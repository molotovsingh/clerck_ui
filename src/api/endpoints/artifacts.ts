import { api } from "../client";
import type { Artifact, ExportPackCreate, ExportPackOut } from "@/types/exports";
import { DEFAULT_PAGE_LIMIT } from "@/lib/constants";

export const artifactsApi = {
  list: (matterId: string, params?: { limit?: number; offset?: number }) =>
    api.get<Artifact[]>(`/matters/${matterId}/artifacts`, {
      params: { limit: params?.limit ?? DEFAULT_PAGE_LIMIT, offset: params?.offset ?? 0 },
    }),

  download: (artifactId: number) => `/artifacts/${artifactId}/download`,

  createExport: (matterId: string, data: ExportPackCreate) =>
    api.post<ExportPackOut>(`/matters/${matterId}/exports`, { body: data }),
};
