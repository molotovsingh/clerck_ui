import type { DraftSection } from "@/types/draft-sections";

interface CaseLoomAiFlagsProps {
  sections: DraftSection[];
}

export function CaseLoomAiFlags({ sections }: CaseLoomAiFlagsProps) {
  const stale = sections.filter((s) => s.stale);
  if (stale.length === 0) return null;

  return (
    <div
      className="mx-5 mb-5 flex gap-2.5 rounded-lg p-3"
      style={{
        background: "color-mix(in srgb, var(--cl-gold) 4%, transparent)",
        border: "1px solid color-mix(in srgb, var(--cl-gold) 16%, transparent)",
      }}
    >
      <span className="text-sm" style={{ color: "var(--cl-gold)" }}>
        {"\u2691"}
      </span>
      <div>
        <div
          className="text-[11px] font-bold mb-1"
          style={{ color: "var(--cl-gold)" }}
        >
          AI Flags — {stale.length} issue{stale.length !== 1 ? "s" : ""}
        </div>
        {stale.map((s) => (
          <div
            key={s.section_key}
            className="text-[11px] leading-relaxed"
            style={{ color: "var(--cl-muted)" }}
          >
            Section{" "}
            <strong style={{ color: "var(--cl-text)" }}>{s.heading}</strong> is
            stale and may need regeneration.
          </div>
        ))}
      </div>
    </div>
  );
}
