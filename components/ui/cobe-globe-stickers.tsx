"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import createGlobe from "cobe";
import { Star, MapPin, TrendingUp, X } from "lucide-react";

export interface HotelDestination {
  id: string;
  location: [number, number]; // [lat, lng]
  emoji: string;
  city: string;
  country: string;
  hotel: string;
  rating: number;
  reviewCount: number;
  topReview: string;
  knowledgeScore: number;
  gapFilled: string;
  trend: number; // % improvement
}

export const HOTEL_DESTINATIONS: HotelDestination[] = [
  {
    id: "paris",
    location: [48.86, 2.35],
    emoji: "🥐",
    city: "Paris",
    country: "France",
    hotel: "Le Marais Boutique Hotel",
    rating: 4.8,
    reviewCount: 1240,
    topReview: "The breakfast was divine, but I never knew about the hidden rooftop bar until checkout.",
    knowledgeScore: 91,
    gapFilled: "Rooftop access hours & reservation policy",
    trend: 23,
  },
  {
    id: "tokyo",
    location: [35.68, 139.69],
    emoji: "🗼",
    city: "Tokyo",
    country: "Japan",
    hotel: "Shinjuku Grand Hotel",
    rating: 4.9,
    reviewCount: 2180,
    topReview: "I wish the capsule breakfast options had been mentioned in reviews — total surprise.",
    knowledgeScore: 88,
    gapFilled: "On-site dining hours & vegetarian options",
    trend: 18,
  },
  {
    id: "nyc",
    location: [40.71, -74.01],
    emoji: "🍎",
    city: "New York",
    country: "USA",
    hotel: "Midtown Central Suites",
    rating: 4.6,
    reviewCount: 3410,
    topReview: "Nobody mentioned the gym closes at 8pm — that would have changed my booking decision.",
    knowledgeScore: 79,
    gapFilled: "Fitness centre hours & equipment details",
    trend: 31,
  },
  {
    id: "bali",
    location: [-8.34, 115.09],
    emoji: "🌺",
    city: "Bali",
    country: "Indonesia",
    hotel: "Ubud Jungle Retreat",
    rating: 4.9,
    reviewCount: 987,
    topReview: "The rice terrace sunrise walk was the highlight — I found out about it on arrival, not in reviews.",
    knowledgeScore: 94,
    gapFilled: "Guided experiences & complimentary activities",
    trend: 42,
  },
  {
    id: "sydney",
    location: [-33.87, 151.21],
    emoji: "🐨",
    city: "Sydney",
    country: "Australia",
    hotel: "Harbour Bridge Residences",
    rating: 4.7,
    reviewCount: 1560,
    topReview: "The ferry schedule from the hotel dock was a mystery until I asked at reception.",
    knowledgeScore: 83,
    gapFilled: "Transport links & ferry timetables",
    trend: 19,
  },
  {
    id: "dubai",
    location: [25.2, 55.27],
    emoji: "🌅",
    city: "Dubai",
    country: "UAE",
    hotel: "Downtown Palace Hotel",
    rating: 4.8,
    reviewCount: 2090,
    topReview: "Pool access during Ramadan was confusing — more context in reviews would have helped.",
    knowledgeScore: 86,
    gapFilled: "Seasonal pool & dining hour changes",
    trend: 27,
  },
  {
    id: "london",
    location: [51.51, -0.13],
    emoji: "☕",
    city: "London",
    country: "UK",
    hotel: "Covent Garden Suites",
    rating: 4.7,
    reviewCount: 1890,
    topReview: "The afternoon tea was included in our rate — I almost booked elsewhere missing this detail.",
    knowledgeScore: 89,
    gapFilled: "Rate inclusions & complimentary services",
    trend: 15,
  },
  {
    id: "barcelona",
    location: [41.39, 2.17],
    emoji: "🎨",
    city: "Barcelona",
    country: "Spain",
    hotel: "Gothic Quarter Inn",
    rating: 4.6,
    reviewCount: 1320,
    topReview: "The noise from La Rambla at night wasn't mentioned once in 1,300 reviews. Surprising.",
    knowledgeScore: 72,
    gapFilled: "Noise levels by room type & floor",
    trend: 38,
  },
  {
    id: "singapore",
    location: [1.29, 103.85],
    emoji: "🦁",
    city: "Singapore",
    country: "Singapore",
    hotel: "Marina Bay Residences",
    rating: 4.9,
    reviewCount: 2760,
    topReview: "The infinity pool time slots were never mentioned — I queued for 45 minutes unnecessarily.",
    knowledgeScore: 85,
    gapFilled: "Pool booking system & peak hour guidance",
    trend: 29,
  },
  {
    id: "capetown",
    location: [-33.93, 18.42],
    emoji: "🏔️",
    city: "Cape Town",
    country: "South Africa",
    hotel: "V&A Waterfront Hotel",
    rating: 4.8,
    reviewCount: 876,
    topReview: "Table Mountain cable car booking from the concierge saved our trip — not one review mentioned it.",
    knowledgeScore: 90,
    gapFilled: "Concierge services & local booking assistance",
    trend: 44,
  },
];

