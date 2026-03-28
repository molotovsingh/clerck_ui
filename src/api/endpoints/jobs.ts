import { api } from "../client";
import type { Job, JobCreate } from "@/types/jobs";
import { paginationParams } from "@/lib/constants";

export const jobsApi = {
  list: (matterId: string, params?: { limit?: number; offset?: number }) =>
    api.get<Job[]>(`/matters/${matterId}/jobs`, {
      params: paginationParams(params),
    }),

  get: (jobId: number) => api.get<Job>(`/jobs/${jobId}`),

  queue: (matterId: string, data: JobCreate) =>
    api.post<Job>(`/matters/${matterId}/jobs`, { body: data }),

  downloadResult: (jobId: number) => `/jobs/${jobId}/result/download`,
};
