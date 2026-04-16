"use client";

import { GlobeStickers, HOTEL_DESTINATIONS } from "@/components/ui/cobe-globe-stickers";
import { MapPin, Sparkles } from "lucide-react";

export default function GlobeSection() {
  return (
    <section
      className="w-full overflow-hidden"
      style={{ background: "linear-gradient(180deg, #020B1A 0%, #031428 60%, #020B1A 100%)" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Left: copy */}
        <div>
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{
              background: "rgba(255,199,44,0.12)",
              color: "#FFC72C",
              border: "1px solid rgba(255,199,44,0.3)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            <MapPin className="w-3 h-3" />
            Hotels Worldwide
          </div>

          <h2
            className="text-4xl font-extrabold text-white mb-4 leading-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Covering every<br />
            <span style={{
              background: "linear-gradient(90deg, #006FCF, #FFC72C)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              corner of the world
            </span>
          </h2>

          <p className="text-white/55 text-base leading-relaxed mb-8 max-w-md">
            From boutique Parisian hotels to Bali jungle retreats — our AI fills the knowledge
            gaps in reviews across{" "}
            <span className="text-white/90 font-semibold">4,700+ properties</span>{" "}
            in 340 cities so every traveller can book with confidence.
          </p>

          {/* Destination pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {HOTEL_DESTINATIONS.slice(0, 8).map((dest) => (
              <div
                key={dest.id}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  background: "rgba(0,111,207,0.12)",
                  border: "1px solid rgba(0,111,207,0.25)",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                <span>{dest.emoji}</span>
                {dest.city}
              </div>
            ))}
            <div
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: "rgba(255,199,44,0.1)",
                border: "1px solid rgba(255,199,44,0.25)",
                color: "#FFC72C",
              }}
            >
              +330 more
            </div>
          </div>

          {/* Instruction */}
          <div
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <Sparkles className="w-4 h-4 text-[#FFC72C] flex-shrink-0 mt-0.5" />
            <p className="text-white/50 text-sm leading-relaxed">
              <span className="text-white/80 font-medium">Hover over a marker</span> on the globe
              to see real reviews, knowledge gaps filled, and booking improvements for that destination.
              <br />
              <span className="text-white/30 text-xs mt-1 block">Drag to rotate · Scroll to zoom</span>
            </p>
          </div>
        </div>

        {/* Right: globe */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[520px]">
            {/* Glow ring behind globe */}
            <div
              className="absolute inset-0 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ background: "radial-gradient(circle, #006FCF 0%, transparent 70%)" }}
            />
            <GlobeStickers
              className="relative z-10"
              speed={0.004}
              accentColor="#006FCF"
            />
          </div>
        </div>

      </div>

      {/* Bottom stat strip */}
      <div
        className="border-t w-full"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-3 sm:grid-cols-5 gap-4">
          {[
            { value: "340", label: "Cities" },
            { value: "4,700+", label: "Properties" },
            { value: "48k+", label: "Reviews" },
            { value: "9,400+", label: "Gaps Closed" },
            { value: "4.8★", label: "Avg Rating" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-white font-extrabold text-lg" style={{ letterSpacing: "-0.02em" }}>
                {s.value}
              </div>
              <div className="text-white/30 text-xs uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
