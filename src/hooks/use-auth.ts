import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/endpoints/auth";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/stores/auth-store";
import type { AuthTokenCreate } from "@/types/auth";

export function useAuthMe() {
  const store = useAuthStore();
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.me,
    enabled: store.mode !== "none",
    retry: false,
  });
}

export function useAuthTokens() {
  return useQuery({
    queryKey: queryKeys.auth.tokens,
    queryFn: authApi.listTokens,
  });
}

export function useCreateToken() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AuthTokenCreate) => authApi.createToken(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.auth.tokens }),
  });
}

export function useRevokeToken() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tokenId: number) => authApi.revokeToken(tokenId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.auth.tokens }),
  });
}

export function useAuthPreferences() {
  return useQuery({
    queryKey: queryKeys.auth.preferences,
    queryFn: authApi.getPreferences,
  });
}
