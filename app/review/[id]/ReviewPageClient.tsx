"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Star, BarChart3 } from "lucide-react";
import ReviewFlow from "@/components/ReviewFlow";

interface ReviewPageClientProps {
  propertyId: string;
  propertyName: string;
  city: string;
  country: string;
  starRating: number;
  location: string;
  currentHealthScore: number;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
        />
      ))}
    </div>
  );
}

export default function ReviewPageClient({
  propertyId,
  propertyName,
  city,
  country,
  starRating,
  location,
  currentHealthScore,
}: ReviewPageClientProps) {
  const [isDirty, setIsDirty] = useState(false);
  const [accountId, setAccountId] = useState("guest");
  const router = useRouter();

  // Read account id from localStorage (set by TravelerHome on sign-in)
  useEffect(() => {
    const stored = localStorage.getItem("awm_account");
    if (stored) setAccountId(stored);
  }, []);

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isDirty) {
      e.preventDefault();
      if (window.confirm("You have an unfinished review. Leave without saving?")) {
        router.push("/");
      }
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#faf8f5" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between">
          <a href="/" onClick={handleHomeClick} className="flex items-center gap-2.5">
            <span className="font-bold text-[#003580] text-sm">Ask What Matters</span>
          </a>
          <div className="flex items-center gap-4">
            <Link href="/manager" className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">
              <BarChart3 className="w-3.5 h-3.5" />
              Manager View
            </Link>
            <a
              href="/"
              onClick={handleHomeClick}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#1E243A] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Change hotel
            </a>
          </div>
        </div>
      </header>

      {/* Property context */}
      <div style={{ background: "linear-gradient(160deg, #FCDB32 0%, #FCDB32 60%, #FDE97A 100%)" }}>
        <div className="max-w-2xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div>
              {starRating > 0 && (
                <div className="mb-0.5">
                  <StarRow rating={starRating} />
                </div>
              )}
              <h1 className="text-lg font-bold text-[#1E243A] leading-tight">{propertyName}</h1>
              <div className="flex items-center gap-1 text-[#1E243A]/60 text-sm">
                <MapPin className="w-3 h-3" />
                <span>{location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review flow */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        <ReviewFlow
          propertyId={propertyId}
          propertyName={propertyName}
          city={city}
          country={country}
          currentHealthScore={currentHealthScore}
          onDirtyChange={setIsDirty}
          accountId={accountId}
        />
      </main>
    </div>
  );
}
