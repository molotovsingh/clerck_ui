import type { Matter } from "@/types/matters";
import { useRequiredV1Drafts } from "@/hooks/use-drafts";

interface CaseLoomStatusBarProps {
  matter: Matter | undefined;
  matterId: string;
}

export function CaseLoomStatusBar({ matter, matterId }: CaseLoomStatusBarProps) {
  const { data: coverage } = useRequiredV1Drafts(matterId);

  const approved = coverage?.required?.filter((r) => r.approved).length ?? 0;
  const total = coverage?.required?.length ?? 0;

  return (
    <div
      className="flex h-[22px] items-center justify-between px-3 text-[10px]"
      style={{
        background: "var(--cl-gold-dk)",
        color: "var(--cl-bg)",
        flexShrink: 0,
      }}
    >
      <div className="flex items-center gap-3">
        <span className="font-bold">{matter?.public_id ?? matterId}</span>
        <span style={{ opacity: 0.7 }}>{matter?.name}</span>
      </div>
      <div className="flex items-center gap-3">
        {matter?.status && (
          <span style={{ opacity: 0.7 }}>{matter.status}</span>
        )}
        <span
          className="rounded-full px-2 text-[10px] font-bold"
          style={{
            background: "var(--cl-green)",
            color: "var(--cl-bg)",
            opacity: 0.8,
          }}
        >
          Outbox: {approved}/{total}
        </span>
      </div>
    </div>
  );
}
