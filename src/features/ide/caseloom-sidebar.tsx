import { useState } from "react";
import { useCaseLoomStore } from "@/stores/caseloom-store";
import { useEvidence, useEvidenceSearch } from "@/hooks/use-evidence";
import { useClaims } from "@/hooks/use-claims";
import { useJobs } from "@/hooks/use-jobs";
import { useDrafts, useRequiredV1Drafts } from "@/hooks/use-drafts";
import { useMatter } from "@/hooks/use-matters";
import { formatLabel } from "@/lib/format-label";
import { formatRelative } from "@/lib/format-date";
import { JobStatus, ClaimKind, DraftStatus } from "@/types/enums";
import type { Evidence } from "@/types/evidence";
import type { Claim } from "@/types/claims";
import type { Job } from "@/types/jobs";
import type { Draft } from "@/types/drafts";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CaseLoomSidebarProps {
  matterId: string;
}

// Color tokens per section
const SECTIONS = {
  INBOX: { color: "var(--cl-gold)", icon: "\u229E", desc: "Immutable \u2014 raw client uploads" },
  SOURCES: { color: "var(--cl-blue)", icon: "\u229F", desc: "Organised \u2014 traced to inbox" },
  WORKING: { color: "var(--cl-purple)", icon: "\u270E", desc: "AI-generated working files" },
  OUTPUTS: { color: "var(--cl-teal)", icon: "\u25C8", desc: "Versioned AI documents" },
  OUTBOX: { color: "var(--cl-green)", icon: "\u2713", desc: "MECE \u2014 final case file" },
} as const;

type SectionKey = keyof typeof SECTIONS;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function suffixIcon(suffix: string): string {
  const s = suffix.replace(".", "").toLowerCase();
  if (["pdf"].includes(s)) return "\u25E7";
  if (["doc", "docx"].includes(s)) return "\u25EB";
  if (["zip", "rar", "7z"].includes(s)) return "\u229E";
  if (["mp3", "wav", "m4a"].includes(s)) return "\u266B";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(s)) return "\u25E9";
  if (["txt", "md"].includes(s)) return "\u25FB";
  return "\u25FB";
}

export function CaseLoomSidebar({ matterId }: CaseLoomSidebarProps) {
  const activityView = useCaseLoomStore((s) => s.activityView);
  const { data: matter } = useMatter(matterId);

  return (
    <div
      className="flex w-60 flex-col overflow-hidden"
      style={{
        background: "var(--cl-sidebar)",
        borderRight: "1px solid var(--cl-border)",
        flexShrink: 0,
      }}
    >
      {/* Case header */}
      <div
        className="px-3 py-2"
        style={{ borderBottom: "1px solid var(--cl-border)" }}
      >
        <div
          className="mb-1 text-[9px] font-bold uppercase tracking-wider"
          style={{ color: "var(--cl-muted)", letterSpacing: "0.08em" }}
        >
          EXPLORER — {matter?.public_id ?? matterId}
        </div>
        <div
          className="text-xs font-bold leading-tight"
          style={{ color: "var(--cl-bright)" }}
        >
          {matter?.name ?? "Loading..."}
        </div>
        <div className="mt-1 flex gap-1.5">
          {matter?.status && <Pill color="var(--cl-gold)" text={matter.status} />}
          {matter?.matter_class && (
            <Pill color="var(--cl-blue)" text={formatLabel(matter.matter_class)} />
          )}
        </div>
      </div>

      {/* Content based on activityView */}
      <div className="flex-1 overflow-y-auto">
        {activityView === "search" ? (
          <SearchView matterId={matterId} />
        ) : activityView === "outbox" ? (
          <OutboxOnlyView matterId={matterId} />
        ) : (
          <ExplorerView matterId={matterId} />
        )}
      </div>

      {/* MECE progress */}
      <MeceProgressBar matterId={matterId} />
    </div>
  );
}

function ExplorerView({ matterId }: { matterId: string }) {
  const { data: evidence } = useEvidence(matterId);
  const { data: claims } = useClaims(matterId);
  const { data: jobs } = useJobs(matterId);
  const { data: drafts } = useDrafts(matterId);
  const { data: coverage } = useRequiredV1Drafts(matterId);

  return (
    <>
      <SidebarSection section="INBOX" count={evidence?.length ?? 0}>
        {evidence?.map((e) => (
          <InboxItem key={e.id} evidence={e} />
        ))}
      </SidebarSection>

      <SidebarSection section="SOURCES" count={claims?.length ?? 0}>
        <ClaimsGrouped claims={claims ?? []} />
      </SidebarSection>

      <SidebarSection
        section="WORKING"
        count={jobs?.filter((j) => j.status === JobStatus.SUCCEEDED).length ?? 0}
      >
        {jobs
          ?.filter((j) => j.status === JobStatus.SUCCEEDED)
          .map((j) => (
            <JobItem key={j.id} job={j} />
          ))}
      </SidebarSection>

      <SidebarSection section="OUTPUTS" count={drafts?.length ?? 0}>
        {drafts?.map((d) => (
          <DraftItem key={d.id} draft={d} />
        ))}
      </SidebarSection>

      <SidebarSection
        section="OUTBOX"
        count={
          coverage?.required
            ? `${coverage.required.filter((r) => r.approved).length}/${coverage.required.length}`
            : "0"
        }
      >
        {coverage?.required?.map((r) => (
          <OutboxItem key={r.doc_type} item={r} />
        ))}
      </SidebarSection>
    </>
  );
}

