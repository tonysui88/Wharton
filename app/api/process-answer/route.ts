import { NextResponse } from "next/server";
import { loadProperties, getReviewsForProperty } from "@/lib/data";
import { analyzeProperty, invalidateAnalysisCache } from "@/lib/analysis";
import { checkAnswerQuality } from "@/lib/quality";
import { reviewStore, LiveReview, LiveAnswer } from "@/lib/store";
import { generateHotelDisplayName } from "@/lib/utils";
import { randomUUID } from "crypto";

interface AnswerPayload {
  topicId: string;
  topicLabel?: string;
  answer: string;
  type: "text" | "yes_no" | "multiple_choice";
}

export async function POST(request: Request) {
  try {
    const { propertyId, answers, coveredTopicIds, overallRating, reviewText, travelerName } =
      await request.json() as {
        propertyId: string;
        answers: AnswerPayload[];
        coveredTopicIds?: string[];
        overallRating?: number;
        reviewText?: string;
        travelerName?: string;
      };

    if (!propertyId || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const properties = loadProperties();
    const property = properties.find((p) => p.eg_property_id === propertyId);
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // ── Score before adding the new review ───────────────────────────────────
    const reviewsBefore = getReviewsForProperty(propertyId);
    const analysisBefore = analyzeProperty(property, reviewsBefore);
    const previousScore = analysisBefore.knowledgeHealthScore;

    // ── Persist new review to in-memory store ────────────────────────────────
    const liveAnswers: LiveAnswer[] = answers.map((a) => ({
      topicId: a.topicId,
      topicLabel: a.topicLabel ?? a.topicId,
      answer: a.answer,
      type: a.type,
    }));

    const liveReview: LiveReview = {
      id: randomUUID(),
      propertyId,
      submittedAt: new Date(),
      overallRating: overallRating ?? 0,
      reviewText: reviewText ?? "",
      coveredTopicIds: Array.isArray(coveredTopicIds) ? coveredTopicIds : [],
      answers: liveAnswers,
      travelerName: travelerName ?? "Anonymous",
    };

    reviewStore.addReview(liveReview);

    // ── Invalidate cache so next analyzeProperty picks up the new review ─────
    invalidateAnalysisCache(propertyId);

    // ── Compute new score (now includes the live review) ─────────────────────
    const reviewsAfter = getReviewsForProperty(propertyId);
    const analysisAfter = analyzeProperty(property, reviewsAfter);

    // Topics that improved: answered follow-up topics + topics from review text
    const validAnswers = answers.filter((a) => checkAnswerQuality(a.answer, a.type));
    const answerTopicIds = validAnswers.map((a) => a.topicId);
    const reviewTopicIds = Array.isArray(coveredTopicIds) ? coveredTopicIds : [];
    const improvedTopics = [...new Set([...answerTopicIds, ...reviewTopicIds])];

    const newScore = analysisAfter.knowledgeHealthScore;
    const improvement = newScore - previousScore;

    // ── Push event for SSE (manager notifications) ───────────────────────────
    const propertyName = generateHotelDisplayName(
      property.property_description,
      property.city,
      property.country,
      property.star_rating
    );

    reviewStore.pushEvent({
      id: liveReview.id,
      propertyId,
      propertyName,
      submittedAt: liveReview.submittedAt,
      previousScore,
      newScore,
      improvement,
      improvedTopics,
      reviewText: liveReview.reviewText,
      overallRating: liveReview.overallRating,
      travelerName: liveReview.travelerName,
    });

    return NextResponse.json({
      previousScore,
      newScore,
      improvement,
      improvedTopics,
      rejectedCount: answers.length - validAnswers.length,
    });
  } catch (err) {
    console.error("Error in /api/process-answer:", err);
    return NextResponse.json({ error: "Failed to process answer" }, { status: 500 });
  }
}
