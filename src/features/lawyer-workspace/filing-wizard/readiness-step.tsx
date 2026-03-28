import { useMatterReadiness } from "@/hooks/use-matters";
import { useRequiredV1Drafts } from "@/hooks/use-drafts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatLabel } from "@/lib/format-label";
import { CHECK_LABELS } from "@/lib/readiness-labels";
import { formatRelative } from "@/lib/format-date";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  AlertTriangle,
  Clock,
} from "lucide-react";

interface Props {
  matterId: string;
  onNext: () => void;
}

export function ReadinessStep({ matterId, onNext }: Props) {
  const { data: readiness } = useMatterReadiness(matterId);
  const { data: requiredV1 } = useRequiredV1Drafts(matterId);

  if (!readiness) return null;

  const allPassed = readiness.checks.every((c) => c.ok);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Step 1: Readiness Check
        </DialogTitle>
        <DialogDescription>
          Verify all requirements are met before proceeding
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 my-4">
        <div className="space-y-1">
          {readiness.checks.map((check) => (
            <div
              key={check.key}
              className="flex items-center gap-2 rounded px-2 py-1 text-sm"
            >
              {check.ok ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400 shrink-0" />
              )}
              <span>{CHECK_LABELS[check.key] ?? check.key}</span>
            </div>
          ))}
        </div>

        {requiredV1 && (
          <div className="border-t pt-2">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Required Documents
            </p>
            {requiredV1.required.map((item) => (
              <div
                key={item.doc_type}
                className="flex items-center gap-2 px-2 py-0.5 text-sm"
              >
                {item.exists && item.approved ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                ) : item.exists ? (
                  <AlertCircle className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                )}
                <span>{item.title}</span>
                {item.status && (
                  <Badge variant="secondary" className="text-xs ml-auto">
                    {formatLabel(item.status)}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}

        {readiness.latest_validation && (
          <div className="border-t pt-2">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Validation
            </p>
            <div className="flex items-center gap-2 px-2 py-0.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              Last validated {formatRelative(readiness.latest_validation.generated_at)}
            </div>
            {readiness.latest_validation.stale_section_count > 0 && (
              <div className="flex items-center gap-2 px-2 py-0.5 text-xs text-amber-600">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                {readiness.latest_validation.stale_section_count} stale section{readiness.latest_validation.stale_section_count > 1 ? "s" : ""} need attention
              </div>
            )}
            {readiness.latest_validation.critical_failures.map((f, i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-0.5 text-xs text-destructive">
                <XCircle className="h-3.5 w-3.5 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button onClick={onNext} disabled={!allPassed}>
          {allPassed ? (
            <>
              Continue
              <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            "Resolve issues first"
          )}
        </Button>
      </DialogFooter>
    </>
  );
}
