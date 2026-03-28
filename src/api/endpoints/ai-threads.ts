import { api } from "../client";
import type {
  AiThread,
  AiThreadCreate,
  AiThreadMessage,
  AiThreadMessageCreate,
} from "@/types/ai-threads";
import { paginationParams } from "@/lib/constants";

export const aiThreadsApi = {
  list: (
    matterId: string,
    params?: { draft_id?: number; section_key?: string; limit?: number; offset?: number }
  ) =>
    api.get<AiThread[]>(`/matters/${matterId}/ai-threads`, {
      params: {
        ...params,
        ...paginationParams(params),
      },
    }),

  get: (threadId: string) =>
    api.get<AiThread>(`/ai-threads/${threadId}`),

  create: (matterId: string, data: AiThreadCreate) =>
    api.post<AiThread>(`/matters/${matterId}/ai-threads`, { body: data }),

  listMessages: (
    threadId: string,
    params?: { limit?: number; offset?: number }
  ) =>
    api.get<AiThreadMessage[]>(`/ai-threads/${threadId}/messages`, {
      params: paginationParams(params),
    }),

  createMessage: (threadId: string, data: AiThreadMessageCreate) =>
    api.post<AiThreadMessage>(`/ai-threads/${threadId}/messages`, {
      body: data,
    }),
};
