/**
 * lib/sentiment-alerts.ts
 *
 * Loads the output of scripts/analyze-sentiment-trends.ts and exposes
 * helpers for reading per-property trend alerts.
 */

import fs from "fs";
import path from "path";

export interface SentimentAlert {
  topicId: string;
  topicLabel: string;
  recentSentiment: "positive" | "neutral" | "negative";
  trend: "improving" | "stable" | "worsening";
  severity: "urgent" | "watch" | "none";
  summary: string | null;
  recentReviewCount: number;
  historicalReviewCount: number;
}

let _cache: Record<string, { alerts: SentimentAlert[] }> | null = null;

function load(): Record<string, { alerts: SentimentAlert[] }> {
  if (_cache !== null) return _cache;
  try {
    const filePath = path.join(process.cwd(), "lib", "sentiment-alerts.json");
    _cache = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    _cache = {};
  }
  return _cache!;
}

export function getPropertyAlerts(propertyId: string): SentimentAlert[] {
  return load()[propertyId]?.alerts ?? [];
}

export function getUrgentAlerts(propertyId: string): SentimentAlert[] {
  return getPropertyAlerts(propertyId).filter((a) => a.severity === "urgent");
}

export function getAlertCount(propertyId: string): { urgent: number; watch: number } {
  const alerts = getPropertyAlerts(propertyId);
  return {
    urgent: alerts.filter((a) => a.severity === "urgent").length,
    watch: alerts.filter((a) => a.severity === "watch").length,
  };
}
