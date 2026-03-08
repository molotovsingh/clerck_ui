import { useQuery } from "@tanstack/react-query";
import { mattersApi } from "@/api/endpoints/matters";
import { formatLabel } from "@/lib/format-label";

export interface MatterClassOption {
  value: string;
  label: string;
}

export interface UseMatterClassResult {
  suggestions: MatterClassOption[];
  customSupported: boolean;
  defaultClass: string | undefined;
}

/**
 * Fetches matter-class options from the compliance endpoint.
 *
 * Returns `suggested_matter_classes` as UI suggestions (not a hard allowlist),
 * a `customSupported` flag indicating whether arbitrary values are accepted,
 * and the server-side `defaultClass`.
 */
export function useMatterClassOptions(
  matterId?: string,
): UseMatterClassResult {
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

  const suggestions: MatterClassOption[] = (
    data?.suggested_matter_classes ?? []
  ).map((value) => ({ value, label: formatLabel(value) }));

  return {
    suggestions,
    customSupported: data?.custom_matter_class_supported ?? true,
    defaultClass: data?.default_matter_class,
  };
}
