import { useMatterReadiness } from "@/hooks/use-matters";
import { useRequiredV1Drafts } from "@/hooks/use-drafts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/loading";
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, Clock, AlertTriangle } from "lucide-react";
import { formatLabel } from "@/lib/format-label";
import { formatRelative } from "@/lib/format-date";
import { CHECK_LABELS } from "@/lib/readiness-labels";

export interface ReadinessNavigationTarget {
  leftTab?: string;
  rightTab?: string;
  route?: string;
  hint?: string;
}

const CHECK_NAVIGATION: Record<string, ReadinessNavigationTarget> = {
  intake_gate: { route: "/clerk/$matterId" },
  intake_manifest: { route: "/clerk/$matterId" },
  claim_source_refs: { leftTab: "claims" },
  status_for_client_approval: { rightTab: "status" },
  status_for_court_bundle: { rightTab: "status" },
  approval_metadata: { rightTab: "status" },
  approved_draft: { hint: "Select and approve a document in the center panel" },
  required_v1_drafts_approved: { hint: "Approve all required documents in the center panel" },
};

interface ReadinessPanelProps {
  matterId: string;
  onNavigate?: (target: ReadinessNavigationTarget) => void;
}

export function ReadinessPanel({ matterId, onNavigate }: ReadinessPanelProps) {
  const { data: readiness, isLoading } = useMatterReadiness(matterId);
  const { data: requiredV1 } = useRequiredV1Drafts(matterId);

  if (isLoading) return <LoadingSpinner />;
  if (!readiness) return null;

  const passedCount = readiness.checks.filter((c) => c.ok).length;
  const totalCount = readiness.checks.length;

  return (
    <div className="space-y-4">
      {/* Progress summary */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold">
          {passedCount} of {totalCount} requirements met
        </span>
        {readiness.intake_gate_passed ? (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Intake Complete
          </Badge>
        ) : (
          <Badge variant="destructive">Intake Incomplete</Badge>
        )}
        {readiness.ready_for_client_approval && (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Ready for Approval
          </Badge>
        )}
      </div>

      {/* Checks list */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Requirements</h3>
        <div className="space-y-1">
          {readiness.checks.map((check) => {
            const nav = CHECK_NAVIGATION[check.key];
            return (
              <div
                key={check.key}
                className="flex items-center gap-2 rounded px-2 py-1.5 text-sm"
              >
                {check.ok ? (
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 mt-0.5 text-red-400 shrink-0" />
                )}
                <span className="flex-1 text-left">
                  {CHECK_LABELS[check.key] ?? check.key}
                </span>
                {!check.ok && nav && onNavigate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs gap-1 text-primary shrink-0"
                    onClick={() => onNavigate(nav)}
                  >
                    Fix
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Validation snapshot (from backend latest_validation) */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Validation</h3>
        {readiness.latest_validation ? (
          <div className="rounded border p-2 text-sm space-y-1.5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs">
                Last validated {formatRelative(readiness.latest_validation.generated_at)}
              </span>
            </div>
            {readiness.latest_validation.stale_section_count > 0 && (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs">
                  {readiness.latest_validation.stale_section_count} stale section{readiness.latest_validation.stale_section_count > 1 ? "s" : ""}
                </span>
              </div>
            )}
            {readiness.latest_validation.critical_failures.length > 0 && (
              <div className="space-y-1">
                {readiness.latest_validation.critical_failures.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-destructive">
                    <XCircle className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-xs">{f}</span>
                  </div>
                ))}
              </div>
            )}
            {readiness.latest_validation.critical_failures.length === 0 &&
              readiness.latest_validation.stale_section_count === 0 && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs">All checks passed</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground px-2">No validation run yet</p>
        )}
      </div>

      {/* Required V1 Drafts */}
      {requiredV1 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold">Required Documents</h3>
            {requiredV1.complete ? (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Complete
              </Badge>
            ) : (
              <Badge variant="secondary">
                {requiredV1.required.filter((d) => d.exists).length}/{requiredV1.required.length} created
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            {requiredV1.required.map((item) => (
              <div
                key={item.doc_type}
                className="flex items-center gap-2 rounded px-2 py-1.5 text-sm"
              >
                {item.exists && item.approved ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                ) : item.exists ? (
                  <AlertCircle className="h-4 w-4 text-blue-500 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                )}
                <span className="text-left">{item.title}</span>
                {item.status && (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {formatLabel(item.status)}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
