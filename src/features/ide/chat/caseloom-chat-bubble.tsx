import type { AiThreadMessage } from "@/types/ai-threads";
import { AiMessageRole } from "@/types/enums";
import { formatRelative } from "@/lib/format-date";

interface CaseLoomChatBubbleProps {
  message: AiThreadMessage;
}

export function CaseLoomChatBubble({ message }: CaseLoomChatBubbleProps) {
  const isAI = message.role === AiMessageRole.ASSISTANT;

  return (
    <div
      className="max-w-[92%] rounded-xl px-3 py-2"
      style={{
        alignSelf: isAI ? "flex-start" : "flex-end",
        background: isAI ? "var(--cl-surface)" : "#1E2C4A",
        border: isAI
          ? "1px solid var(--cl-border)"
          : "1px solid #2A3F6A",
        borderRadius: isAI ? "10px 10px 10px 3px" : "10px 10px 3px 10px",
        color: isAI ? "var(--cl-text)" : "var(--cl-bright)",
      }}
    >
      {isAI && (
        <div
          className="mb-1 text-[8px] font-bold uppercase tracking-wider"
          style={{ color: "var(--cl-gold)", letterSpacing: "0.06em" }}
        >
          CaseLoom AI
        </div>
      )}
      <div className="text-xs leading-relaxed whitespace-pre-wrap">
        {message.content}
      </div>
      <div
        className="mt-1 text-[9px]"
        style={{ color: "var(--cl-dim)" }}
      >
        {formatRelative(message.created_at)}
      </div>
    </div>
  );
}
