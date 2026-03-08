import { useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useUpdateMatterStatus } from "@/hooks/use-matters";
import { useIntakeProgress } from "@/hooks/use-intake";
import { MatterStatus } from "@/types/enums";
import type { MatterWorkspaceOut } from "@/types/workspace";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { UploadCard } from "@/features/workspace/intake/upload-card";
import { DisputeCard } from "@/features/workspace/intake/dispute-card";
import { DocumentsCard } from "@/features/workspace/intake/documents-card";
import { JobsTrackerCard } from "@/features/workspace/intake/jobs-tracker-card";
import { ProgressRail } from "@/features/workspace/intake/progress-rail";

interface Props {
  matterId: string;
  workspace: MatterWorkspaceOut;
}

export function IntakeView({ matterId, workspace }: Props) {
  const { matter } = workspace;
  const { data: progress } = useIntakeProgress(matterId);
  const updateStatus = useUpdateMatterStatus(matterId);

  const hasEvidence = progress?.has_evidence ?? false;
  const intakeReady = progress?.context.gate_passed === true;
  const canOrder = hasEvidence && intakeReady;
  const hasSucceededJob = progress?.has_successful_job ?? false;

  const step1Done = hasEvidence;
  const step2Done = intakeReady;
  const step3Done = hasSucceededJob;

  const prevStep1 = useRef(step1Done);
  const prevStep2 = useRef(step2Done);
  const prevStep3 = useRef(step3Done);

  useEffect(() => {
    if (!prevStep1.current && step1Done) {
      toast.success("Evidence uploaded — you can now describe the dispute");
    }
    prevStep1.current = step1Done;
  }, [step1Done]);

  useEffect(() => {
    if (!prevStep2.current && step2Done) {
      toast.success("Intake complete — you can now order documents");
    }
    prevStep2.current = step2Done;
  }, [step2Done]);

  useEffect(() => {
    if (!prevStep3.current && step3Done) {
      toast.success("First document ready — switch to Review mode");
    }
    prevStep3.current = step3Done;
  }, [step3Done]);

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-5xl flex p-6">
        <ProgressRail
          steps={[
            {
              label: "Upload Evidence",
              targetId: "step-1",
              done: step1Done,
              active: !step1Done,
            },
            {
              label: "Describe Dispute",
              targetId: "step-2",
              done: step2Done,
              active: step1Done && !step2Done,
            },
            {
              label: "Order Documents",
              targetId: "step-3",
              done: step3Done,
              active: canOrder && !step3Done,
            },
          ]}
        />
        <div className="flex-1 max-w-4xl space-y-6 mx-auto">
          <Link
            to="/matters"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to matters
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{matter.name}</h1>
              <p className="text-sm text-muted-foreground">
                {matter.client_name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={matter.status} />
              {matter.status === MatterStatus.INTAKE && intakeReady && (
                <Button
                  size="sm"
                  onClick={() =>
                    updateStatus.mutate(
                      { status: MatterStatus.UNDER_REVIEW },
                      {
                        onSuccess: () =>
                          toast.success("Submitted for review"),
                      }
                    )
                  }
                  disabled={updateStatus.isPending}
                >
                  {updateStatus.isPending
                    ? "Submitting..."
                    : "Submit for Review"}
                </Button>
              )}
              {updateStatus.error && (
                <span className="text-xs text-destructive">
                  {updateStatus.error.message}
                </span>
              )}
            </div>
          </div>

          <UploadCard matterId={matterId} stepDone={step1Done} />
          <DisputeCard
            matterId={matterId}
            step1Done={step1Done}
            step2Done={step2Done}
          />
          <DocumentsCard
            matterId={matterId}
            canOrder={canOrder}
            hasEvidence={hasEvidence}
            step3Done={step3Done}
          />
          <JobsTrackerCard matterId={matterId} />
        </div>
      </div>
    </div>
  );
}
