import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { intakeApi } from "@/api/endpoints/intake";
import { queryKeys } from "@/lib/query-keys";
import type { IntakeContextPatch, IntakeContextUpdate } from "@/types/intake";

export function useIntakeProgress(matterId: string) {
  return useQuery({
    queryKey: queryKeys.intake.progress(matterId),
    queryFn: () => intakeApi.getProgress(matterId),
    enabled: !!matterId,
  });
}

export function useIntakeContext(matterId: string) {
  return useQuery({
    queryKey: queryKeys.intake.context(matterId),
    queryFn: () => intakeApi.getContext(matterId),
    enabled: !!matterId,
  });
}

export function useUpdateIntakeContext(matterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: IntakeContextUpdate) =>
      intakeApi.updateContext(matterId, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.intake.context(matterId) }),
  });
}

export function usePatchIntakeContext(matterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: IntakeContextPatch) =>
      intakeApi.patchContext(matterId, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.intake.context(matterId) }),
  });
}

export function useUploadFiles(matterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => intakeApi.uploadFiles(matterId, files),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.evidence.list(matterId) });
      qc.invalidateQueries({ queryKey: queryKeys.intake.context(matterId) });
      qc.invalidateQueries({ queryKey: queryKeys.intake.progress(matterId) });
    },
  });
}
