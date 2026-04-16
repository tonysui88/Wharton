"use client";

import { useMemo, useState, useEffect } from "react";
import { Player } from "@remotion/player";
import Link from "next/link";
import { FlowButton } from "@/components/ui/flow-button";
import { InfiniteBentoPan } from "@/components/ui/infinite-bento-pan";

function BentoScene() {
  return <InfiniteBentoPan accentColor="#1a8fff" panSpeed={0.55} />;
}

export default function HeroSection() {
  const bentoProps = useMemo(() => ({ speed: 1 }), []);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        className="relative w-full overflow-hidden"
        style={{ minHeight: "92vh" }}
      >
        {/*
          Cover-fit the Remotion Player as a background.
          Remotion Player uses "contain" internally (keeps 16:9 ratio and
          adds black bars). The trick: size the inner wrapper so that its
          own ratio is always exactly 16:9, making it as wide as the
          viewport OR as tall as needed — whichever is larger — then
          overflow+clip the parent.

          CSS max() with mixed viewport units:
            width  = max(100%, 177.8vh)   → fills width AND covers height
            height = max(100%, 56.25vw)   → fills height AND covers width
          This guarantees the 16:9 wrapper always covers the container in
          both axes, with any excess clipped.
        */}
        <div
          className="absolute inset-0 z-0 overflow-hidden"
          aria-hidden="true"
        >
          {mounted && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                /* Cover: grow to fill whichever dimension is constraining */
                width: "max(100%, 177.8vh)",
                height: "max(100%, 56.25vw)",
              }}
            >
              <Player
                component={BentoScene}
                inputProps={bentoProps}
                durationInFrames={300}
                fps={30}
                compositionWidth={1280}
                compositionHeight={720}
                autoPlay
                loop
                controls={false}
                clickToPlay={false}
                style={{ width: "100%", height: "100%", display: "block" }}
                acknowledgeRemotionLicense
              />
            </div>
          )}
        </div>

        {/*
          Gradient overlay — lighter, more vibrant Expedia blue.
          Switched from near-opaque navy to a translucent mid-blue so the
          animated bento shows through noticeably.
        */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(160deg, rgba(0,60,160,0.82) 0%, rgba(0,100,220,0.60) 45%, rgba(0,50,140,0.80) 100%)",
          }}
        />

        {/* Hero copy */}
        <div className="relative z-20 flex flex-col items-center justify-center text-center h-full min-h-[92vh] px-6 py-28">
          <img
            src="/Expedia-Logo.svg.png"
            alt="Expedia"
            className="h-10 w-auto mb-8"
            style={{ filter: "brightness(0) invert(1)", opacity: 0.92 }}
          />

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{
              background: "rgba(255,199,44,0.18)",
              color: "#FFD55A",
              border: "1px solid rgba(255,199,44,0.40)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            ✦ Wharton Hack-AI-thon 2026 · Expedia Group
          </div>

          <h1
            className="text-6xl sm:text-7xl font-extrabold text-white leading-none tracking-tight mb-5"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              textShadow: "0 4px 48px rgba(0,0,0,0.4)",
            }}
          >
            Complete<span style={{ color: "#FFC72C" }}>Stayz</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/75 max-w-2xl leading-relaxed mb-3">
            AI-powered follow-up questions that turn vague hotel reviews into precise
            property intelligence — closing knowledge gaps before the next guest books.
          </p>

          <p
            className="text-sm mb-10 tracking-wide italic"
            style={{ color: "#FFD55A", opacity: 0.85 }}
          >
            A journey to better travel insights
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="/hotels">
              <FlowButton text="Explore Hotels" />
            </Link>
            <Link href="/manager">
              <FlowButton text="Hotel Dashboard" />
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <span className="text-white/30 text-xs uppercase tracking-[0.15em]">Scroll</span>
            <div className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent" />
          </div>
        </div>
      </section>

      {/* ── STATS ROW ───────────────────────────────────────── */}
      <section
        className="w-full"
        style={{
          background: "linear-gradient(90deg, #003B8E 0%, #005BB5 50%, #003B8E 100%)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4">
          {[
            { value: "48,200+", label: "Reviews Analyzed" },
            { value: "9,400+", label: "Knowledge Gaps Closed" },
            { value: "4.8 ★", label: "Avg Guest Rating" },
            { value: "94%",    label: "Response Rate" },
          ].map((s, i) => (
            <div
              key={s.label}
              className="px-8 py-7 text-center"
              style={{
                borderRight: i < 3 ? "1px solid rgba(255,255,255,0.08)" : undefined,
              }}
            >
              <div
                className="text-2xl font-extrabold mb-1"
                style={{ color: "#FFC72C", letterSpacing: "-0.02em" }}
              >
                {s.value}
              </div>
              <div className="text-xs text-white/45 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

    </>
  );
}
