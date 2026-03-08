import { useJobs } from "@/hooks/use-jobs";
import { JobStatus } from "@/types/enums";
import type { MatterCapabilities } from "@/types/access";
import { canPerform } from "@/lib/capability-check";
import { formatLabel } from "@/lib/format-label";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { LoadingSpinner } from "@/components/common/loading";
import { EmptyState } from "@/components/common/empty-state";
import { FormDialog } from "@/components/common/form-dialog";
import { QueueJobForm } from "./queue-job-form";
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
