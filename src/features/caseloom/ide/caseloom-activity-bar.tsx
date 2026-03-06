import { useAuthStore } from "@/stores/auth-store";
import { useCaseLoomStore, type ActivityView } from "@/stores/caseloom-store";
import { Files, Search, Calendar, CheckSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const navItems: { key: ActivityView; icon: LucideIcon; label: string }[] = [
  { key: "explorer", icon: Files, label: "Explorer" },
  { key: "search", icon: Search, label: "Search" },
  { key: "timeline", icon: Calendar, label: "Timeline" },
  { key: "outbox", icon: CheckSquare, label: "Outbox" },
];

export function CaseLoomActivityBar() {
  const activityView = useCaseLoomStore((s) => s.activityView);
  const setActivityView = useCaseLoomStore((s) => s.setActivityView);
  const actor = useAuthStore((s) => s.actor);

  const initials = actor
    ? actor
        .split(/[\s._-]/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("")
    : "?";

  return (
    <div
      className="flex w-11 flex-col items-center pt-2 pb-2"
      style={{
        background: "var(--cl-act-bar)",
        borderRight: "1px solid var(--cl-border)",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        className="mb-4 flex h-7 w-7 items-center justify-center rounded-md"
        style={{
          background: "linear-gradient(135deg, var(--cl-gold), var(--cl-gold-dk))",
        }}
      >
        <span
          className="text-[10px] font-extrabold leading-none"
          style={{ color: "var(--cl-bg)" }}
        >
          CL
        </span>
      </div>

      {/* Nav */}
      <div className="flex flex-1 flex-col items-center gap-0.5">
        {navItems.map(({ key, icon: Icon, label }) => {
          const active = activityView === key;
          return (
            <button
              key={key}
              title={label}
              onClick={() => setActivityView(key)}
              className="flex h-9 w-9 items-center justify-center rounded-lg transition-all"
              style={{
                background: active ? "var(--cl-surface)" : "transparent",
                borderLeft: active
                  ? "2px solid var(--cl-gold)"
                  : "2px solid transparent",
                color: active ? "var(--cl-gold)" : "var(--cl-muted)",
              }}
            >
              <Icon size={16} />
            </button>
          );
        })}
      </div>

      {/* User avatar */}
      <div
        className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold"
        style={{
          background: "linear-gradient(135deg, var(--cl-blue), var(--cl-purple))",
          color: "#fff",
        }}
        title={actor ?? "User"}
      >
        {initials}
      </div>
    </div>
  );
}
