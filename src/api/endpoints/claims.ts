import { api } from "../client";
import type { Claim, ClaimCreate } from "@/types/claims";
import { paginationParams } from "@/lib/constants";

export const claimsApi = {
  list: (matterId: string, params?: { limit?: number; offset?: number }) =>
    api.get<Claim[]>(`/matters/${matterId}/claims`, {
      params: paginationParams(params),
    }),

  create: (matterId: string, data: ClaimCreate) =>
    api.post<Claim>(`/matters/${matterId}/claims`, { body: data }),
};
