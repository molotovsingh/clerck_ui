import { useCaseLoomStore } from "@/stores/caseloom-store";
import { useDraftVersions, useDrafts } from "@/hooks/use-drafts";

interface CaseLoomBreadcrumbProps {
  matterId: string;
}

export function CaseLoomBreadcrumb({ matterId }: CaseLoomBreadcrumbProps) {
  const activeDraftId = useCaseLoomStore((s) => s.activeDraftId);
  const activeVersionNumber = useCaseLoomStore((s) => s.activeVersionNumber);
  const setActiveVersion = useCaseLoomStore((s) => s.setActiveVersion);

  const { data: drafts } = useDrafts(matterId);
  const { data: versions } = useDraftVersions(matterId, activeDraftId ?? 0);

  const draft = drafts?.find((d) => d.id === activeDraftId);
  if (!draft) return null;

  const currentVersion = activeVersionNumber ?? draft.latest_version;

  return (
    <div
      className="flex items-center justify-between px-4 py-1.5"
      style={{
        borderBottom: "1px solid var(--cl-border)",
        background: "var(--cl-panel)",
        flexShrink: 0,
      }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-[11px]">
        <span style={{ color: "var(--cl-muted)" }}>Outputs</span>
        <span style={{ color: "var(--cl-dim)" }}>{"\u203A"}</span>
        <span style={{ color: "var(--cl-muted)" }}>{draft.title}</span>
        <span style={{ color: "var(--cl-dim)" }}>{"\u203A"}</span>
        <span style={{ color: "var(--cl-teal)" }}>v{currentVersion}</span>
      </div>

      {/* Version pills */}
      <div className="flex items-center gap-1">
        {versions?.map((v) => {
          const isActive = v.version_number === currentVersion;
          return (
            <button
              key={v.version_number}
              onClick={() => setActiveVersion(v.version_number)}
              className="flex items-center gap-1 rounded-full px-2 py-0.5 transition-all"
              style={{
                background: isActive
                  ? "color-mix(in srgb, var(--cl-teal) 15%, transparent)"
                  : "var(--cl-surface)",
                border: `1px solid ${isActive ? "color-mix(in srgb, var(--cl-teal) 30%, transparent)" : "var(--cl-border)"}`,
                color: isActive ? "var(--cl-teal)" : "var(--cl-dim)",
                fontWeight: isActive ? 700 : 400,
                fontSize: "10px",
              }}
              title={v.change_summary}
            >
              <span
                className="h-1 w-1 rounded-full"
                style={{
                  background: isActive ? "var(--cl-teal)" : "var(--cl-dim)",
                }}
              />
              v{v.version_number}
            </button>
          );
        })}
      </div>
    </div>
  );
}
