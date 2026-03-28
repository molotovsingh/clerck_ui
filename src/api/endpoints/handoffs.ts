import { api } from "../client";
import type {
  HandoffRequest,
  HandoffRequestCreate,
  HandoffRequestResolve,
  HandoffActive,
} from "@/types/handoffs";
import { paginationParams } from "@/lib/constants";

export const handoffsApi = {
  list: (matterId: string, params?: { limit?: number; offset?: number }) =>
    api.get<HandoffRequest[]>(`/matters/${matterId}/handoffs`, {
      params: paginationParams(params),
    }),

  getActive: (matterId: string) =>
    api.get<HandoffActive>(`/matters/${matterId}/handoffs/active`),

  create: (matterId: string, data: HandoffRequestCreate) =>
    api.post<HandoffRequest>(`/matters/${matterId}/handoffs`, { body: data }),

  resolve: (matterId: string, handoffId: number, data: HandoffRequestResolve) =>
    api.patch<HandoffRequest>(
      `/matters/${matterId}/handoffs/${handoffId}`,
      { body: data }
    ),
};