interface GlobeStickersProps {
  destinations?: HotelDestination[];
  className?: string;
  speed?: number;
  accentColor?: string;
}

// Spherical to screen projection for hover detection
function projectToScreen(
  lat: number,
  lng: number,
  phi: number,
  theta: number,
  canvasSize: number
): { x: number; y: number; visible: boolean } {
  const latR = (lat * Math.PI) / 180;
  const lngR = (lng * Math.PI) / 180;

  // Unit sphere cartesian
  let x = Math.cos(latR) * Math.sin(lngR);
  const y0 = Math.sin(latR);
  let z = Math.cos(latR) * Math.cos(lngR);

  // Y-axis rotation (phi — globe spin)
  const cosP = Math.cos(phi);
  const sinP = Math.sin(phi);
  const x1 = x * cosP + z * sinP;
  const z1 = -x * sinP + z * cosP;

  // X-axis rotation (theta — tilt)
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const y1 = y0 * cosT - z1 * sinT;
  const z2 = y0 * sinT + z1 * cosT;

  const radius = canvasSize * 0.45;
  const cx = canvasSize / 2;
  const cy = canvasSize / 2;

  return {
    x: cx + x1 * radius,
    y: cy - y1 * radius,
    visible: z2 > 0,
  };
}

export function GlobeStickers({
  destinations = HOTEL_DESTINATIONS,
  className = "",
  speed = 0.004,
  accentColor = "#006FCF",
}: GlobeStickersProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const phiRef = useRef(0);
  const thetaRef = useRef(0.25);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, phi: 0, theta: 0 });
  const [hoveredDest, setHoveredDest] = useState<HotelDestination | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState(0);

  // Pointer drag handlers
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, phi: phiRef.current, theta: thetaRef.current };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) {
      // Hover: find nearest visible marker
      const canvas = canvasRef.current;
      if (!canvas || canvasSize === 0) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const cx = canvasSize / 2;
      const cy = canvasSize / 2;
      const radius = canvasSize * 0.45;

      let bestDest: HotelDestination | null = null;
      let bestDist = Infinity;
      const threshold = radius * 0.18; // ~8% of globe radius

      destinations.forEach((dest) => {
        const proj = projectToScreen(
          dest.location[0],
          dest.location[1],
          phiRef.current,
          thetaRef.current,
          canvasSize
        );
        if (!proj.visible) return;
        const dx = proj.x - mx;
        const dy = proj.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < threshold && dist < bestDist) {
          bestDist = dist;
          bestDest = dest;
        }
      });

      setHoveredDest(bestDest);
      if (bestDest) {
        const proj = projectToScreen(
          (bestDest as HotelDestination).location[0],
          (bestDest as HotelDestination).location[1],
          phiRef.current,
          thetaRef.current,
          canvasSize
        );
        // Position tooltip relative to canvas
        setTooltipPos({ x: proj.x, y: proj.y });
      }
      return;
    }
    // Drag: rotate globe
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    phiRef.current = dragStart.current.phi - dx / 250;
    thetaRef.current = Math.max(-0.5, Math.min(0.6, dragStart.current.theta + dy / 600));
  }, [destinations, canvasSize]);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const onPointerLeave = useCallback(() => {
    setHoveredDest(null);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let globe: ReturnType<typeof createGlobe> | null = null;
    let raf = 0;

    function init() {
      const w = canvas!.offsetWidth;
      if (w === 0 || globe) return;
      setCanvasSize(w);

      globe = createGlobe(canvas!, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width: w,
        height: w,
        phi: phiRef.current,
        theta: thetaRef.current,
        dark: 1,
        diffuse: 1.8,
        mapSamples: 20000,
        mapBrightness: 6,
        baseColor: [0.1, 0.2, 0.45],
        markerColor: [1, 0.85, 0.2],
        glowColor: [0.2, 0.5, 0.9],
        markers: destinations.map((d) => ({
          location: d.location,
          size: 0.055,
        })),
      });

      function animate() {
        raf = requestAnimationFrame(animate);
        if (!isDragging.current) phiRef.current += speed;
        globe!.update({ phi: phiRef.current, theta: thetaRef.current });
      }
      raf = requestAnimationFrame(animate);

      canvas!.style.opacity = "1";
    }

    if (canvas.offsetWidth > 0) {
      init();
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect();
          init();
        }
      });
      ro.observe(canvas);
      return () => ro.disconnect();
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      globe?.destroy();
    };
  }, [destinations, speed]);

  return (
    <div
      ref={wrapperRef}
      className={`relative select-none ${className}`}
      style={{ aspectRatio: "1 / 1" }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
        style={{
          width: "100%",
          height: "100%",
          cursor: isDragging.current ? "grabbing" : "grab",
          opacity: 0,
          transition: "opacity 1.2s ease",
          borderRadius: "50%",
          touchAction: "none",
          display: "block",
        }}
      />

      {/* Hover tooltip card */}
      {hoveredDest && canvasSize > 0 && (() => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        const scaleX = rect.width / canvasSize;
        const scaleY = rect.height / canvasSize;
        const px = tooltipPos.x * scaleX;
        const py = tooltipPos.y * scaleY;

        // Keep card within bounds
        const cardW = 280;
        const cardH = 200;
        let left = px + 16;
        let top = py - cardH / 2;
        if (left + cardW > rect.width) left = px - cardW - 16;
        if (top < 8) top = 8;
        if (top + cardH > rect.height - 8) top = rect.height - cardH - 8;

        return (
          <div
            className="absolute z-50 pointer-events-none"
            style={{ left, top, width: cardW }}
          >
            <div
              className="rounded-2xl overflow-hidden shadow-2xl"
              style={{
                background: "rgba(5, 15, 40, 0.96)",
                border: "1px solid rgba(0,111,207,0.35)",
                backdropFilter: "blur(12px)",
              }}
            >
              {/* Card header */}
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ background: "rgba(0,80,180,0.25)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{hoveredDest.emoji}</span>
                  <div>
                    <div className="text-white font-bold text-sm leading-tight">{hoveredDest.city}</div>
                    <div className="text-white/40 text-xs">{hoveredDest.country}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={11} className="fill-[#FFC72C] text-[#FFC72C]" />
                  <span className="text-[#FFC72C] font-bold text-sm">{hoveredDest.rating}</span>
                  <span className="text-white/30 text-xs ml-1">({(hoveredDest.reviewCount / 1000).toFixed(1)}k)</span>
                </div>
              </div>

              {/* Hotel name */}
              <div className="px-4 pt-3 pb-1">
                <div className="text-white/60 text-xs flex items-center gap-1 mb-1">
                  <MapPin size={10} />
                  {hoveredDest.hotel}
                </div>

                {/* Review snippet */}
                <p className="text-white/80 text-xs leading-relaxed italic mb-3">
                  &ldquo;{hoveredDest.topReview}&rdquo;
                </p>

                {/* Gap filled */}
                <div
                  className="rounded-lg px-3 py-2 mb-3"
                  style={{ background: "rgba(0,111,207,0.15)", border: "1px solid rgba(0,111,207,0.25)" }}
                >
                  <div className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Gap filled by CompleteStayz</div>
                  <div className="text-white/90 text-xs font-medium">{hoveredDest.gapFilled}</div>
                </div>

                {/* Score + trend */}
                <div className="flex items-center justify-between pb-3">
                  <div className="text-center">
                    <div className="text-[#FFC72C] font-extrabold text-lg leading-none">{hoveredDest.knowledgeScore}</div>
                    <div className="text-white/30 text-[10px] mt-0.5">Health Score</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 justify-center">
                      <TrendingUp size={12} className="text-green-400" />
                      <span className="text-green-400 font-bold text-lg leading-none">+{hoveredDest.trend}%</span>
                    </div>
                    <div className="text-white/30 text-[10px] mt-0.5">Booking lift</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-extrabold text-lg leading-none">{(hoveredDest.reviewCount / 1000).toFixed(1)}k</div>
                    <div className="text-white/30 text-[10px] mt-0.5">Reviews</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Connector dot */}
            <div
              className="absolute w-2 h-2 rounded-full border-2 border-[#FFC72C]"
              style={{
                background: accentColor,
                top: cardH / 2 - 4,
                left: left > px ? -8 : cardW,
              }}
            />
          </div>
        );
      })()}
    </div>
  );
}