function OutboxOnlyView({ matterId }: { matterId: string }) {
  const { data: coverage } = useRequiredV1Drafts(matterId);
  return (
    <SidebarSection
      section="OUTBOX"
      count={
        coverage?.required
          ? `${coverage.required.filter((r) => r.approved).length}/${coverage.required.length}`
          : "0"
      }
      forceOpen
    >
      {coverage?.required?.map((r) => (
        <OutboxItem key={r.doc_type} item={r} />
      ))}
    </SidebarSection>
  );
}

function SearchView({ matterId }: { matterId: string }) {
  const [query, setQuery] = useState("");
  const { data: results, isLoading } = useEvidenceSearch(matterId, query);

  return (
    <div className="p-2">
      <div className="relative">
        <Search
          size={12}
          className="absolute left-2 top-1/2 -translate-y-1/2"
          style={{ color: "var(--cl-muted)" }}
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search evidence..."
          className="h-7 pl-6 text-xs"
          style={{
            background: "var(--cl-surface)",
            border: "1px solid var(--cl-border-hi)",
            color: "var(--cl-text)",
          }}
        />
      </div>
      {isLoading && (
        <div className="mt-3 text-center text-[10px]" style={{ color: "var(--cl-muted)" }}>
          Searching...
        </div>
      )}
      {results?.hits?.map((hit) => (
        <div
          key={hit.id}
          className="mt-1 rounded px-2 py-1.5 text-xs"
          style={{ color: "var(--cl-text)" }}
        >
          <div className="font-medium" style={{ color: "var(--cl-bright)" }}>
            {hit.original_name}
          </div>
          {hit.snippet && (
            <div
              className="mt-0.5 text-[10px] line-clamp-2"
              style={{ color: "var(--cl-muted)" }}
            >
              {hit.snippet}
            </div>
          )}
        </div>
      ))}
      {results && results.hits.length === 0 && query.length >= 2 && (
        <div className="mt-3 text-center text-[10px]" style={{ color: "var(--cl-muted)" }}>
          No results
        </div>
      )}
    </div>
  );
}

// ── Section shell ──

function SidebarSection({
  section,
  count,
  children,
  forceOpen,
}: {
  section: SectionKey;
  count: number | string;
  children?: React.ReactNode;
  forceOpen?: boolean;
}) {
  const openSections = useCaseLoomStore((s) => s.openSections);
  const toggleSection = useCaseLoomStore((s) => s.toggleSection);
  const meta = SECTIONS[section];
  const isOpen = forceOpen || openSections[section];

  return (
    <div>
      <button
        onClick={() => !forceOpen && toggleSection(section)}
        className="flex w-full items-center gap-1.5 px-2.5 py-1.5"
        style={{
          background: isOpen ? `color-mix(in srgb, ${meta.color} 6%, transparent)` : "transparent",
          borderBottom: "1px solid var(--cl-border)",
          cursor: forceOpen ? "default" : "pointer",
        }}
      >
        <span className="text-[10px]" style={{ color: isOpen ? meta.color : "var(--cl-muted)" }}>
          {isOpen ? "\u25BE" : "\u25B8"}
        </span>
        <span
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{
            color: isOpen ? meta.color : "var(--cl-muted)",
            letterSpacing: "0.07em",
          }}
        >
          {section}
        </span>
        <span
          className="ml-auto text-[10px]"
          style={{ color: "var(--cl-dim)" }}
        >
          {count}
        </span>
      </button>
      {isOpen && <div className="py-0.5">{children}</div>}
    </div>
  );
}

// ── Item renderers ──

