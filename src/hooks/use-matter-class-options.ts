import { useQuery } from "@tanstack/react-query";
import { mattersApi } from "@/api/endpoints/matters";
import { formatLabel } from "@/lib/format-label";

export interface MatterClassOption {
  value: string;
  label: string;
}

/**
 * Fetches allowed matter classes. Uses the global compliance/defaults
 * endpoint when no matterId is available (e.g. the create-matter form),
 * and the matter-scoped endpoint when a matterId exists.
 */
export function useMatterClassOptions(matterId?: string): MatterClassOption[] {
  const { data } = useQuery({
    queryKey: matterId
      ? ["compliance", "matter-classes", matterId]
      : ["compliance", "defaults"],
    queryFn: () =>
      matterId
        ? mattersApi.getComplianceOptions(matterId)
        : mattersApi.getComplianceDefaults(),
    staleTime: 5 * 60 * 1000,
  });

  if (data?.allowed_matter_classes?.length) {
    return data.allowed_matter_classes.map((value) => ({
      value,
      label: formatLabel(value),
    }));
  }

  return [];
}
