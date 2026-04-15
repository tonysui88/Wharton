import { NextResponse } from "next/server";
import { loadProperties, getReviewsForProperty, parseReviewDate } from "@/lib/data";
import { TOPICS } from "@/lib/topics";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get("propertyId");
  const granularity = searchParams.get("granularity") === "yearly" ? "yearly" : "monthly";

  if (!propertyId) {
    return NextResponse.json({ error: "Missing propertyId" }, { status: 400 });
  }

  const properties = loadProperties();
  const property = properties.find((p) => p.eg_property_id === propertyId);
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const reviews = getReviewsForProperty(propertyId).filter(
    (r) => r.rating?.overall > 0 || r.review_text?.trim()
  );

  if (reviews.length === 0) return NextResponse.json([]);

  // Group reviews by period
  const groups: Record<string, typeof reviews> = {};
  for (const r of reviews) {
    const d = parseReviewDate(r.acquisition_date);
    const key =
      granularity === "yearly"
        ? String(d.getFullYear())
        : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  }

  const periods = Object.keys(groups).sort();

  const result = periods.map((period) => {
    const g = groups[period];
    const overall =
      g.filter((r) => r.rating?.overall > 0).length > 0
        ? g.reduce((s, r) => s + (r.rating?.overall ?? 0), 0) /
          g.filter((r) => r.rating?.overall > 0).length /
          10 // normalize 0-10 → 0-1
        : NaN;

    const row: Record<string, number | string> = {
      period: granularity === "yearly" ? period : period.slice(2), // "2024-03" → "24-03"
      overall: isNaN(overall) ? 0.5 : Math.round(overall * 100) / 100,
    };

    // Per-topic scores from structured sub-ratings
    for (const topic of TOPICS) {
      if (topic.ratingKeys.length === 0) continue;
      const vals: number[] = [];
      for (const r of g) {
        const rr = r.rating as Record<string, number>;
        for (const k of topic.ratingKeys) {
          const v = rr[k];
          if (v && v > 0) vals.push(v);
        }
      }
      if (vals.length > 0) {
        const avg = vals.reduce((s, v) => s + v, 0) / vals.length / 5;
        row[topic.id] = Math.round(avg * 100) / 100;
      }
    }

    return row;
  });

  return NextResponse.json(result);
}
