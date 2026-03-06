import { useMatterReadiness } from "@/hooks/use-matters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/loading";
import { CheckCircle2, XCircle, AlertCircle, ArrowRight } from "lucide-react";
import { formatLabel } from "@/lib/format-label";

export interface ReadinessNavigationTarget {
  leftTab?: string;
  rightTab?: string;
  route?: string;
  hint?: string;
}

const CHECK_NAVIGATION: Record<string, ReadinessNavigationTarget> = {
  intake_gate: { route: "/matters/$matterId" },
  intake_manifest: { route: "/matters/$matterId" },
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

  if (isLoading) return <LoadingSpinner />;
  if (!readiness) return null;

  const { passed_count, total_count, required_v1_coverage } = readiness;

  return (
    <div className="space-y-4">
      {/* Progress summary */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold">
          {passed_count} of {total_count} requirements met
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
                  {check.label}
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

      {/* Required V1 Drafts (from readiness.required_v1_coverage) */}
      {required_v1_coverage && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold">Required Documents</h3>
            {required_v1_coverage.complete ? (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Complete
              </Badge>
            ) : (
              <Badge variant="secondary">
                {required_v1_coverage.required.filter((d) => d.exists).length}/{required_v1_coverage.required.length} created
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            {required_v1_coverage.required.map((item) => (
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
