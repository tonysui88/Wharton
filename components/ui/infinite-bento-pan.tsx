"use client";

import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export interface InfiniteBentoPanProps {
  panSpeed?: number;
  accentColor?: string;
  speed?: number;
  className?: string;
}

const FONT_FAMILY =
  "var(--font-geist-sans), 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif";

const SUPER_W = 3500;
const SUPER_H = 2500;

type CardKind =
  | "chart"
  | "counter"
  | "gradient"
  | "stars"
  | "logo"
  | "stat"
  | "bars"
  | "quote";

interface CardDef {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: CardKind;
  hue: number;
  label?: string;
  value?: string;
  text?: string;
}

const CARDS: CardDef[] = [
  { x: 80,  y: 80,  w: 480, h: 280, kind: "chart",    hue: 220, label: "Knowledge Health Score" },
  { x: 600, y: 80,  w: 280, h: 280, kind: "counter",  hue: 210, label: "Reviews", value: "48.2k" },
  { x: 920, y: 80,  w: 360, h: 180, kind: "gradient", hue: 200 },
  { x: 1320,y: 80,  w: 480, h: 280, kind: "quote",    hue: 0,   text: "The pool view exceeded every expectation. Staff remembered our names all week." },
  { x: 1840,y: 80,  w: 280, h: 280, kind: "logo",     hue: 210 },
  { x: 2160,y: 80,  w: 380, h: 180, kind: "stat",     hue: 160, label: "Response Rate", value: "94" },
  { x: 2580,y: 80,  w: 360, h: 280, kind: "bars",     hue: 40,  label: "Gap Topics Filled" },
  { x: 920, y: 300, w: 360, h: 200, kind: "counter",  hue: 180, label: "Properties", value: "1.2k" },
  { x: 2160,y: 300, w: 380, h: 200, kind: "chart",    hue: 100, label: "Avg Rating" },
  { x: 80,  y: 400, w: 280, h: 280, kind: "gradient", hue: 200 },
  { x: 400, y: 400, w: 480, h: 280, kind: "quote",    hue: 0,   text: "Finally, a hotel that asked the right questions about accessibility. Truly helpful." },
  { x: 1320,y: 420, w: 280, h: 280, kind: "stat",     hue: 60,  label: "Satisfaction", value: "97" },
  { x: 1640,y: 420, w: 380, h: 280, kind: "bars",     hue: 210, label: "Questions Asked" },
  { x: 2580,y: 420, w: 360, h: 280, kind: "logo",     hue: 190 },
  { x: 80,  y: 720, w: 480, h: 240, kind: "chart",    hue: 210, label: "Review Completeness" },
  { x: 600, y: 720, w: 280, h: 240, kind: "stat",     hue: 20,  label: "Avg Stars", value: "4.8" },
  { x: 920, y: 740, w: 380, h: 220, kind: "gradient", hue: 215 },
  { x: 1320,y: 740, w: 360, h: 220, kind: "counter",  hue: 140, label: "Gaps Closed", value: "9.4k" },
  { x: 1720,y: 740, w: 480, h: 240, kind: "quote",    hue: 0,   text: "Answering follow-up questions took 90 seconds. Now I trust my reviews actually help." },
  { x: 2240,y: 740, w: 360, h: 240, kind: "bars",     hue: 210, label: "Amenity Coverage" },
  { x: 80,  y: 1000,w: 360, h: 220, kind: "logo",     hue: 200 },
  { x: 460, y: 1000,w: 380, h: 220, kind: "stat",     hue: 80,  label: "Cleanliness", value: "98" },
  { x: 880, y: 1000,w: 480, h: 220, kind: "chart",    hue: 210, label: "Traveler Trust" },
  { x: 1400,y: 1000,w: 280, h: 220, kind: "counter",  hue: 360, label: "Follow-ups", value: "31k" },
  { x: 1720,y: 1020,w: 360, h: 220, kind: "gradient", hue: 205 },
  { x: 2120,y: 1020,w: 380, h: 220, kind: "quote",    hue: 0,   text: "We filled 12 knowledge gaps in one week. Booking conversions up 23%." },
  { x: 2540,y: 1020,w: 400, h: 220, kind: "bars",     hue: 210, label: "Location Scores" },
  { x: 80,  y: 1280,w: 480, h: 260, kind: "quote",    hue: 0,   text: "CompleteStayz turns vague feedback into precise insights our team can actually use." },
  { x: 600, y: 1280,w: 360, h: 260, kind: "chart",    hue: 210, label: "Sentiment Trend" },
  { x: 1000,y: 1280,w: 280, h: 260, kind: "logo",     hue: 195 },
  { x: 1320,y: 1280,w: 380, h: 260, kind: "stat",     hue: 200, label: "Uptime", value: "99.9" },
  { x: 1740,y: 1280,w: 360, h: 260, kind: "counter",  hue: 210, label: "Hotels", value: "4.7k" },
  { x: 2140,y: 1280,w: 380, h: 260, kind: "gradient", hue: 210 },
  { x: 2560,y: 1280,w: 380, h: 260, kind: "bars",     hue: 30,  label: "Service Quality" },
  { x: 80,  y: 1600,w: 380, h: 220, kind: "stat",     hue: 210, label: "NPS Score", value: "72" },
  { x: 500, y: 1600,w: 480, h: 220, kind: "chart",    hue: 40,  label: "Review Volume" },
  { x: 1020,y: 1600,w: 360, h: 220, kind: "quote",    hue: 0,   text: "Room service hours were a mystery until this tool got our guests to mention it." },
  { x: 1420,y: 1600,w: 280, h: 220, kind: "logo",     hue: 220 },
  { x: 1740,y: 1620,w: 380, h: 220, kind: "counter",  hue: 100, label: "Insights", value: "88k" },
  { x: 2160,y: 1620,w: 360, h: 220, kind: "bars",     hue: 210, label: "Pool & Spa Topics" },
  { x: 2560,y: 1620,w: 380, h: 220, kind: "gradient", hue: 195 },
  { x: 80,  y: 1880,w: 480, h: 240, kind: "bars",     hue: 210, label: "F&B Coverage" },
  { x: 600, y: 1880,w: 380, h: 240, kind: "gradient", hue: 205 },
  { x: 1020,y: 1880,w: 360, h: 240, kind: "logo",     hue: 210 },
  { x: 1420,y: 1880,w: 480, h: 240, kind: "chart",    hue: 210, label: "Guest Happiness" },
  { x: 1940,y: 1880,w: 280, h: 240, kind: "counter",  hue: 20,  label: "Cities", value: "340" },
  { x: 2260,y: 1880,w: 380, h: 240, kind: "stat",     hue: 140, label: "Knowledge Score", value: "86" },
  { x: 2680,y: 1880,w: 260, h: 240, kind: "stars",    hue: 40 },
];

