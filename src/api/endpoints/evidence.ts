import { api } from "../client";
import type { Evidence, DuplicateCluster, MatterSearchOut } from "@/types/evidence";
import { paginationParams } from "@/lib/constants";

export const evidenceApi = {
  list: (matterId: string, params?: { limit?: number; offset?: number }) =>
    api.get<Evidence[]>(`/matters/${matterId}/evidence`, {
      params: paginationParams(params),
    }),

  listDuplicates: (matterId: string, params?: { limit?: number; offset?: number }) =>
    api.get<DuplicateCluster[]>(`/matters/${matterId}/duplicates`, {
      params: paginationParams(params),
    }),

  search: (matterId: string, q: string, limit?: number) =>
    api.get<MatterSearchOut>(`/matters/${matterId}/search`, {
      params: { q, limit: limit ?? 50 },
    }),
};
