"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  Shield,
  CheckCircle2,
  Check,
  Languages,
  Code2,
  Cpu,
  Bot,
  Zap,
} from "lucide-react";
import axios from "axios";
import { useTheme } from "next-themes";

import { useAuthStore } from "@/stores/auth-store";
import { authService } from "@/features/auth/services/auth.service";
import { registerUser } from "@/features/auth/services/register-service";

interface EnterpriseAuthViewProps {
  initialMode?: "login" | "signup";
  redirectPath?: string;
}

let activeGoogleAuthHandler: ((credential: string) => void) | null = null;
let isGisInitialized = false;

export function EnterpriseAuthView({
  initialMode = "login",
  redirectPath,
}: EnterpriseAuthViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resolvedTheme } = useTheme();

  const queryAuth = searchParams.get("auth") || searchParams.get("mode");
  const targetRedirect = redirectPath || searchParams.get("redirect") || "/chat";

  const [mode, setMode] = useState<"login" | "signup">(
    queryAuth === "signup" ? "signup" : initialMode
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const emailInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const googleButtonContainerRef = useRef<HTMLDivElement>(null);
  const isAuthenticatingRef = useRef(false);

  const setAuth = useAuthStore((state) => state.setAuth);

  // Sync mode with query params if they change
  useEffect(() => {
    if (queryAuth === "signup") {
      setMode("signup");
    } else if (queryAuth === "login") {
      setMode("login");
    }
  }, [queryAuth]);

  // Google OAuth Handshake
  async function handleGoogleCredential(credential: string) {
    if (isAuthenticatingRef.current) return;
    isAuthenticatingRef.current = true;
    setGoogleLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const currentUser = useAuthStore.getState().user;
      const currentToken = useAuthStore.getState().accessToken;
      const guestToken = currentUser?.role === "guest" ? currentToken : undefined;

      const data = await authService.loginWithGoogle(credential, guestToken || undefined);
      setAuth(data.user, data.access_token, data.refresh_token);
      setSuccessMessage("Authenticated with Google successfully!");
      setTimeout(() => {
        router.push(targetRedirect);
      }, 350);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "Google authentication failed");
      } else {
        setError("Google authentication failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
      isAuthenticatingRef.current = false;
    }
  }

  useEffect(() => {
    activeGoogleAuthHandler = handleGoogleCredential;
    return () => {
      if (activeGoogleAuthHandler === handleGoogleCredential) {
        activeGoogleAuthHandler = null;
      }
    };
  }, []);

  // Mount Google GIS Button
  useEffect(() => {
    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      "647663692578-u0q685v87qoqjabksdlul3t92g3mlguo.apps.googleusercontent.com";

    function mountGisButton() {
      if (!window.google?.accounts?.id) return false;

      if (!isGisInitialized) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response?.credential && activeGoogleAuthHandler) {
              activeGoogleAuthHandler(response.credential);
            }
          },
        });
        isGisInitialized = true;
      }

      if (googleButtonContainerRef.current) {
        const containerWidth = googleButtonContainerRef.current.offsetWidth || 380;
        const buttonWidth = Math.min(400, Math.max(240, Math.floor(containerWidth)));
        const gisTheme = resolvedTheme === "dark" ? "filled_black" : "outline";

        const tempContainer = document.createElement("div");
        tempContainer.style.width = "100%";
        tempContainer.style.display = "flex";
        tempContainer.style.justifyContent = "center";
        tempContainer.style.alignItems = "center";
        tempContainer.style.height = "44px";

        window.google.accounts.id.renderButton(tempContainer, {
          theme: gisTheme,
          size: "large",
          width: buttonWidth,
          text: "continue_with",
          shape: "pill",
        });

        googleButtonContainerRef.current.replaceChildren(tempContainer);
      }
      return true;
    }

    if (mountGisButton()) return;

    let script = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    if (!script) {
      script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (mountGisButton() || attempts >= 40) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [resolvedTheme]);

  // Autofocus input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mode === "signup") {
        nameInputRef.current?.focus();
      } else {
        emailInputRef.current?.focus();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [mode]);

  // Password Strength Calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { text: "", color: "", bg: "", percent: "0%" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) {
      return { text: "Weak", color: "text-red-500", bg: "bg-red-500", percent: "33%" };
    }
    if (score <= 4) {
      return { text: "Medium", color: "text-amber-500", bg: "bg-amber-500", percent: "66%" };
    }
    return { text: "Strong", color: "text-emerald-500", bg: "bg-emerald-500", percent: "100%" };
  };

  const strength = getPasswordStrength(password);

  // Sign In Submission
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const currentUser = useAuthStore.getState().user;
      const currentToken = useAuthStore.getState().accessToken;
      const guestToken = currentUser?.role === "guest" ? currentToken : undefined;

      const data = await authService.login({
        email: email.trim().toLowerCase(),
        password,
        guest_token: guestToken || undefined,
      });

      setAuth(data.user, data.access_token, data.refresh_token);
      setSuccessMessage("Logged in successfully! Redirecting...");
      setTimeout(() => {
        router.push(targetRedirect);
      }, 350);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        if (Array.isArray(detail)) {
          setError(detail[0]?.msg || "Invalid credentials");
        } else if (typeof detail === "string") {
          setError(detail);
        } else {
          setError("Invalid email or password");
        }
      } else {
        setError("Login failed. Please verify credentials.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Create Account Submission
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (!acceptedTerms) {
      setError("Please accept the terms of service & privacy policy to continue.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim();
      const currentUser = useAuthStore.getState().user;
      const currentToken = useAuthStore.getState().accessToken;
      const guestToken = currentUser?.role === "guest" ? currentToken : undefined;

      await registerUser(cleanName, cleanEmail, password, guestToken || undefined);

      try {
        const loginRes = await authService.login({
          email: cleanEmail,
          password,
          guest_token: guestToken || undefined,
        });
        const authUser = loginRes.user || {
          id: 1,
          email: cleanEmail,
          full_name: cleanName,
          role: "MEMBER",
        };
        setAuth(authUser, loginRes.access_token, loginRes.refresh_token);
        setSuccessMessage("Account created successfully! Welcome aboard.");
        setTimeout(() => {
          router.push(targetRedirect);
        }, 350);
      } catch {
        setMode("login");
        setSuccessMessage("Account created successfully! Please sign in.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        setError(typeof detail === "string" ? detail : "Registration failed. Email may already be registered.");
      } else if (err instanceof Error) {
        setError(err.message || "Registration failed");
      } else {
        setError("Unexpected error occurred during registration");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* ======================================================== */}
      {/* LEFT SIDE: FEATURE SHOWCASE (SARVAM AI ENTERPRISE STYLE)  */}
      {/* ======================================================== */}
      <div className="relative hidden lg:flex lg:w-[50%] xl:w-[52%] flex-col justify-between p-8 xl:p-12 overflow-hidden border-r border-slate-200/80 dark:border-slate-800/80">
        
        {/* Artistic Generative Backdrop */}
        <div className="absolute inset-0 bg-linear-to-br from-emerald-600/10 via-teal-500/5 to-cyan-600/10 dark:from-emerald-950/40 dark:via-slate-950 dark:to-teal-950/30" />
        
        {/* Subtle Geometric Wave Pattern */}
        <div className="absolute inset-0 opacity-[0.07] dark:opacity-[0.12] pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />

        {/* Ambient Glow Orbs */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-400/20 dark:bg-emerald-600/15 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-teal-400/20 dark:bg-teal-600/15 blur-[120px] pointer-events-none" />

        {/* Top Header Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-tr from-emerald-600 to-green-500 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles size={20} />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                PATWATOLI AI
              </span>
              <span className="block text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
                Enterprise Intelligence
              </span>
            </div>
          </Link>
        </div>

        {/* Main Floating Showcase Card */}
        <div className="relative z-10 my-auto py-6 max-w-xl">
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl p-7 xl:p-9 shadow-2xl shadow-emerald-900/10 transition-colors duration-200">
            
            {/* Tagline */}
            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <Zap size={12} className="fill-emerald-500 text-emerald-500" />
                India&apos;s Full-Stack AI Platform
              </span>
              <h2 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2.5">
                Built for scale, multilingual depth, and high performance.
              </h2>
            </div>

            {/* 4 Feature Cards (Directly matching Sarvam UI pattern) */}
            <div className="space-y-4">
              
              {/* Feature 1: Voice & Language */}
              <div className="flex items-start gap-3.5 group">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs group-hover:scale-105 transition-transform duration-200">
                  <Languages size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Multilingual Voice & Reasoning
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Conversational agents capable of fluent reasoning, live telephony, and natural speaking across Indian languages.
                  </p>
                </div>
              </div>

              {/* Feature 2: High Throughput API */}
              <div className="flex items-start gap-3.5 group">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400 border border-teal-200/80 dark:border-teal-800/60 shadow-xs group-hover:scale-105 transition-transform duration-200">
                  <Code2 size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Patwatoli Developer API
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Add ultra low-latency AI voice, text synthesis, and embeddings to your applications with OpenAI-compatible endpoints.
                  </p>
                </div>
              </div>

              {/* Feature 3: Translation Studio */}
              <div className="flex items-start gap-3.5 group">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-400 border border-cyan-200/80 dark:border-cyan-800/60 shadow-xs group-hover:scale-105 transition-transform duration-200">
                  <Cpu size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Document Translation Studio
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                    High-speed multi-page PDF/DOCX parallel document translation engine with automated scanned OCR fallback.
                  </p>
                </div>
              </div>

              {/* Feature 4: Autonomous Cowork & RAG */}
              <div className="flex items-start gap-3.5 group">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60 shadow-xs group-hover:scale-105 transition-transform duration-200">
                  <Bot size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Cognitive RAG & Enterprise Memory
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Ask questions, upload proprietary datasets, and let high-precision vector pipelines provide verified citations.
                  </p>
                </div>
              </div>

            </div>

            {/* Enterprise Trust Metric Badges */}
            <div className="mt-7 pt-5 border-t border-slate-200/70 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-500" />
                99.9% Uptime SLA
              </span>
              <span className="flex items-center gap-1.5">
                <Shield size={13} className="text-emerald-500" />
                SOC-2 & TLS 1.3 Encrypted
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-emerald-500" />
                Zero Data Retention Option
              </span>
            </div>

          </div>
        </div>

        {/* Left Bottom Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>&copy; {new Date().getFullYear()} Patwatoli AI Technologies</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
              Contact
            </Link>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* RIGHT SIDE: AUTHENTICATION FORM (CLEAN, MINIMALIST, FAST) */}
      {/* ======================================================== */}
      <div className="w-full lg:w-[50%] xl:w-[48%] flex flex-col justify-center items-center px-6 py-12 sm:px-12 relative">
        
        {/* Mobile Header Brand Display (Hidden on Desktop) */}
        <div className="lg:hidden mb-8 flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-tr from-emerald-600 to-green-500 text-white shadow-md shadow-emerald-500/20">
              <Sparkles size={20} />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              PATWATOLI AI
            </span>
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            India&apos;s Full-Stack AI Platform
          </p>
        </div>

        {/* Main Auth Container */}
        <div className="w-full max-w-110">
          
          {/* Top Geometric Emblem (Sarvam AI Inspired Circular Emblem) */}
          <div className="hidden lg:flex flex-col items-center mb-6">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md">
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8 stroke-current"
                fill="none"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v4" />
                <path d="M12 18v4" />
                <path d="m4.93 4.93 2.83 2.83" />
                <path d="m16.24 16.24 2.83 2.83" />
                <path d="M2 12h4" />
                <path d="M18 12h4" />
                <path d="m4.93 19.07 2.83-2.83" />
                <path d="m16.24 7.76 2.83-2.83" />
              </svg>
            </div>
          </div>

          {/* Form Header Title */}
          <div className="text-center mb-7">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {mode === "login" ? "Log into your account" : "Create your account"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              {mode === "login"
                ? "Enter your credentials or continue with Google to access your workspace"
                : "Get started with your free tier and unlock all AI features"}
            </p>
          </div>

          {/* ======================================================== */}
          {/* GOOGLE ONE-TAP OFFICIAL GIS PILL BUTTON                   */}
          {/* ======================================================== */}
          <div className="w-full flex flex-col items-center mb-4">
            <div className="w-full max-w-90 h-11 min-h-11 flex justify-center items-center shrink-0 overflow-hidden">
              <div
                ref={googleButtonContainerRef}
                className="w-full h-11 min-h-11 flex justify-center items-center shrink-0"
              />
            </div>
            {googleLoading && (
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Authorizing with Google...</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative my-5 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <span className="relative bg-slate-50 dark:bg-slate-950 px-3 text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">
              OR
            </span>
          </div>

          {/* Alerts / Feedback Notifications */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400 flex items-start gap-2.5"
              >
                <div className="h-4 w-4 rounded-full bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  !
                </div>
                <span className="flex-1">{error}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2.5"
              >
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="flex-1">{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ======================================================== */}
          {/* CREDENTIALS FORM                                         */}
          {/* ======================================================== */}
          <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-4">
            
            {/* Full Name Field (Sign Up Only) */}
            {mode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    ref={nameInputRef}
                    type="text"
                    autoCapitalize="words"
                    autoCorrect="off"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Anand Kumar"
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 transition disabled:opacity-50"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  ref={emailInputRef}
                  type="email"
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., name@company.com"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 transition disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                {mode === "login" && (
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 transition"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 transition disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Meter (Sign Up Only) */}
              {mode === "signup" && password.length > 0 && (
                <div className="pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">Password Strength:</span>
                    <span className={`font-semibold ${strength.color}`}>{strength.text}</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-slate-200 dark:bg-slate-800 mt-1 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strength.bg}`}
                      style={{ width: strength.percent }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Terms of Service Checkbox (Sarvam AI style) */}
            <div className="flex items-start gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setAcceptedTerms(!acceptedTerms)}
                className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition cursor-pointer ${
                  acceptedTerms
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                }`}
                aria-label="Accept terms and privacy policy"
              >
                {acceptedTerms && <Check size={12} strokeWidth={3} />}
              </button>
              <label
                onClick={() => setAcceptedTerms(!acceptedTerms)}
                className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none leading-relaxed"
              >
                I accept the{" "}
                <Link
                  href="/terms"
                  onClick={(e) => e.stopPropagation()}
                  className="text-emerald-600 dark:text-emerald-400 underline hover:text-emerald-500"
                >
                  Terms of Service
                </Link>{" "}
                &amp;{" "}
                <Link
                  href="/privacy"
                  onClick={(e) => e.stopPropagation()}
                  className="text-emerald-600 dark:text-emerald-400 underline hover:text-emerald-500"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-emerald-600 to-green-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 hover:from-emerald-500 hover:to-green-500 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{mode === "login" ? "Signing in..." : "Creating account..."}</span>
                </>
              ) : (
                <>
                  <span>{mode === "login" ? "Continue" : "Create Account"}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

          </form>

          {/* Mode Switch Footer (Directly matching Sarvam UI) */}
          <div className="mt-6 text-center text-xs text-slate-600 dark:text-slate-400">
            {mode === "login" ? (
              <p>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError("");
                    setSuccessMessage("");
                  }}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Create one
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setSuccessMessage("");
                  }}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>

          {/* Enterprise Security Disclaimer */}
          <div className="mt-8 text-center text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5">
            <Shield size={12} className="text-emerald-500" />
            <span>Enterprise End-to-End Encrypted Session</span>
          </div>

        </div>

      </div>

    </div>
  );
}
