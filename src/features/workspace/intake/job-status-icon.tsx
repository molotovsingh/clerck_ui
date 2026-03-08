import { JobStatus } from "@/types/enums";
import { CheckCircle2, AlertCircle, Loader2, Clock } from "lucide-react";

export function JobStatusIcon({ status }: { status: string }) {
  switch (status) {
    case JobStatus.SUCCEEDED:
      return <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />;
    case JobStatus.FAILED:
      return <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />;
    case JobStatus.RUNNING:
      return <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground shrink-0" />;
  }
}
