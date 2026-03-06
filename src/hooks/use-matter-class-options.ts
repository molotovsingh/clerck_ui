import { useQuery } from "@tanstack/react-query";
import { mattersApi } from "@/api/endpoints/matters";
import { formatLabel } from "@/lib/format-label";

export interface MatterClassOption {
  value: string;
  label: string;
}

// Bootstrap defaults for matter creation (no matterId available yet).
// TODO: Replace with a global /api/v1/compliance/defaults endpoint when available.
// These values mirror the backend's default allowed_matter_classes and must stay in sync.
const BOOTSTRAP_DEFAULTS: MatterClassOption[] = [
  { value: "general_dispute", label: "General Dispute" },
  { value: "debt_recovery", label: "Debt Recovery" },
  { value: "employment_dispute", label: "Employment Dispute" },
  { value: "regulatory_enforcement", label: "Regulatory Enforcement" },
];

/**
 * Fetches allowed matter classes from the backend compliance endpoint.
 * When no matterId is available (e.g., the create-matter form), returns
 * static bootstrap defaults until a global endpoint is added.
 */
export function useMatterClassOptions(matterId?: string): MatterClassOption[] {
  const { data } = useQuery({
    queryKey: ["compliance", "matter-classes", matterId],
    queryFn: () => mattersApi.getComplianceOptions(matterId!),
    enabled: !!matterId,
    staleTime: 5 * 60 * 1000,
  });

  if (data?.allowed_matter_classes?.length) {
    return data.allowed_matter_classes.map((value) => ({
      value,
      label: formatLabel(value),
    }));
  }

  return BOOTSTRAP_DEFAULTS;
}
