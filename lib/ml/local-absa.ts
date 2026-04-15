/**
 * lib/ml/local-absa.ts
 *
 * Local Aspect-Based Sentiment Analysis — no API calls.
 *
 * Pipeline per review × topic:
 *   1. Split review into sentences
 *   2. Embed each sentence with MiniLM (already loaded for topic classification)
 *   3. Compute cosine similarity against the topic description embedding
 *   4. Keep sentences above the relevance threshold (0.22)
 *   5. Run kept sentences through local DistilBERT sentiment classifier
 *   6. Return confidence-weighted average score (0–1)
 *
 * Handles negation implicitly because DistilBERT reads the full sentence in
 * context — "not dirty" scores positive, unlike keyword counting.
 *
 * Returns null score when no sentences are relevant to the topic (not_mentioned).
 */

import { getEmbeddings, cosineSimilarity } from "./embeddings";
import { scoreSentimentBatch } from "./sentiment-classifier";

const RELEVANCE_THRESHOLD = 0.22; // lower than topic classification (0.32) — sentence fragments score lower
const MIN_SENTENCE_CHARS = 15;    // skip very short fragments

// ── Sentence splitting ─────────────────────────────────────────────────────────

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= MIN_SENTENCE_CHARS);
}

// ── Per-review ABSA ────────────────────────────────────────────────────────────

export interface LocalAbsaResult {
  score: number | null;     // 0–1, null = not mentioned
  confidence: number;       // average confidence of contributing sentences
  sentenceCount: number;    // how many sentences contributed
}

/**
 * Score a single review text against a single topic aspect.
 *
 * @param reviewText     full review string
 * @param topicEmbedding pre-computed MiniLM embedding of the topic description
 */
export async function scoreReviewForTopic(
  reviewText: string,
  topicEmbedding: number[]
): Promise<LocalAbsaResult> {
  const sentences = splitSentences(reviewText);
  if (sentences.length === 0) return { score: null, confidence: 0, sentenceCount: 0 };

  // Embed all sentences in one batch
  const sentenceEmbeddings = await getEmbeddings(sentences);

  // Filter to sentences relevant to this topic
  const relevant: { sentence: string; similarity: number }[] = [];
  for (let i = 0; i < sentences.length; i++) {
    const emb = sentenceEmbeddings[i];
    if (emb.length === 0) continue; // model unavailable
    const sim = cosineSimilarity(emb, topicEmbedding);
    if (sim >= RELEVANCE_THRESHOLD) {
      relevant.push({ sentence: sentences[i], similarity: sim });
    }
  }

  if (relevant.length === 0) return { score: null, confidence: 0, sentenceCount: 0 };

  // Run sentiment on the relevant sentences
  const sentimentScores = await scoreSentimentBatch(relevant.map((r) => r.sentence));

  // Similarity-weighted average of valid sentiment scores
  let weightedSum = 0;
  let totalWeight = 0;
  let validCount = 0;

  for (let i = 0; i < relevant.length; i++) {
    const s = sentimentScores[i];
    if (s === null) continue;
    const weight = relevant[i].similarity;
    weightedSum += s * weight;
    totalWeight += weight;
    validCount++;
  }

  if (validCount === 0) return { score: null, confidence: 0, sentenceCount: 0 };

  return {
    score: weightedSum / totalWeight,
    confidence: totalWeight / relevant.length, // avg similarity as proxy for confidence
    sentenceCount: validCount,
  };
}

// ── Batch ABSA across multiple reviews for one topic ──────────────────────────

export interface TopicAbsaAggregate {
  score: number;       // 0–1 aggregate sentiment; 0.5 if no reviews mentioned the topic
  reviewCount: number; // reviews that actually mentioned the topic
}

/**
 * Run local ABSA for one topic across multiple review texts.
 * Returns a single aggregate sentiment score for the topic.
 *
 * @param reviewTexts    review texts (pre-filtered to likely mention this topic)
 * @param topicEmbedding pre-computed MiniLM embedding of the topic description
 */
export async function aggregateTopicSentiment(
  reviewTexts: string[],
  topicEmbedding: number[]
): Promise<TopicAbsaAggregate> {
  if (reviewTexts.length === 0) return { score: 0.5, reviewCount: 0 };

  // Process all reviews; can be parallelised since each is independent
  const results = await Promise.all(
    reviewTexts.map((text) => scoreReviewForTopic(text, topicEmbedding))
  );

  // Aggregate only reviews that mentioned the topic
  const mentioned = results.filter((r) => r.score !== null);
  if (mentioned.length === 0) return { score: 0.5, reviewCount: 0 };

  const totalConf = mentioned.reduce((s, r) => s + r.confidence, 0);
  const score = totalConf === 0
    ? mentioned.reduce((s, r) => s + r.score!, 0) / mentioned.length
    : mentioned.reduce((s, r) => s + r.score! * r.confidence, 0) / totalConf;

  return {
    score: Math.max(0, Math.min(1, score)),
    reviewCount: mentioned.length,
  };
}
