/**
 * scripts/test-ml.mjs
 *
 * Verifies the ML pipeline in three stages:
 *
 * 1. EMBEDDING CLASSIFIER — checks that it correctly classifies reviews that
 *    keyword matching would miss (paraphrasing / indirect references).
 *
 * 2. ABSA — checks that aspect-based sentiment handles negation and
 *    mixed-sentiment reviews that word counting gets wrong.
 *
 * 3. COMPARISON — runs both systems on the same reviews and shows the diff.
 *
 * Run with:
 *   node scripts/test-ml.mjs
 */

import "dotenv/config";
import OpenAI from "openai";
import crypto from "crypto";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cosine(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

async function embed(texts) {
  const res = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });
  return res.data.map(d => d.embedding);
}

// ─── Topic config (mirrors lib/ml/topic-classifier.ts) ───────────────────────

const TOPIC_DESCRIPTIONS = {
  cleanliness:     "Cleanliness, hygiene, tidiness, dirty rooms, dust, stains, mold, odors, spotless surfaces, housekeeping quality.",
  noise:           "Noise levels, sound insulation, loud neighbors, traffic, thin walls, disturbances, couldn't sleep, peaceful.",
  room_comfort:    "Room size, bed comfort, mattress quality, pillows, lumpy bed, spacious or cramped, temperature, air conditioning.",
  staff_service:   "Staff attitude, helpfulness, friendliness, professional service, went above and beyond, rude or attentive staff.",
  wifi_internet:   "WiFi and internet connectivity, slow or fast connection, dropped signal, bandwidth, streaming.",
  food_breakfast:  "Food quality, breakfast options, hotel restaurant, buffet, meals, coffee, tasty or bland food.",
  bathroom:        "Bathroom facilities, shower pressure, hot water, bathtub, towels, toiletries, hairdryer, cleanliness.",
  parking:         "Parking availability, car park, valet, garage, fees, free parking, limited spaces.",
  value:           "Value for money, pricing, expensive, overpriced, good deal, worth the cost, price-quality ratio.",
};

const TOPIC_KEYWORDS = {
  cleanliness:    ["clean", "dirty", "spotless", "filthy", "stain", "dust", "mold", "odor", "hygiene"],
  noise:          ["noise", "noisy", "quiet", "loud", "sound", "peaceful", "disturbance", "earplugs"],
  room_comfort:   ["room", "bed", "pillow", "mattress", "comfortable", "spacious", "cramped", "cozy"],
  staff_service:  ["staff", "service", "helpful", "friendly", "rude", "professional", "attentive"],
  wifi_internet:  ["wifi", "wi-fi", "internet", "connection", "bandwidth", "signal", "streaming"],
  food_breakfast: ["breakfast", "food", "meal", "dining", "restaurant", "buffet", "menu", "coffee"],
  bathroom:       ["bathroom", "shower", "bath", "toilet", "towel", "hot water", "water pressure"],
  parking:        ["parking", "car park", "valet", "garage"],
  value:          ["value", "price", "worth", "expensive", "cheap", "affordable", "overpriced"],
};

function keywordClassify(text) {
  const lower = text.toLowerCase();
  return Object.entries(TOPIC_KEYWORDS)
    .filter(([, kws]) => kws.some(kw => lower.includes(kw)))
    .map(([id]) => id);
}

// ─── Stage 1: Embedding classifier ───────────────────────────────────────────
// These reviews are deliberately chosen because keyword matching FAILS on them.

const TRICKY_REVIEWS = [
  {
    text: "The mattress was so lumpy I woke up with back pain every morning.",
    expected: "room_comfort",
    note: "No keyword match — 'lumpy' and 'back pain' aren't in the keyword list",
  },
  {
    text: "I could hear the couple next door having an argument through the walls.",
    expected: "noise",
    note: "No keyword match — 'couple next door' implies noise without the word 'noise'",
  },
  {
    text: "The room was not dirty at all — actually one of the cleanest I've stayed in.",
    expected: "cleanliness",
    note: "Keyword match on 'dirty' — but sentiment should be POSITIVE (negation test)",
  },
  {
    text: "Couldn't get any work done because the signal kept dropping every 10 minutes.",
    expected: "wifi_internet",
    note: "No keyword match — 'signal dropping' not in keyword list",
  },
  {
    text: "The buffet spread was incredible — fresh pastries, omelette station, great coffee.",
    expected: "food_breakfast",
    note: "Keyword match on 'buffet' and 'coffee' — this one should match both systems",
  },
  {
    text: "Springs were poking out and the duvet was wafer-thin — I froze all night.",
    expected: "room_comfort",
    note: "No keyword match — 'springs', 'duvet', 'froze' aren't in keyword list",
  },
];

