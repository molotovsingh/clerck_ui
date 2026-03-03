import { api } from "../client";
import type { Evidence, DuplicateCluster, MatterSearchOut } from "@/types/evidence";
import { DEFAULT_PAGE_LIMIT } from "@/lib/constants";

export const evidenceApi = {
  list: (matterId: string, params?: { limit?: number; offset?: number }) =>
    api.get<Evidence[]>(`/matters/${matterId}/evidence`, {
      params: { limit: params?.limit ?? DEFAULT_PAGE_LIMIT, offset: params?.offset ?? 0 },
    }),

  listDuplicates: (matterId: string, params?: { limit?: number; offset?: number }) =>
    api.get<DuplicateCluster[]>(`/matters/${matterId}/duplicates`, {
      params: { limit: params?.limit ?? DEFAULT_PAGE_LIMIT, offset: params?.offset ?? 0 },
    }),

  search: (matterId: string, q: string, limit?: number) =>
    api.get<MatterSearchOut>(`/matters/${matterId}/search`, {
      params: { q, limit: limit ?? 50 },
    }),
};
