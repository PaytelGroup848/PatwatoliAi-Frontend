"use client";

import { Bot, Sparkles, Menu, Plus, LogIn } from "lucide-react";
import { useAssistants } from "../hooks/use-assistants";
import { getAssistantLogo } from "@/features/chat/utils/assistant-logo";
import { useConversationStore } from "@/features/chat/stores/conversation-store";
import { useChatStore } from "@/features/chat/stores/chat-store";
import { useAuthStore } from "@/stores/auth-store";
import { AuthModal } from "@/components/auth/auth-modal";
import { useState } from "react";

export function ChatHeader() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isGuest = user?.role === "guest";

  const activeAssistantId = useConversationStore((state) => state.activeAssistantId);
  const conversations = useConversationStore((state) => state.conversations);
  const activeConversationId = useConversationStore((state) => state.activeConversationId);
  const setActiveConversation = useConversationStore((state) => state.setActiveConversation);
  const setMobileSidebarOpen = useConversationStore((state) => state.setMobileSidebarOpen);
  const setMessages = useChatStore((state) => state.setMessages);
  const { data: assistants = [] } = useAssistants();

  const assistant = assistants.find((item) => item.id === activeAssistantId);
  const conversation = conversations.find((item) => item.id === activeConversationId);

  const handleNewChat = () => {
    setActiveConversation(null);
    setMessages([]);
  };

  return (
    <header className="flex h-14 md:h-16 min-h-[56px] md:min-h-[64px] items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-3 sm:px-6 py-2 backdrop-blur-2xl text-slate-900 dark:text-white shadow-xs z-10">
      <div className="flex items-center gap-2 sm:gap-3.5 overflow-hidden min-w-0">
        {/* MOBILE HAMBURGER BUTTON (DRAWER TOGGLE) */}
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors md:hidden shrink-0 cursor-pointer"
          title="Open Menu"
          aria-label="Open Menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          <img
            src={getAssistantLogo(assistant?.code, assistant?.name)}
            alt={assistant?.name ?? "Assistant"}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              {assistant?.name ?? "General Chat"}
            </h2>
            <span className="shrink-0 flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs">
              <Sparkles size={11} className="text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Active Model</span>
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px] sm:max-w-md hidden xs:block">
            {assistant?.description ?? "Universal AI Assistant"}
          </p>
        </div>

        {/* FEATURE BADGES */}
        <div className="ml-4 hidden md:flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800 pl-4">
          {assistant?.code === "coder" && (
            <>
              <span className="rounded-md bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 text-[11px] font-medium text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Code Assistant
              </span>
              <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-[11px] font-medium text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Syntax Highlighting
              </span>
              <span className="rounded-md bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[11px] font-medium text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Refactoring
              </span>
            </>
          )}
          {(assistant?.code === "general" || assistant?.config?.document_chat_enabled) && (
            <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Documents
            </span>
          )}
          {(assistant?.code === "general" || assistant?.config?.voice_enabled) && (
            <span className="rounded-md bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 text-[11px] font-medium text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Voice
            </span>
          )}
          {assistant?.config?.web_search_enabled && (
            <span className="rounded-md bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 text-[11px] font-medium text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              Web Search
            </span>
          )}
          {assistant?.config?.tool_calling_enabled && (
            <span className="rounded-md bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              Tools
            </span>
          )}
          {assistant?.config?.rag_enabled && (
            <span className="rounded-md bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 text-[11px] font-medium text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
              RAG
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {isGuest && (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 text-[11px] font-semibold text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800 shadow-xs">
              <Sparkles size={12} className="text-amber-600 dark:text-amber-400" />
              <span>Guest Mode</span>
            </span>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition cursor-pointer"
            >
              <LogIn size={13} />
              <span>Sign In</span>
            </button>
          </div>
        )}

        {/* MOBILE NEW CHAT (+) BUTTON */}
        <button
          onClick={handleNewChat}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors md:hidden cursor-pointer"
          title="New Conversation"
          aria-label="New Conversation"
        >
          <Plus size={20} />
        </button>

        <div className="text-right hidden sm:flex items-center">
          <p className="flex items-center justify-end gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
          </p>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        canClose={true}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAuthModalOpen(false)}
      />
    </header>
  );
}
