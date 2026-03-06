import { useState } from "react";
import { useMatterReadiness, useUpdateMatterStatus } from "@/hooks/use-matters";
import { useRequiredV1Drafts } from "@/hooks/use-drafts";
import { useCreateExport } from "@/hooks/use-artifacts";
import { useIntakeContext } from "@/hooks/use-intake";
import { MatterStatus, ArtifactKind } from "@/types/enums";
import { useWorkspaceStore } from "@/stores/workspace-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { formatLabel } from "@/lib/format-label";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Package,
  Gavel,
} from "lucide-react";

const CHECK_LABELS: Record<string, string> = {
  intake_gate: "Case details complete",
  status_for_client_approval: "Ready for client review",
  intake_manifest: "Evidence uploaded",
  claim_source_refs: "Claims linked to evidence",
  approved_draft: "At least one document approved",
  required_v1_drafts_approved: "All required documents approved",
  status_for_court_bundle: "Ready for court filing",
  approval_metadata: "Client approval recorded",
};

interface Props {
  matterId: string;
  matterStatus: MatterStatus;
}

export function FilingWizard({ matterId, matterStatus }: Props) {
  const open = useWorkspaceStore((s) => s.filingWizardOpen);
  const setOpen = useWorkspaceStore((s) => s.setFilingWizardOpen);
  const [step, setStep] = useState(0);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setStep(0);
      }}
    >
      <DialogContent className="max-w-lg">
        {step === 0 && (
          <ReadinessStep
            matterId={matterId}
            onNext={() => setStep(1)}
          />
        )}
        {step === 1 && (
          <ExportStep
            matterId={matterId}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <StatusAdvanceStep
            matterId={matterId}
            matterStatus={matterStatus}
            onBack={() => setStep(1)}
            onDone={() => {
              setOpen(false);
              setStep(0);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ReadinessStep({
  matterId,
  onNext,
}: {
  matterId: string;
  onNext: () => void;
}) {
  const { data: readiness } = useMatterReadiness(matterId);
  const { data: requiredV1 } = useRequiredV1Drafts(matterId);

  if (!readiness) return null;

  const allPassed = readiness.checks.every((c) => c.ok);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Step 1: Readiness Check
        </DialogTitle>
        <DialogDescription>
          Verify all requirements are met before proceeding
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 my-4">
        <div className="space-y-1">
          {readiness.checks.map((check) => (
            <div
              key={check.key}
              className="flex items-center gap-2 rounded px-2 py-1 text-sm"
            >
              {check.ok ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400 shrink-0" />
              )}
              <span>{CHECK_LABELS[check.key] ?? check.key}</span>
            </div>
          ))}
        </div>

        {requiredV1 && (
          <div className="border-t pt-2">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Required Documents
            </p>
            {requiredV1.required.map((item) => (
              <div
                key={item.doc_type}
                className="flex items-center gap-2 px-2 py-0.5 text-sm"
              >
                {item.exists && item.approved ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                ) : item.exists ? (
                  <AlertCircle className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                )}
                <span>{item.title}</span>
                {item.status && (
                  <Badge variant="secondary" className="text-xs ml-auto">
                    {formatLabel(item.status)}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button onClick={onNext} disabled={!allPassed}>
          {allPassed ? (
            <>
              Continue
              <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            "Resolve issues first"
          )}
        </Button>
      </DialogFooter>
    </>
  );
}

function ExportStep({
  matterId,
  onBack,
  onNext,
}: {
  matterId: string;
  onBack: () => void;
  onNext: () => void;
}) {
  const [kind, setKind] = useState<ArtifactKind>(ArtifactKind.COURT_BUNDLE);
  const [approvedBy, setApprovedBy] = useState("");
  const create = useCreateExport(matterId);

  const handleExport = async () => {
    try {
      await create.mutateAsync({
        kind,
        approved_by: approvedBy || undefined,
      });
      toast.success("Export created");
      onNext();
    } catch {
      /* error displayed via create.error */
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Step 2: Create Export
        </DialogTitle>
        <DialogDescription>
          Generate an export package for filing
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 my-4">
        <div className="space-y-2">
          <Label>Export Type</Label>
          <Select
            value={kind}
            onValueChange={(v) => setKind(v as ArtifactKind)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                ArtifactKind.COURT_BUNDLE,
                ArtifactKind.SHAREABLE_PACK,
                ArtifactKind.LIQUIDTEXT_PACK,
              ].map((k) => (
                <SelectItem key={k} value={k}>
                  {formatLabel(k)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Approved By (optional)</Label>
          <Input
            value={approvedBy}
            onChange={(e) => setApprovedBy(e.target.value)}
            placeholder="Partner name"
          />
        </div>
        {create.error && (
          <p className="text-sm text-destructive">{create.error.message}</p>
        )}
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onNext}>
            Skip
          </Button>
          <Button onClick={handleExport} disabled={create.isPending}>
            {create.isPending ? "Creating..." : "Create Export"}
          </Button>
        </div>
      </DialogFooter>
    </>
  );
}

function StatusAdvanceStep({
  matterId,
  matterStatus,
  onBack,
  onDone,
}: {
  matterId: string;
  matterStatus: MatterStatus;
  onBack: () => void;
  onDone: () => void;
}) {
  const [approvalName, setApprovalName] = useState("");
  const updateStatus = useUpdateMatterStatus(matterId);
  const { data: intakeCtx } = useIntakeContext(matterId);

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