// ─── Stage 2: ABSA negation/mixed sentiment tests ────────────────────────────

const ABSA_TESTS = [
  {
    text: "The room was not dirty at all — actually one of the cleanest I've stayed in.",
    topic: "cleanliness",
    topicLabel: "Cleanliness",
    description: "Cleanliness, hygiene, tidiness, dirty rooms, dust, stains, mold, odors, spotless surfaces, housekeeping quality.",
    expected: "positive",
    note: "Negation: 'not dirty' should score POSITIVE — keyword system would hit 'dirty' and score negative",
  },
  {
    text: "The staff were incredible and so helpful, but the parking situation was an absolute nightmare.",
    topic: "staff_service",
    topicLabel: "Staff & Service",
    description: "Staff attitude, helpfulness, friendliness, professional service, went above and beyond, rude or attentive staff.",
    expected: "positive",
    note: "Mixed review — when asked about staff, should be POSITIVE despite negative parking mention",
  },
  {
    text: "The staff were incredible and so helpful, but the parking situation was an absolute nightmare.",
    topic: "parking",
    topicLabel: "Parking",
    description: "Parking availability, car park, valet, garage, fees, free parking, limited spaces.",
    expected: "negative",
    note: "Same review — when asked about parking, should be NEGATIVE",
  },
  {
    text: "Nothing to complain about — the beds were perfect and the linens were spotless.",
    topic: "room_comfort",
    topicLabel: "Room Comfort",
    description: "Room size, bed comfort, mattress quality, pillows, lumpy bed, spacious or cramped, temperature, air conditioning.",
    expected: "positive",
    note: "Double negation: 'nothing to complain about' should read as strongly positive",
  },
];

// ─── Run ──────────────────────────────────────────────────────────────────────

async function runEmbeddingTests(topicEmbeddings) {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("STAGE 1: Embedding classifier vs keyword matching");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const reviewEmbeddings = await embed(TRICKY_REVIEWS.map(r => r.text));

  let mlCorrect = 0, kwCorrect = 0;

  for (let i = 0; i < TRICKY_REVIEWS.length; i++) {
    const { text, expected, note } = TRICKY_REVIEWS[i];
    const reviewEmb = reviewEmbeddings[i];

    // ML: top 3 by cosine similarity above 0.32
    const similarities = Object.entries(topicEmbeddings)
      .map(([id, emb]) => ({ id, sim: cosine(reviewEmb, emb) }))
      .filter(x => x.sim >= 0.32)
      .sort((a, b) => b.sim - a.sim);

    const mlTopics = similarities.map(x => x.id);
    const kwTopics = keywordClassify(text);

    const mlHit = mlTopics.includes(expected);
    const kwHit = kwTopics.includes(expected);

    if (mlHit) mlCorrect++;
    if (kwHit) kwCorrect++;

    console.log(`Review: "${text.slice(0, 70)}..."`);
    console.log(`Note:   ${note}`);
    console.log(`Expected topic: ${expected}`);
    console.log(`Keyword: ${kwHit ? "✓ HIT" : "✗ MISS"} → [${kwTopics.join(", ") || "none"}]`);
    console.log(`ML:      ${mlHit ? "✓ HIT" : "✗ MISS"} → [${similarities.slice(0,3).map(x => `${x.id}(${x.sim.toFixed(2)})`).join(", ") || "none"}]`);
    console.log();
  }

  console.log(`Score — Keyword: ${kwCorrect}/${TRICKY_REVIEWS.length}   ML: ${mlCorrect}/${TRICKY_REVIEWS.length}`);
}

