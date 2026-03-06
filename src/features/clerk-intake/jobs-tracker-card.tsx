import { useJobs } from "@/hooks/use-jobs";
import { JobStatus } from "@/types/enums";
import { formatLabel } from "@/lib/format-label";
import { formatRelative } from "@/lib/format-date";
import { JobStatusIcon } from "./job-status-icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface Props {
  matterId: string;
}

export function JobsTrackerCard({ matterId }: Props) {
  const { data: jobs } = useJobs(matterId);

  if (!jobs || jobs.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Loader2 className="h-5 w-5" />
          Processing ({jobs.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[250px]">
          <div className="space-y-2">
            {[...jobs].reverse().map((j) => (
              <div
                key={j.id}
                className="flex items-center justify-between rounded border px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <JobStatusIcon status={j.status} />
                  <span className="font-medium">
                    {formatLabel(j.job_type)}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={
                      j.status === JobStatus.SUCCEEDED
                        ? "secondary"
                        : j.status === JobStatus.FAILED
                          ? "destructive"
                          : "outline"
                    }
                    className="text-xs"
                  >
                    {formatLabel(j.status)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatRelative(j.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
