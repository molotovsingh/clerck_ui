import { useState } from "react";
import { useMatterReadiness } from "@/hooks/use-matters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/stores/workspace-store";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";
import { formatLabel } from "@/lib/format-label";

interface Props {
  matterId: string;
}

export function WorkspaceStatusLine({ matterId }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { data: readiness } = useMatterReadiness(matterId);
  const setFilingWizardOpen = useWorkspaceStore((s) => s.setFilingWizardOpen);

  if (!readiness) return null;

  const { passed_count, total_count, required_v1_coverage } = readiness;
  const failedChecks = readiness.checks.filter((c) => !c.ok);
  const allPassed = failedChecks.length === 0;
  const readyToFile = readiness.ready_for_court_bundle;

  return (
    <div className="relative">
      <button
        onClick={() => (readyToFile ? setFilingWizardOpen(true) : setExpanded(!expanded))}
        className="flex items-center gap-2 rounded-md px-2.5 py-1 text-sm transition-colors hover:bg-muted"
      >
        {allPassed ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <AlertCircle className="h-4 w-4 text-amber-500" />
        )}
        <span className={allPassed ? "text-green-700" : "text-muted-foreground"}>
          {readyToFile
            ? "Ready to file"
            : allPassed
              ? "All checks passed"
              : `${failedChecks.length} item${failedChecks.length > 1 ? "s" : ""} need attention`}
        </span>
        {!readyToFile && (
          expanded ? (
            <ChevronUp className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          )
        )}
      </button>

      {expanded && (
        <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-lg border bg-popover p-3 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              {passed_count}/{total_count} requirements met
            </span>
            {readiness.intake_gate_passed && (
              <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                Intake Complete
              </Badge>
            )}
          </div>

          <div className="space-y-0.5">
            {readiness.checks.map((check) => (
              <div
                key={check.key}
                className="flex items-center gap-2 rounded px-1.5 py-1 text-xs"
              >
                {check.ok ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                )}
                <span className="flex-1">
                  {check.label}
                </span>
              </div>
            ))}
          </div>

          {required_v1_coverage && (
            <div className="mt-3 border-t pt-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Required Documents
                </span>
                <Badge variant="secondary" className="text-xs">
                  {required_v1_coverage.required.filter((d) => d.exists).length}/{required_v1_coverage.required.length}
                </Badge>
              </div>
              <div className="space-y-0.5">
                {required_v1_coverage.required.map((item) => (
                  <div
                    key={item.doc_type}
                    className="flex items-center gap-2 px-1.5 py-0.5 text-xs"
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
            </div>
          )}

          {readiness.ready_for_client_approval && (
            <Button
              size="sm"
              className="w-full mt-3"
              onClick={() => {
                setExpanded(false);
                setFilingWizardOpen(true);
              }}
            >
              <ArrowRight className="h-3 w-3" />
              Proceed to Filing
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
