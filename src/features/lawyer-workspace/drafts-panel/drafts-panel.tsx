import { useState, useEffect } from "react";
import {
  useDrafts,
  useCreateDraft,
  useUpdateDraftStatus,
  useDraftVersions,
  useDraftCompare,
} from "@/hooks/use-drafts";
import { DraftStatus } from "@/types/enums";
import type { MatterCapabilities } from "@/types/access";
import { canPerform } from "@/lib/capability-check";
import { formatLabel } from "@/lib/format-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingSpinner } from "@/components/common/loading";
import { EmptyState } from "@/components/common/empty-state";
import { Plus, FileText, GitCompare } from "lucide-react";
import { cn } from "@/lib/cn";

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
  const [createOpen, setCreateOpen] = useState(false);
  const [diffDraftId, setDiffDraftId] = useState<number | null>(null);

  return (
    <div className="border-b">
      <div className="flex items-center justify-between px-3 py-2">
        <h3 className="text-sm font-semibold">Drafts</h3>
        <div className="flex items-center gap-1">
          {canPerform(capabilities, "draft_write") && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-3 w-3" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Draft</DialogTitle>
                  <DialogDescription>Create a new draft document</DialogDescription>
                </DialogHeader>
                <CreateDraftForm
                  matterId={matterId}
                  onSuccess={() => setCreateOpen(false)}
                />
              </DialogContent>
            </Dialog>
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

      {/* Version Diff Dialog */}
      {diffDraftId && (
        <VersionDiffDialog
          matterId={matterId}
          draftId={diffDraftId}
          onClose={() => setDiffDraftId(null)}
        />
      )}

      {/* Draft Status Controls */}
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

function DraftStatusControls({
  matterId,
  draftId,
  currentStatus,
}: {
  matterId: string;
  draftId: number;
  currentStatus: DraftStatus;
}) {
  const update = useUpdateDraftStatus(matterId, draftId);

  const nextStatuses: Record<DraftStatus, DraftStatus | null> = {
    [DraftStatus.DRAFT]: DraftStatus.REVIEW_READY,
    [DraftStatus.REVIEW_READY]: DraftStatus.APPROVED,
    [DraftStatus.APPROVED]: null,
  };

  const next = nextStatuses[currentStatus];
  if (!next) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-t">
      <Button
        size="sm"
        variant="outline"
        onClick={() => update.mutate({ status: next })}
        disabled={update.isPending}
      >
        {update.isPending ? "Updating..." : `Move to ${formatLabel(next)}`}
      </Button>
      {update.error && (
        <span className="text-xs text-destructive">{update.error.message}</span>
      )}
    </div>
  );
}

function VersionDiffDialog({
  matterId,
  draftId,
  onClose,
}: {
  matterId: string;
  draftId: number;
  onClose: () => void;
}) {
  const { data: versions } = useDraftVersions(matterId, draftId);
  const maxVersion = versions?.length ? Math.max(...versions.map((v) => v.version_number)) : 0;
  const [fromVersion, setFromVersion] = useState(0);
  const [toVersion, setToVersion] = useState(0);

  // Sync version inputs once the versions query resolves
  useEffect(() => {
    if (maxVersion > 0 && toVersion === 0) {
      setFromVersion(Math.max(1, maxVersion - 1));
      setToVersion(maxVersion);
    }
  }, [maxVersion, toVersion]);

  const { data: diff, isLoading } = useDraftCompare(
    matterId,
    draftId,
    fromVersion,
    toVersion
  );

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Compare Versions</DialogTitle>
          <DialogDescription>
            Compare versions of this draft
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Label>From</Label>
            <Input
              type="number"
              min={1}
              max={maxVersion}
              value={fromVersion}
              onChange={(e) => setFromVersion(Number(e.target.value))}
              className="w-20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label>To</Label>
            <Input
              type="number"
              min={1}
              max={maxVersion}
              value={toVersion}
              onChange={(e) => setToVersion(Number(e.target.value))}
              className="w-20"
            />
          </div>
          {diff && (
            <div className="flex gap-2 text-sm">
              <span className="text-green-600">+{diff.added_lines}</span>
              <span className="text-red-600">-{diff.removed_lines}</span>
            </div>
          )}
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : diff?.unified_diff ? (
          <pre className="rounded bg-muted p-3 text-xs overflow-auto whitespace-pre-wrap font-mono">
            {diff.unified_diff}
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground">No differences found</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CreateDraftForm({
  matterId,
  onSuccess,
}: {
  matterId: string;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState("pleading");
  const create = useCreateDraft(matterId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create.mutateAsync({ title, doc_type: docType });
      onSuccess();
    } catch { /* error displayed via create.error */ }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Statement of Claim"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Document Type</Label>
        <Input
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          placeholder="pleading"
          required
        />
      </div>
      {create.error && (
        <p className="text-sm text-destructive">{create.error.message}</p>
      )}
      <Button type="submit" className="w-full" disabled={create.isPending}>
        {create.isPending ? "Creating..." : "Create Draft"}
      </Button>
    </form>
  );
}
