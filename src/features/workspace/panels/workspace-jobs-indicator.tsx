import { useJobs } from "@/hooks/use-jobs";
import { JobStatus } from "@/types/enums";
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
import { QueueJobForm } from "./jobs-panel/queue-job-form";
import { Loader2, Plus } from "lucide-react";

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
