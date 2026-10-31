"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Bot,
  ChevronDown,
  Sparkles,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquare,
  Key,
  X,
  LogIn,
  Languages,
  Pencil,
  Check,
} from "lucide-react";

import {
  getConversations,
  getConversationMessages,
  deleteConversation,
  updateConversationTitle,
} from "../services/conversation-service";

import { useConversationStore } from "../stores/conversation-store";
import { useChatStore } from "../stores/chat-store";
import { socketClient } from "@/services/websocket/socket-client";
import { useAuthStore } from "@/stores/auth-store";
import { useAssistants } from "@/features/playground/hooks/use-assistants";
import { Assistant } from "@/features/playground/types/assistant";
import { getAssistantLogo } from "../utils/assistant-logo";
import { useQuery } from "@tanstack/react-query";
import { fetchUserUsage } from "@/features/billing/services/billing.service";
import { UpgradePlanModal } from "@/features/billing/components/upgrade-plan-modal";
import { AuthModal } from "@/components/auth/auth-modal";
import { SettingsModal } from "./settings-modal";
import { ApiKeysModal } from "./api-keys-modal";
import { TranslationStudioModal } from "@/features/translation/components/translation-studio-modal";
import { Conversation } from "../types/conversation.types";

export function formatConversationTitle(title?: string | null): string {
  if (!title) return "New Conversation";
  const cleaned = title.replace(/^['"`\s]+|['"`\s]+$/g, "").trim();
  if (!cleaned || cleaned === "''" || cleaned === '""' || cleaned.toLowerCase() === "untitled chat") {
    return "New Conversation";
  }
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

interface GroupedConversations {
  today: Conversation[];
  yesterday: Conversation[];
  last7Days: Conversation[];
  older: Conversation[];
}

function groupConversationsByDate(conversations: Conversation[]): GroupedConversations {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const last7DaysStart = todayStart - 86400000 * 7;

  const groups: GroupedConversations = {
    today: [],
    yesterday: [],
    last7Days: [],
    older: [],
  };

  for (const conv of conversations) {
    const convTime = conv.created_at ? new Date(conv.created_at).getTime() : now.getTime();
    if (convTime >= todayStart) {
      groups.today.push(conv);
    } else if (convTime >= yesterdayStart) {
      groups.yesterday.push(conv);
    } else if (convTime >= last7DaysStart) {
      groups.last7Days.push(conv);
    } else {
      groups.older.push(conv);
    }
  }

  return groups;
}

export function ConversationSidebar() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isGuest = user?.role === "guest";

  const conversations = useConversationStore((state) => state.conversations);
  const setConversations = useConversationStore((state) => state.setConversations);
  const activeConversationId = useConversationStore((state) => state.activeConversationId);
  const setActiveConversation = useConversationStore((state) => state.setActiveConversation);
  const setMessages = useChatStore((state) => state.setMessages);
  const activeAssistantId = useConversationStore((state) => state.activeAssistantId);
  const setActiveAssistantId = useConversationStore((state) => state.setActiveAssistantId);
  const isMobileSidebarOpen = useConversationStore((state) => state.isMobileSidebarOpen);
  const setMobileSidebarOpen = useConversationStore((state) => state.setMobileSidebarOpen);

  const { data: assistants = [] } = useAssistants();
  const [isAssistantDropdownOpen, setIsAssistantDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isApiKeysOpen, setIsApiKeysOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTranslationOpen, setIsTranslationOpen] = useState(false);

  const { data: usage } = useQuery({
    queryKey: ["billing-usage"],
    queryFn: fetchUserUsage,
    staleTime: 60 * 1000,
    enabled: !isGuest,
  });

  const currentPlanName = isGuest ? "GUEST" : (usage?.plan?.toUpperCase() || "FREE");

  const [isCollapsed, setIsCollapsed] = useState(false);

  const userEmail = user?.email || "user@platform.com";
  const userName = user?.full_name || (user?.email ? user.email.split("@")[0] : "User");
  const userAvatarInitial = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    setMobileSidebarOpen(false);
    logout();
    router.push("/login");
  };

  const activeAssistant: Assistant | undefined = assistants.find((a: Assistant) => a.id === activeAssistantId) || assistants[0];

  useEffect(() => {
    if (assistants.length > 0 && activeAssistantId === null) {
      const general = assistants.find((a: Assistant) => a.code === "general") || assistants[0];
      if (general) {
        setActiveAssistantId(general.id);
      }
    }
  }, [assistants, activeAssistantId, setActiveAssistantId]);

  // When opening mobile drawer, ensure it is in expanded view
  useEffect(() => {
    if (isMobileSidebarOpen && isCollapsed) {
      setIsCollapsed(false);
    }
  }, [isMobileSidebarOpen, isCollapsed]);

  /* =========================
     LOAD CONVERSATIONS
  ========================= */

  useEffect(() => {
    async function load() {
      setActiveConversation(null);
      setMessages([]);

      try {
        const data = await getConversations(activeAssistantId);
        setConversations(data);

        if (data.length > 0) {
          const latestConversation = data[0];
          try {
            const messages = await getConversationMessages(latestConversation.id);
            setActiveConversation(latestConversation.id);
            setMessages(messages);
          } catch {
            setActiveConversation(null);
            setMessages([]);
          }
        } else {
          setActiveConversation(null);
          setMessages([]);
        }
      } catch (error) {
        console.error(error);
        setActiveConversation(null);
        setMessages([]);
      }
    }

    load();
  }, [activeAssistantId, user?.id]);

  /* =========================
     CREATE CHAT (LAZY DRAFT)
  ========================= */

  function handleNewChat() {
    setMobileSidebarOpen(false);

    // Guard: If already in an empty draft chat (activeConversationId is null and no messages), do nothing
    const currentMessages = useChatStore.getState().messages;
    if (activeConversationId === null && currentMessages.length === 0) {
      return;
    }

    // If streaming, send stop signal
    if (useChatStore.getState().isStreaming && activeConversationId) {
      try {
        socketClient.send({
          type: "stop",
          conversation_id: activeConversationId,
        });
      } catch (e) {
        console.warn("Failed to send stop signal on new chat:", e);
      }
      useChatStore.getState().setStreaming(false);
    }

    // Set active conversation to null and clear messages for a clean new chat draft
    setActiveConversation(null);
    setMessages([]);
  }

  async function handleDeleteChat(conversationId: number) {
    try {
      if (useChatStore.getState().isStreaming && activeConversationId === conversationId) {
        try {
          socketClient.send({
            type: "stop",
            conversation_id: conversationId,
          });
        } catch (e) {
          console.warn("Failed to send stop signal on chat delete:", e);
        }
        useChatStore.getState().setStreaming(false);
      }

      await deleteConversation(conversationId);
      const updatedConversations = conversations.filter((c) => c.id !== conversationId);
      setConversations(updatedConversations);

      if (activeConversationId === conversationId) {
        if (updatedConversations.length > 0) {
          const latest = updatedConversations[0];
          const messages = await getConversationMessages(latest.id);
          setActiveConversation(latest.id);
          setMessages(messages);
        } else {
          setActiveConversation(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const startRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(formatConversationTitle(conv.title));
  };

  const handleSaveRename = async (id: number) => {
    const trimmed = editTitle.trim();
    if (trimmed) {
      useConversationStore.getState().updateTitle(id, trimmed);
      try {
        await updateConversationTitle(id, trimmed);
      } catch (err) {
        console.error("Failed to rename conversation:", err);
      }
    }
    setEditingId(null);
  };

  const handleCancelRename = () => {
    setEditingId(null);
  };

  const filteredConversations = conversations.filter(
    (c) => activeAssistantId === null || c.assistant_id === activeAssistantId
  );

  const grouped = groupConversationsByDate(filteredConversations);

  const renderConversationItem = (conversation: Conversation) => {
    const isActive = activeConversationId === conversation.id;
    const isEditing = editingId === conversation.id;
    const displayTitle = formatConversationTitle(conversation.title);

    if (isCollapsed) {
      return (
        <button
          key={conversation.id}
          type="button"
          onClick={async () => {
            try {
              const messages = await getConversationMessages(conversation.id);
              setActiveConversation(conversation.id);
              setMessages(messages);
            } catch (error) {
              console.error(error);
              setActiveConversation(null);
              setMessages([]);
            }
          }}
          className={`flex h-9 w-9 items-center justify-center rounded-xl mx-auto transition-all cursor-pointer ${
            isActive
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold"
              : "text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
          title={displayTitle}
        >
          <MessageSquare size={16} />
        </button>
      );
    }

    return (
      <div
        key={conversation.id}
        onClick={async () => {
          if (isEditing) return;
          setMobileSidebarOpen(false);
          try {
            const messages = await getConversationMessages(conversation.id);
            setActiveConversation(conversation.id);
            setMessages(messages);
          } catch (error) {
            console.error(error);
            setActiveConversation(null);
            setMessages([]);
          }
        }}
        className={`group relative flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors duration-150 cursor-pointer ${
          isActive
            ? "bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-medium"
            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
        }`}
        title={displayTitle}
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1 mr-1">
          {isActive ? (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
          ) : (
            <MessageSquare size={13} className="text-slate-400 shrink-0 group-hover:text-slate-500 dark:group-hover:text-slate-300 transition-colors" />
          )}

          {isEditing ? (
            <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveRename(conversation.id);
                  if (e.key === "Escape") handleCancelRename();
                }}
                className="w-full bg-white dark:bg-slate-900 border border-emerald-500 rounded px-1.5 py-0.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => handleSaveRename(conversation.id)}
                className="p-1 hover:text-emerald-600 text-slate-500 cursor-pointer"
                title="Save"
              >
                <Check size={12} />
              </button>
              <button
                type="button"
                onClick={handleCancelRename}
                className="p-1 hover:text-red-500 text-slate-500 cursor-pointer"
                title="Cancel"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <span className="truncate">{displayTitle}</span>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              type="button"
              onClick={(e) => startRename(conversation, e)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer rounded hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
              title="Rename conversation"
            >
              <Pencil size={12} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteChat(conversation.id);
              }}
              className="p-1 text-slate-400 hover:text-red-500 transition cursor-pointer rounded hover:bg-red-50 dark:hover:bg-red-950/40"
              title="Delete conversation"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* MOBILE BACKDROP OVERLAY (TAP TO CLOSE) */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300 md:hidden animate-in fade-in"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 select-none shadow-2xl transition-transform duration-300 ease-in-out md:relative md:z-0 md:shadow-sm md:translate-x-0 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } w-72 ${isCollapsed ? "md:w-20" : "md:w-72"}`}
      >
        {/* ASSISTANT SELECTOR & TOGGLE HEADER */}
        <div className="relative border-b border-slate-200/80 dark:border-slate-800 p-3.5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 px-1">
                Patwatoli AI Assistant
              </label>
            )}
            <div className="flex items-center gap-1 ml-auto">
              {/* DESKTOP COLLAPSE BUTTON */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`hidden md:flex p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${isCollapsed ? "mx-auto" : ""}`}
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
              </button>
              {/* MOBILE CLOSE (X) BUTTON */}
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="flex md:hidden p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                title="Close Menu"
                aria-label="Close Menu"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="relative">
            {!isCollapsed ? (
              <button
                onClick={() => setIsAssistantDropdownOpen(!isAssistantDropdownOpen)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-3 py-2.5 text-left transition hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-slate-800 shadow-sm"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs">
                    <img
                      src={getAssistantLogo(activeAssistant?.code, activeAssistant?.name)}
                      alt={activeAssistant?.name || "Assistant"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="truncate">
                    <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {activeAssistant?.name || "General Chat"}
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                      {activeAssistant?.description || "Universal AI Assistant"}
                    </div>
                  </div>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isAssistantDropdownOpen ? "rotate-180 text-emerald-600" : ""}`} />
              </button>
            ) : (
              <button
                onClick={() => setIsAssistantDropdownOpen(!isAssistantDropdownOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md mx-auto transition hover:scale-105 p-1"
                title={activeAssistant?.name || "General Chat"}
              >
                <img
                  src={getAssistantLogo(activeAssistant?.code, activeAssistant?.name)}
                  alt={activeAssistant?.name || "Assistant"}
                  className="h-full w-full object-cover rounded-lg"
                />
              </button>
            )}

            {/* DROPDOWN MENU */}
            {isAssistantDropdownOpen && (
              <>
                {/* Backdrop dismiss */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsAssistantDropdownOpen(false)}
                />
                <div
                  className={`absolute z-50 max-h-80 overflow-y-auto space-y-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-2xl backdrop-blur-xl ${
                    isCollapsed ? "left-full ml-2 top-0 w-64" : "left-0 right-0 top-full mt-1.5"
                  }`}
                >
                  {assistants.length === 0 ? (
                    <div className="px-3 py-3 text-center text-xs text-slate-500 font-medium">
                      Loading assistants...
                    </div>
                  ) : (
                    assistants.map((assistant) => (
                      <button
                        key={assistant.id}
                        onClick={() => {
                          setActiveAssistantId(assistant.id);
                          setActiveConversation(null);
                          setMessages([]);
                          setIsAssistantDropdownOpen(false);
                          setMobileSidebarOpen(false);
                        }}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                          activeAssistantId === assistant.id
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold border border-emerald-200/80 dark:border-emerald-800 shadow-xs"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                          <img
                            src={getAssistantLogo(assistant.code, assistant.name)}
                            alt={assistant.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-slate-900 dark:text-white truncate">{assistant.name}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{assistant.description}</div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

        </div>

      {/* ACTIONS: NEW CHAT & TRANSLATE DOCUMENT */}
      <div className="p-3.5 space-y-2">
        {!isCollapsed ? (
          <>
            <button
              onClick={handleNewChat}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg hover:shadow-emerald-600/25 active:scale-[0.98] shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <Plus size={16} />
              New Conversation
            </button>
            <button
              onClick={() => setIsTranslationOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-300 dark:hover:border-emerald-700 border border-slate-200/90 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all duration-200 active:scale-[0.98] cursor-pointer"
            >
              <Languages size={15} className="text-emerald-600" />
              <span>Translate Document</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleNewChat}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 mx-auto transition hover:scale-105 cursor-pointer"
              title="New Conversation"
            >
              <Plus size={18} />
            </button>
            <button
              onClick={() => setIsTranslationOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200/90 dark:border-slate-700 mx-auto transition hover:scale-105 cursor-pointer"
              title="Translate Document"
            >
              <Languages size={17} className="text-emerald-600" />
            </button>
          </>
        )}
      </div>

      {/* CONVERSATION HISTORY */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-3">
        {filteredConversations.length === 0 ? (
          !isCollapsed && (
            <div className="px-3 py-8 text-center text-xs text-slate-400 dark:text-slate-500 italic">
              No chats yet for {activeAssistant?.name || "this model"}. Click &quot;New Conversation&quot; to start!
            </div>
          )
        ) : isCollapsed ? (
          <div className="space-y-1.5 py-1">
            {filteredConversations.map(renderConversationItem)}
          </div>
        ) : (
          <>
            {grouped.today.length > 0 && (
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2.5 py-1">
                  Today
                </div>
                {grouped.today.map(renderConversationItem)}
              </div>
            )}

            {grouped.yesterday.length > 0 && (
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2.5 py-1">
                  Yesterday
                </div>
                {grouped.yesterday.map(renderConversationItem)}
              </div>
            )}

            {grouped.last7Days.length > 0 && (
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2.5 py-1">
                  Previous 7 Days
                </div>
                {grouped.last7Days.map(renderConversationItem)}
              </div>
            )}

            {grouped.older.length > 0 && (
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2.5 py-1">
                  Older
                </div>
                {grouped.older.map(renderConversationItem)}
              </div>
            )}
          </>
        )}
      </div>

      {/* USER & SETTINGS FOOTER */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-3 mt-auto space-y-2 bg-slate-50 dark:bg-slate-950/60">
        {!isCollapsed ? (
          <>
            {/* UPGRADE PLAN BUTTON */}
            <button
              onClick={() => {
                router.push("/pricing");
                setMobileSidebarOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 transition hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-slate-800/80 shadow-xs cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs group-hover:scale-105 transition-transform">
                  <Sparkles size={16} />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {currentPlanName === "PRO" ? "Pro Plan Active" : "Upgrade Plan"}
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {currentPlanName === "PRO" ? "1M monthly tokens" : "Frontier AI & higher limits"}
                  </div>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  currentPlanName === "PRO"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-emerald-600 text-white"
                }`}
              >
                {currentPlanName === "PRO" ? "PRO" : "UPGRADE"}
              </span>
            </button>

            {/* DEVELOPER API KEYS */}
            <button
              onClick={() => {
                setIsApiKeysOpen(true);
                setMobileSidebarOpen(false);
              }}
              className="group flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800/70 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                  <Key size={14} />
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Developer API Keys</span>
              </div>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                REST v1
              </span>
            </button>

            {/* PLATFORM SETTINGS */}
            <button
              onClick={() => {
                setIsSettingsOpen(true);
                setMobileSidebarOpen(false);
              }}
              className="group flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800/70 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 group-hover:scale-105 transition-transform">
                  <Settings size={14} />
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Platform Settings</span>
              </div>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                router.push("/pricing");
                setMobileSidebarOpen(false);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700 mx-auto transition cursor-pointer"
              title={`Upgrade Plan (${currentPlanName})`}
            >
              <Sparkles size={18} />
            </button>

            <button
              onClick={() => {
                setIsApiKeysOpen(true);
                setMobileSidebarOpen(false);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/30 mx-auto transition-all cursor-pointer"
              title="Developer API Keys"
            >
              <Key size={16} />
            </button>

            <button
              onClick={() => {
                setIsSettingsOpen(true);
                setMobileSidebarOpen(false);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 mx-auto transition-all cursor-pointer"
              title="Platform Settings"
            >
              <Settings size={16} />
            </button>
          </>
        )}

        {/* USER / GUEST PROFILE CARD */}
        {isGuest ? (
          !isCollapsed ? (
            <div className="rounded-2xl bg-linear-to-br from-emerald-500/10 via-teal-500/5 to-slate-100 dark:to-slate-900/60 p-3 border border-emerald-200/70 dark:border-emerald-800/60 shadow-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-xs">
                  G
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-white">Guest Visitor</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2.5 leading-relaxed">
                Sign in to save your chat history and unlock all features.
              </p>
              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <LogIn size={13} />
                <span>Sign In / Register</span>
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white shadow-xs mx-auto transition hover:opacity-90 cursor-pointer"
              title="Sign in to save chat"
            >
              <LogIn size={16} />
            </Link>
          )
        ) : !isCollapsed ? (
          <div className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-900 p-2.5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-700 font-bold text-xs text-white shadow-xs">
                {userAvatarInitial}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {userName}
                </div>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                  {userEmail}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
              title="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white shadow-xs mx-auto transition hover:opacity-90 cursor-pointer"
            title={`Log out (${userName})`}
          >
            {userAvatarInitial}
          </button>
        )}
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ApiKeysModal isOpen={isApiKeysOpen} onClose={() => setIsApiKeysOpen(false)} />
      <UpgradePlanModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />
    </aside>

    <TranslationStudioModal isOpen={isTranslationOpen} onClose={() => setIsTranslationOpen(false)} />
    <AuthModal isOpen={isAuthModalOpen} canClose={true} onClose={() => setIsAuthModalOpen(false)} onSuccess={() => setIsAuthModalOpen(false)} />
  </>
  );
}
