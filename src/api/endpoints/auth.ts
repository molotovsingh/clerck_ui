import { api } from "../client";
import type {
  AuthMe,
  AuthToken,
  AuthTokenCreate,
  AuthOtpRequest,
  AuthOtpRequestOut,
  AuthOtpVerify,
  AuthOtpVerifyOut,
  AuthPreferencesOut,
  AuthPreferenceUpdate,
  AuthPreferenceOut,
} from "@/types/auth";

export const authApi = {
  me: () => api.get<AuthMe>("/auth/me"),

  listTokens: () => api.get<AuthToken[]>("/auth/tokens"),

  createToken: (data: AuthTokenCreate) =>
    api.post<AuthToken>("/auth/tokens", { body: data }),

  revokeToken: (tokenId: number) =>
    api.delete<void>(`/auth/tokens/${tokenId}`),

  requestOtp: (data: AuthOtpRequest) =>
    api.post<AuthOtpRequestOut>("/auth/otp/request", { body: data }),

  verifyOtp: (data: AuthOtpVerify) =>
    api.post<AuthOtpVerifyOut>("/auth/otp/verify", { body: data }),

  getPreferences: () => api.get<AuthPreferencesOut>("/auth/preferences"),

  updatePreference: (key: string, data: AuthPreferenceUpdate) =>
    api.put<AuthPreferenceOut>(`/auth/preferences/${key}`, { body: data }),
};
