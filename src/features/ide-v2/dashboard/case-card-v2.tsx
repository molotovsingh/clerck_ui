import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { Matter } from "@/types/matters";
import { MatterStatus } from "@/types/enums";
import { useEvidence } from "@/hooks/use-evidence";
import { useClaims } from "@/hooks/use-claims";
import { useDrafts } from "@/hooks/use-drafts";
import { useRequiredV1Drafts } from "@/hooks/use-drafts";
import { formatRelative } from "@/lib/format-date";
import { formatLabel } from "@/lib/format-label";

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  [MatterStatus.INTAKE]: { bg: "var(--cl-blue)", color: "var(--cl-blue)", label: "New" },
  [MatterStatus.UNDER_REVIEW]: { bg: "var(--cl-green)", color: "var(--cl-green)", label: "Active" },
  [MatterStatus.CLIENT_APPROVED]: { bg: "var(--cl-green)", color: "var(--cl-green)", label: "Approved" },
  [MatterStatus.FILED]: { bg: "var(--cl-dim)", color: "var(--cl-dim)", label: "Filed" },
};

const TYPE_COLORS: Record<string, string> = {
  general_dispute: "var(--cl-gold)",
  debt_recovery: "var(--cl-red)",
  employment_dispute: "var(--cl-purple)",
  regulatory_enforcement: "var(--cl-blue)",
};

const BOX_META = {
  inbox: { icon: "\u2193", color: "var(--cl-gold)", label: "Inbox" },
  middlebox: { icon: "\u229F", color: "var(--cl-blue)", label: "Middlebox" },
  outputs: { icon: "\u25C8", color: "var(--cl-teal)", label: "Outputs" },
  outbox: { icon: "\u2713", color: "var(--cl-green)", label: "Outbox" },
} as const;

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

interface CaseCardV2Props {
  matter: Matter;
}

export function CaseCardV2({ matter }: CaseCardV2Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const { data: evidence } = useEvidence(matter.public_id);
  const { data: claims } = useClaims(matter.public_id);
  const { data: drafts } = useDrafts(matter.public_id);
  const { data: outbox } = useRequiredV1Drafts(matter.public_id);

  const inboxCount = evidence?.length ?? 0;
  const middleboxCount = claims?.length ?? 0;
  const outputCount = drafts?.length ?? 0;
  const outboxTotal = outbox?.required?.length ?? 0;
  const outboxComplete = outbox?.required?.filter((r) => r.approved).length ?? 0;
  const mecePercent = outboxTotal > 0 ? Math.round((outboxComplete / outboxTotal) * 100) : 0;

  const st = STATUS_COLORS[matter.status] ?? STATUS_COLORS[MatterStatus.INTAKE]!;
  const typeColor = TYPE_COLORS[matter.matter_class] ?? "var(--cl-muted)";
  const isFiled = matter.status === MatterStatus.FILED;

  const boxes = {
    inbox: { label: `${inboxCount} file${inboxCount !== 1 ? "s" : ""}` },
    middlebox: { label: `${middleboxCount} organised` },
    outputs: { label: `${outputCount} doc${outputCount !== 1 ? "s" : ""}` },
    outbox: { label: `${outboxComplete}/${outboxTotal} MECE`, complete: outboxTotal > 0 && outboxComplete === outboxTotal },
  };

  return (
    <Link
      to="/caseloom-v2/$matterId"
      params={{ matterId: matter.public_id }}
      className="block overflow-hidden rounded-xl transition-shadow hover:shadow-lg"
      style={{
        background: "var(--cl-surface)",
        border: matter.status === MatterStatus.INTAKE
          ? "1px solid color-mix(in srgb, var(--cl-blue) 27%, transparent)"
          : "1px solid var(--cl-border)",
        opacity: isFiled ? 0.65 : 1,
      }}
    >
      {/* Card header */}
      <div className="px-4 pt-3.5 pb-2">
        <div className="mb-2 flex items-start justify-between">
          <div>
            <div className="text-sm font-bold" style={{ color: "var(--cl-bright)" }}>
              {matter.client_name}{" "}
              <span style={{ color: "var(--cl-dim)", fontWeight: 400 }}>v.</span>{" "}
              {matter.name}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <Pill color={typeColor} text={formatLabel(matter.matter_class)} />
              <Pill color={st.color} text={st.label} />
              <span className="text-[9px]" style={{ color: "var(--cl-dim)" }}>
                #{matter.public_id.slice(0, 8)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px]" style={{ color: "var(--cl-dim)" }}>
              {formatRelative(matter.updated_at)}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-1 flex items-center gap-2">
          <div
            className="h-[3px] flex-1 overflow-hidden rounded-sm"
            style={{ background: "color-mix(in srgb, var(--cl-dim) 27%, transparent)" }}
          >
            <div
              className="h-full rounded-sm transition-[width] duration-500"
              style={{
                width: `${mecePercent}%`,
                background:
                  mecePercent === 100
                    ? "var(--cl-green)"
                    : "linear-gradient(90deg, var(--cl-gold), var(--cl-gold-dk))",
              }}
            />
          </div>
          <span
            className="min-w-[26px] text-right text-[9px]"
            style={{ color: "var(--cl-muted)" }}
          >
            {mecePercent}%
          </span>
        </div>
        <div className="text-[9px]" style={{ color: "var(--cl-muted)" }}>
          {formatLabel(matter.status)}
        </div>
      </div>

      {/* Four-box strip */}
      <div
        className="grid grid-cols-4"
        style={{ borderTop: "1px solid var(--cl-border)" }}
      >
        {(Object.entries(BOX_META) as [keyof typeof BOX_META, typeof BOX_META[keyof typeof BOX_META]][]).map(
          ([key, meta], i) => {
            const isHov = hovered === key;
            const box = boxes[key];
            const isComplete = "complete" in box && box.complete;
            return (
              <div
                key={key}
                onMouseEnter={() => setHovered(key)}
                onMouseLeave={() => setHovered(null)}
                className="cursor-pointer py-2.5 px-2 text-center transition-colors"
                style={{
                  background: isHov
                    ? `color-mix(in srgb, ${meta.color} 6%, transparent)`
                    : "transparent",
                  borderRight: i < 3 ? "1px solid var(--cl-border)" : "none",
                }}
              >
                <div
                  className="text-[15px] transition-colors"
                  style={{
                    color: isHov ? meta.color : "var(--cl-dim)",
                  }}
                >
                  {isComplete ? "\u2713" : meta.icon}
                </div>
                <div
                  className="mt-0.5 text-[8px] font-bold uppercase tracking-wider transition-colors"
                  style={{
                    color: isHov ? meta.color : "var(--cl-dim)",
                  }}
                >
                  {meta.label}
                </div>
                <div
                  className="mt-0.5 text-[9px] transition-colors"
                  style={{
                    color: isHov ? "var(--cl-muted)" : "color-mix(in srgb, var(--cl-dim) 60%, transparent)",
                  }}
                >
                  {box.label}
                </div>
              </div>
            );
          }
        )}
      </div>
    </Link>
  );
}
