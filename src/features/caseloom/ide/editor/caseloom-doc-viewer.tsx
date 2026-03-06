import { useDraftSections } from "@/hooks/use-drafts";
import { useCaseLoomStore } from "@/stores/caseloom-store";
import { CaseLoomAiFlags } from "./caseloom-ai-flags";
import { LoadingSpinner } from "@/components/common/loading";

interface CaseLoomDocViewerProps {
  matterId: string;
  draftId: number;
}

export function CaseLoomDocViewer({ matterId, draftId }: CaseLoomDocViewerProps) {
  const { data: sections, isLoading } = useDraftSections(matterId, draftId);
  const activeSectionKey = useCaseLoomStore((s) => s.activeSectionKey);
  const setActiveSectionKey = useCaseLoomStore((s) => s.setActiveSectionKey);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!sections?.length) {
    return (
      <div
        className="flex flex-1 items-center justify-center text-sm"
        style={{ color: "var(--cl-muted)" }}
      >
        No sections in this draft yet
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Document content as sections */}
      <div className="px-5 py-4">
        {sections
          .sort((a, b) => a.order_index - b.order_index)
          .map((section, idx) => {
            const isSelected = activeSectionKey === section.section_key;
            return (
              <div
                key={section.section_key}
                onClick={() => setActiveSectionKey(section.section_key)}
                className="cursor-pointer rounded-lg px-4 py-3 mb-1 transition-all"
                style={{
                  background: isSelected ? "var(--cl-surface)" : "transparent",
                  borderLeft: isSelected
                    ? "2px solid var(--cl-teal)"
                    : "2px solid transparent",
                }}
              >
                {/* Line number + heading */}
                <div className="flex items-baseline gap-3 mb-2">
                  <span
                    className="text-[10px] tabular-nums select-none"
                    style={{ color: "var(--cl-dim)" }}
                  >
                    {idx + 1}
                  </span>
                  <h3
                    className="text-sm font-bold"
                    style={{ color: "var(--cl-bright)" }}
                  >
                    {section.heading}
                  </h3>
                  {section.stale && (
                    <span
                      className="rounded-full px-1.5 py-px text-[8px] font-bold uppercase"
                      style={{
                        color: "var(--cl-gold)",
                        background: "color-mix(in srgb, var(--cl-gold) 12%, transparent)",
                      }}
                    >
                      stale
                    </span>
                  )}
                </div>

                {/* Content */}
                <div
                  className="text-xs leading-relaxed whitespace-pre-wrap"
                  style={{ color: "var(--cl-text)" }}
                >
                  {section.content}
                </div>

                {/* Source refs */}
                {section.source_refs.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {section.source_refs.map((ref) => (
                      <span
                        key={ref}
                        className="rounded px-1.5 py-0.5 text-[10px]"
                        style={{
                          color: "var(--cl-blue)",
                          background: "color-mix(in srgb, var(--cl-blue) 8%, transparent)",
                          borderBottom: "1px dotted color-mix(in srgb, var(--cl-blue) 30%, transparent)",
                        }}
                      >
                        {ref}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* AI Flags */}
      <CaseLoomAiFlags sections={sections} />
    </div>
  );
}
