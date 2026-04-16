"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, User } from "lucide-react";
import { MANAGER_ACCOUNTS, MANAGER_STORAGE_KEY, type ManagerAccount } from "@/lib/manager-accounts";
import HeroSection from "@/components/HeroSection";

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

      {/* Sticky minimal nav */}
      <header className="bg-white/90 backdrop-blur border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <img src="/Expedia-Logo.svg.png" alt="Expedia" className="h-8 w-auto" />
          <div className="flex items-center gap-3">
            <Link
              href="/hotels"
              className="text-xs font-semibold text-gray-600 hover:text-[#003580] transition-colors"
            >
              For Travelers
            </Link>
            <Link
              href="/manager"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-all hover:opacity-90"
              style={{ background: "#003580" }}
            >
              Hotel Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero + Stats + Bento */}
      <HeroSection />

      {/* Entry points */}
      <div
        className="w-full flex flex-col items-center justify-center px-6 py-20"
        style={{ background: "#F5F7FA" }}
      >
        <p className="text-xs font-semibold text-gray-400 mb-8 uppercase tracking-widest">
          Choose your path
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Traveler */}
          <Link
            href="/hotels"
            className="flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-[#1E243A] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
            style={{ background: "#FFC72C", minWidth: 230 }}
          >
            <User className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1 text-left">I&apos;m a traveler</span>
            <ArrowRight className="w-4 h-4 flex-shrink-0" />
          </Link>

          {/* Manager */}
          <Link
            href="/manager"
            className="flex flex-col px-8 py-4 rounded-2xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
            style={{ background: "#003580", minWidth: 230 }}
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
