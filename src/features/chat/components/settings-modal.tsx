"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  User,
  Shield,
  Sliders,
  ExternalLink,
  Key,
  Check,
  Sun,
  Moon,
  Monitor,
  Palette,
  Sparkles,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/stores/auth-store";
import { hasAdminAccess } from "@/features/admin/utils/roles";
import Link from "next/link";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const user = useAuthStore((state) => state.user);
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<"profile" | "appearance" | "preferences" | "admin">("profile");
  const [savedNotice, setSavedNotice] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [brightnessLevel, setBrightnessLevel] = useState<"100" | "90" | "80">("100");

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("patwatoli_brightness");
      if (stored === "dim") setBrightnessLevel("90");
      else if (stored === "soft") setBrightnessLevel("80");
      else setBrightnessLevel("100");
    } catch {}
  }, []);

  const handleBrightnessChange = (lvl: "100" | "90" | "80") => {
    setBrightnessLevel(lvl);
    try {
      if (lvl === "90") {
        localStorage.setItem("patwatoli_brightness", "dim");
        document.documentElement.style.filter = "brightness(0.92)";
      } else if (lvl === "80") {
        localStorage.setItem("patwatoli_brightness", "soft");
        document.documentElement.style.filter = "brightness(0.85)";
      } else {
        localStorage.setItem("patwatoli_brightness", "standard");
        document.documentElement.style.filter = "";
      }
    } catch {}
  };

  if (!isOpen || !mounted) return null;

  const email = user?.email || "user@platform.com";
  const fullName = user?.full_name || (user?.email ? user.email.split("@")[0] : "User");
  const role = user?.role || "MEMBER";
  const avatarInitial = fullName.charAt(0).toUpperCase();
  const isAdmin = hasAdminAccess(role);

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const isDarkMode = resolvedTheme === "dark";

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 dark:bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl transition-colors duration-200">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 shadow-xs">
              <Sliders size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Platform Settings</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage your user account & AI environment preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY CONTAINER */}
        <div className="flex min-h-[400px]">
          {/* TABS SIDEBAR */}
          <div className="w-52 border-r border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-3 space-y-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition cursor-pointer ${
                activeTab === "profile"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <User size={15} />
              <span>Account Profile</span>
            </button>

            <button
              onClick={() => setActiveTab("appearance")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition cursor-pointer ${
                activeTab === "appearance"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Palette size={15} />
              <span>Appearance & Theme</span>
            </button>

            <button
              onClick={() => setActiveTab("preferences")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition cursor-pointer ${
                activeTab === "preferences"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Sliders size={15} />
              <span>AI Preferences</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition cursor-pointer ${
                  activeTab === "admin"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Shield size={15} />
                <span>Admin Controls</span>
              </button>
            )}
          </div>

          {/* TAB CONTENT */}
          <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-slate-900 transition-colors duration-200">
            {/* 1. PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-xl font-bold text-white shadow-md shadow-emerald-600/20 shrink-0">
                    {avatarInitial}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{fullName}</h3>
                      <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{email}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">Full Name</label>
                    <input
                      type="text"
                      defaultValue={fullName}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">Email Address</label>
                    <input
                      type="email"
                      readOnly
                      defaultValue={email}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 px-3.5 py-2 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    />
                  </div>

                  {/* QUICK THEME PREVIEW IN PROFILE */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3.5">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Palette size={14} className="text-emerald-600" />
                          <span>Interface Theme</span>
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Current: {isDarkMode ? "Night (Dark) Mode" : "Day (Light) Mode"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setTheme(isDarkMode ? "light" : "dark")}
                        className="flex items-center gap-1.5 rounded-lg bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 shadow-xs transition cursor-pointer active:scale-95"
                      >
                        {isDarkMode ? (
                          <>
                            <Sun size={14} className="text-amber-400" />
                            <span>Switch to Day</span>
                          </>
                        ) : (
                          <>
                            <Moon size={14} className="text-slate-700" />
                            <span>Switch to Night</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. APPEARANCE & THEME TAB (FULL PRODUCTION GRADE) */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Palette size={16} className="text-emerald-600" />
                    <span>Interface Appearance & Theme</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Select your preferred brightness aesthetic. Changes apply instantly across the entire application and are permanently preserved.
                  </p>
                </div>

                {/* 3 INTERACTIVE THEME CARDS */}
                <div className="grid grid-cols-3 gap-3">
                  {/* DAY (LIGHT) CARD */}
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`flex flex-col items-center justify-between rounded-xl border p-4 text-center transition cursor-pointer ${
                      theme === "light"
                        ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-500 border border-amber-200 shadow-xs mb-3">
                      <Sun size={22} className="transition-transform duration-200 hover:rotate-12" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Day Mode</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Bright & Crisp</span>
                    {theme === "light" && (
                      <span className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                        <Check size={10} /> Active
                      </span>
                    )}
                  </button>

                  {/* NIGHT (DARK) CARD */}
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`flex flex-col items-center justify-between rounded-xl border p-4 text-center transition cursor-pointer ${
                      theme === "dark"
                        ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-slate-100 border border-slate-700 shadow-xs mb-3">
                      <Moon size={22} className="transition-transform duration-200 hover:-rotate-12" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Night Mode</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Deep Slate (Dark)</span>
                    {theme === "dark" && (
                      <span className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                        <Check size={10} /> Active
                      </span>
                    )}
                  </button>

                  {/* SYSTEM MATCH CARD */}
                  <button
                    type="button"
                    onClick={() => setTheme("system")}
                    className={`flex flex-col items-center justify-between rounded-xl border p-4 text-center transition cursor-pointer ${
                      theme === "system"
                        ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 shadow-xs mb-3">
                      <Monitor size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">System Sync</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Auto Device Sync</span>
                    {theme === "system" && (
                      <span className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                        <Check size={10} /> Active
                      </span>
                    )}
                  </button>
                </div>

                {/* REAL-TIME TOGGLE BANNER */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Instant Toggle Switch</span>
                        <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-mono text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {isDarkMode ? "Dark Active" : "Light Active"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Toggles root HTML class instantaneously across your active chat session.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setTheme(isDarkMode ? "light" : "dark")}
                      className="flex h-9 items-center gap-2 rounded-xl bg-white dark:bg-slate-900 px-3.5 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      {isDarkMode ? (
                        <>
                          <Sun size={15} className="text-amber-400" />
                          <span>Switch to Day</span>
                        </>
                      ) : (
                        <>
                          <Moon size={15} className="text-slate-700" />
                          <span>Switch to Night</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                {/* DISPLAY BRIGHTNESS & EYE COMFORT CONTROLS */}
                <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Sun size={14} className="text-amber-500" />
                        <span>Display Brightness & Eye-Comfort</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Adjust luminance across the entire page to reduce eye-strain during extended sessions.
                      </p>
                    </div>
                    <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {brightnessLevel === "100" ? "100% Full" : brightnessLevel === "90" ? "90% Soft Dim" : "85% Deep Comfort"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleBrightnessChange("100")}
                      className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition cursor-pointer ${
                        brightnessLevel === "100"
                          ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-bold ring-1 ring-emerald-500/20"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span className="text-xs font-bold">100% Bright</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Standard Display</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBrightnessChange("90")}
                      className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition cursor-pointer ${
                        brightnessLevel === "90"
                          ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-bold ring-1 ring-emerald-500/20"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span className="text-xs font-bold">90% Eye Comfort</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Reduced Glare</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBrightnessChange("80")}
                      className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition cursor-pointer ${
                        brightnessLevel === "80"
                          ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-bold ring-1 ring-emerald-500/20"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span className="text-xs font-bold">85% Night Focus</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Max Eye Relief</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. PREFERENCES TAB */}
            {activeTab === "preferences" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">Default Output Tone</label>
                  <select className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none transition">
                    <option value="precise">Precise & Analytical (Default)</option>
                    <option value="creative">Creative & Conversational</option>
                    <option value="concise">Concise Bullet Points</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">Response Streaming</label>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3">
                    <span className="text-xs text-slate-700 dark:text-slate-300">Enable real-time token streaming</span>
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-emerald-600" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">Context History Limit</label>
                  <input
                    type="number"
                    defaultValue={10}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>
              </div>
            )}

            {/* 4. ADMIN TAB */}
            {activeTab === "admin" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <Key size={16} className="text-emerald-600" />
                    Admin Control Center Access
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Access dataset management, pipeline training jobs, models registry, and system telemetry in the Admin Control Dashboard.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/admin"
                      onClick={onClose}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20"
                    >
                      <span>Open Admin Control Dashboard</span>
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-6 py-3.5">
          {savedNotice ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <Check size={14} /> Settings saved successfully!
            </span>
          ) : (
            <span className="text-[11px] text-slate-400 dark:text-slate-500">Enterprise AI Infrastructure v2.4</span>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition shadow-sm cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
