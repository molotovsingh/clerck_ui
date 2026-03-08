import { useQuery } from "@tanstack/react-query";
import { aiRunsApi } from "@/api/endpoints/ai-runs";
import { queryKeys } from "@/lib/query-keys";

export function useAiRuns(matterId: string) {
  return useQuery({
    queryKey: queryKeys.aiRuns.list(matterId),
    queryFn: () => aiRunsApi.list(matterId),
  });
}

export function useAiRun(runId: string) {
  return useQuery({
    queryKey: queryKeys.aiRuns.detail(runId),
    queryFn: () => aiRunsApi.get(runId),
    enabled: !!runId,
  });
}

export function useAiRunsForJob(jobId: number) {
  return useQuery({
    queryKey: queryKeys.aiRuns.forJob(jobId),
    queryFn: () => aiRunsApi.listForJob(jobId),
    enabled: !!jobId,
  });
}
