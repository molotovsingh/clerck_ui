import { api } from "../client";
import type { MatterAccess, MatterAccessSelf, MatterAccessGrant } from "@/types/access";
import { DEFAULT_PAGE_LIMIT } from "@/lib/constants";

export const accessApi = {
  list: (matterId: string, params?: { limit?: number; offset?: number }) =>
    api.get<MatterAccess[]>(`/matters/${matterId}/access`, {
      params: { limit: params?.limit ?? DEFAULT_PAGE_LIMIT, offset: params?.offset ?? 0 },
    }),

  getSelf: (matterId: string) =>
    api.get<MatterAccessSelf>(`/matters/${matterId}/access/self`),

  grant: (matterId: string, data: MatterAccessGrant) =>
    api.post<MatterAccess>(`/matters/${matterId}/access`, { body: data }),

  revoke: (matterId: string, actor: string) =>
    api.delete<void>(`/matters/${matterId}/access/${actor}`),
};
