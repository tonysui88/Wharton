"use client";

import { Search, BarChart3, MessageSquare, Sparkles, Database } from "lucide-react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";

const processData = [
  {
    id: 1,
    title: "Ingest",
    date: "Step 1",
    content:
      "Raw reviews are ingested and parsed. Each review is tokenised, stripped of noise, and queued for deep semantic analysis.",
    category: "Data",
    icon: Database,
    relatedIds: [2],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 2,
    title: "Detect Gaps",
    date: "Step 2",
    content:
      "Our AI maps review content against 40+ hotel knowledge dimensions — amenities, cleanliness, location, service — and flags what's missing.",
    category: "Analysis",
    icon: Search,
    relatedIds: [1, 3],
    status: "completed" as const,
    energy: 92,
  },
  {
    id: 3,
    title: "Score",
    date: "Step 3",
    content:
      "A Knowledge Health Score is computed per property, weighting gaps by traveller importance and review recency.",
    category: "Scoring",
    icon: BarChart3,
    relatedIds: [2, 4],
    status: "in-progress" as const,
    energy: 75,
  },
  {
    id: 4,
    title: "Ask",
    date: "Step 4",
    content:
      "Personalised follow-up questions are crafted for reviewers whose stays covered the highest-value uncovered topics.",
    category: "Engagement",
    icon: MessageSquare,
    relatedIds: [3, 5],
    status: "in-progress" as const,
    energy: 55,
  },
  {
    id: 5,
    title: "Learn",
    date: "Step 5",
    content:
      "New responses close knowledge gaps, update the property graph, and improve future question targeting — the system gets smarter with every cycle.",
    category: "Learning",
    icon: Sparkles,
    relatedIds: [4],
    status: "pending" as const,
    energy: 30,
  },
];

export default function HowItWorks() {
  return (
    <section className="w-full py-16 px-6" style={{ background: "#0d0d1a" }}>
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
            style={{ background: "#ff6b3520", color: "#ff6b35", border: "1px solid #ff6b3540" }}
          >
            <Sparkles className="w-3 h-3" />
            Intelligence Pipeline
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-3">
            How{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #ff6b35, #f59e0b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Ask What Matters
            </span>{" "}
            works
          </h2>
          <p className="text-white/50 text-sm max-w-xl mx-auto">
            Click any node to explore the stage. Related stages pulse to show
            how the pipeline connects.
          </p>
        </div>

        {/* Timeline */}
        <RadialOrbitalTimeline timelineData={processData} />

        {/* Step legend */}
        <div className="grid grid-cols-5 gap-3 mt-8">
          {processData.map((step) => {
            const Icon = step.icon;
            const statusColor =
              step.status === "completed"
                ? "#22c55e"
                : step.status === "in-progress"
                ? "#ff6b35"
                : "#64748b";
            return (
              <div
                key={step.id}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: `${statusColor}20`, border: `1px solid ${statusColor}40` }}
                >
                  <Icon size={14} style={{ color: statusColor }} />
                </div>
                <span className="text-xs font-semibold text-white/80">{step.title}</span>
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: `${statusColor}20`, color: statusColor }}
                >
                  {step.status === "completed" ? "Live" : step.status === "in-progress" ? "Active" : "Soon"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
