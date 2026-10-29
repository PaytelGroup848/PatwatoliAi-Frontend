"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  X,
  Sparkles,
  Zap,
  Terminal,
  ShieldCheck,
  ArrowLeft,
  BookOpen,
  Loader2,
  Lock,
  UserPlus,
  LogIn,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import {
  fetchApiKeys,
  createBackendApiKey,
  disableBackendApiKey,
  fetchUsageOverview,
  UsageOverview,
} from "../services/api-key-service";

interface ApiKeyItem {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
}

interface ApiKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiKeysModal({ isOpen, onClose }: ApiKeysModalProps) {
  const user = useAuthStore((state) => state.user);
  const isGuest = !user || user.role === "guest";

  const [mounted, setMounted] = useState(false);
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsageOverview>({
    total_tokens: 0,
    prompt_tokens: 0,
    completion_tokens: 0,
    monthly_tokens: 0,
    token_limit: 100000,
    remaining_tokens: 100000,
    estimated_cost: 0,
    plan_name: "free",
  });

  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<"curl" | "python" | "openai" | "js">("curl");

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadBackendData = async () => {
    if (isGuest) {
      setLoading(false);
      setKeys([]);
      return;
    }

    setLoading(true);
    try {
      const [backendKeys, usageStats] = await Promise.all([
        fetchApiKeys(),
        fetchUsageOverview(),
      ]);

      const formattedKeys: ApiKeyItem[] = backendKeys.map((k) => ({
        id: String(k.id),
        name: k.name || "API Key",
        key: k.key || (k.prefix ? `${k.prefix}••••••••••••••••` : "pt_live_••••••••••••••••"),
        created: k.created_at
          ? new Date(k.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })
          : "Active",
        lastUsed: k.last_used_at ? new Date(k.last_used_at).toLocaleTimeString() : "Never",
      }));

      setKeys(formattedKeys);
      setUsage(usageStats);
    } catch (err) {
      console.error("Error loading backend developer portal data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && mounted) {
      loadBackendData();
    }
  }, [isOpen, mounted, isGuest]);

  if (!isOpen || !mounted) return null;

  const handleGenerateKey = async () => {
    if (isGuest) {
      setCreateError("Developer API access requires a permanent account. Please sign in or register.");
      return;
    }
    if (!newKeyName.trim() || isCreating) return;
    setIsCreating(true);
    setCreateError(null);
    try {
      const createdKey = await createBackendApiKey(newKeyName.trim());
      const rawKey = createdKey.key || "";
      const prefix = createdKey.prefix || rawKey.slice(0, 14);

      const newItem: ApiKeyItem = {
        id: String(createdKey.id),
        name: createdKey.name || newKeyName.trim(),
        key: prefix ? `${prefix}••••••••••••••••` : "pt_live_••••••••••••••••",
        created: "Just now",
        lastUsed: "Never",
      };

      setKeys([newItem, ...keys]);
      setGeneratedKey(rawKey);
      setNewKeyName("");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create API key";
      setCreateError(errorMsg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRevokeKey = async (id: string) => {
    const ok = await disableBackendApiKey(id);
    if (ok) {
      setKeys(keys.filter((k) => k.id !== id));
    }
  };

  const sampleKey = generatedKey || keys[0]?.key || "pt_live_xxxxxxxxxxxxxxxxxxxxxxxx";

  const curlCode = `curl "https://api.patwatoliai.com/v1/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${sampleKey}" \\
  -d '{
    "model": "lawgpt",
    "messages": [
      {"role": "system", "content": "You are LawGPT, an Indian legal advisor."},
      {"role": "user", "content": "What is IPC Section 302?"}
    ]
  }'`;

  const pythonNativeCode = `import requests

url = "https://api.patwatoliai.com/v1/chat/completions"
headers = {
    "Authorization": "Bearer ${sampleKey}",
    "Content-Type": "application/json",
}
payload = {
    "model": "lawgpt",  # Options: 'lawgpt', 'astrology-ai', 'patwatoli-general'
    "messages": [
        {"role": "user", "content": "Namaste Patwatoli AI! Please explain IPC 302."}
    ],
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;

  const pythonOpenAICode = `from openai import OpenAI

# Patwatoli AI is 100% drop-in compatible with standard OpenAI SDK:
client = OpenAI(
    api_key="${sampleKey}",
    base_url="https://api.patwatoliai.com/v1",
)

response = client.chat.completions.create(
    model="lawgpt",  # or 'astrology-ai', 'patwatoli-general'
    messages=[
        {"role": "user", "content": "Namaste Patwatoli AI! Please explain IPC 302."}
    ],
)
print(response.choices[0].message.content)`;

  const jsCode = `// Direct Fetch API or OpenAI Node SDK:
const response = await fetch("https://api.patwatoliai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${sampleKey}",
  },
  body: JSON.stringify({
    model: "lawgpt",
    messages: [{ role: "user", content: "Namaste Patwatoli AI!" }],
  }),
});

const data = await response.json();
console.log(data);`;

  const getCodeSnippet = () => {
    switch (activeCodeTab) {
      case "curl":
        return curlCode;
      case "python":
        return pythonNativeCode;
      case "openai":
        return pythonOpenAICode;
      case "js":
        return jsCode;
      default:
        return curlCode;
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-999999 h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col animate-in fade-in duration-200">
      {/* DEVELOPER PORTAL TOP NAVBAR */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 px-6 backdrop-blur-xl shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
            <Key size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-base">
              <span>Patwatoli Developer Portal</span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                <Sparkles size={10} /> Patwatoli v1 REST API
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              API Keys, Documentation & Metered Usage Dashboard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-emerald-600/20 transition cursor-pointer active:scale-95"
          >
            <ArrowLeft size={16} />
            <span>Back to Chat Workspace</span>
          </button>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* MAIN DEVELOPER PORTAL BODY GRID */}
      <div className="relative flex-1 overflow-y-auto p-6 md:p-8">
        {/* Patwatoli AI Emerald Green Wave Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 left-1/2 h-130 w-275 -translate-x-1/2 rounded-full bg-emerald-200/40 dark:bg-emerald-900/20 blur-[120px]" />
          <div className="absolute top-1/4 -left-40 h-105 w-180 rounded-full bg-teal-200/30 dark:bg-teal-900/20 blur-[130px]" />
          <div className="absolute -bottom-40 -left-20 h-130 w-205 rounded-full bg-emerald-300/30 dark:bg-emerald-950/30 blur-[120px]" />
          <div className="absolute -bottom-55 -right-25 h-140 w-215 rounded-full bg-teal-100/50 dark:bg-teal-950/30 blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: API KEYS & GENERATOR OR AUTH LOCKOUT (7 COLS) */}
          <div className="lg:col-span-7 space-y-6">
            {isGuest ? (
              /* GUEST USER LOCKOUT BANNER */
              <div className="rounded-2xl bg-white dark:bg-slate-900 p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 shadow-xs shrink-0">
                    <Lock size={24} />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 mb-1.5">
                      🔒 Developer Account Required
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Unlock Patwatoli Developer Platform
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Generate cryptographic <code className="rounded bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 font-mono font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">pt_live_</code> secret keys and deploy custom AI models (LawGPT, Astrology AI, Code Architect, MedAssist) into your web and mobile applications.
                    </p>
                  </div>
                </div>

                {/* Feature Value Props */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3.5 border border-slate-200/70 dark:border-slate-700/70 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                      <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
                      <span>Custom Fine-Tuned Models</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Access LawGPT, Astrology AI, Code Architect & General Chat.
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3.5 border border-slate-200/70 dark:border-slate-700/70 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                      <Terminal size={14} className="text-emerald-600 dark:text-emerald-400" />
                      <span>OpenAI SDK Compatible</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Drop-in replacement for OpenAI Python, Node & REST clients.
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3.5 border border-slate-200/70 dark:border-slate-700/70 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                      <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                      <span>pt_live_ Key Security</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Secure SHA-256 hashed keys with instant revocation control.
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3.5 border border-slate-200/70 dark:border-slate-700/70 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                      <Zap size={14} className="text-emerald-600 dark:text-emerald-400" />
                      <span>Real-Time Usage Meter</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Monitor token counts, latency ms, and quota allocations.
                    </p>
                  </div>
                </div>

                {/* Action CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href="/register?redirect=/chat"
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-xs font-bold text-white shadow-sm shadow-emerald-600/30 transition cursor-pointer active:scale-95 text-center"
                  >
                    <UserPlus size={16} />
                    <span>Create Free Developer Account</span>
                  </Link>

                  <Link
                    href="/login?redirect=/chat"
                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-5 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer active:scale-95 text-center"
                  >
                    <LogIn size={16} />
                    <span>Sign In</span>
                  </Link>
                </div>
              </div>
            ) : (
              /* LOGGED IN USER: CREATE NEW KEY CARD */
              <>
                <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                    <Plus size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Create New Secret API Key</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Name your secret key to identify where it is deployed (e.g. Production Backend, WhatsApp Bot, Mobile App).
                  </p>

                  <div className="flex gap-3 pt-1">
                    <input
                      type="text"
                      placeholder="e.g. Production Backend Service"
                      value={newKeyName}
                      onChange={(e) => {
                        setNewKeyName(e.target.value);
                        if (createError) setCreateError(null);
                      }}
                      className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none shadow-xs font-mono transition"
                    />
                    <button
                      onClick={handleGenerateKey}
                      disabled={!newKeyName.trim() || isCreating}
                      className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-emerald-600/30 transition cursor-pointer active:scale-95"
                    >
                      {isCreating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                      <span>{isCreating ? "Generating..." : "Generate Key"}</span>
                    </button>
                  </div>

                  {createError && (
                    <div className="mt-3 rounded-xl bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60 flex items-center gap-2">
                      <X size={15} className="text-red-500 shrink-0" />
                      <span>{createError}</span>
                    </div>
                  )}

                  {generatedKey && (
                    <div className="mt-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 p-4 border border-emerald-200 dark:border-emerald-800/60 space-y-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                          <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" /> Please copy your secret key now!
                        </span>
                        <span className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                          You won&apos;t be able to view it again.
                        </span>
                      </div>
                      <div className="rounded-lg bg-white dark:bg-slate-900 p-3 text-xs font-mono text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between shadow-xs">
                        <div className="truncate pr-3 font-semibold select-all text-slate-800 dark:text-slate-200">{generatedKey}</div>
                        <button
                          onClick={() => handleCopy(generatedKey, "gen")}
                          className="flex items-center gap-1.5 shrink-0 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition cursor-pointer shadow-xs active:scale-95"
                        >
                          {copiedId === "gen" ? <Check size={14} /> : <Copy size={14} />}
                          <span>{copiedId === "gen" ? "Copied!" : "Copy Key"}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ACTIVE KEYS TABLE */}
                <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Key size={16} className="text-emerald-600 dark:text-emerald-400" />
                      <span>Your Active Secret Keys ({keys.length})</span>
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Keep your secret keys safe and secure.</span>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    {loading ? (
                      <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin text-emerald-600" />
                        <span>Loading active keys...</span>
                      </div>
                    ) : keys.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400 italic">No active secret API keys found. Generate one above.</div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {keys.map((k) => (
                          <div key={k.id} className="flex items-center justify-between p-4 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                            <div className="space-y-1 max-w-[65%]">
                              <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-sm">
                                <span>{k.name}</span>
                                <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 font-medium">
                                  {k.key.substring(0, 16)}••••
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Created: {k.created} • Last used: {k.lastUsed}</div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleCopy(k.key, k.id)}
                                className="flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer border border-slate-200 dark:border-slate-700 active:scale-95"
                              >
                                {copiedId === k.id ? <Check size={13} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={13} />}
                                <span>{copiedId === k.id ? "Copied" : "Copy"}</span>
                              </button>

                              <button
                                onClick={() => handleRevokeKey(k.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition cursor-pointer border border-transparent hover:border-red-200 dark:hover:border-red-800/50"
                                title="Revoke Key"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* RIGHT COLUMN: QUICKSTART & METERING (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">
            {/* PATWATOLI AI REST API QUICKSTART */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-sm">
                  <Terminal size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <span>API Integration Quickstart</span>
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setActiveCodeTab("curl")}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                      activeCodeTab === "curl"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    cURL
                  </button>
                  <button
                    onClick={() => setActiveCodeTab("python")}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                      activeCodeTab === "python"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Python
                  </button>
                  <button
                    onClick={() => setActiveCodeTab("openai")}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                      activeCodeTab === "openai"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    OpenAI SDK
                  </button>
                  <button
                    onClick={() => setActiveCodeTab("js")}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                      activeCodeTab === "js"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Node.js
                  </button>
                </div>
              </div>

              <pre className="overflow-x-auto p-4 bg-slate-950 dark:bg-black/60 rounded-xl text-emerald-400 font-mono text-[11px] leading-relaxed border border-slate-800 shadow-inner max-h-65">
                {getCodeSnippet()}
              </pre>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span>
                  Base URL: <code className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-emerald-700 dark:text-emerald-300 font-mono border border-slate-200 dark:border-slate-700">https://api.patwatoliai.com/v1</code>
                </span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <BookOpen size={13} /> v1 Compatible
                </span>
              </div>
            </div>

            {/* LIVE USAGE & BILLING METER */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Zap size={16} className="text-amber-500" /> Live Monthly Token Usage
                </span>
                <span className="font-mono text-xs text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                  {isGuest
                    ? "Login Required"
                    : loading
                    ? "Loading..."
                    : `${(usage.monthly_tokens || usage.total_tokens).toLocaleString()} / ${usage.token_limit.toLocaleString()}`}
                </span>
              </div>

              <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-sm"
                  style={{
                    width: isGuest
                      ? "0%"
                      : `${Math.min(
                          100,
                          Math.max(
                            1,
                            ((usage.monthly_tokens || usage.total_tokens) / (usage.token_limit || 100000)) * 100
                          )
                        )}%`,
                  }}
                />
              </div>

              {isGuest ? (
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-2 py-5">
                  <Lock size={18} className="mx-auto text-slate-400" />
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-200">Account Required for Usage Metering</div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Sign in to view token consumption, remaining balance, and plan tier.</p>
                </div>
              ) : (
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Prompt Tokens</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
                      {usage.prompt_tokens.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Completion Tokens</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
                      {usage.completion_tokens.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Remaining Balance</span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400 font-mono">
                      {usage.remaining_tokens.toLocaleString()} Tokens
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-2">
                    <span>Estimated Total Usage Cost</span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400 font-mono">
                      ${usage.estimated_cost.toFixed(4)} USD
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>Subscription Plan</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 uppercase">
                      <ShieldCheck size={14} /> {usage.plan_name} Tier
                    </span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
