"use client";

import Link from "next/link";
import { ArrowLeft, MessageSquare, Sparkles, Bot, Shield, User } from "lucide-react";
import { PricingView } from "@/features/billing/components/pricing-view";
import { useAuthStore } from "@/stores/auth-store";

export default function PricingPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* LOGO & BRAND */}
          <Link href="/chat" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Bot size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-base tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                Patwatoli AI
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 -mt-1 tracking-wider uppercase">
                Intelligence Platform
              </span>
            </div>
          </Link>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <User size={14} className="text-slate-500 dark:text-slate-400" />
                <span className="max-w-[140px] truncate">{user.full_name || user.email}</span>
              </div>
            ) : (
              <Link
                href="/login?redirect=/pricing"
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-8 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All systems operational • Patwatoli AI</span>
          </div>
          <div className="flex items-center gap-6 text-slate-500 dark:text-slate-400">
            <Link href="/chat" className="hover:text-slate-900 dark:hover:text-white transition">Chat Assistant</Link>
          </div>
          <div>© {new Date().getFullYear()} Patwatoli AI. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
