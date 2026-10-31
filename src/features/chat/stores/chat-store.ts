import { create } from "zustand";

import {
  ChatMessage,
} from "../types/chat.types";

interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;

  setMessages: (
    messages: ChatMessage[]
  ) => void;

  addMessage: (
    message: ChatMessage
  ) => void;

  updateLastMessage: (
    chunk: string,
    meta?: { reasoningDuration?: number }
  ) => void;

  clearMessages: () => void;
  setStreaming: (
    value: boolean
  ) => void;
}

export const useChatStore =
  create<ChatState>((set) => ({
    messages: [],
    isStreaming: false,

    setMessages: (messages) =>
      set({
        messages,
      }),

    addMessage: (message) =>
      set((state) => ({
        messages: [
          ...state.messages,
          message,
        ],
      })),

    updateLastMessage: (chunk, meta) =>
      set((state) => {
        const messages = [...state.messages];

        for (
          let i = messages.length - 1;
          i >= 0;
          i--
        ) {
          if (
            messages[i].role ===
            "assistant"
          ) {
            messages[i] = {
              ...messages[i],
              content:
                messages[i].content +
                chunk,
              ...(meta?.reasoningDuration !== undefined
                ? { reasoningDuration: meta.reasoningDuration }
                : {}),
            };
            break;
          }
        }

        return {
          messages,
        };
      }),

    setStreaming: (value) =>
      set({
        isStreaming: value,
      }),

    clearMessages: () =>
      set({
        messages: [],
      }),
  }));
