"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin, ArrowRight, LogOut, ChevronRight, Search,
} from "lucide-react";
import { motion } from "framer-motion";
import { DEMO_ACCOUNTS, TIER_COLORS, DemoAccount } from "@/lib/accounts";
import { initAccountPoints } from "@/lib/levels";
import { PropertyCard } from "@/components/ui/card-3";

interface Hotel {
  id: string;
  name: string;
  location: string;
  guestRating: number;
  imageUrl: string;
  price: number;
  reviewCount: number;
}

interface TravelerHomeProps {
  hotels: Hotel[];
}

const STORAGE_KEY = "awm_account";

// ── Helpers ───────────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: DemoAccount["tier"] }) {
  const s = TIER_COLORS[tier];
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full border"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}>
      {tier}
    </span>
  );
}

function TripTypeBadge({ type }: { type: DemoAccount["tripType"] }) {
  return <span className="text-xs text-gray-400">{type}</span>;
}

// ── Logged-in view ────────────────────────────────────────────────────────────

function LoggedInView({
  account,
  hotel,
  hotels: _hotels,
  onSignOut,
}: {
  account: DemoAccount;
  hotel: Hotel | undefined;
  hotels: Hotel[];
  onSignOut: () => void;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F5F7FA" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 h-14 px-6 flex items-center justify-between overflow-hidden bg-white border-b border-[#E4E7EF]">
        <Link href="/"><img src="/Expedia-Logo.svg.png" alt="Expedia" className="h-10 w-auto" /></Link>
        <button
          onClick={onSignOut}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </header>

      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg, #003580 0%, #006FCF 100%)" }}>
        <div className="max-w-xl mx-auto px-4 py-10">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">
            Welcome back
          </p>
          <h1 className="text-2xl font-extrabold text-white mb-1.5">
            {account.name.split(" ")[0]}, how was your stay?
          </h1>
          <p className="text-white/70 text-sm">
            Checked out of{" "}
            <span className="font-semibold text-white">{account.recentCity}, {account.recentCountry}</span>
            {" "}· {account.checkOutDate} · {account.nightsStayed} nights
          </p>
        </div>
      </div>

      {/* Hotel card */}
      <div className="max-w-xl mx-auto w-full px-4 -mt-5 pb-20">
        {hotel ? (
          <div className="bg-white rounded-2xl shadow-md border border-[#E4E7EF] overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-[#E4E7EF]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-[#003580] uppercase tracking-widest mb-1">
                    Your recent stay (auto-detected)
                  </p>
                  <h2 className="text-base font-bold text-[#1E243A] leading-tight">{hotel.name}</h2>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{hotel.location}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-[#F5F7FA] border-b border-[#E4E7EF] flex items-center gap-5 text-xs text-gray-500">
              <span>Check-out: <span className="font-semibold text-[#1E243A]">{account.checkOutDate}</span></span>
              <span>{account.nightsStayed} nights</span>
              <TripTypeBadge type={account.tripType} />
            </div>

            <div className="px-5 py-5">
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                Your review helps future travelers. It takes less than 2 minutes.
              </p>
              <button
                onClick={() => router.push(`/review/${hotel.id}`)}
                className="w-full py-3.5 rounded-xl text-[#1E243A] font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "#FFC72C" }}
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
          <div className="bg-white rounded-2xl shadow-md border border-[#E4E7EF] p-6 text-center">
            <p className="text-gray-500 text-sm">Could not detect your recent hotel.</p>
            <button onClick={onSignOut} className="mt-3 text-sm text-[#003580] underline underline-offset-2">
              Search manually
            </button>
          </div>
        )}
      </div>

      {/* Debug link */}
      <div className="fixed bottom-4 right-4 z-50">
        <Link
          href="/guest-debug"
          className="text-[10px] text-gray-300 hover:text-gray-500 transition-colors px-2 py-1 rounded border border-gray-200 bg-white shadow-sm"
        >
          debug
        </Link>
      </div>
    </div>
  );
}

// ── Landing page (not logged in) ──────────────────────────────────────────────

function GuestLanding({
  hotels,
  onSelectAccount,
}: {
  hotels: Hotel[];
  onSelectAccount: (account: DemoAccount) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return hotels;
    return hotels.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.location.toLowerCase().includes(q)
    );
  }, [hotels, query]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F5F7FA" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 h-14 px-6 flex items-center justify-between overflow-hidden bg-white border-b border-[#E4E7EF]">
        <Link href="/"><img src="/Expedia-Logo.svg.png" alt="Expedia" className="h-10 w-auto" /></Link>
        <Link
          href="/manager"
          className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          Hotel Manager →
        </Link>
      </header>

      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg, #003580 0%, #006FCF 100%)" }}>
        <div className="max-w-2xl mx-auto px-4 py-14 text-center">
          <h1 className="text-3xl font-extrabold text-white leading-tight mb-3">
            Find your next stay
          </h1>
          <p className="text-white/70 text-sm max-w-sm mx-auto leading-relaxed mb-6">
            Browse hotels worldwide, or sign in to review a recent booking.
          </p>
          {/* Search bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by city, country or hotel type…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-white/50 shadow-md"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 -mt-4 pb-20">
        {/* Sign-in card */}
        <div className="bg-white rounded-2xl shadow-md border border-[#E4E7EF] overflow-hidden mb-10">
          <div className="px-5 pt-5 pb-3 border-b border-[#E4E7EF]">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Sign in to leave a review
            </p>
          </div>
          <div className="divide-y divide-[#F5F7FA]">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.id}
                onClick={() => onSelectAccount(account)}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-[#F5F7FA] transition-colors group text-left"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #003580, #006FCF)" }}
                >
                  {account.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-[#1E243A]">{account.name}</span>
                    <TierBadge tier={account.tier} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">Recent: {account.recentCity}, {account.recentCountry}</span>
                    <span>·</span>
                    <TripTypeBadge type={account.tripType} />
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#003580] flex-shrink-0 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Hotel grid */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#1E243A]">
            {query ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}` : `All Hotels`}
          </h2>
          <span className="text-xs text-gray-400">{hotels.length} properties worldwide</span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            No hotels match &ldquo;{query}&rdquo;
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } },
            }}
          >
            {filtered.map((hotel) => (
              <Link key={hotel.id} href={`/property/${hotel.id}`} className="block">
                <PropertyCard
                  imageUrl={hotel.imageUrl}
                  name={hotel.name}
                  location={hotel.location}
                  price={hotel.price}
                  rating={hotel.guestRating || 8.0}
                  reviews={hotel.reviewCount}
                  imageAlt={`${hotel.name} photo`}
                />
              </Link>
            ))}
          </motion.div>
        )}
      </div>

      {/* Debug link */}
      <div className="fixed bottom-4 right-4 z-50">
        <Link
          href="/guest-debug"
          className="text-[10px] text-gray-300 hover:text-gray-500 transition-colors px-2 py-1 rounded border border-gray-200 bg-white shadow-sm"
        >
          debug
        </Link>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TravelerHome({ hotels }: TravelerHomeProps) {
  // account is session-only, never restored from localStorage.
  // Visiting / always shows the profile picker regardless of prior sessions.
  const [account, setAccount] = useState<DemoAccount | null>(null);

  const handleSelectAccount = (a: DemoAccount) => {
    localStorage.setItem(STORAGE_KEY, a.id); // kept for ReviewFlow compatibility
    initAccountPoints(a.id, a.startingPoints);
    setAccount(a);
  };

  const handleSignOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAccount(null);
  };

  if (account) {
    const hotel = hotels.find((h) => h.id === account.recentPropertyId);
    return <LoggedInView account={account} hotel={hotel} hotels={hotels} onSignOut={handleSignOut} />;
  }

  return <GuestLanding hotels={hotels} onSelectAccount={handleSelectAccount} />;
}
