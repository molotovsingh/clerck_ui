import { useRef, useEffect } from "react";
import { useParams, Link } from "@tanstack/react-router";
import { useMatter, useUpdateMatterStatus } from "@/hooks/use-matters";
import { useIntakeContext } from "@/hooks/use-intake";
import { useEvidence } from "@/hooks/use-evidence";
import { useJobs } from "@/hooks/use-jobs";
import { MatterStatus, JobStatus } from "@/types/enums";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { LoadingSpinner } from "@/components/common/loading";
import { ErrorDisplay } from "@/components/common/error-display";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { UploadCard } from "./upload-card";
import { DisputeCard } from "./dispute-card";
import { DocumentsCard } from "./documents-card";
import { JobsTrackerCard } from "./jobs-tracker-card";
import { ProgressRail } from "./progress-rail";

export function ClerkIntakePage() {
  const { matterId } = useParams({ strict: false }) as { matterId: string };
  const { data: matter, isLoading: matterLoading } = useMatter(matterId);
  const { data: context, isLoading: ctxLoading } = useIntakeContext(matterId);
  const { data: evidence } = useEvidence(matterId);
  const { data: jobs } = useJobs(matterId);
  const updateStatus = useUpdateMatterStatus(matterId);

  // Compute step booleans before early returns (safe with undefined data)
  const hasEvidence = !!(evidence && evidence.length > 0);
  const intakeReady = context?.gate_passed === true;
  const canOrder = hasEvidence && intakeReady;
  const hasSucceededJob = (jobs ?? []).some((j) => j.status === JobStatus.SUCCEEDED);

  const step1Done = hasEvidence;
  const step2Done = intakeReady;
  const step3Done = hasSucceededJob;

  // Step completion milestone toasts — must be before early returns
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
      toast.success("First document ready — check the Lawyer Workspace");
    }
    prevStep3.current = step3Done;
  }, [step3Done]);

  if (matterLoading || ctxLoading) return <LoadingSpinner />;
  if (!matter) return <ErrorDisplay error={new Error("Matter not found")} />;

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-5xl flex p-6">
        <ProgressRail
          steps={[
            { label: "Upload Evidence", targetId: "step-1", done: step1Done, active: !step1Done },
            { label: "Describe Dispute", targetId: "step-2", done: step2Done, active: step1Done && !step2Done },
            { label: "Order Documents", targetId: "step-3", done: step3Done, active: canOrder && !step3Done },
          ]}
        />
        <div className="flex-1 max-w-4xl space-y-6 mx-auto">
          {/* Header */}
          <Link
            to="/clerk"
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
                  onClick={() => updateStatus.mutate(
                    { status: MatterStatus.UNDER_REVIEW },
                    { onSuccess: () => toast.success("Submitted for review") }
                  )}
                  disabled={updateStatus.isPending}
                >
                  {updateStatus.isPending
                    ? "Submitting..."
                    : "Submit for Review"}
                </Button>
              )}
              {updateStatus.error && (
                <span className="text-xs text-destructive">{updateStatus.error.message}</span>
              )}
            </div>
          </div>

          <UploadCard matterId={matterId} stepDone={step1Done} />
          <DisputeCard matterId={matterId} step1Done={step1Done} step2Done={step2Done} />
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
