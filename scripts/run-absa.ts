/**
 * scripts/run-absa.ts
 *
 * Batch local ABSA (Aspect-Based Sentiment Analysis) for all properties.
 * No API calls — uses local ML models only:
 *
 *   - MiniLM (all-MiniLM-L6-v2, already in use for topic classification)
 *     → embeds each sentence and filters to ones relevant to the target topic
 *   - DistilBERT (distilbert-base-uncased-finetuned-sst-2-english, ~67MB)
 *     → scores sentiment on the topic-relevant sentences
 *
 * Results are written to lib/ml-sentiment-cache.json, keyed by
 * propertyId → topicId → { score, reviewCount, computedAt }.
 *
 * analyzeProperty() reads that file and uses the ML scores as the S2 sentiment
 * signal instead of keyword counting.
 *
 * Run:    npx tsx scripts/run-absa.ts
 * Resume: re-running skips property+topic pairs already in the cache.
 * Cost:   $0 — entirely local inference
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { parse } from "csv-parse/sync";

// Must run before any @xenova/transformers import so the cache dir is set
process.env.TRANSFORMERS_CACHE = path.join(process.cwd(), "node_modules", ".cache", "huggingface");

// ── Config ────────────────────────────────────────────────────────────────────

const MAX_REVIEWS_PER_TOPIC = 50;

const DATA_DIR              = path.join(process.cwd(), "data");
const TOPIC_CLASSIFICATIONS = path.join(process.cwd(), "lib", "topic-classifications.json");
const OUT_FILE              = path.join(process.cwd(), "lib", "ml-sentiment-cache.json");

// ── Topics (mirrors lib/topics.ts) ───────────────────────────────────────────

const TOPICS = [
  { id: "cleanliness",        label: "Cleanliness",          desc: "Cleanliness, hygiene, tidiness of the hotel. Dirty rooms, dust, stains, mold, bad odors, spotless rooms, housekeeping quality." },
  { id: "location",           label: "Location",             desc: "Location, neighborhood, proximity to attractions, public transport, walking distance, central area." },
  { id: "food_breakfast",     label: "Food & Breakfast",     desc: "Food quality, breakfast options, hotel restaurant, buffet, meals, coffee, tasty or bland food, included breakfast." },
  { id: "wifi_internet",      label: "WiFi & Internet",      desc: "WiFi and internet connectivity, slow or fast connection, dropped signal, bandwidth, streaming." },
  { id: "parking",            label: "Parking",              desc: "Parking availability, car park, valet, garage, fees, free parking, limited spaces." },
  { id: "pool_fitness",       label: "Pool & Fitness",       desc: "Swimming pool, fitness center, gym, equipment, jacuzzi, sauna, pool cleanliness and temperature." },
  { id: "checkin_checkout",   label: "Check-in / Check-out", desc: "Check-in and check-out process, front desk, reception queue, wait times, key card, early or late check-in." },
  { id: "noise",              label: "Noise",                desc: "Noise levels, sound insulation, loud neighbors, traffic, thin walls, couldn't sleep, peaceful environment." },
  { id: "room_comfort",       label: "Room Comfort",         desc: "Room size, bed comfort, mattress quality, pillows, spacious or cramped, temperature, air conditioning." },
  { id: "bathroom",           label: "Bathroom",             desc: "Bathroom facilities, shower pressure, hot water, bathtub, towels, toiletries, hairdryer." },
  { id: "staff_service",      label: "Staff & Service",      desc: "Staff attitude, helpfulness, friendliness, professional service, went above and beyond, rude or attentive staff." },
  { id: "value",              label: "Value for Money",      desc: "Value for money, pricing, expensive, overpriced, good deal, worth the cost, price-quality ratio." },
  { id: "spa_wellness",       label: "Spa & Wellness",       desc: "Spa treatments, massage, wellness facilities, relaxation, sauna, steam room, beauty treatments." },
  { id: "accessibility",      label: "Accessibility",        desc: "Wheelchair access, disabled facilities, elevator, mobility assistance, special needs accommodation." },
  { id: "eco_sustainability", label: "Eco-Sustainability",   desc: "Eco-friendliness, sustainability, recycling, organic, plastic-free, environmental practices." },
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface RawReview {
  eg_property_id: string;
  acquisition_date: string;
  review_text: string;
}

interface AbsaTopicEntry {
  score: number;
  reviewCount: number;
  computedAt: string;
}

type SentimentCache = Record<string, Record<string, AbsaTopicEntry>>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function hashText(text: string): string {
  return crypto.createHash("sha256").update(text.trim()).digest("hex").slice(0, 16);
}

function parseDate(dateStr: string): Date {
  const parts = dateStr.split("/");
  if (parts.length !== 3) return new Date(0);
  const month = parseInt(parts[0], 10) - 1;
  const day   = parseInt(parts[1], 10);
  const year  = parseInt(parts[2], 10) + (parseInt(parts[2], 10) < 50 ? 2000 : 1900);
  return new Date(year, month, day);
}

// ── Keyword fallback for topic assignment ─────────────────────────────────────

const TOPIC_KEYWORDS: Record<string, string[]> = {
  cleanliness:       ["clean","dirty","dust","stain","hygiene","housekeep","tidy","spotless","mold","odor","smell"],
  location:          ["location","area","neighborhood","transport","walk","central","nearby","distance"],
  food_breakfast:    ["breakfast","food","restaurant","meal","dining","coffee","buffet","bar"],
  wifi_internet:     ["wifi","internet","connection","bandwidth","signal","online","streaming"],
  parking:           ["parking","car park","valet","garage","parked"],
  pool_fitness:      ["pool","gym","fitness","workout","sauna","jacuzzi","swim"],
  checkin_checkout:  ["check-in","check in","checkout","check out","front desk","reception","key card"],
  noise:             ["noise","noisy","loud","quiet","sound","thin walls","sleep","disturb","traffic"],
  room_comfort:      ["room","bed","mattress","pillow","comfort","spacious","cramped","temperature","ac"],
  bathroom:          ["bathroom","shower","bath","hot water","towel","toiletries"],
  staff_service:     ["staff","service","helpful","friendly","rude","professional","attentive"],
  value:             ["value","price","expensive","overpriced","deal","worth","cost","cheap"],
  spa_wellness:      ["spa","massage","wellness","treatment","steam room","relaxation"],
  accessibility:     ["wheelchair","elevator","lift","disabled","mobility","accessible","stairs"],
  eco_sustainability:["eco","sustainable","green","recycle","organic","environment","plastic"],
};

function keywordMatchesTopic(text: string, topicId: string): boolean {
  const lower = text.toLowerCase();
  return (TOPIC_KEYWORDS[topicId] ?? []).some((kw) => lower.includes(kw));
}

// ── Local ML (inline, avoids Next.js @/ alias in script context) ──────────────

const RELEVANCE_THRESHOLD = 0.22;
const MIN_SENTENCE_CHARS  = 15;

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= MIN_SENTENCE_CHARS);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot  += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _embedder: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _classifier: any = null;

async function loadModels() {
  const { pipeline } = await import("@xenova/transformers");

  if (!_embedder) {
    process.stdout.write("[models] loading MiniLM embedder... ");
    _embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    console.log("ready");
  }

  if (!_classifier) {
    process.stdout.write("[models] loading DistilBERT sentiment classifier... ");
    _classifier = await pipeline("sentiment-analysis", "Xenova/distilbert-base-uncased-finetuned-sst-2-english");
    console.log("ready");
  }
}

async function embed(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  for (const text of texts) {
    const out = await _embedder(text.slice(0, 512), { pooling: "mean", normalize: true }) as { data: Float32Array };
    results.push(Array.from(out.data));
  }
  return results;
}

async function sentimentScore(text: string): Promise<number> {
  const [result] = await _classifier(text.slice(0, 512)) as { label: string; score: number }[];
  return result.label === "POSITIVE" ? result.score : 1 - result.score;
}

async function scoreReviewForTopic(reviewText: string, topicEmb: number[]): Promise<number | null> {
  const sentences = splitSentences(reviewText);
  if (sentences.length === 0) return null;

  const sentEmbs = await embed(sentences);
  const relevant: { sentence: string; similarity: number }[] = [];

  for (let i = 0; i < sentences.length; i++) {
    const sim = cosineSimilarity(sentEmbs[i], topicEmb);
    if (sim >= RELEVANCE_THRESHOLD) relevant.push({ sentence: sentences[i], similarity: sim });
  }

  if (relevant.length === 0) return null;

  let weightedSum = 0, totalWeight = 0;
  for (const { sentence, similarity } of relevant) {
    const score = await sentimentScore(sentence);
    weightedSum += score * similarity;
    totalWeight += similarity;
  }

  return weightedSum / totalWeight;
}

async function aggregateTopicSentiment(
  texts: string[],
  topicEmb: number[]
): Promise<{ score: number; reviewCount: number }> {
  const scores: number[] = [];
  for (const text of texts) {
    const s = await scoreReviewForTopic(text, topicEmb);
    if (s !== null) scores.push(s);
  }
  if (scores.length === 0) return { score: 0.5, reviewCount: 0 };
  return {
    score: scores.reduce((a, b) => a + b, 0) / scores.length,
    reviewCount: scores.length,
  };
}

// ── Data loading ──────────────────────────────────────────────────────────────

function loadReviews(): RawReview[] {
  const content = fs.readFileSync(path.join(DATA_DIR, "Reviews_PROC.csv"), "utf-8");
  return parse(content, { columns: true, skip_empty_lines: true }) as RawReview[];
}

function loadTopicClassifications(): Record<string, string[]> {
  if (!fs.existsSync(TOPIC_CLASSIFICATIONS)) {
    console.warn("Warning: lib/topic-classifications.json not found — using keyword fallback.\n");
    return {};
  }
  return JSON.parse(fs.readFileSync(TOPIC_CLASSIFICATIONS, "utf-8"));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Local ABSA batch run (no API calls) ===\n");

  await loadModels();
  console.log();

  // Pre-embed all topic descriptions
  process.stdout.write("Embedding topic descriptions... ");
  const topicDescEmbs = await embed(TOPICS.map((t) => t.desc));
  const topicEmbMap: Record<string, number[]> = {};
  for (let i = 0; i < TOPICS.length; i++) topicEmbMap[TOPICS[i].id] = topicDescEmbs[i];
  console.log("done\n");

  // Load existing cache (for resuming)
  let cache: SentimentCache = {};
  if (fs.existsSync(OUT_FILE)) {
    try {
      cache = JSON.parse(fs.readFileSync(OUT_FILE, "utf-8"));
      console.log(`Resuming: ${Object.keys(cache).length} properties already cached\n`);
    } catch {
      console.warn("Could not read existing cache, starting fresh\n");
    }
  }

  console.log("Loading reviews...");
  const allReviews = loadReviews();
  const topicClassifications = loadTopicClassifications();
  const hasClassifications = Object.keys(topicClassifications).length > 0;

  // Group by property
  const reviewsByProperty: Record<string, RawReview[]> = {};
  for (const r of allReviews) {
    if (!r.review_text?.trim()) continue;
    if (!reviewsByProperty[r.eg_property_id]) reviewsByProperty[r.eg_property_id] = [];
    reviewsByProperty[r.eg_property_id].push(r);
  }

  const propertyIds = Object.keys(reviewsByProperty);
  console.log(`${propertyIds.length} properties, ${allReviews.length} reviews\n`);

  for (let pi = 0; pi < propertyIds.length; pi++) {
    const propId = propertyIds[pi];
    const reviews = reviewsByProperty[propId];

    console.log(`[${pi + 1}/${propertyIds.length}] Property ${propId} (${reviews.length} reviews)`);

    if (!cache[propId]) cache[propId] = {};

    // Sort newest-first
    const sorted = [...reviews].sort(
      (a, b) => parseDate(b.acquisition_date).getTime() - parseDate(a.acquisition_date).getTime()
    );

    for (const topic of TOPICS) {
      if (cache[propId][topic.id] !== undefined) {
        process.stdout.write(`  ${topic.id.padEnd(22)} [cached]\n`);
        continue;
      }

      // Select reviews that mention this topic
      let topicReviews: RawReview[];
      if (hasClassifications) {
        topicReviews = sorted.filter((r) => {
          const h = hashText(r.review_text);
          const topics = topicClassifications[h];
          return topics ? topics.includes(topic.id) : keywordMatchesTopic(r.review_text, topic.id);
        });
      } else {
        topicReviews = sorted.filter((r) => keywordMatchesTopic(r.review_text, topic.id));
      }

      const texts = topicReviews.slice(0, MAX_REVIEWS_PER_TOPIC).map((r) => r.review_text.trim());

      if (texts.length === 0) {
        cache[propId][topic.id] = { score: 0.5, reviewCount: 0, computedAt: new Date().toISOString() };
        process.stdout.write(`  ${topic.id.padEnd(22)} [no reviews]\n`);
        continue;
      }

      process.stdout.write(`  ${topic.id.padEnd(22)} ${texts.length} reviews... `);

      try {
        const { score, reviewCount } = await aggregateTopicSentiment(texts, topicEmbMap[topic.id]);
        cache[propId][topic.id] = { score, reviewCount, computedAt: new Date().toISOString() };
        console.log(`score=${score.toFixed(3)} (${reviewCount} with sentiment)`);
      } catch (err) {
        console.error(`FAILED — ${err instanceof Error ? err.message : err}`);
        cache[propId][topic.id] = { score: 0.5, reviewCount: 0, computedAt: new Date().toISOString() };
      }

      // Save after every topic
      fs.writeFileSync(OUT_FILE, JSON.stringify(cache, null, 2));
    }

    console.log();
  }

  console.log("── Done ─────────────────────────────────────────────");
  console.log(`Output: ${OUT_FILE}`);
  console.log("All analyzeProperty() calls will now use local ML sentiment scores.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
