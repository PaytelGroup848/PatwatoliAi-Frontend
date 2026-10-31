"use client";

import { useEffect, useState } from "react";
import { Volume2, AudioLines, Square } from "lucide-react";
import { useSpeechStore } from "../stores/speech-store";
import { cn } from "@/lib/utils";

interface SpeechButtonProps {
  messageId: string | number;
  text: string;
  className?: string;
}

export function SpeechButton({ messageId, text, className }: SpeechButtonProps) {
  const [isSupported, setIsSupported] = useState(false);
  const activeMessageId = useSpeechStore((state) => state.activeMessageId);
  const isPlaying = useSpeechStore((state) => state.isPlaying);
  const play = useSpeechStore((state) => state.play);
  const stop = useSpeechStore((state) => state.stop);

  // Check browser SpeechSynthesis support safely on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);

      // Pre-warm voices on modern Chrome
      window.speechSynthesis.getVoices();
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
      };
    }
  }, []);

  if (!isSupported || !text) {
    return null;
  }

  const isCurrentPlaying = activeMessageId === messageId && isPlaying;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentPlaying) {
      stop();
    } else {
      play(messageId, text);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={isCurrentPlaying ? "Stop reading" : "Read aloud"}
      aria-label={isCurrentPlaying ? "Stop reading" : "Read aloud"}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md transition-all cursor-pointer relative group",
        isCurrentPlaying
          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 shadow-2xs"
          : "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 text-slate-400",
        className
      )}
    >
      {isCurrentPlaying ? (
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