function InboxItem({ evidence }: { evidence: Evidence }) {
  return (
    <div
      className="flex items-center gap-2 px-2.5 py-1 cursor-default"
      style={{ color: "var(--cl-text)" }}
    >
      <span className="text-sm" style={{ color: "var(--cl-gold)" }}>
        {suffixIcon(evidence.suffix)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs">{evidence.original_name}</div>
        <div className="text-[9px]" style={{ color: "var(--cl-dim)" }}>
          {formatBytes(evidence.size_bytes)}
        </div>
      </div>
      <Pill color="var(--cl-green)" text="logged" />
    </div>
  );
}

function ClaimsGrouped({ claims }: { claims: Claim[] }) {
  const grouped: Record<string, Claim[]> = {};
  for (const c of claims) {
    const kind = c.kind || "other";
    if (!grouped[kind]) grouped[kind] = [];
    grouped[kind]!.push(c);
  }

  const kindColors: Record<string, string> = {
    [ClaimKind.QUOTE]: "var(--cl-gold)",
    [ClaimKind.PARAPHRASE]: "var(--cl-blue)",
    [ClaimKind.INFERENCE]: "var(--cl-purple)",
  };

  return (
    <>
      {Object.entries(grouped).map(([kind, items]) => (
        <div key={kind}>
          <div
            className="flex items-center gap-1.5 px-4 py-1 text-[10px] font-semibold uppercase"
            style={{ color: kindColors[kind] ?? "var(--cl-muted)" }}
          >
            {formatLabel(kind)} ({items.length})
          </div>
          {items.map((c) => (
            <div
              key={c.id}
              className="truncate px-5 py-0.5 text-[11px]"
              style={{ color: "var(--cl-text)" }}
            >
              {c.text}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

function JobItem({ job }: { job: Job }) {
  return (
    <div
      className="flex items-center gap-2 px-2.5 py-1"
      style={{ color: "var(--cl-text)" }}
    >
      <span className="text-sm" style={{ color: "var(--cl-purple)" }}>
        {"\u25C8"}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs">{formatLabel(job.job_type)}</div>
        <div className="text-[9px]" style={{ color: "var(--cl-dim)" }}>
          {job.finished_at ? formatRelative(job.finished_at) : ""}
        </div>
      </div>
    </div>
  );
}

function DraftItem({ draft }: { draft: Draft }) {
  const activeDraftId = useCaseLoomStore((s) => s.activeDraftId);
  const setActiveDraft = useCaseLoomStore((s) => s.setActiveDraft);
  const isActive = activeDraftId === draft.id;

  return (
    <button
      onClick={() => setActiveDraft(draft.id, draft.title)}
      className="flex w-full items-center gap-2 px-2.5 py-1 text-left transition-all"
      style={{
        background: isActive ? "color-mix(in srgb, var(--cl-teal) 10%, transparent)" : "transparent",
        borderLeft: isActive ? "2px solid var(--cl-teal)" : "2px solid transparent",
        color: isActive ? "var(--cl-bright)" : "var(--cl-text)",
      }}
    >
      <span className="text-sm" style={{ color: "var(--cl-teal)" }}>
        {"\u25C8"}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs">{draft.title}</div>
        <div className="text-[9px]" style={{ color: "var(--cl-dim)" }}>
          v{draft.latest_version}
        </div>
      </div>
      <Pill
        color={
          draft.status === DraftStatus.APPROVED
            ? "var(--cl-green)"
            : draft.status === DraftStatus.REVIEW_READY
              ? "var(--cl-teal)"
              : "var(--cl-dim)"
        }
        text={formatLabel(draft.status)}
      />
    </button>
  );
}

function OutboxItem({
  item,
}: {
  item: { doc_type: string; title: string; exists: boolean; approved: boolean; draft_id: number | null; status: string | null };
}) {
  const done = item.approved;
  return (
    <div
      className="flex items-center gap-2 px-2.5 py-1"
      style={{ color: done ? "var(--cl-text)" : "var(--cl-muted)" }}
    >
      <span
        className="flex h-5 w-5 items-center justify-center rounded-full text-[10px]"
        style={{
          background: done ? "color-mix(in srgb, var(--cl-green) 15%, transparent)" : "color-mix(in srgb, var(--cl-red) 10%, transparent)",
          color: done ? "var(--cl-green)" : "var(--cl-red)",
        }}
      >
        {done ? "\u2713" : "\u25CB"}
      </span>
      <span className="truncate text-xs">{item.title}</span>
      {done ? (
        <Pill color="var(--cl-green)" text="published" />
      ) : (
        <Pill color="var(--cl-red)" text="missing" />
      )}
    </div>
  );
}

// ── MECE progress bar ──

function MeceProgressBar({ matterId }: { matterId: string }) {
  const { data: coverage } = useRequiredV1Drafts(matterId);
  const approved = coverage?.required?.filter((r) => r.approved).length ?? 0;
  const total = coverage?.required?.length ?? 0;
  const pct = total > 0 ? Math.round((approved / total) * 100) : 0;

  return (
    <div
      className="px-3 py-2"
      style={{
        borderTop: "1px solid var(--cl-border)",
        background: "var(--cl-panel)",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px]" style={{ color: "var(--cl-muted)" }}>
          Outbox Completeness
        </span>
        <span
          className="text-[11px] font-bold"
          style={{ color: pct === 100 ? "var(--cl-green)" : "var(--cl-gold)" }}
        >
          {pct}%
        </span>
      </div>
      <div
        className="mt-1 h-1 rounded-full"
        style={{ background: "color-mix(in srgb, var(--cl-dim) 40%, transparent)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background:
              pct === 100
                ? "var(--cl-green)"
                : "linear-gradient(90deg, var(--cl-gold), var(--cl-gold-dk))",
          }}
        />
      </div>
      <div className="mt-1 text-[9px]" style={{ color: "var(--cl-dim)" }}>
        {approved} of {total} MECE documents complete
      </div>
    </div>
  );
}

// ── Helpers ──

function Pill({ color, text }: { color: string; text: string }) {
  return (
    <span
      className="flex-shrink-0 rounded-full px-1.5 py-px text-[9px] font-bold uppercase tracking-wide"
      style={{
        color,
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
        letterSpacing: "0.04em",
      }}
    >
      {text}
    </span>
  );
}
