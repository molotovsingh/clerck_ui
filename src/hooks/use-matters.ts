import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mattersApi } from "@/api/endpoints/matters";
import { queryKeys } from "@/lib/query-keys";
import type { MatterCreate, MatterStatusUpdate } from "@/types/matters";

export function useMatters(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: queryKeys.matters.list(params),
    queryFn: () => mattersApi.list(params),
  });
}

export function useMatter(id: string) {
  return useQuery({
    queryKey: queryKeys.matters.detail(id),
    queryFn: () => mattersApi.get(id),
    enabled: !!id,
  });
}

export function useCreateMatter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MatterCreate) => mattersApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.matters.all }),
  });
}

export function useUpdateMatterStatus(matterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MatterStatusUpdate) =>
      mattersApi.updateStatus(matterId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.matters.detail(matterId) });
      qc.invalidateQueries({ queryKey: queryKeys.matters.all });
    },
  });
}

export function useMatterReadiness(matterId: string) {
  return useQuery({
    queryKey: queryKeys.matters.readiness(matterId),
    queryFn: () => mattersApi.getReadiness(matterId),
    enabled: !!matterId,
  });
}

export function useMatterAudit(
  matterId: string,
  params?: { limit?: number; offset?: number }
) {
  return useQuery({
    queryKey: queryKeys.matters.audit(matterId),
    queryFn: () => mattersApi.listAudit(matterId, params),
    enabled: !!matterId,
  });
}
