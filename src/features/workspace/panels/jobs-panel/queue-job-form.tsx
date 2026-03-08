import { useState } from "react";
import { useQueueJob } from "@/hooks/use-jobs";
import { JobType } from "@/types/enums";
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
import { toast } from "sonner";

interface Props {
  matterId: string;
  onSuccess: () => void;
}

export function QueueJobForm({ matterId, onSuccess }: Props) {
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
