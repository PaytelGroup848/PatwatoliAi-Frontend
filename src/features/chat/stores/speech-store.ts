import { create } from "zustand";
import { sanitizeTextForSpeech } from "../utils/speech-sanitizer";

interface SpeechState {
  /** The id of the message currently speaking (null if idle) */
  activeMessageId: string | number | null;
  /** Whether speech audio is actively playing */
  isPlaying: boolean;
  /** Play text for a given message id */
  play: (messageId: string | number, rawText: string) => void;
  /** Stop any active speech playback */
  stop: () => void;
}

let chromeResumeInterval: ReturnType<typeof setInterval> | null = null;

function clearResumeInterval() {
  if (chromeResumeInterval) {
    clearInterval(chromeResumeInterval);
    chromeResumeInterval = null;
  }
}

/**
 * Detects best matching browser voice for the given text.
 * Prefers Hindi voices if Devanagari script is present, otherwise natural English.
 */
function pickBestVoice(voices: SpeechSynthesisVoice[], text: string): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const hasDevanagari = /[\u0900-\u097F]/.test(text);

  if (hasDevanagari) {
    const hindiVoice = voices.find(
      (v) => v.lang.startsWith("hi") || v.name.toLowerCase().includes("hindi")
    );
    if (hindiVoice) return hindiVoice;
  }

  // Preferred natural English voices
  const preferredEnglish = voices.find(
    (v) =>
      (v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Neural"))) ||
      v.lang === "en-IN" ||
      v.lang === "en-US" ||
      v.lang === "en-GB"
  );

  return preferredEnglish || voices.find((v) => v.lang.startsWith("en")) || voices[0] || null;
}

export const useSpeechStore = create<SpeechState>((set, get) => ({
  activeMessageId: null,
  isPlaying: false,

  play: (messageId, rawText) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      console.warn("SpeechSynthesis API not supported in this browser.");
      return;
    }

    const { activeMessageId, isPlaying } = get();

    // Toggle: if clicking the currently playing message, stop it
    if (activeMessageId === messageId && isPlaying) {
      get().stop();
      return;
    }

    // Cancel any current utterance cleanly
    window.speechSynthesis.cancel();
    clearResumeInterval();

    const sanitized = sanitizeTextForSpeech(rawText);
    if (!sanitized) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(sanitized);

    // Rate and pitch for natural professional cadence
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const voice = pickBestVoice(voices, sanitized);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }

    utterance.onstart = () => {
      set({
        activeMessageId: messageId,
        isPlaying: true,
      });

      // Chrome 15s pause bug defense: periodically ping resume while playing
      clearResumeInterval();
      chromeResumeInterval = setInterval(() => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } else {
          clearResumeInterval();
        }
      }, 10000);
    };

    utterance.onend = () => {
      clearResumeInterval();
      set({
        activeMessageId: null,
        isPlaying: false,
      });
    };

    utterance.onerror = (e) => {
      // Ignore interruption cancellations
      if (e.error !== "canceled" && e.error !== "interrupted") {
        console.warn("SpeechSynthesis error:", e.error);
      }
      clearResumeInterval();
      set({
        activeMessageId: null,
        isPlaying: false,
      });
    };

    // Speak
    window.speechSynthesis.speak(utterance);
  },

  stop: () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    clearResumeInterval();
    set({
      activeMessageId: null,
      isPlaying: false,
    });
  },
}));
