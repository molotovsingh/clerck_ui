import { formatRelative } from "@/lib/format-date";
import type { Matter } from "@/types/matters";

interface ActivitySidebarProps {
  matters: Matter[];
}

export function ActivitySidebar({ matters }: ActivitySidebarProps) {
  // Build activity items from matters sorted by updated_at
  const sorted = [...matters]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 8);

  return (
    <div
      className="flex w-[260px] shrink-0 flex-col overflow-auto p-4"
      style={{ borderLeft: "1px solid var(--cl-border)" }}
    >
      <div
        className="mb-3 text-[9px] font-bold uppercase tracking-widest"
        style={{ color: "var(--cl-dim)" }}
      >
        Recent Activity
      </div>
      {sorted.map((m, i) => (
        <div
          key={m.public_id}
          className="mb-0.5 cursor-pointer rounded-lg p-2.5"
          style={{
            background: i === 0 ? "var(--cl-surface)" : "transparent",
            border:
              i === 0
                ? "1px solid var(--cl-border)"
                : "1px solid transparent",
          }}
        >
          <div className="mb-0.5 flex items-center gap-1.5">
            <span className="text-[11px]" style={{ color: "var(--cl-gold)" }}>
              {"\u25C8"}
            </span>
            <span className="text-[9px]" style={{ color: "var(--cl-dim)" }}>
              {formatRelative(m.updated_at)}
            </span>
          </div>
          <div
            className="text-[11px] leading-snug"
            style={{ color: "var(--cl-muted)" }}
          >
            {m.client_name} v. {m.name}
          </div>
          <div className="mt-0.5 text-[9px]" style={{ color: "var(--cl-dim)" }}>
            #{m.public_id.slice(0, 8)}
          </div>
        </div>
      ))}
      {sorted.length === 0 && (
        <div className="text-[11px]" style={{ color: "var(--cl-dim)" }}>
          No recent activity
        </div>
      )}
    </div>
  );
}
