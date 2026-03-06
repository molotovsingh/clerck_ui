import { useQuery } from "@tanstack/react-query";
import { mattersApi } from "@/api/endpoints/matters";
import { formatLabel } from "@/lib/format-label";

export interface MatterClassOption {
  value: string;
  label: string;
}

const FALLBACK_CLASSES: MatterClassOption[] = [
  { value: "general_dispute", label: "General Dispute" },
  { value: "debt_recovery", label: "Debt Recovery" },
  { value: "employment_dispute", label: "Employment Dispute" },
  { value: "regulatory_enforcement", label: "Regulatory Enforcement" },
];

/**
 * Fetches allowed matter classes from the backend compliance endpoint.
 * Falls back to a static list if no matterId is provided or the request fails.
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

  return FALLBACK_CLASSES;
}
