import { Link } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth-store";

interface CaseLoomV2TopBarProps {
  children?: React.ReactNode;
  right?: React.ReactNode;
}

export function CaseLoomV2TopBar({ children, right }: CaseLoomV2TopBarProps) {
  const actor = useAuthStore((s) => s.actor);
  const initials = actor
    ? actor
        .split(/[\s@]+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("")
    : "U";

  return (
    <div
      className="flex shrink-0 items-center justify-between px-5 py-2.5"
      style={{
        borderBottom: "1px solid var(--cl-border)",
        background: "var(--cl-act-bar)",
      }}
    >
      <div className="flex items-center gap-2.5">
        <Link
          to="/caseloom-v2"
          className="flex h-[30px] w-[30px] items-center justify-center rounded-[7px] text-[13px] font-extrabold"
          style={{
            background:
              "linear-gradient(135deg, var(--cl-gold), var(--cl-gold-dk))",
            color: "var(--cl-bg)",
          }}
        >
          CL
        </Link>
        <span
          className="text-[15px] font-bold"
          style={{ color: "var(--cl-bright)" }}
        >
          CaseLoom
        </span>
        {children}
      </div>
      <div className="flex items-center gap-2.5">
        {right}
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{
            background:
              "linear-gradient(135deg, var(--cl-blue), var(--cl-purple))",
          }}
        >
          {initials}
        </div>
      </div>
    </div>
  );
}
