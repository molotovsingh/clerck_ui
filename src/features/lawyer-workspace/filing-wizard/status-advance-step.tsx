import { useState } from "react";
import { useUpdateMatterStatus } from "@/hooks/use-matters";
import { useIntakeContext } from "@/hooks/use-intake";
import { MatterStatus } from "@/types/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { formatLabel } from "@/lib/format-label";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Gavel } from "lucide-react";

interface Props {
  matterId: string;
  matterStatus: MatterStatus;
  onBack: () => void;
  onDone: () => void;
}

export function StatusAdvanceStep({ matterId, matterStatus, onBack, onDone }: Props) {
  const [approvalName, setApprovalName] = useState("");
  const updateStatus = useUpdateMatterStatus(matterId);
  const { data: intakeCtx } = useIntakeContext(matterId);

  // UI hint only — the server is authoritative and will reject invalid transitions
  // with INVALID_STATUS_TRANSITION. Do not use this map for policy decisions.
  const statusTransitions: Record<MatterStatus, MatterStatus[]> = {
    [MatterStatus.INTAKE]: [MatterStatus.UNDER_REVIEW],
    [MatterStatus.UNDER_REVIEW]: [MatterStatus.CLIENT_APPROVED],
    [MatterStatus.CLIENT_APPROVED]: [MatterStatus.FILED],
    [MatterStatus.FILED]: [],
  };

  const nextStatuses = statusTransitions[matterStatus] ?? [];
  const intakeBlocked =
    matterStatus === MatterStatus.INTAKE && intakeCtx?.gate_passed !== true;

  const handleAdvance = (next: MatterStatus) => {
    updateStatus.mutate(
      { status: next, approval_name: approvalName || undefined },
      {
        onSuccess: () => {
          toast.success(`Status changed to ${formatLabel(next)}`);
          onDone();
        },
      }
    );
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Gavel className="h-5 w-5" />
          Step 3: Advance Status
        </DialogTitle>
        <DialogDescription>
          Change the matter status to proceed with filing
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 my-4">
        <div>
          <span className="text-sm text-muted-foreground">Current status</span>
          <p className="font-medium">{formatLabel(matterStatus)}</p>
        </div>

        {nextStatuses.length === 0 ? (
          <div className="rounded border p-3 text-sm text-muted-foreground">
            This matter is in its final state. No further transitions available.
          </div>
        ) : (
          <>
            {(matterStatus === MatterStatus.UNDER_REVIEW ||
              matterStatus === MatterStatus.CLIENT_APPROVED) && (
              <div className="space-y-2">
                <Label>Approval Name</Label>
                <Input
                  value={approvalName}
                  onChange={(e) => setApprovalName(e.target.value)}
                  placeholder="Partner name"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {nextStatuses.map((next) => {
                if (next === MatterStatus.FILED) {
                  return (
                    <ConfirmDialog
                      key={next}
                      title="File This Matter"
                      description="Mark this matter as Filed? This is a terminal state — no further changes will be possible. This action cannot be undone."
                      confirmLabel="File Matter"
                      isPending={updateStatus.isPending}
                      onConfirm={() => handleAdvance(next)}
                      trigger={
                        <Button disabled={intakeBlocked}>
                          <Gavel className="h-4 w-4" />
                          {formatLabel(next)}
                        </Button>
                      }
                    />
                  );
                }
                return (
                  <Button
                    key={next}
                    onClick={() => handleAdvance(next)}
                    disabled={updateStatus.isPending || intakeBlocked}
                  >
                    <ArrowRight className="h-4 w-4" />
                    {formatLabel(next)}
                  </Button>
                );
              })}
            </div>

            {updateStatus.error && (
              <p className="text-sm text-destructive">
                {updateStatus.error.message}
              </p>
            )}
          </>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button variant="ghost" onClick={onDone}>
          Close
        </Button>
      </DialogFooter>
    </>
  );
}