function noise(i: number, frame: number) {
  return Math.sin(frame / 30 + i) * 0.5 + 0.5;
}

function StarRating({ accent, t }: { accent: string; t: number }) {
  const rating = 4 + (Math.sin(t) > 0 ? 1 : 0);
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column" }}>
      <div style={{ display: "flex", gap: 4 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} width="28" height="28" viewBox="0 0 24 24">
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={i < rating ? accent : "rgba(255,255,255,0.12)"}
              stroke="none"
            />
          </svg>
        ))}
      </div>
      <div style={{ fontSize: 38, fontWeight: 800, color: "white", letterSpacing: "-0.04em" }}>
        {(4.2 + Math.sin(t) * 0.3).toFixed(1)}
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        avg guest rating
      </div>
    </div>
  );
}

function ChartCard({ accent, t }: { accent: string; t: number }) {
  const points: string[] = [];
  for (let i = 0; i < 12; i++) {
    const x = (i / 11) * 100;
    const y = 50 - (Math.sin(i * 0.7 + t) * 18 + Math.cos(i * 0.4 + t * 0.6) * 8);
    points.push(`${x},${y}`);
  }
  return (
    <svg viewBox="0 0 100 60" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={accent}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points={`${points.join(" ")} 100,60 0,60`}
        fill={`${accent}22`}
        stroke="none"
      />
    </svg>
  );
}

function BarsCard({ accent, t }: { accent: string; t: number }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: "100%", width: "100%" }}>
      {Array.from({ length: 10 }).map((_, i) => {
        const h = 25 + (Math.sin(i * 0.8 + t) * 0.5 + 0.5) * 70;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${h}%`,
              background: `linear-gradient(180deg, ${accent} 0%, ${accent}55 100%)`,
              borderRadius: 4,
            }}
          />
        );
      })}
    </div>
  );
}

function QuoteCard({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
      <div style={{ fontSize: 28, color: "rgba(255,255,255,0.2)", fontFamily: "Georgia, serif", lineHeight: 1, marginBottom: 8 }}>&ldquo;</div>
      <p style={{
        fontSize: 13,
        color: "rgba(255,255,255,0.75)",
        lineHeight: 1.6,
        fontStyle: "italic",
        flex: 1,
        display: "flex",
        alignItems: "center",
      }}>
        {text}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg, #006FCF, #FFC72C)" }} />
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.03em" }}>
          Verified traveler
        </div>
      </div>
    </div>
  );
}

function LogoCard({ accent, hue }: { accent: string; hue: number }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        width: 72,
        height: 72,
        borderRadius: 18,
        background: `linear-gradient(135deg, hsl(${hue},75%,45%) 0%, hsl(${(hue + 30) % 360},60%,35%) 100%)`,
        boxShadow: `0 12px 32px ${accent}44`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {/* Simplified hotel icon */}
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" fill="none" />
          <path d="M9 22V12h6v10" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
}

function GradientCard({ hue }: { hue: number }) {
  return (
    <div style={{
      width: "100%",
      height: "100%",
      background: `radial-gradient(circle at 30% 30%, hsl(${hue},75%,50%) 0%, hsl(${(hue + 40) % 360},65%,30%) 50%, #0a0f1a 100%)`,
    }} />
  );
}

