import { useJobs, useQueueJob } from "@/hooks/use-jobs";
import { JobStatus, JobType } from "@/types/enums";
import type { MatterCapabilities } from "@/types/access";
import { canPerform } from "@/lib/capability-check";
import { formatLabel } from "@/lib/format-label";
import { formatRelative } from "@/lib/format-date";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FormDialog } from "@/components/common/form-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface Props {
  matterId: string;
  capabilities?: MatterCapabilities;
}

export function WorkspaceJobsIndicator({ matterId, capabilities }: Props) {
  const { data: jobs } = useJobs(matterId);

  const activeCount =
    jobs?.filter(
      (j) => j.status === JobStatus.RUNNING || j.status === JobStatus.QUEUED
    ).length ?? 0;

  const failedCount =
    jobs?.filter((j) => j.status === JobStatus.FAILED).length ?? 0;

  if (activeCount === 0 && failedCount === 0 && (!jobs || jobs.length === 0)) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors hover:bg-muted">
          {activeCount > 0 && (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              <span className="text-muted-foreground">
                {activeCount} running
              </span>
            </>
          )}
          {activeCount === 0 && failedCount > 0 && (
            <span className="text-destructive text-xs">
              {failedCount} failed
            </span>
          )}
          {activeCount === 0 && failedCount === 0 && (
            <span className="text-xs text-muted-foreground">
              {jobs?.length} tasks
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Processing</h4>
            {canPerform(capabilities, "queue_jobs") && (
              <FormDialog
                title="Start Task"
                description="Start a new processing task"
                trigger={
                  <Button variant="outline" size="sm">
                    <Plus className="h-3 w-3" />
                    Start
                  </Button>
                }
              >
                {(close) => (
                  <QueueJobForm matterId={matterId} onSuccess={close} />
                )}
              </FormDialog>
            )}
          </div>
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {jobs?.map((j) => (
              <div key={j.id} className="rounded border p-2 text-xs">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-medium">{formatLabel(j.job_type)}</span>
                  <StatusBadge status={j.status} />
                </div>
                <span className="text-muted-foreground">
                  {formatRelative(j.created_at)}
                </span>
                {j.status === JobStatus.FAILED && j.error_message && (
                  <p className="mt-0.5 text-destructive">{j.error_message}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
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
    } catch {
      /* error displayed via queue.error */
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Task Type</Label>
        <Select
          value={jobType}
          onValueChange={(v) => setJobType(v as JobType)}
        >
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
