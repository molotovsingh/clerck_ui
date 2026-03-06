import { useState } from "react";
import { useJobs, useQueueJob } from "@/hooks/use-jobs";
import { JobType, JobStatus } from "@/types/enums";
import type { MatterCapabilities } from "@/types/access";
import { canPerform } from "@/lib/capability-check";
import { formatLabel } from "@/lib/format-label";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/common/status-badge";
import { LoadingSpinner } from "@/components/common/loading";
import { EmptyState } from "@/components/common/empty-state";
import { FormDialog } from "@/components/common/form-dialog";
import { toast } from "sonner";
import { Plus, Layers } from "lucide-react";
import { formatRelative } from "@/lib/format-date";

interface Props {
  matterId: string;
  capabilities?: MatterCapabilities;
}

export function JobsPanel({ matterId, capabilities }: Props) {
  const { data: jobs, isLoading } = useJobs(matterId);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Processing {jobs && `(${jobs.length})`}
        </h3>
        {canPerform(capabilities, "queue_jobs") && (
          <FormDialog
            title="Start Task"
            description="Start a new processing task"
            trigger={
              <Button variant="outline" size="sm">
                <Plus className="h-3 w-3" />
                Start Task
              </Button>
            }
          >
            {(close) => (
              <QueueJobForm matterId={matterId} onSuccess={close} />
            )}
          </FormDialog>
        )}
      </div>

      {!jobs?.length ? (
        <EmptyState
          icon={Layers}
          title="Nothing processing yet"
          description="Start a task from the Matters intake page"
        />
      ) : (
        <div className="space-y-2">
          {jobs.map((j) => (
            <div key={j.id} className="rounded border p-2 text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{formatLabel(j.job_type)}</span>
                <StatusBadge status={j.status} />
              </div>
              <div className="text-xs text-muted-foreground">
                <span>by {j.queued_by}</span>
                <span className="mx-1">&middot;</span>
                <span>{formatRelative(j.created_at)}</span>
              </div>
              {j.status === JobStatus.FAILED && j.error_message && (
                <p className="mt-1 text-xs text-destructive">
                  {j.error_message}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QueueJobForm({
  matterId,
  onSuccess,
}: {
  matterId: string;
  onSuccess: () => void;
}) {
  const [jobType, setJobType] = useState<JobType>(JobType.OCR);
  const queue = useQueueJob(matterId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await queue.mutateAsync({ job_type: jobType });
      toast.success("Task started");
      onSuccess();
    } catch { /* error displayed via queue.error */ }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Task Type</Label>
        <Select value={jobType} onValueChange={(v) => setJobType(v as JobType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(JobType).map((t) => (
              <SelectItem key={t} value={t}>
                {formatLabel(t)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {queue.error && (
        <p className="text-sm text-destructive">{queue.error.message}</p>
      )}
      <Button type="submit" className="w-full" disabled={queue.isPending}>
        {queue.isPending ? "Starting..." : "Start Task"}
      </Button>
    </form>
  );
}
