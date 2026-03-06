import { useDrafts, useDraftSections } from "@/hooks/use-drafts";
import { DraftStatus } from "@/types/enums";
import type { MatterCapabilities } from "@/types/access";
import { canPerform } from "@/lib/capability-check";
import { formatLabel } from "@/lib/format-label";
import { useWorkspaceStore } from "@/stores/workspace-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusBadge } from "@/components/common/status-badge";
import { LoadingSpinner } from "@/components/common/loading";
import { EmptyState } from "@/components/common/empty-state";
import { FormDialog } from "@/components/common/form-dialog";
import { DraftStatusControls } from "../drafts-panel/draft-status-controls";
import { CreateDraftForm } from "../drafts-panel/create-draft-form";
import { VersionDiffDialog } from "../drafts-panel/version-diff-dialog";
import { cn } from "@/lib/cn";
import {
  Plus,
  FileText,
  GitCompare,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";

interface Props {
  matterId: string;
  capabilities?: MatterCapabilities;
}

export function DraftToc({ matterId, capabilities }: Props) {
  const { data: drafts, isLoading: draftsLoading } = useDrafts(matterId);
  const selectedDraftId = useWorkspaceStore((s) => s.selectedDraftId);
  const selectedSectionKey = useWorkspaceStore((s) => s.selectedSectionKey);
  const setSelectedDraftId = useWorkspaceStore((s) => s.setSelectedDraftId);
  const setSelectedSectionKey = useWorkspaceStore((s) => s.setSelectedSectionKey);
  const [diffDraftId, setDiffDraftId] = useState<number | null>(null);

  const selectedDraft = drafts?.find((d) => d.id === selectedDraftId);

  return (
    <div className="flex h-full flex-col">
      {/* Draft selector */}
      <div className="border-b p-2 space-y-2">
        <div className="flex items-center gap-2">
          <Select
            value={selectedDraftId ? String(selectedDraftId) : ""}
            onValueChange={(v) => setSelectedDraftId(v ? Number(v) : null)}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a draft..." />
            </SelectTrigger>
            <SelectContent>
              {drafts?.map((d) => (
                <SelectItem key={d.id} value={String(d.id)}>
                  <span className="flex items-center gap-2">
                    {d.title}
                    <Badge variant="outline" className="text-xs">
                      v{d.latest_version}
                    </Badge>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {canPerform(capabilities, "draft_write") && (
            <FormDialog
              title="Create Draft"
              description="Create a new draft document"
              trigger={
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
              }
            >
              {(close) => (
                <CreateDraftForm matterId={matterId} onSuccess={close} />
              )}
            </FormDialog>
          )}
        </div>

        {/* Draft status + actions */}
        {selectedDraft && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusBadge status={selectedDraft.status} />
              <span className="text-xs text-muted-foreground">
                {formatLabel(selectedDraft.doc_type)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {selectedDraft.latest_version > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() => setDiffDraftId(selectedDraft.id)}
                >
                  <GitCompare className="h-3 w-3" />
                  Diff
                </Button>
              )}
            </div>
          </div>
        )}

        {selectedDraftId && canPerform(capabilities, "draft_write") && (
          <DraftStatusControls
            matterId={matterId}
            draftId={selectedDraftId}
            currentStatus={selectedDraft?.status ?? DraftStatus.DRAFT}
          />
        )}
      </div>

      {/* Sections TOC */}
      {draftsLoading ? (
        <div className="p-4">
          <LoadingSpinner />
        </div>
      ) : !drafts?.length ? (
        <div className="p-4">
          <EmptyState
            icon={FileText}
            title="No drafts yet"
            description="Create a draft to get started"
          />
        </div>
      ) : selectedDraftId ? (
        <SectionsList
          matterId={matterId}
          draftId={selectedDraftId}
          selectedSectionKey={selectedSectionKey}
          onSelectSection={setSelectedSectionKey}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground p-4">
          Select a draft above
        </div>
      )}

      {diffDraftId && (
        <VersionDiffDialog
          matterId={matterId}
          draftId={diffDraftId}
          onClose={() => setDiffDraftId(null)}
        />
      )}
    </div>
  );
}

function SectionsList({
  matterId,
  draftId,
  selectedSectionKey,
  onSelectSection,
}: {
  matterId: string;
  draftId: number;
  selectedSectionKey: string | null;
  onSelectSection: (key: string | null) => void;
}) {
  const { data: sections, isLoading } = useDraftSections(matterId, draftId);

  if (isLoading) return <LoadingSpinner />;

  if (!sections?.length) {
    return (
      <div className="p-4">
        <EmptyState icon={FileText} title="No sections" />
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-0.5">
        <p className="text-xs font-medium text-muted-foreground px-2 mb-1">
          Sections ({sections.length})
        </p>
        {sections
          .sort((a, b) => a.order_index - b.order_index)
          .map((s) => (
            <button
              key={s.section_key}
              onClick={() => onSelectSection(s.section_key)}
              className={cn(
                "w-full text-left rounded px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                selectedSectionKey === s.section_key &&
                  "bg-muted border-l-2 border-l-primary"
              )}
            >
              <div className="flex items-center gap-1.5">
                <span className="font-medium truncate">{s.heading}</span>
                {s.stale && (
                  <AlertTriangle className="h-3 w-3 text-yellow-500 shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {s.content.slice(0, 80)}...
              </p>
            </button>
          ))}
      </div>
    </ScrollArea>
  );
}
