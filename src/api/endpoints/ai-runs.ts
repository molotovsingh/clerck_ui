import { api } from "../client";
import type { AiRun } from "@/types/ai-runs";
import { DEFAULT_PAGE_LIMIT } from "@/lib/constants";

export const aiRunsApi = {
  list: (matterId: string, params?: { limit?: number; offset?: number }) =>
    api.get<AiRun[]>(`/matters/${matterId}/ai-runs`, {
      params: { limit: params?.limit ?? DEFAULT_PAGE_LIMIT, offset: params?.offset ?? 0 },
    }),

  get: (runId: string) => api.get<AiRun>(`/ai-runs/${runId}`),

  listForJob: (jobId: number, params?: { limit?: number; offset?: number }) =>
    api.get<AiRun[]>(`/jobs/${jobId}/ai-runs`, {
      params: { limit: params?.limit ?? DEFAULT_PAGE_LIMIT, offset: params?.offset ?? 0 },
    }),
};
