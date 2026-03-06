import { useJobs, useQueueJob } from "@/hooks/use-jobs";
import { JobType, JobStatus } from "@/types/enums";
import { StepIndicator } from "./step-indicator";
import { HelpTip } from "@/components/common/help-tip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock,
  Search,
  ListChecks,
  FileSignature,
  ScanLine,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

const DOCUMENT_OPTIONS = [
  {
    type: JobType.TIMELINE,
    label: "Timeline",
    description: "Chronological list of events from your evidence",
    icon: Clock,
  },
  {
    type: JobType.RESEARCH,
    label: "Research Summary",
    description: "Legal research and analysis of the dispute",
    icon: Search,
  },
  {
    type: JobType.CLAIM_MATRIX,
    label: "Extract Claims",
    description: "Identify key claims from your evidence",
    icon: ListChecks,
  },
  {
    type: JobType.DRAFT_GENERATION,
    label: "Draft Document",
    description: "Generate a legal draft (runs research first if needed)",
    icon: FileSignature,
  },
  {
    type: JobType.OCR,
    label: "Scan for Text",
    description: "Extract text from scanned/image documents",
    icon: ScanLine,
  },
] as const;

interface Props {
  matterId: string;
  canOrder: boolean;
  hasEvidence: boolean;
  step3Done: boolean;
}

export function DocumentsCard({ matterId, canOrder, hasEvidence, step3Done }: Props) {
  const { data: jobs } = useJobs(matterId);
  const queueJob = useQueueJob(matterId);

  const activeJobTypes = new Set(
    (jobs ?? [])
      .filter((j) => j.status === JobStatus.QUEUED || j.status === JobStatus.RUNNING)
      .map((j) => j.job_type)
  );

  return (
    <Card id="step-3">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <StepIndicator step={3} done={step3Done} active={canOrder && !step3Done} />
          Order Documents
          <HelpTip content="Select documents to generate from your evidence. Each runs an AI task." />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!canOrder && (
          <div className="flex items-start gap-2 rounded border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 mb-4">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>
              {!hasEvidence ? (
                "Upload at least one evidence file in Step 1 first."
              ) : (
                <>
                  Save your dispute details in{" "}
                  <a href="#step-2" className="underline font-medium">
                    Step 2
                  </a>{" "}
                  first.
                </>
              )}
            </p>
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {DOCUMENT_OPTIONS.map((doc) => {
            const isActive = activeJobTypes.has(doc.type);
            const succeeded = (jobs ?? []).some(
              (j) =>
                j.job_type === doc.type &&
                j.status === JobStatus.SUCCEEDED
            );
            return (
              <button
                key={doc.type}
                disabled={!canOrder || isActive}
                onClick={() => queueJob.mutate(
                  { job_type: doc.type },
                  { onSuccess: () => toast.success(`${doc.label} queued`) }
                )}
                className="flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <doc.icon className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {doc.label}
                    </span>
                    {isActive && (
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                    )}
                    {succeeded && (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {doc.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
        {queueJob.error && (
          <p className="mt-3 text-sm text-destructive">
            {queueJob.error.message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
