import { useState, useRef, useEffect } from "react";
import { useCaseLoomStore } from "@/stores/caseloom-store";
import {
  useAiThreads,
  useCreateAiThread,
  useAiThreadMessages,
  useCreateAiMessage,
} from "@/hooks/use-ai-threads";
import { useQueueJob } from "@/hooks/use-jobs";
import { useDrafts } from "@/hooks/use-drafts";
import { useDraftSections } from "@/hooks/use-drafts";
import { useClaims } from "@/hooks/use-claims";
import { aiThreadsApi } from "@/api/endpoints/ai-threads";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { AiMessageRole } from "@/types/enums";
import { formatLabel } from "@/lib/format-label";
import { formatRelative } from "@/lib/format-date";
import { CaseLoomChatBubble } from "./caseloom-chat-bubble";
import { SlashCommandMenu } from "./slash-command-menu";
import {
  parseSlashCommand,
  buildJobPayload,
  matchSlashCommands,
} from "./slash-commands";
import { toast } from "sonner";

interface CaseLoomChatPanelProps {
  matterId: string;
}

export function CaseLoomChatPanel({ matterId }: CaseLoomChatPanelProps) {
  const [chatInput, setChatInput] = useState("");
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [showThreadList, setShowThreadList] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedThreadId = useCaseLoomStore((s) => s.selectedThreadId);
  const setSelectedThreadId = useCaseLoomStore((s) => s.setSelectedThreadId);
  const activeDraftId = useCaseLoomStore((s) => s.activeDraftId);
  const activeSectionKey = useCaseLoomStore((s) => s.activeSectionKey);

  const { data: threads } = useAiThreads(matterId);
  const createThread = useCreateAiThread(matterId);
  const { data: drafts } = useDrafts(matterId);
  const { data: claims } = useClaims(matterId);
  const { data: sections } = useDraftSections(
    matterId,
    activeDraftId ?? 0
  );
  const queueJob = useQueueJob(matterId);

  // Auto-select first thread only if none selected
  useEffect(() => {
    if (selectedThreadId) return;
    if (threads && threads.length > 0) {
      setSelectedThreadId(threads[0]!.thread_public_id);
    }
  }, [threads, selectedThreadId, setSelectedThreadId]);

  const { data: messages } = useAiThreadMessages(selectedThreadId ?? "");
  const sendMessage = useCreateAiMessage(selectedThreadId ?? "");

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activeDraft = drafts?.find((d) => d.id === activeDraftId);
  const activeSection = sections?.find((s) => s.section_key === activeSectionKey);
  const activeThread = threads?.find(
    (t) => t.thread_public_id === selectedThreadId
  );

  const queryClient = useQueryClient();

  // Show slash menu when input starts with /
  useEffect(() => {
    const trimmed = chatInput.trim();
    setShowSlashMenu(trimmed.startsWith("/") && matchSlashCommands(trimmed).length > 0);
  }, [chatInput]);

  // ── Ensure thread exists, return threadId ──────────────────────
  const ensureThread = async (): Promise<string | null> => {
    if (selectedThreadId) return selectedThreadId;
    try {
      const thread = await createThread.mutateAsync({
        title: "CaseLoom Assistant",
        draft_id: activeDraftId ?? undefined,
      });
      setSelectedThreadId(thread.thread_public_id);
      return thread.thread_public_id;
    } catch {
      return null;
    }
  };

  // ── Post a message to a thread (handles fresh-thread closure issue) ──
  const postMessage = async (
    threadId: string,
    role: AiMessageRole,
    content: string,
    metadata?: Record<string, unknown>
  ) => {
    if (threadId !== selectedThreadId) {
      await aiThreadsApi.createMessage(threadId, { role, content, metadata });
      queryClient.invalidateQueries({
        queryKey: queryKeys.aiThreads.messages(threadId),
      });
    } else {
      sendMessage.mutate({ role, content, metadata });
    }
  };

  // ── Build context metadata for messages ────────────────────────
  const buildContextMetadata = (): Record<string, unknown> | undefined => {
    const ctx: Record<string, unknown> = {};
    if (activeDraftId) {
      ctx.active_draft_id = activeDraftId;
      if (activeDraft) ctx.active_draft_title = activeDraft.title;
    }
    if (activeSectionKey) {
      ctx.active_section_key = activeSectionKey;
      if (activeSection) ctx.active_section_heading = activeSection.heading;
    }
    return Object.keys(ctx).length > 0 ? ctx : undefined;
  };

  // ── Handle send (slash commands or normal messages) ────────────
  const handleSend = async () => {
    const text = chatInput.trim();
    if (!text) return;

    // Try slash command
    const parsed = parseSlashCommand(text);
    if (parsed) {
      // Validate doc_type arg if required
      if (
        parsed.def.needsDocType &&
        parsed.args.length === 0
      ) {
        toast.error(
          `Usage: ${parsed.def.command} <doc_type> — e.g. ${parsed.def.command} chronology_memo`
        );
        return;
      }

      setChatInput("");
      setShowSlashMenu(false);

      const payload = buildJobPayload(parsed);
      try {
        await queueJob.mutateAsync({
          job_type: parsed.def.jobType,
          payload,
        });

        const label = payload?.doc_type
          ? `${formatLabel(parsed.def.jobType)}: ${formatLabel(payload.doc_type as string)}`
          : formatLabel(parsed.def.jobType);

        toast.success(`Queued: ${label}`);

        // Post a record of the command to the thread
        const threadId = await ensureThread();
        if (threadId) {
          await postMessage(threadId, AiMessageRole.USER, text);
        }
      } catch (err) {
        toast.error(
          `Failed to queue job: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      }
      return;
    }

    // Invalid slash command
    if (text.startsWith("/")) {
      toast.error(`Unknown command: ${text.split(/\s/)[0]}`);
      return;
    }

    // Normal message
    setChatInput("");
    const threadId = await ensureThread();
    if (!threadId) return;

    await postMessage(
      threadId,
      AiMessageRole.USER,
      text,
      buildContextMetadata()
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape") {
      setShowSlashMenu(false);
    }
  };

  const handleSlashSelect = (text: string) => {
    setChatInput(text);
    setShowSlashMenu(false);
    inputRef.current?.focus();
  };

  // ── New chat ───────────────────────────────────────────────────
  const handleNewChat = async () => {
    try {
      const thread = await createThread.mutateAsync({
        title: "New conversation",
        draft_id: activeDraftId ?? undefined,
      });
      setSelectedThreadId(thread.thread_public_id);
      setShowThreadList(false);
    } catch {
      /* handled by mutation error */
    }
  };

  // ── Dynamic suggested prompts ──────────────────────────────────
  const suggestedPrompts = getSuggestedPrompts(
    drafts ?? [],
    claims ?? [],
    activeDraft ?? null
  );

  return (
    <div
      className="flex w-[300px] flex-col"
      style={{
        borderLeft: "1px solid var(--cl-border)",
        background: "var(--cl-panel)",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ borderBottom: "1px solid var(--cl-border)" }}
      >
        <span
          className="h-[7px] w-[7px] rounded-full"
          style={{
            background: "var(--cl-green)",
            boxShadow: "0 0 5px var(--cl-green)",
          }}
        />
        {/* Thread selector */}
        <div className="relative flex-1">
          <button
            onClick={() => setShowThreadList(!showThreadList)}
            className="flex items-center gap-1 text-xs font-bold"
            style={{
              color: "var(--cl-gold)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <span className="truncate max-w-[140px]">
              {activeThread?.title ?? "AI Legal Assistant"}
            </span>
            <span style={{ fontSize: 8, color: "var(--cl-dim)" }}>
              {"\u25BE"}
            </span>
          </button>

          {/* Thread dropdown */}
          {showThreadList && (
            <div
              className="absolute left-0 top-full z-50 mt-1 w-[260px] overflow-y-auto rounded-lg py-1"
              style={{
                background: "var(--cl-surface)",
                border: "1px solid var(--cl-border-hi)",
                maxHeight: 240,
              }}
            >
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleNewChat();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold"
                style={{
                  color: "var(--cl-gold)",
                  background: "none",
                  border: "none",
                  borderBottom: "1px solid var(--cl-border)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                + New Chat
              </button>
              {threads?.map((t) => (
                <button
                  key={t.thread_public_id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSelectedThreadId(t.thread_public_id);
                    setShowThreadList(false);
                  }}
                  className="flex w-full flex-col gap-0.5 px-3 py-2 text-left text-xs"
                  style={{
                    background:
                      t.thread_public_id === selectedThreadId
                        ? "color-mix(in srgb, var(--cl-gold) 10%, transparent)"
                        : "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <span
                    className="truncate font-semibold"
                    style={{ color: "var(--cl-bright)" }}
                  >
                    {t.title}
                  </span>
                  <span style={{ color: "var(--cl-dim)", fontSize: 9 }}>
                    {formatRelative(t.created_at)}
                    {t.draft_id != null && " · scoped to draft"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="text-[9px]" style={{ color: "var(--cl-dim)" }}>
          {threads?.length ?? 0} thread{(threads?.length ?? 0) !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Context pills */}
      <div
        className="flex flex-wrap gap-1 px-2.5 py-1.5"
        style={{ borderBottom: "1px solid var(--cl-border)" }}
      >
        {activeDraft && (
          <span
            className="rounded-md px-1.5 py-0.5 text-[9px]"
            style={{
              color: "var(--cl-teal)",
              background: "color-mix(in srgb, var(--cl-teal) 12%, transparent)",
            }}
          >
            {activeDraft.title}
          </span>
        )}
        {activeSection && (
          <span
            className="rounded-md px-1.5 py-0.5 text-[9px]"
            style={{
              color: "var(--cl-purple)",
              background:
                "color-mix(in srgb, var(--cl-purple) 12%, transparent)",
            }}
          >
            {activeSection.heading}
          </span>
        )}
        <span
          className="rounded-md px-1.5 py-0.5 text-[9px]"
          style={{
            color: "var(--cl-teal)",
            background: "color-mix(in srgb, var(--cl-teal) 12%, transparent)",
          }}
        >
          {matterId}
        </span>
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-2.5">
        {!messages?.length && (
          <div
            className="flex flex-1 flex-col items-center justify-center gap-2 text-center"
            style={{ color: "var(--cl-muted)" }}
          >
            <span className="text-[11px]">
              Start a conversation about this case
            </span>
            <span className="text-[9px]" style={{ color: "var(--cl-dim)" }}>
              Type <span style={{ color: "var(--cl-gold)" }}>/</span> for
              commands
            </span>
          </div>
        )}
        {messages?.map((msg) => (
          <CaseLoomChatBubble key={msg.id} message={msg} />
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested prompts */}
      <div
        className="flex flex-wrap gap-1 px-2.5 py-1.5"
        style={{ borderTop: "1px solid var(--cl-border)" }}
      >
        {suggestedPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => {
              setChatInput(prompt);
              inputRef.current?.focus();
            }}
            className="rounded-md px-1.5 py-0.5 text-[9px] transition-colors"
            style={{
              color: prompt.startsWith("/")
                ? "var(--cl-gold)"
                : "var(--cl-muted)",
              background: "var(--cl-surface)",
              border: "1px solid var(--cl-border)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input area with slash command autocomplete */}
      <div
        className="relative flex items-center gap-1.5 px-2.5 py-2"
        style={{ borderTop: "1px solid var(--cl-border)" }}
      >
        <SlashCommandMenu
          input={chatInput}
          onSelect={handleSlashSelect}
          visible={showSlashMenu}
        />
        <input
          ref={inputRef}
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (chatInput.trim().startsWith("/")) setShowSlashMenu(true);
          }}
          onBlur={() => setTimeout(() => setShowSlashMenu(false), 150)}
          placeholder="Message or /command..."
          className="flex-1 rounded-lg px-2.5 py-1.5 text-xs outline-none"
          style={{
            background: "var(--cl-surface)",
            border: "1px solid var(--cl-border-hi)",
            color: "var(--cl-text)",
            fontFamily: "inherit",
          }}
        />
        <button
          onClick={handleSend}
          disabled={sendMessage.isPending || !chatInput.trim()}
          className="rounded-lg px-2.5 py-1.5 text-sm font-bold"
          style={{
            background:
              "linear-gradient(135deg, var(--cl-gold), var(--cl-gold-dk))",
            border: "none",
            color: "var(--cl-bg)",
            cursor: chatInput.trim() ? "pointer" : "default",
            opacity: chatInput.trim() ? 1 : 0.5,
          }}
        >
          {"\u2192"}
        </button>
      </div>
    </div>
  );
}

// ── Dynamic suggested prompts based on matter state ──────────────

function getSuggestedPrompts(
  drafts: { has_stale_sections: boolean }[],
  claims: unknown[],
  activeDraft: { has_stale_sections: boolean } | null
): string[] {
  if (drafts.length === 0 && claims.length === 0) {
    return ["/generate demand_letter", "/generate chronology_memo", "/ocr"];
  }
  if (drafts.length === 0 && claims.length > 0) {
    return ["/generate demand_letter", "Summarize claims", "/research"];
  }
  if (activeDraft?.has_stale_sections) {
    return ["Fix stale sections", "/validate", "/research"];
  }
  if (activeDraft) {
    return ["Review this draft", "/validate", "Explain this section"];
  }
  return ["What should I do next?", "/validate", "Explain this case"];
}
