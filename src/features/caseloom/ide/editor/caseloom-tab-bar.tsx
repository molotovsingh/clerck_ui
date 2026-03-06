import { useCaseLoomStore } from "@/stores/caseloom-store";
import { useUpdateDraftStatus } from "@/hooks/use-drafts";
import { DraftStatus } from "@/types/enums";
import { X } from "lucide-react";

interface CaseLoomTabBarProps {
  matterId: string;
}

export function CaseLoomTabBar({ matterId }: CaseLoomTabBarProps) {
  const openTabs = useCaseLoomStore((s) => s.openTabs);
  const activeDraftId = useCaseLoomStore((s) => s.activeDraftId);
  const openTab = useCaseLoomStore((s) => s.openTab);
  const closeTab = useCaseLoomStore((s) => s.closeTab);
  const publishDraft = useUpdateDraftStatus(matterId, activeDraftId ?? 0);

  const handlePublish = () => {
    if (!activeDraftId) return;
    publishDraft.mutate({ status: DraftStatus.APPROVED });
  };

  return (
    <div
      className="flex items-center"
      style={{
        background: "var(--cl-panel)",
        borderBottom: "1px solid var(--cl-border)",
        flexShrink: 0,
      }}
    >
      <div className="flex flex-1 overflow-x-auto">
        {openTabs.map((tab) => {
          const active = tab.draftId === activeDraftId;
          return (
            <div
              key={tab.draftId}
              className="group flex items-center gap-1.5 px-3 py-1.5 cursor-pointer"
              style={{
                background: active ? "var(--cl-bg)" : "transparent",
                borderBottom: active ? "2px solid var(--cl-teal)" : "2px solid transparent",
                color: active ? "var(--cl-bright)" : "var(--cl-muted)",
              }}
              onClick={() => openTab(tab.draftId, tab.title)}
            >
              <span className="text-[11px]" style={{ color: "var(--cl-teal)" }}>
                {"\u25C8"}
              </span>
              <span
                className="text-xs max-w-[120px] truncate"
                style={{ fontWeight: active ? 600 : 400 }}
              >
                {tab.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.draftId);
                }}
                className="ml-1 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: "var(--cl-muted)" }}
              >
                <X size={10} />
              </button>
            </div>
          );
        })}
      </div>

      {activeDraftId && (
        <div className="flex items-center gap-1.5 px-2">
          <button
            className="rounded px-2 py-1 text-[10px]"
            style={{
              background: "var(--cl-surface)",
              border: "1px solid var(--cl-border)",
              color: "var(--cl-muted)",
            }}
          >
            Export PDF
          </button>
          <button
            onClick={handlePublish}
            disabled={publishDraft.isPending}
            className="rounded px-2 py-1 text-[10px] font-bold"
            style={{
              background: "linear-gradient(135deg, var(--cl-gold), var(--cl-gold-dk))",
              border: "none",
              color: "var(--cl-bg)",
            }}
          >
            {publishDraft.isPending ? "Publishing..." : "Publish to Outbox \u2197"}
          </button>
        </div>
      )}
    </div>
  );
}
