/**
 * lib/ml/sentiment-classifier.ts
 *
 * Local sentiment classification using @xenova/transformers.
 *
 * Model: Xenova/distilbert-base-uncased-finetuned-sst-2-english
 *   - DistilBERT fine-tuned on SST-2 (Stanford Sentiment Treebank)
 *   - ~67MB download, cached after first run
 *   - Binary output: POSITIVE / NEGATIVE with confidence score
 *   - No API calls, no network dependency after initial download
 *
 * Returns a 0–1 score:
 *   POSITIVE with confidence 0.95 → 0.95
 *   NEGATIVE with confidence 0.95 → 0.05  (1 - 0.95)
 */

declare global {
  // eslint-disable-next-line no-var
  var _sentimentPipeline: unknown | undefined;
}

let _pipelinePromise: Promise<unknown> | null = null;
let _unavailable = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getSentimentPipeline(): Promise<any> {
  if (_unavailable) return null;
  if (globalThis._sentimentPipeline) return globalThis._sentimentPipeline;

  if (!_pipelinePromise) {
    _pipelinePromise = (async () => {
      try {
        const { pipeline } = await import("@xenova/transformers");
        const classifier = await pipeline(
          "sentiment-analysis",
          "Xenova/distilbert-base-uncased-finetuned-sst-2-english",
          {
            progress_callback: process.env.NODE_ENV === "development"
              ? (p: unknown) => {
                  const progress = p as { status?: string; file?: string; progress?: number };
                  if (progress.status === "downloading") {
                    process.stdout.write(
                      `\r[sentiment] downloading ${progress.file ?? ""} ${Math.round(progress.progress ?? 0)}%`
                    );
                  }
                }
              : undefined,
          }
        );
        globalThis._sentimentPipeline = classifier;
        return classifier;
      } catch (err) {
        console.error("[sentiment-classifier] failed to load model:", err);
        _unavailable = true;
        return null;
      }
    })();
  }

  return _pipelinePromise;
}

/**
 * Score a single text snippet (0 = very negative, 1 = very positive).
 * Returns null if the model is unavailable.
 */
export async function scoreSentiment(text: string): Promise<number | null> {
  const classifier = await getSentimentPipeline();
  if (!classifier) return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [result] = await (classifier as any)(text.slice(0, 512)) as { label: string; score: number }[];
    return result.label === "POSITIVE" ? result.score : 1 - result.score;
  } catch {
    return null;
  }
}

/**
 * Score multiple text snippets in one pass.
 * Returns an array of 0–1 scores (null entries where model failed).
 */
export async function scoreSentimentBatch(texts: string[]): Promise<(number | null)[]> {
  const classifier = await getSentimentPipeline();
  if (!classifier) return texts.map(() => null);

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await (classifier as any)(texts.map((t) => t.slice(0, 512))) as { label: string; score: number }[];
    return results.map((r) => (r.label === "POSITIVE" ? r.score : 1 - r.score));
  } catch {
    return texts.map(() => null);
  }
}
