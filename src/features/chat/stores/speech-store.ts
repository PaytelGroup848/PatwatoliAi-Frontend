import { create } from "zustand";
import { sanitizeTextForSpeech } from "../utils/speech-sanitizer";

interface SpeechState {
  /** The id of the message currently speaking (null if idle) */
  activeMessageId: string | number | null;
  /** Whether the neural audio stream is connecting/buffering */
  isLoading: boolean;
  /** Whether speech audio is actively playing */
  isPlaying: boolean;
  /** Play text for a given message id via Server Neural Stream */
  play: (messageId: string | number, rawText: string) => Promise<void>;
  /** Client-side fallback if server neural stream is unreachable */
  fallbackBrowserSpeech: (messageId: string | number, text: string) => void;
  /** Stop any active speech playback */
  stop: () => void;
}

let activeAudio: HTMLAudioElement | null = null;

export const useSpeechStore = create<SpeechState>((set, get) => ({
  activeMessageId: null,
  isLoading: false,
  isPlaying: false,

  play: async (messageId, rawText) => {
    if (typeof window === "undefined") return;

    const { activeMessageId, isPlaying, isLoading } = get();

    // Toggle off if clicking the currently active message
    if (activeMessageId === messageId && (isPlaying || isLoading)) {
      get().stop();
      return;
    }

    // Stop any existing audio immediately
    get().stop();

    const sanitized = sanitizeTextForSpeech(rawText);
    if (!sanitized) return;

    // Set loading state
    set({
      activeMessageId: messageId,
      isLoading: true,
      isPlaying: false,
    });

    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL || "https://api.patwatoliai.com";

      const streamUrl = `${apiBase}/api/v1/voice/speak?text=${encodeURIComponent(sanitized)}`;

      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      audio.preload = "auto";
      audio.src = streamUrl;
      activeAudio = audio;

      audio.onplaying = () => {
        if (activeAudio === audio) {
          set({ isLoading: false, isPlaying: true });
        }
      };

      audio.onended = () => {
        if (activeAudio === audio) {
          activeAudio = null;
          set({ activeMessageId: null, isLoading: false, isPlaying: false });
        }
      };

      audio.onerror = (e) => {
        console.warn("Neural audio stream failed, invoking client fallback:", e);
        if (activeAudio === audio) {
          activeAudio = null;
          get().fallbackBrowserSpeech(messageId, sanitized);
        }
      };

      await audio.play();
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.warn("Audio play error, falling back to browser speech:", err);
        get().fallbackBrowserSpeech(messageId, sanitized);
      }
    }
  },

  fallbackBrowserSpeech: (messageId: string | number, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      set({ activeMessageId: null, isLoading: false, isPlaying: false });
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        set({ activeMessageId: messageId, isLoading: false, isPlaying: true });
      };

      utterance.onend = () => {
        set({ activeMessageId: null, isLoading: false, isPlaying: false });
      };

      utterance.onerror = () => {
        set({ activeMessageId: null, isLoading: false, isPlaying: false });
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Client fallback speech synthesis error:", e);
      set({ activeMessageId: null, isLoading: false, isPlaying: false });
    }
  },

  stop: () => {
    if (activeAudio) {
      try {
        activeAudio.pause();
        activeAudio.currentTime = 0;
        activeAudio.removeAttribute("src");
        activeAudio.load();
      } catch (e) {
        // ignore
      }
      activeAudio = null;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
    }

    set({
      activeMessageId: null,
      isLoading: false,
      isPlaying: false,
    });
  },
}));
