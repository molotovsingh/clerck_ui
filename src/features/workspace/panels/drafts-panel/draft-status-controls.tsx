import { useUpdateDraftStatus } from "@/hooks/use-drafts";
import { toast } from "sonner";
import { DraftStatus } from "@/types/enums";
import { formatLabel } from "@/lib/format-label";
import { Button } from "@/components/ui/button";

interface Props {
  matterId: string;
  draftId: number;
  currentStatus: DraftStatus;
}

const NEXT_STATUSES: Record<DraftStatus, DraftStatus | null> = {
  [DraftStatus.DRAFT]: DraftStatus.REVIEW_READY,
  [DraftStatus.REVIEW_READY]: DraftStatus.APPROVED,
  [DraftStatus.APPROVED]: null,
};

export function DraftStatusControls({ matterId, draftId, currentStatus }: Props) {
  const update = useUpdateDraftStatus(matterId, draftId);

  const next = NEXT_STATUSES[currentStatus];
  if (!next) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-t">
      <Button
        size="sm"
        variant="outline"
        onClick={() => update.mutate(
          { status: next },
          { onSuccess: () => toast.success(`Draft moved to ${formatLabel(next)}`) }
        )}
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
