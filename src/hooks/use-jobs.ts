import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsApi } from "@/api/endpoints/jobs";
import { queryKeys } from "@/lib/query-keys";
import type { JobCreate } from "@/types/jobs";

export function useJobs(matterId: string) {
  return useQuery({
    queryKey: queryKeys.jobs.list(matterId),
    queryFn: () => jobsApi.list(matterId),
    enabled: !!matterId,
  });
}

export function useJob(jobId: number) {
  return useQuery({
    queryKey: queryKeys.jobs.detail(jobId),
    queryFn: () => jobsApi.get(jobId),
    enabled: !!jobId,
  });
}

export function useQueueJob(matterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: JobCreate) => jobsApi.queue(matterId, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.jobs.list(matterId) }),
  });
}
