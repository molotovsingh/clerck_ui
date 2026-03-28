import { api } from "../client";
import type { Artifact, ExportPackCreate, ExportPackOut } from "@/types/exports";
import { paginationParams } from "@/lib/constants";

export const artifactsApi = {
  list: (matterId: string, params?: { limit?: number; offset?: number }) =>
    api.get<Artifact[]>(`/matters/${matterId}/artifacts`, {
      params: paginationParams(params),
    }),

  download: (artifactId: number) => `/artifacts/${artifactId}/download`,

  createExport: (matterId: string, data: ExportPackCreate) =>
    api.post<ExportPackOut>(`/matters/${matterId}/exports`, { body: data }),
};
