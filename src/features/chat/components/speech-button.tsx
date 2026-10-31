"use client";

import { useEffect, useState } from "react";
import { Volume2, AudioLines, Loader2 } from "lucide-react";
import { useSpeechStore } from "../stores/speech-store";
import { cn } from "@/lib/utils";

interface SpeechButtonProps {
  messageId: string | number;
  text: string;
  className?: string;
}

export function SpeechButton({ messageId, text, className }: SpeechButtonProps) {
  const [mounted, setMounted] = useState(false);
  const activeMessageId = useSpeechStore((state) => state.activeMessageId);
  const isPlaying = useSpeechStore((state) => state.isPlaying);
  const isLoading = useSpeechStore((state) => state.isLoading);
  const play = useSpeechStore((state) => state.play);
  const stop = useSpeechStore((state) => state.stop);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !text) {
    return null;
  }

  const isCurrentActive = activeMessageId === messageId;
  const isCurrentPlaying = isCurrentActive && isPlaying;
  const isCurrentLoading = isCurrentActive && isLoading;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentPlaying || isCurrentLoading) {
      stop();
    } else {
      play(messageId, text);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={
        isCurrentPlaying
          ? "Stop reading"
          : isCurrentLoading
          ? "Connecting neural voice..."
          : "Read aloud"
      }
      aria-label={
        isCurrentPlaying
          ? "Stop reading"
          : isCurrentLoading
          ? "Connecting neural voice"
          : "Read aloud"
      }
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md transition-all cursor-pointer relative group",
        isCurrentPlaying || isCurrentLoading
          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 shadow-2xs"
          : "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 text-slate-400",
        className
      )}
    >
      {isCurrentLoading ? (
        <Loader2 size={13} className="text-emerald-600 dark:text-emerald-400 animate-spin" />
      ) : isCurrentPlaying ? (
        <div className="flex items-center justify-center relative">
          <AudioLines size={14} className="text-emerald-600 dark:text-emerald-400 animate-pulse" />
          <span className="sr-only">Stop</span>
        </div>
      ) : (
        <Volume2 size={14} className="group-hover:scale-105 transition-transform" />
      )}
    </button>
  );
}
