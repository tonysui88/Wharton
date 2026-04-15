/**
 * lib/ml/absa-cache.ts
 *
 * File-persisted cache for ABSA (Aspect-Based Sentiment Analysis) scores.
 *
 * Written by analyzePropertyML after ABSA runs.
 * Read by analyzeProperty in lib/analysis.ts to replace keyword-based
 * textSentimentScore with the ML-derived score when available.
 *
 * Structure: { [propertyId]: { [topicId]: { score: number, computedAt: string } } }
 */

import fs from "fs";
import path from "path";

const CACHE_PATH = path.join(process.cwd(), "lib", "ml-sentiment-cache.json");

interface AbsaTopicEntry {
  score: number;       // 0–1 confidence-weighted sentiment score from ABSA
  computedAt: string;  // ISO timestamp
}

type AbsaCache = Record<string, Record<string, AbsaTopicEntry>>;

declare global {
  // eslint-disable-next-line no-var
  var _absaSentimentCache: AbsaCache | undefined;
}

function loadCache(): AbsaCache {
  if (globalThis._absaSentimentCache) return globalThis._absaSentimentCache;
  try {
    const raw = fs.readFileSync(CACHE_PATH, "utf-8");
    globalThis._absaSentimentCache = JSON.parse(raw) as AbsaCache;
  } catch {
    globalThis._absaSentimentCache = {};
  }
  return globalThis._absaSentimentCache!;
}

function saveCache(cache: AbsaCache): void {
  try {
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist ABSA sentiment cache:", err);
  }
}

/**
 * Persist ML sentiment scores for all topics of a property.
 * Called by analyzePropertyML after ABSA completes.
 */
export function setAbsaScores(
  propertyId: string,
  scores: { topicId: string; score: number }[]
): void {
  const cache = loadCache();
  const now = new Date().toISOString();
  cache[propertyId] = {};
  for (const { topicId, score } of scores) {
    cache[propertyId][topicId] = { score, computedAt: now };
  }
  globalThis._absaSentimentCache = cache;
  saveCache(cache);
}

/**
 * Get the cached ABSA sentiment score (0–1) for a property + topic.
 * Returns null if ABSA has not been run for this property yet.
 */
export function getAbsaScore(propertyId: string, topicId: string): number | null {
  const cache = loadCache();
  return cache[propertyId]?.[topicId]?.score ?? null;
}

/**
 * Returns true if ABSA scores have been computed for this property.
 */
export function hasAbsaScores(propertyId: string): boolean {
  const cache = loadCache();
  return !!cache[propertyId] && Object.keys(cache[propertyId]).length > 0;
}

/**
 * Invalidate cached ABSA scores for a property (e.g. after new reviews arrive).
 */
export function invalidateAbsaCache(propertyId: string): void {
  const cache = loadCache();
  if (cache[propertyId]) {
    delete cache[propertyId];
    globalThis._absaSentimentCache = cache;
    saveCache(cache);
  }
}
