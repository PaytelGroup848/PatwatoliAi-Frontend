"use client";

import Link from "next/link";
import { ArrowLeft, MessageSquare, Sparkles, Bot, Shield, User } from "lucide-react";
import { PricingView } from "@/features/billing/components/pricing-view";
import { useAuthStore } from "@/stores/auth-store";

export default function PricingPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 flex flex-col">
      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/80 transition-all">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* LOGO & BRAND */}
          <Link href="/chat" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Bot size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-base tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                Patwatoli AI
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 -mt-1 tracking-wider uppercase">
                Intelligence Platform
              </span>
            </div>
          </Link>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium">
                <User size={14} className="text-slate-500" />
                <span className="max-w-[140px] truncate">{user.full_name || user.email}</span>
              </div>
            ) : (
              <Link
                href="/login?redirect=/pricing"
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition"
              >
                Sign In
              </Link>
            )}

            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs md:text-sm font-bold shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Back to Chat</span>
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN PRICING CONTENT */}
      <main className="flex-1 py-4">
        <PricingView />
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200/80 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All systems operational • Patwatoli AI</span>
          </div>
          <div className="flex items-center gap-6 text-slate-500">
            <Link href="/chat" className="hover:text-slate-900 transition">Chat Assistant</Link>
          </div>
          <div>© {new Date().getFullYear()} Patwatoli AI. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
