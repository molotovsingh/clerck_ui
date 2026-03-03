import { api } from "../client";
import type { Claim, ClaimCreate } from "@/types/claims";
import { DEFAULT_PAGE_LIMIT } from "@/lib/constants";

export const claimsApi = {
  list: (matterId: string, params?: { limit?: number; offset?: number }) =>
    api.get<Claim[]>(`/matters/${matterId}/claims`, {
      params: { limit: params?.limit ?? DEFAULT_PAGE_LIMIT, offset: params?.offset ?? 0 },
    }),

  create: (matterId: string, data: ClaimCreate) =>
    api.post<Claim>(`/matters/${matterId}/claims`, { body: data }),
};
