import { NextResponse } from "next/server";
import { loadProperties, getReviewsForProperty } from "@/lib/data";
import { analyzeProperty } from "@/lib/analysis";
import { analyzePropertyML } from "@/lib/ml/analyze-ml";

export async function POST(request: Request) {
  try {
    const { propertyId } = await request.json() as { propertyId: string };
    if (!propertyId) {
      return NextResponse.json({ error: "Missing propertyId" }, { status: 400 });
    }

    const properties = loadProperties();
    const property = properties.find((p) => p.eg_property_id === propertyId);
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const reviews = getReviewsForProperty(propertyId);
    const currentAnalysis = analyzeProperty(property, reviews);

    const mlAnalysis = await analyzePropertyML(
      property,
      reviews,
      currentAnalysis.knowledgeHealthScore
    );

    return NextResponse.json(mlAnalysis);
  } catch (err) {
    console.error("Error in /api/ml-analyze:", err);
    return NextResponse.json({ error: "ML analysis failed" }, { status: 500 });
  }
}
