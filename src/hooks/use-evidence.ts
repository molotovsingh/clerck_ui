import { useQuery } from "@tanstack/react-query";
import { evidenceApi } from "@/api/endpoints/evidence";
import { queryKeys } from "@/lib/query-keys";

export function useEvidence(
  matterId: string,
  params?: { limit?: number; offset?: number }
) {
  return useQuery({
    queryKey: queryKeys.evidence.list(matterId),
    queryFn: () => evidenceApi.list(matterId, params),
    enabled: !!matterId,
  });
}

export function useDuplicates(matterId: string) {
  return useQuery({
    queryKey: queryKeys.evidence.duplicates(matterId),
    queryFn: () => evidenceApi.listDuplicates(matterId),
    enabled: !!matterId,
  });
}

export function useEvidenceSearch(matterId: string, query: string) {
  return useQuery({
    queryKey: queryKeys.evidence.search(matterId, query),
    queryFn: () => evidenceApi.search(matterId, query),
    enabled: !!matterId && query.length >= 2,
  });
}
