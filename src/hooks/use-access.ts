import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accessApi } from "@/api/endpoints/access";
import { queryKeys } from "@/lib/query-keys";
import type { MatterAccessGrant } from "@/types/access";

export function useAccessList(matterId: string) {
  return useQuery({
    queryKey: queryKeys.access.list(matterId),
    queryFn: () => accessApi.list(matterId),
    enabled: !!matterId,
  });
}

export function useAccessSelf(matterId: string) {
  return useQuery({
    queryKey: queryKeys.access.self(matterId),
    queryFn: () => accessApi.getSelf(matterId),
    enabled: !!matterId,
  });
}

export function useGrantAccess(matterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MatterAccessGrant) => accessApi.grant(matterId, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.access.list(matterId) }),
  });
}

export function useRevokeAccess(matterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (actor: string) => accessApi.revoke(matterId, actor),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.access.list(matterId) }),
  });
}
