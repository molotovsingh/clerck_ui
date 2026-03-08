import { useState } from "react";
import { useUpdateMatterStatus } from "@/hooks/use-matters";
import { useIntakeContext } from "@/hooks/use-intake";
import { MatterStatus } from "@/types/enums";
import type { MatterCapabilities } from "@/types/access";
import { canPerform } from "@/lib/capability-check";
import { formatLabel } from "@/lib/format-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/common/status-badge";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { toast } from "sonner";
import { ArrowRight, AlertTriangle } from "lucide-react";

interface Props {
  matterId: string;
  matterStatus: MatterStatus;
  allowedTransitions: MatterStatus[];
  capabilities?: MatterCapabilities;
}

export function StatusPanel({ matterId, matterStatus, allowedTransitions, capabilities }: Props) {
  const updateStatus = useUpdateMatterStatus(matterId);
  const { data: intakeCtx } = useIntakeContext(matterId);
  const [approvalName, setApprovalName] = useState("");
  const canUpdate = canPerform(capabilities, "status_write");
  const nextStatuses = allowedTransitions;

  // Block INTAKE → UNDER_REVIEW unless intake gate has passed
  const intakeBlocked =
    matterStatus === MatterStatus.INTAKE && intakeCtx?.gate_passed !== true;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-2">Current Status</h3>
        <StatusBadge status={matterStatus} />
      </div>

      {canUpdate && nextStatuses.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Change Status To</h3>

          {intakeBlocked && (
            <div className="flex items-start gap-2 rounded border border-yellow-200 bg-yellow-50 p-2 text-sm text-yellow-800">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>
                Intake not complete. Fill in the dispute details and upload
                evidence in <strong>Matters</strong> before changing status.
              </p>
            </div>
          )}

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
              const button = (
                <Button
                  key={next}
                  variant="outline"
                  onClick={
                    next !== MatterStatus.FILED
                      ? () =>
                          updateStatus.mutate(
                            { status: next, approval_name: approvalName || undefined },
                            { onSuccess: () => toast.success(`Status changed to ${formatLabel(next)}`) }
                          )
                      : undefined
                  }
                  disabled={updateStatus.isPending || intakeBlocked}
                >
                  <ArrowRight className="h-4 w-4" />
                  {formatLabel(next)}
                </Button>
              );

              if (next === MatterStatus.FILED) {
                return (
                  <ConfirmDialog
                    key={next}
                    title="File This Matter"
                    description="Mark this matter as Filed? This is a terminal state — no further status changes, edits, or transfers will be possible. This action cannot be undone."
                    confirmLabel="File Matter"
                    isPending={updateStatus.isPending}
                    onConfirm={() =>
                      updateStatus.mutate(
                        { status: next, approval_name: approvalName || undefined },
                        { onSuccess: () => toast.success(`Status changed to ${formatLabel(next)}`) }
                      )
                    }
                    trigger={button}
                  />
                );
              }

              return button;
            })}
          </div>
          {updateStatus.error && (
            <p className="text-sm text-destructive">
              {updateStatus.error.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
