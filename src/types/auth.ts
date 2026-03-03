import type { Role } from "./enums";

export interface AuthMe {
  actor: string;
  role: Role;
}

export interface AuthToken {
  id: number;
  actor: string;
  role: Role;
  expires_at: string | null;
  created_at: string;
  revoked_at: string | null;
  token?: string;
}

export interface AuthTokenCreate {
  actor: string;
  role: Role;
}

export interface AuthOtpRequest {
  email: string;
}

export interface AuthOtpRequestOut {
  challenge_id: string;
  expires_at: string;
  otp_debug_code?: string;
}

export interface AuthOtpVerify {
  challenge_id: string;
  code: string;
}

export interface AuthOtpVerifyOut {
  id: number;
  actor: string;
  role: Role;
  created_at: string;
  token: string;
}

export interface AuthPreferencesOut {
  actor: string;
  preferences: Record<string, unknown>;
}

export interface AuthPreferenceUpdate {
  value: unknown;
}

export interface AuthPreferenceOut {
  key: string;
  value: unknown;
  updated_at: string;
}
