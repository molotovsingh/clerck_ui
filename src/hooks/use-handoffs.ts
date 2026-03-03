import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { handoffsApi } from "@/api/endpoints/handoffs";
import { queryKeys } from "@/lib/query-keys";
import type { HandoffRequestCreate, HandoffRequestResolve } from "@/types/handoffs";

export function useHandoffs(matterId: string) {
  return useQuery({
    queryKey: queryKeys.handoffs.list(matterId),
    queryFn: () => handoffsApi.list(matterId),
    enabled: !!matterId,
  });
}

export function useActiveHandoff(matterId: string) {
  return useQuery({
    queryKey: queryKeys.handoffs.active(matterId),
    queryFn: () => handoffsApi.getActive(matterId),
    enabled: !!matterId,
  });
}

export function useCreateHandoff(matterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: HandoffRequestCreate) =>
      handoffsApi.create(matterId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.handoffs.list(matterId) });
      qc.invalidateQueries({ queryKey: queryKeys.handoffs.active(matterId) });
    },
  });
}

export function useResolveHandoff(matterId: string, handoffId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: HandoffRequestResolve) =>
      handoffsApi.resolve(matterId, handoffId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.handoffs.list(matterId) });
      qc.invalidateQueries({ queryKey: queryKeys.handoffs.active(matterId) });
      qc.invalidateQueries({ queryKey: queryKeys.access.self(matterId) });
    },
  });
}
