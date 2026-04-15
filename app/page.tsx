"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, User } from "lucide-react";
import { MANAGER_ACCOUNTS, MANAGER_STORAGE_KEY, type ManagerAccount } from "@/lib/manager-accounts";

export default function LandingPage() {
  const [manager, setManager] = useState<ManagerAccount | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(MANAGER_STORAGE_KEY);
    if (stored) {
      const found = MANAGER_ACCOUNTS.find((a) => a.id === stored);
      setManager(found ?? null);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F5F7FA" }}>

      {/* Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
          <img src="/Expedia-Logo.svg.png" alt="Expedia" className="h-9 w-auto" />
        </div>
      </header>

      {/* Hero */}
      <div
        className="w-full py-20 px-6 flex flex-col items-center text-center"
        style={{
          background: "linear-gradient(160deg, #003580 0%, #006FCF 100%)",
        }}
      >
        <h1
          className="text-5xl font-extrabold text-white mb-3 tracking-tight"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          CompleteStayz
        </h1>
        <p className="text-sm font-medium text-[#FFC72C] mb-5 tracking-wide italic">
          A journey to better travel insights
        </p>
        <p className="text-lg text-white/80 max-w-xl leading-relaxed">
          Smarter hotel reviews, for everyone. CompleteStayz uses AI to ask the right follow-up
          questions, filling the gaps that standard reviews miss, so every stay is fully understood.
        </p>
      </div>

      {/* Entry points */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <p className="text-sm font-medium text-gray-500 mb-8 uppercase tracking-widest">
          Who are you?
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">

          {/* Traveler */}
          <Link
            href="/hotels"
            className="flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-[#1E243A] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
            style={{ background: "#FFC72C", minWidth: 220 }}
          >
            <User className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1 text-left">I&apos;m a traveler</span>
            <ArrowRight className="w-4 h-4 flex-shrink-0" />
          </Link>

          {/* Manager */}
          <Link
            href="/manager"
            className="flex flex-col px-8 py-4 rounded-2xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
            style={{ background: "#003580", minWidth: 220 }}
          >
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-left">I&apos;m a hotel manager</span>
              <ArrowRight className="w-4 h-4 flex-shrink-0" />
            </div>
            {manager && (
              <p className="text-xs text-white/60 mt-1.5 ml-8 font-normal">
                Continue as {manager.name}
              </p>
            )}
          </Link>

        </div>
      </div>

    </div>
  );
}
