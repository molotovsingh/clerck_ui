import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { artifactsApi } from "@/api/endpoints/artifacts";
import { queryKeys } from "@/lib/query-keys";
import type { ExportPackCreate } from "@/types/exports";

export function useArtifacts(matterId: string) {
  return useQuery({
    queryKey: queryKeys.artifacts.list(matterId),
    queryFn: () => artifactsApi.list(matterId),
    enabled: !!matterId,
  });
}

export function useCreateExport(matterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ExportPackCreate) =>
      artifactsApi.createExport(matterId, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.artifacts.list(matterId) }),
  });
}
