import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { aiThreadsApi } from "@/api/endpoints/ai-threads";
import { queryKeys } from "@/lib/query-keys";
import type { AiThreadCreate, AiThreadMessageCreate } from "@/types/ai-threads";

export function useAiThreads(
  matterId: string,
  params?: { draft_id?: number; section_key?: string }
) {
  return useQuery({
    queryKey: queryKeys.aiThreads.list(matterId),
    queryFn: () => aiThreadsApi.list(matterId, params),
    enabled: !!matterId,
  });
}

export function useAiThread(threadId: string) {
  return useQuery({
    queryKey: queryKeys.aiThreads.detail(threadId),
    queryFn: () => aiThreadsApi.get(threadId),
    enabled: !!threadId,
  });
}

export function useCreateAiThread(matterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AiThreadCreate) =>
      aiThreadsApi.create(matterId, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.aiThreads.list(matterId) }),
  });
}

export function useAiThreadMessages(threadId: string) {
  return useQuery({
    queryKey: queryKeys.aiThreads.messages(threadId),
    queryFn: () => aiThreadsApi.listMessages(threadId),
    enabled: !!threadId,
  });
}

export function useCreateAiMessage(threadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AiThreadMessageCreate) =>
      aiThreadsApi.createMessage(threadId, data),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: queryKeys.aiThreads.messages(threadId),
      }),
  });
}
