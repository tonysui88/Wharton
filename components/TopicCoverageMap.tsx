"use client";

import { useState } from "react";
import { TopicAnalysis } from "@/lib/analysis";
import { Review } from "@/lib/data";
import { classifyText } from "@/lib/topics";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown, Clock, CheckCircle, MinusCircle, X, ChevronDown } from "lucide-react";

interface TopicCoverageMapProps {
  topics: TopicAnalysis[];
  reviews?: Review[];
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const config = {
    positive: { label: "Positive", class: "bg-green-100 text-green-700 border-green-200" },
    negative: { label: "Negative", class: "bg-red-100 text-red-700 border-red-200" },
    mixed: { label: "Mixed", class: "bg-amber-100 text-amber-700 border-amber-200" },
    unknown: { label: "No data", class: "bg-gray-100 text-gray-500 border-gray-200" },
  };
  const c = config[sentiment as keyof typeof config] || config.unknown;
  return (
    <Badge variant="outline" className={`text-xs ${c.class}`}>
      {c.label}
    </Badge>
  );
}

function GapIcon({ gap }: { gap: string }) {
  if (gap === "high") return <AlertTriangle className="w-4 h-4 text-red-500" />;
  if (gap === "medium") return <Clock className="w-4 h-4 text-amber-500" />;
  if (gap === "low") return <MinusCircle className="w-4 h-4 text-blue-400" />;
  return <CheckCircle className="w-4 h-4 text-green-500" />;
}

function coverageColor(score: number): string {
  if (score >= 0.7) return "#22c55e";
  if (score >= 0.4) return "#f59e0b";
  if (score > 0) return "#ef4444";
  return "#e5e0d8";
}

export default function TopicCoverageMap({ topics, reviews = [] }: TopicCoverageMapProps) {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const relevantTopics = topics.filter((t) => t.isRelevant);
  const irrelevantTopics = topics.filter((t) => !t.isRelevant);

  const selectedTopic = relevantTopics.find((t) => t.topicId === selectedTopicId) ?? null;

  // Find reviews that mention the selected topic
  const topicReviews = selectedTopicId
    ? reviews.filter((r) => {
        if (!r.review_text?.trim()) return false;
        return classifyText(r.review_text).has(selectedTopicId);
      }).slice(0, 10)
    : [];

  const handleSelect = (topicId: string) => {
    setSelectedTopicId((prev) => (prev === topicId ? null : topicId));
  };

  return (
    <div>
      {/* Grid heatmap */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {relevantTopics.map((topic) => (
          <TopicCell
            key={topic.topicId}
            topic={topic}
            isSelected={selectedTopicId === topic.topicId}
            onClick={() => handleSelect(topic.topicId)}
          />
        ))}
      </div>

      {/* Expanded review panel */}
      {selectedTopic && (
        <div className="mb-6 bg-white rounded-2xl border border-[#e5e0d8] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#e5e0d8] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GapIcon gap={selectedTopic.gap} />
              <span className="text-sm font-bold text-[#1a1a2e]">{selectedTopic.topicLabel}</span>
              <span className="text-xs text-gray-400">
                {selectedTopic.reviewCount} {selectedTopic.reviewCount === 1 ? "review mentions this topic" : "reviews mention this topic"}
              </span>
            </div>
            <button
              onClick={() => setSelectedTopicId(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {topicReviews.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-gray-400">No reviews mention this topic yet.</p>
              <p className="text-xs text-gray-300 mt-1">This is a knowledge gap — prompt travelers to share their experience.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#f0ede8]">
              {topicReviews.map((r, i) => (
                <div key={i} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-400">
                      {r.acquisition_date} · {r.rating.overall > 0 ? `${r.rating.overall}/5` : ""}
                    </span>
                  </div>
                  {r.review_title && (
                    <p className="text-xs font-semibold text-[#1a1a2e] mb-0.5">{r.review_title}</p>
                  )}
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">{r.review_text}</p>
                </div>
              ))}
              {selectedTopic.reviewCount > 10 && (
                <div className="px-5 py-3 text-center">
                  <p className="text-xs text-gray-400">Showing 10 of {selectedTopic.reviewCount} reviews</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Not applicable */}
      {irrelevantTopics.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
            Not tracked for this property
          </p>
          <p className="text-xs text-gray-400 mb-2">
            These topics are skipped because this property does not advertise the relevant amenity or service (e.g. no spa, no pool, no eco certification). Collecting reviews on features a hotel doesn&apos;t offer would mislead future guests.
          </p>
          <div className="flex flex-wrap gap-2">
            {irrelevantTopics.map((t) => (
              <Badge key={t.topicId} variant="outline" className="text-xs text-gray-400 border-gray-200">
                {t.topicLabel}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


function TopicCell({
  topic,
  isSelected,
  onClick,
}: {
  topic: TopicAnalysis;
  isSelected: boolean;
  onClick: () => void;
}) {
  const bgColor = isSelected
    ? "#eff6ff"
    : topic.reviewCount === 0
    ? "#fef2f2"
    : topic.gap === "none"
    ? "#f0fdf4"
    : "#fffbeb";

  const borderColor = isSelected
    ? "#3b82f6"
    : topic.reviewCount === 0
    ? "#fecaca"
    : topic.gap === "none"
    ? "#bbf7d0"
    : "#fde68a";

  return (
    <button
      onClick={onClick}
      className="rounded-xl p-3 border text-left w-full transition-all hover:shadow-sm hover:scale-[1.01] active:scale-[0.99]"
      style={{ background: bgColor, borderColor }}
    >
      <div className="flex items-start justify-between gap-1 mb-2">
        <span className="text-sm font-semibold text-[#1a1a2e] leading-tight">{topic.topicLabel}</span>
        <div className="flex items-center gap-1 flex-shrink-0">
          <GapIcon gap={topic.gap} />
          <ChevronDown
            className={`w-3 h-3 text-gray-400 transition-transform ${isSelected ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* Coverage bar */}
      <div className="h-1.5 bg-white rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.round(topic.coverageScore * 100)}%`,
            background: coverageColor(topic.coverageScore),
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {topic.reviewCount} {topic.reviewCount === 1 ? "mention" : "mentions"}
        </span>
        <SentimentBadge sentiment={topic.sentiment} />
      </div>

      {topic.isStale && (
        <div className="mt-1.5 flex items-center gap-1">
          <TrendingDown className="w-3 h-3 text-amber-500" />
          <span className="text-xs text-amber-600">
            Stale ({topic.freshnessDays}d ago)
          </span>
        </div>
      )}

      {topic.hasSentimentShift && (
        <div className="mt-1.5">
          <Badge variant="outline" className="text-xs border-red-300 text-red-600 bg-red-50">
            Sentiment shift
          </Badge>
        </div>
      )}

      {topic.lastMentionDate && !topic.isStale && (
        <div className="mt-1 text-xs text-gray-400">
          Last: {new Date(topic.lastMentionDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
        </div>
      )}
    </button>
  );
}
