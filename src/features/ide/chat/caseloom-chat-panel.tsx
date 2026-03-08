import { useState, useRef, useEffect } from "react";
import { useCaseLoomStore } from "@/stores/caseloom-store";
import {
  useAiThreads,
  useCreateAiThread,
  useAiThreadMessages,
  useCreateAiMessage,
} from "@/hooks/use-ai-threads";
import { useDrafts } from "@/hooks/use-drafts";
import { AiMessageRole } from "@/types/enums";
import { CaseLoomChatBubble } from "./caseloom-chat-bubble";

const SUGGESTED_PROMPTS = [
  "Explain gap",
  "Publish draft",
  "Add witness section",
];

interface CaseLoomChatPanelProps {
  matterId: string;
}

export function CaseLoomChatPanel({ matterId }: CaseLoomChatPanelProps) {
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedThreadId = useCaseLoomStore((s) => s.selectedThreadId);
  const setSelectedThreadId = useCaseLoomStore((s) => s.setSelectedThreadId);
  const activeDraftId = useCaseLoomStore((s) => s.activeDraftId);

  const { data: threads } = useAiThreads(matterId);
  const createThread = useCreateAiThread(matterId);
  const { data: drafts } = useDrafts(matterId);

  // Auto-select or create thread
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

  const handleSend = async () => {
    const text = chatInput.trim();
    if (!text) return;

    // If no thread exists, create one first
    if (!selectedThreadId) {
      try {
        const thread = await createThread.mutateAsync({
          title: "CaseLoom Assistant",
          draft_id: activeDraftId ?? undefined,
        });
        setSelectedThreadId(thread.thread_public_id);
        // Send message after short delay to allow thread ID to propagate
        setTimeout(() => {
          setChatInput("");
        }, 100);
        return;
      } catch {
        return;
      }
    }

    setChatInput("");
    sendMessage.mutate({
      role: AiMessageRole.USER,
      content: text,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
        <span className="flex-1 text-xs font-bold" style={{ color: "var(--cl-gold)" }}>
          AI Legal Assistant
        </span>
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
      <div
        className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-2.5"
      >
        {!messages?.length && (
          <div
            className="flex flex-1 items-center justify-center text-[11px]"
            style={{ color: "var(--cl-muted)" }}
          >
            Start a conversation about this case
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
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => setChatInput(prompt)}
            className="rounded-md px-1.5 py-0.5 text-[9px] transition-colors"
            style={{
              color: "var(--cl-muted)",
              background: "var(--cl-surface)",
              border: "1px solid var(--cl-border)",
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-2"
        style={{ borderTop: "1px solid var(--cl-border)" }}
      >
        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about this document..."
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
            background: "linear-gradient(135deg, var(--cl-gold), var(--cl-gold-dk))",
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
