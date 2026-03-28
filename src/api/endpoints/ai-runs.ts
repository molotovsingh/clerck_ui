import { api } from "../client";
import type { AiRun } from "@/types/ai-runs";
import { paginationParams } from "@/lib/constants";

export const aiRunsApi = {
  list: (matterId: string, params?: { limit?: number; offset?: number }) =>
    api.get<AiRun[]>(`/matters/${matterId}/ai-runs`, {
      params: paginationParams(params),
    }),

  get: (runId: string) => api.get<AiRun>(`/ai-runs/${runId}`),

  listForJob: (jobId: number, params?: { limit?: number; offset?: number }) =>
    api.get<AiRun[]>(`/jobs/${jobId}/ai-runs`, {
      params: paginationParams(params),
    }),
};
