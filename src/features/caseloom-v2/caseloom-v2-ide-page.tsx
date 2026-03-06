import { useEffect } from "react";
import { useParams, Link } from "@tanstack/react-router";
import { useMatter } from "@/hooks/use-matters";
import { useCaseLoomStore } from "@/stores/caseloom-store";
import { CaseLoomActivityBar } from "@/features/caseloom/ide/caseloom-activity-bar";
import { CaseLoomSidebar } from "@/features/caseloom/ide/caseloom-sidebar";
import { CaseLoomEditor } from "@/features/caseloom/ide/editor/caseloom-editor";
import { CaseLoomChatPanel } from "@/features/caseloom/ide/chat/caseloom-chat-panel";
import { LoadingSpinner } from "@/components/common/loading";
import { formatLabel } from "@/lib/format-label";

function Pill({ color, text }: { color: string; text: string }) {
  return (
    <span
      className="inline-block rounded-[10px] px-[7px] py-[2px] text-[9px] font-bold tracking-wider"
      style={{
        color,
        background: `color-mix(in srgb, ${color} 13%, transparent)`,
      }}
    >
      {text}
    </span>
  );
}

export function CaseLoomV2IDEPage() {
  const { matterId } = useParams({ strict: false }) as { matterId: string };
  const { data: matter, isLoading, error } = useMatter(matterId);
  const reset = useCaseLoomStore((s) => s.reset);

  useEffect(() => {
    reset();
  }, [matterId, reset]);

  if (isLoading) {
    return (
      <div
        data-theme="caseloom"
        className="flex h-screen items-center justify-center"
        style={{
          background: "var(--cl-bg)",
          color: "var(--cl-text)",
          fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div
        data-theme="caseloom"
        className="flex h-screen items-center justify-center"
        style={{
          background: "var(--cl-bg)",
          color: "var(--cl-red)",
          fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        }}
      >
        <p>Failed to load matter: {error.message}</p>
      </div>
    );
  }

  return (
    <div
      data-theme="caseloom"
      className="flex h-screen flex-col overflow-hidden"
      style={{
        background: "var(--cl-bg)",
        color: "var(--cl-text)",
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      }}
    >
      {/* Breadcrumb top bar */}
      <div
        className="flex shrink-0 items-center justify-between px-3.5 py-[7px]"
        style={{
          borderBottom: "1px solid var(--cl-border)",
          background: "var(--cl-act-bar)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <Link
            to="/caseloom-v2"
            className="flex h-7 w-7 items-center justify-center rounded-[7px] text-xs font-extrabold"
            style={{
              background:
                "linear-gradient(135deg, var(--cl-gold), var(--cl-gold-dk))",
              color: "var(--cl-bg)",
            }}
          >
            CL
          </Link>
          <span
            className="text-sm font-bold"
            style={{ color: "var(--cl-bright)" }}
          >
            CaseLoom
          </span>
          <span style={{ color: "var(--cl-dim)" }}>{"\u203A"}</span>
          <Link
            to="/caseloom-v2"
            className="cursor-pointer text-xs"
            style={{ color: "var(--cl-muted)" }}
          >
            All Cases
          </Link>
          <span style={{ color: "var(--cl-dim)" }}>{"\u203A"}</span>
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--cl-bright)" }}
          >
            {matter?.client_name} v. {matter?.name}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          {matter && (
            <>
              <Pill
                color="var(--cl-gold)"
                text={formatLabel(matter.matter_class)}
              />
              <Pill color="var(--cl-gold)" text={formatLabel(matter.status)} />
            </>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <CaseLoomActivityBar />
        <CaseLoomSidebar matterId={matterId} />
        <CaseLoomEditor matterId={matterId} />
        <CaseLoomChatPanel matterId={matterId} />
      </div>

      {/* Status bar */}
      <div
        className="flex h-5 shrink-0 items-center gap-3.5 px-3"
        style={{
          background:
            "color-mix(in srgb, var(--cl-gold-dk) 80%, transparent)",
        }}
      >
        <span
          className="text-[9px]"
          style={{ color: "var(--cl-bg)" }}
        >
          {"\u2387"} main
        </span>
        <span
          className="text-[9px]"
          style={{ color: "var(--cl-bg)" }}
        >
          #{matterId.slice(0, 8)}
        </span>
        <div className="flex-1" />
      </div>
    </div>
  );
}
