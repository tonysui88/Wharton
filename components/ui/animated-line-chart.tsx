"use client";

import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface AnimatedLineChartProps {
  data?: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  background?: string;
  gridColor?: string;
  showDot?: boolean;
  speed?: number;
  className?: string;
  label?: string;
  sublabel?: string;
}

export function AnimatedLineChart({
  data = [42, 51, 47, 58, 63, 55, 72, 68, 79, 85, 81, 91],
  width = 1000,
  height = 500,
  strokeColor = "#006FCF",
  strokeWidth = 4,
  background = "transparent",
  gridColor = "rgba(255,255,255,0.08)",
  showDot = true,
  speed = 1,
  className,
  label = "Knowledge Health Score",
  sublabel = "rolling 12-week average across all properties",
}: AnimatedLineChartProps) {
  const frame = useCurrentFrame() * speed;
  const { fps, durationInFrames } = useVideoConfig();

  const padding = 60;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * innerWidth;
    const y = padding + innerHeight - ((value - min) / range) * innerHeight;
    return { x, y };
  });

  let pathLength = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    pathLength += Math.sqrt(dx * dx + dy * dy);
  }

  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");

  // Area fill path (line + close to bottom)
  const areaD =
    d +
    ` L${points[points.length - 1].x.toFixed(2)},${(padding + innerHeight).toFixed(2)}` +
    ` L${points[0].x.toFixed(2)},${(padding + innerHeight).toFixed(2)} Z`;

  const progress = spring({
    frame,
    fps,
    durationInFrames: Math.round(durationInFrames * 0.85),
    config: { damping: 200 },
  });

  const dashOffset = pathLength * (1 - progress);

  const targetLen = pathLength * progress;
  let traveled = 0;
  let dotX = points[0].x;
  let dotY = points[0].y;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const segLen = Math.sqrt(dx * dx + dy * dy);
    if (traveled + segLen >= targetLen) {
      const t = (targetLen - traveled) / segLen;
      dotX = points[i - 1].x + dx * t;
      dotY = points[i - 1].y + dy * t;
      break;
    }
    traveled += segLen;
    dotX = points[i].x;
    dotY = points[i].y;
  }

  const gridRows = 4;
  const gridCols = data.length - 1;

  // Y-axis labels (min → max mapped to actual values)
  const yLabels = Array.from({ length: gridRows + 1 }, (_, i) => {
    const val = min + ((gridRows - i) / gridRows) * range;
    return { y: padding + (i / gridRows) * innerHeight, val: Math.round(val) };
  });

  // X-axis week labels
  const weeks = ["W1", "W3", "W5", "W7", "W9", "W11"];

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background,
        fontFamily:
          "var(--font-geist-sans), 'Plus Jakarta Sans', -apple-system, sans-serif",
        padding: 40,
      }}
    >
      {/* Header */}
      <div
        style={{
          width: width,
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            {label}
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
            {sublabel}
          </div>
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 800,
            color: strokeColor,
            letterSpacing: "-0.04em",
          }}
        >
          {Math.round(min + range * progress)}
          <span style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
            /100
          </span>
        </div>
      </div>

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
          <clipPath id="progressClip">
            <rect
              x={0}
              y={0}
              width={padding + (pathLength > 0 ? (1 - dashOffset / pathLength) * innerWidth : 0)}
              height={height}
            />
          </clipPath>
        </defs>

        {/* Horizontal grid */}
        {yLabels.map(({ y, val }, i) => (
          <g key={`h-${i}`}>
            <line
              x1={padding}
              x2={padding + innerWidth}
              y1={y}
              y2={y}
              stroke={gridColor}
              strokeWidth={1}
            />
            <text
              x={padding - 10}
              y={y + 4}
              textAnchor="end"
              fontSize={11}
              fill="rgba(255,255,255,0.3)"
              fontFamily="ui-monospace, monospace"
            >
              {val}
            </text>
          </g>
        ))}

        {/* Vertical grid */}
        {Array.from({ length: gridCols + 1 }).map((_, i) => {
          const x = padding + (i / gridCols) * innerWidth;
          return (
            <g key={`v-${i}`}>
              <line
                x1={x}
                x2={x}
                y1={padding}
                y2={padding + innerHeight}
                stroke={gridColor}
                strokeWidth={1}
              />
              {i % 2 === 0 && weeks[i / 2] && (
                <text
                  x={x}
                  y={padding + innerHeight + 20}
                  textAnchor="middle"
                  fontSize={11}
                  fill="rgba(255,255,255,0.3)"
                  fontFamily="ui-monospace, monospace"
                >
                  {weeks[i / 2]}
                </text>
              )}
            </g>
          );
        })}

        {/* Axes */}
        <line
          x1={padding} x2={padding}
          y1={padding} y2={padding + innerHeight}
          stroke={gridColor} strokeWidth={2}
        />
        <line
          x1={padding} x2={padding + innerWidth}
          y1={padding + innerHeight} y2={padding + innerHeight}
          stroke={gridColor} strokeWidth={2}
        />

        {/* Area fill — clipped to progress */}
        <path
          d={areaD}
          fill="url(#areaGrad)"
          clipPath="url(#progressClip)"
        />

        {/* Animated line */}
        <path
          d={d}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={pathLength}
          strokeDashoffset={dashOffset}
          style={{ filter: `drop-shadow(0 0 10px ${strokeColor}88)` }}
        />

        {/* Data point dots (revealed as line draws) */}
        {points.map((p, i) => {
          const pointProgress = i / (points.length - 1);
          if (progress < pointProgress) return null;
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={3}
              fill={strokeColor}
              opacity={0.6}
            />
          );
        })}

        {/* Leading dot */}
        {showDot && progress > 0.02 && progress < 0.99 && (
          <circle
            cx={dotX}
            cy={dotY}
            r={strokeWidth * 2.5}
            fill={strokeColor}
            style={{ filter: `drop-shadow(0 0 10px ${strokeColor})` }}
          />
        )}
      </svg>
    </div>
  );
}
