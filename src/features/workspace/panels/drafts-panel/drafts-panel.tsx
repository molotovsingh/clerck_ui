import { useState } from "react";
import { useDrafts } from "@/hooks/use-drafts";
import { DraftStatus } from "@/types/enums";
import type { MatterCapabilities } from "@/types/access";
import { canPerform } from "@/lib/capability-check";
import { formatLabel } from "@/lib/format-label";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingSpinner } from "@/components/common/loading";
import { EmptyState } from "@/components/common/empty-state";
import { FormDialog } from "@/components/common/form-dialog";
import { Plus, FileText, GitCompare } from "lucide-react";
import { cn } from "@/lib/cn";
import { VersionDiffDialog } from "./version-diff-dialog";
import { DraftStatusControls } from "./draft-status-controls";
import { CreateDraftForm } from "./create-draft-form";

interface Props {
  matterId: string;
  selectedDraftId: number | null;
  onSelectDraft: (id: number | null) => void;
  capabilities?: MatterCapabilities;
}

export function DraftsPanel({
  matterId,
  selectedDraftId,
  onSelectDraft,
  capabilities,
}: Props) {
  const { data: drafts, isLoading } = useDrafts(matterId);
  const [diffDraftId, setDiffDraftId] = useState<number | null>(null);

  return (
    <div className="border-b">
      <div className="flex items-center justify-between px-3 py-2">
        <h3 className="text-sm font-semibold">Drafts</h3>
        <div className="flex items-center gap-1">
          {canPerform(capabilities, "draft_write") && (
            <FormDialog
              title="Create Draft"
              description="Create a new draft document"
              trigger={
                <Button variant="outline" size="sm">
                  <Plus className="h-3 w-3" />
                  New
                </Button>
              }
            >
              {(close) => (
                <CreateDraftForm matterId={matterId} onSuccess={close} />
              )}
            </FormDialog>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="p-3">
          <LoadingSpinner />
        </div>
      ) : !drafts?.length ? (
        <EmptyState
          icon={FileText}
          title="No drafts yet"
          description="Order a Draft Document from Clerk Intake"
        />
      ) : (
        <ScrollArea className="max-h-[200px]">
          <div className="space-y-0.5 px-2 pb-2">
            {drafts.map((d) => (
              <div
                key={d.id}
                className={cn(
                  "flex items-center justify-between rounded px-2 py-1.5 text-sm cursor-pointer hover:bg-muted transition-colors",
                  selectedDraftId === d.id && "bg-muted"
                )}
                onClick={() => onSelectDraft(d.id)}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{d.title}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      v{d.latest_version}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatLabel(d.doc_type)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={d.status} />
                  {d.latest_version > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDiffDraftId(d.id);
                      }}
                    >
                      <GitCompare className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {diffDraftId && (
        <VersionDiffDialog
          matterId={matterId}
          draftId={diffDraftId}
          onClose={() => setDiffDraftId(null)}
        />
      )}

      {selectedDraftId && canPerform(capabilities, "draft_write") && (
        <DraftStatusControls
          matterId={matterId}
          draftId={selectedDraftId}
          currentStatus={
            drafts?.find((d) => d.id === selectedDraftId)?.status ??
            DraftStatus.DRAFT
          }
        />
      )}
    </div>
  );
}
