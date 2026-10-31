"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Brain,
  ChevronDown,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReasoningAccordionProps {
  /** The extracted Chain-of-Thought / reasoning text */
  reasoning: string;
  /** Whether the message is currently in an active streaming thinking phase */
  isStreaming?: boolean;
  /** Recorded duration in seconds (if already completed) */
  durationSeconds?: number;
  /** Custom className */
  className?: string;
}

export function ReasoningAccordion({
  reasoning,
  isStreaming = false,
  durationSeconds,
  className,
}: ReasoningAccordionProps) {
  // During live streaming of thoughts, expand by default; once thoughts finish, default to collapsed
  const [isOpen, setIsOpen] = useState(isStreaming);
  const [copied, setCopied] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(durationSeconds ?? 0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number | null>(null);

  // Live timer tick during active thinking stream
  useEffect(() => {
    if (!isStreaming) {
      if (durationSeconds !== undefined) {
        setElapsedSeconds(durationSeconds);
      }
      return;
    }

    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    const interval = setInterval(() => {
      if (startTimeRef.current) {
        const secs = (Date.now() - startTimeRef.current) / 1000;
        setElapsedSeconds(Number(secs.toFixed(1)));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isStreaming, durationSeconds]);

  // Keep accordion open while streaming thoughts, auto-scroll inner container to bottom
  useEffect(() => {
    if (isStreaming) {
      setIsOpen(true);
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [isStreaming, reasoning]);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(reasoning);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  if (!reasoning && !isStreaming) {
    return null;
  }

  // Display text calculation
  const displayTime = durationSeconds !== undefined
    ? `${durationSeconds.toFixed(1)}s`
    : elapsedSeconds > 0
    ? `${elapsedSeconds.toFixed(1)}s`
    : "";

  return (
    <div className={cn("my-2.5 w-full max-w-3xl", className)}>
      {/* HEADER PILL / ACCORDION TRIGGER */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className={cn(
          "group flex items-center justify-between gap-3 w-full sm:w-auto px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-all duration-150 cursor-pointer select-none",
          isOpen
            ? "bg-slate-100/90 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs"
            : "bg-slate-50/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
        )}
      >
        <div className="flex items-center gap-2">
          {isStreaming ? (
            <div className="relative flex items-center justify-center">
              <Brain className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
          ) : (
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          )}

          <div className="flex items-center gap-1.5 font-mono">
            {isStreaming ? (
              <>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Thinking...
                </span>
                {displayTime && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    ({displayTime})
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="text-slate-700 dark:text-slate-300">
                  {displayTime ? `Thought for ${displayTime}` : "Thought process"}
                </span>
              </>
            )}
          </div>
        </div>

        <ChevronDown
          size={13}
          className={cn(
            "text-slate-400 dark:text-slate-500 transition-transform duration-200 shrink-0 ml-2 group-hover:text-slate-600 dark:group-hover:text-slate-300",
            isOpen && "rotate-180 text-emerald-600 dark:text-emerald-400"
          )}
        />
      </button>

      {/* COLLAPSIBLE REASONING CONTENT */}
      {isOpen && (
        <div className="mt-2 relative rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 shadow-2xs backdrop-blur-xs transition-all animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 dark:border-slate-800/60 text-[11px] font-mono text-slate-400 dark:text-slate-500">
            <span className="uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Brain size={12} className="text-emerald-500" />
              Reasoning Trace
            </span>

            <button
              type="button"
              onClick={handleCopy}
              title={copied ? "Copied" : "Copy reasoning trace"}
              className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={11} className="text-emerald-500" />
                  <span className="text-emerald-500 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={11} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div
            ref={scrollRef}
            className="max-h-72 overflow-y-auto pr-1 text-xs font-mono text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap select-text border-l-2 border-emerald-500/40 dark:border-emerald-500/30 pl-3"
          >
            {reasoning || (
              <span className="italic text-slate-400 dark:text-slate-500">
                Evaluating logic and synthesizing response...
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
