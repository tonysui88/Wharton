"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin, ArrowRight, Search, LogOut, Star, ChevronRight, BarChart3
} from "lucide-react";
import { DEMO_ACCOUNTS, TIER_COLORS, DemoAccount } from "@/lib/accounts";
import { initAccountPoints, getStoredPoints, getLevel } from "@/lib/levels";

interface Hotel {
  id: string;
  name: string;
  location: string;
  guestRating: number;
}

interface TravelerHomeProps {
  hotels: Hotel[];
}

const STORAGE_KEY = "awm_account";

// ── Sub-components ────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: DemoAccount["tier"] }) {
  const s = TIER_COLORS[tier];
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full border"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}
    >
      {tier}
    </span>
  );
}

function TripTypeBadge({ type }: { type: DemoAccount["tripType"] }) {
  const icons: Record<DemoAccount["tripType"], string> = {
    Business: "💼", Family: "👨‍👩‍👧", Couple: "💑", Solo: "🎒",
  };
  return (
    <span className="text-xs text-gray-400">
      {icons[type]} {type}
    </span>
  );
}

// ── Logged-in view ────────────────────────────────────────────────────────────

function LoggedInView({
  account,
  hotel,
  onSignOut,
}: {
  account: DemoAccount;
  hotel: Hotel | undefined;
  onSignOut: () => void;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ background: "#F0F4FF" }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <button
            onClick={onSignOut}
            className="font-bold text-[#003580] text-base tracking-tight hover:opacity-70 transition-opacity"
          >
            Ask What Matters
          </button>
          <div className="flex items-center gap-4">
            <Link
              href="/manager"
              className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Manager View
            </Link>
            <button
              onClick={onSignOut}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Hero — detected stay */}
      <div style={{ background: "linear-gradient(160deg, #FCDB32 0%, #FCDB32 55%, #FDE97A 100%)" }}>
        <div className="max-w-3xl mx-auto px-6 py-12">
          <p className="text-sm font-semibold text-[#1E243A]/60 mb-1 uppercase tracking-wide">
            Welcome back
          </p>
          <h1 className="text-3xl font-extrabold text-[#1E243A] mb-2">
            {account.name.split(" ")[0]}, how was your stay?
          </h1>
          <p className="text-[#1E243A]/70 text-sm">
            We noticed you checked out of{" "}
            <span className="font-semibold">
              {account.recentCity}, {account.recentCountry}
            </span>{" "}
            on {account.checkOutDate} · {account.nightsStayed} nights
          </p>
        </div>
      </div>

      {/* Detected hotel card */}
      <div className="max-w-3xl mx-auto px-6 -mt-6 pb-16">
        {hotel ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Location banner */}
            <div className="px-6 pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-[#003580] uppercase tracking-wide mb-1">
                    Your recent stay — auto-detected
                  </p>
                  <h2 className="text-lg font-bold text-[#1E243A]">{hotel.name}</h2>
                  <div className="flex items-center gap-1 text-sm text-gray-400 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{hotel.location}</span>
                  </div>
                </div>
                {hotel.guestRating > 0 && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold text-[#003580]">
                      {hotel.guestRating.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-400">/ 10 rating</p>
                  </div>
                )}
              </div>
            </div>

            {/* Booking details */}
            <div className="px-6 py-4 bg-gray-50 flex items-center gap-6 text-sm text-gray-500">
              <span>Check-out: <span className="font-medium text-[#1E243A]">{account.checkOutDate}</span></span>
              <span>{account.nightsStayed} nights</span>
              <TripTypeBadge type={account.tripType} />
            </div>

            {/* CTA */}
            <div className="px-6 py-5">
              <p className="text-sm text-gray-500 mb-4">
                Your review helps future travelers make better decisions — and takes less than 2 minutes.
              </p>
              <button
                onClick={() => router.push(`/review/${hotel.id}`)}
                className="w-full py-3.5 rounded-xl text-[#1E243A] font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #FCDB32, #F5C800)" }}
              >
                Share Your Experience
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">
                Not the right hotel?{" "}
                <button onClick={onSignOut} className="text-[#003580] underline underline-offset-2">
                  Search manually
                </button>
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
            <p className="text-gray-500 text-sm">Could not detect your recent hotel. Try searching below.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Not logged in view ────────────────────────────────────────────────────────

function GuestView({
  hotels,
  onSelectAccount,
}: {
  hotels: Hotel[];
  onSelectAccount: (account: DemoAccount) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return hotels;
    return hotels.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.location.toLowerCase().includes(q)
    );
  }, [searchQuery, hotels]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="font-bold text-[#003580] text-base tracking-tight">
            Ask What Matters
          </Link>
          <Link
            href="/manager"
            className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Manager View
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg, #003580 0%, #006FCF 100%)" }}>
        <div className="max-w-3xl mx-auto px-6 py-14 text-center">
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-3">
            How was your stay?
          </h1>
          <p className="text-white/70 text-base leading-relaxed max-w-md mx-auto">
            Sign in with your Expedia account and we'll find your recent booking automatically.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-6 pb-16 space-y-5">

        {/* Account picker */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Sign in as
          </p>
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.id}
                onClick={() => onSelectAccount(account)}
                className="w-full flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-[#003580] hover:bg-blue-50 transition-all group text-left"
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #003580, #006FCF)" }}
                >
                  {account.initial}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-[#1E243A]">{account.name}</span>
                    <TierBadge tier={account.tier} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <MapPin className="w-3 h-3" />
                    <span>Recent: {account.recentCity}, {account.recentCountry}</span>
                    <span>·</span>
                    <TripTypeBadge type={account.tripType} />
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#003580] flex-shrink-0 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">or search manually</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Search + hotel list */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="relative mb-4">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by hotel name or city..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10 transition-all"
            />
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No hotels found for &quot;{searchQuery}&quot;</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((hotel) => (
                <Link
                  key={hotel.id}
                  href={`/review/${hotel.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-gray-100 hover:border-[#003580] hover:bg-blue-50 transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1E243A] truncate">{hotel.name}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{hotel.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {hotel.guestRating > 0 && (
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-[#1E243A]">{hotel.guestRating.toFixed(1)}</p>
                        <p className="text-xs text-gray-400">/ 10</p>
                      </div>
                    )}
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                      style={{ background: "#FCDB32" }}>
                      <ArrowRight className="w-3.5 h-3.5 text-[#1E243A]" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TravelerHome({ hotels }: TravelerHomeProps) {
  const [account, setAccount] = useState<DemoAccount | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const found = DEMO_ACCOUNTS.find((a) => a.id === stored);
      if (found) setAccount(found);
    }
  }, []);

  const handleSelectAccount = (a: DemoAccount) => {
    localStorage.setItem(STORAGE_KEY, a.id);
    initAccountPoints(a.id, a.startingPoints);
    setAccount(a);
  };

  const handleSignOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAccount(null);
  };

  // Avoid hydration mismatch — don't render account-specific content until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#003580] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (account) {
    const hotel = hotels.find((h) => h.id === account.recentPropertyId);
    return <LoggedInView account={account} hotel={hotel} onSignOut={handleSignOut} />;
  }

  return <GuestView hotels={hotels} onSelectAccount={handleSelectAccount} />;
}
