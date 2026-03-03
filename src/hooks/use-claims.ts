import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { claimsApi } from "@/api/endpoints/claims";
import { queryKeys } from "@/lib/query-keys";
import type { ClaimCreate } from "@/types/claims";

export function useClaims(matterId: string) {
  return useQuery({
    queryKey: queryKeys.claims.list(matterId),
    queryFn: () => claimsApi.list(matterId),
    enabled: !!matterId,
  });
}

export function useCreateClaim(matterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ClaimCreate) => claimsApi.create(matterId, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.claims.list(matterId) }),
  });
}