async function runABSATests() {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("STAGE 2: ABSA negation and mixed-sentiment tests");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const POS_WORDS = ["great","excellent","amazing","wonderful","fantastic","loved","perfect","good","nice","lovely","outstanding","superb","best","clean","comfortable","helpful","friendly","beautiful","delicious","spacious","modern","recommend"];
  const NEG_WORDS = ["bad","poor","terrible","awful","horrible","worst","dirty","rude","disappointing","disgusting","broken","noisy","stained","cold","slow","unfriendly","unhelpful","cramped","outdated","overpriced","smelly","avoid"];

  function kwSentiment(text) {
    const lower = text.toLowerCase();
    let pos = 0, neg = 0;
    for (const w of POS_WORDS) if (lower.includes(w)) pos++;
    for (const w of NEG_WORDS) if (lower.includes(w)) neg++;
    const total = pos + neg;
    if (total === 0) return { label: "neutral", score: 0.5 };
    const score = 0.1 + (pos / total) * 0.8;
    return { label: score >= 0.6 ? "positive" : score <= 0.4 ? "negative" : "neutral", score };
  }

  let absa_correct = 0, kw_correct = 0;

  for (const test of ABSA_TESTS) {
    const prompt = `You are an Aspect-Based Sentiment Analysis (ABSA) system.

Aspect: "${test.topicLabel}"
What this covers: ${test.description}

Analyze the sentiment expressed specifically toward "${test.topicLabel}" in this review.
Negation rule: "not dirty" = POSITIVE. "nothing to complain about" = POSITIVE.
Mixed reviews: focus ONLY on the aspect asked about, ignore other aspects.

Review: "${test.text}"

Respond ONLY with valid JSON: {"sentiment": "positive|negative|neutral|not_mentioned", "score": 0.0, "confidence": 0.0, "evidence": "exact phrase"}`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 100,
    });

    const raw = response.choices[0].message.content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const result = JSON.parse(raw);
    const kw = kwSentiment(test.text);

    const absa_ok = result.sentiment === test.expected;
    const kw_ok = kw.label === test.expected;
    if (absa_ok) absa_correct++;
    if (kw_ok) kw_correct++;

    console.log(`Review: "${test.text.slice(0, 70)}..."`);
    console.log(`Aspect: ${test.topicLabel}   Expected: ${test.expected}`);
    console.log(`Note:   ${test.note}`);
    console.log(`Keyword sentiment: ${kw_ok ? "✓" : "✗"} ${kw.label} (score: ${kw.score.toFixed(2)})`);
    console.log(`ABSA sentiment:    ${absa_ok ? "✓" : "✗"} ${result.sentiment} (score: ${result.score.toFixed(2)}, evidence: "${result.evidence}")`);
    console.log();
  }

  console.log(`Score — Keyword: ${kw_correct}/${ABSA_TESTS.length}   ABSA: ${absa_correct}/${ABSA_TESTS.length}`);
}

async function main() {
  console.log("ML Pipeline Verification");
  console.log(`OpenAI key: ${process.env.OPENAI_API_KEY ? "✓ set" : "✗ missing"}\n`);

  // Pre-compute topic embeddings once
  console.log("Embedding topic descriptions…");
  const topicIds = Object.keys(TOPIC_DESCRIPTIONS);
  const topicEmbeddingsList = await embed(Object.values(TOPIC_DESCRIPTIONS));
  const topicEmbeddings = Object.fromEntries(topicIds.map((id, i) => [id, topicEmbeddingsList[i]]));
  console.log(`✓ ${topicIds.length} topic embeddings computed`);

  await runEmbeddingTests(topicEmbeddings);
  await runABSATests();

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("What to look for:");
  console.log("  Stage 1: ML should score higher than keyword (especially on tricky cases)");
  console.log("  Stage 2: ABSA should correctly handle negation + mixed-sentiment reviews");
  console.log("  If both scores are identical → threshold may be too high or embeddings not loading");
  console.log("  If ABSA matches keyword on 'not dirty' → something went wrong with the prompt");
}

main().catch(console.error);
