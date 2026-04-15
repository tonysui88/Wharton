/**
 * lib/ml/embeddings.ts
 *
 * OpenAI text-embedding-3-small wrapper with:
 *  - Batch support (up to 100 texts per API call)
 *  - globalThis cache keyed by text hash so embeddings survive HMR
 *  - Cosine similarity helper
 */

import crypto from "crypto";
import OpenAI from "openai";

declare global {
  // eslint-disable-next-line no-var
  var _embeddingCache: Map<string, number[]> | undefined;
}

const embeddingCache: Map<string, number[]> =
  globalThis._embeddingCache ?? (globalThis._embeddingCache = new Map());

let _client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _client;
}

function hashText(text: string): string {
  return crypto.createHash("sha256").update(text.trim()).digest("hex").slice(0, 24);
}

/**
 * Embed multiple texts in a single API call.
 * Texts already in cache are returned without a network request.
 * Remaining texts are sent in one batch.
 */
export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const results: (number[] | null)[] = new Array(texts.length).fill(null);
  const toFetch: { index: number; text: string }[] = [];

  for (let i = 0; i < texts.length; i++) {
    const key = hashText(texts[i]);
    if (embeddingCache.has(key)) {
      results[i] = embeddingCache.get(key)!;
    } else {
      toFetch.push({ index: i, text: texts[i] });
    }
  }

  if (toFetch.length > 0) {
    // OpenAI allows up to 2048 inputs; we chunk at 100 for safety
    const CHUNK = 100;
    for (let c = 0; c < toFetch.length; c += CHUNK) {
      const chunk = toFetch.slice(c, c + CHUNK);
      const response = await getClient().embeddings.create({
        model: "text-embedding-3-small",
        input: chunk.map((t) => t.text.slice(0, 8000)),
      });
      for (let j = 0; j < chunk.length; j++) {
        const embedding = response.data[j].embedding;
        const key = hashText(chunk[j].text);
        embeddingCache.set(key, embedding);
        results[chunk[j].index] = embedding;
      }
    }
  }

  return results as number[][];
}

/** Embed a single text. */
export async function getEmbedding(text: string): Promise<number[]> {
  return (await getEmbeddings([text]))[0];
}

/**
 * Cosine similarity between two vectors — range [-1, 1].
 * For unit-normalised embeddings from text-embedding-3-small this is essentially dot product.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot  += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}