function Card({
  card,
  accent,
  index,
  frame,
}: {
  card: CardDef;
  accent: string;
  index: number;
  frame: number;
}) {
  const t = noise(index, frame) * 6.28;
  const baseStyle: React.CSSProperties = {
    position: "absolute",
    left: card.x,
    top: card.y,
    width: card.w,
    height: card.h,
    borderRadius: 18,
    background: "linear-gradient(180deg, #0d1526 0%, #080e1c 100%)",
    border: "1px solid rgba(255,255,255,0.07)",
    overflow: "hidden",
    padding: 20,
    color: "white",
    display: "flex",
    flexDirection: "column",
  };

  const labelEl = card.label ? (
    <div style={{
      fontSize: 11,
      fontWeight: 600,
      color: "rgba(255,255,255,0.4)",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      marginBottom: 8,
    }}>
      {card.label}
    </div>
  ) : null;

  if (card.kind === "chart") {
    return (
      <div style={baseStyle}>
        {labelEl}
        <div style={{ flex: 1 }}><ChartCard accent={accent} t={t} /></div>
      </div>
    );
  }
  if (card.kind === "bars") {
    return (
      <div style={baseStyle}>
        {labelEl}
        <div style={{ flex: 1 }}><BarsCard accent={accent} t={t} /></div>
      </div>
    );
  }
  if (card.kind === "stars") {
    return (
      <div style={baseStyle}>
        <StarRating accent="#FFC72C" t={t} />
      </div>
    );
  }
  if (card.kind === "counter") {
    const base = parseFloat(card.value ?? "1000");
    const v = base + noise(index, frame) * base * 0.05;
    const display = v >= 1000
      ? `${(v / 1000).toFixed(1)}k`
      : Math.floor(v).toLocaleString();
    return (
      <div style={baseStyle}>
        {labelEl}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-start", fontSize: 52, fontWeight: 800, letterSpacing: "-0.04em", color: "white" }}>
          {display}
        </div>
        <div style={{ fontSize: 12, color: accent, fontWeight: 600 }}>
          +{(noise(index + 1, frame) * 14).toFixed(1)}% this month
        </div>
      </div>
    );
  }
  if (card.kind === "stat") {
    const base = parseFloat(card.value ?? "95");
    const v = (base - 2 + noise(index, frame) * 4).toFixed(1);
    const suffix = base > 10 ? "%" : "";
    return (
      <div style={baseStyle}>
        {labelEl}
        <div style={{ flex: 1, display: "flex", alignItems: "center", fontSize: 48, fontWeight: 800, letterSpacing: "-0.03em", color: accent }}>
          {v}
          <span style={{ fontSize: 18, color: "rgba(255,255,255,0.35)", marginLeft: 4, fontWeight: 500 }}>{suffix}</span>
        </div>
      </div>
    );
  }
  if (card.kind === "quote") {
    return (
      <div style={baseStyle}>
        <QuoteCard text={card.text ?? ""} />
      </div>
    );
  }
  if (card.kind === "logo") {
    return <div style={{ ...baseStyle, padding: 0 }}><LogoCard accent={accent} hue={card.hue} /></div>;
  }
  // gradient
  return <div style={{ ...baseStyle, padding: 0 }}><GradientCard hue={card.hue} /></div>;
}

export function InfiniteBentoPan({
  panSpeed = 1,
  accentColor = "#006FCF",
  speed = 1,
  className,
}: InfiniteBentoPanProps) {
  const frame = useCurrentFrame() * speed;
  const { durationInFrames, width, height } = useVideoConfig();

  const maxX = SUPER_W - width;
  const maxY = SUPER_H - height;

  const t = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const px = t * maxX * Math.min(1, panSpeed);
  const py = t * maxY * Math.min(1, panSpeed);

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        background: "#050d1a",
        overflow: "hidden",
        fontFamily: FONT_FAMILY,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: SUPER_W,
          height: SUPER_H,
          transform: `translate(${-px}px, ${-py}px)`,
          willChange: "transform",
        }}
      >
        {CARDS.map((c, i) => (
          <Card key={i} card={c} accent={accentColor} index={i} frame={frame} />
        ))}
      </div>
      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 25%, rgba(5,13,26,0.7) 70%, rgba(5,13,26,0.95) 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
