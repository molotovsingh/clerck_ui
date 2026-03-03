import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/types/enums";
import { AUTH_STORAGE_KEY } from "@/lib/constants";

export type AuthMode = "dev-headers" | "bearer" | "none";

interface AuthState {
  mode: AuthMode;
  actor: string | null;
  role: Role | null;
  token: string | null;
  validated: boolean;
  loading: boolean;

  setDevHeaders: (actor: string, role: Role) => void;
  setBearerToken: (token: string, actor: string, role: Role) => void;
  setValidated: (validated: boolean) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      mode: "none",
      actor: null,
      role: null,
      token: null,
      validated: false,
      loading: false,

      setDevHeaders: (actor, role) =>
        set({ mode: "dev-headers", actor, role, token: null, validated: true }),

      setBearerToken: (token, actor, role) =>
        set({ mode: "bearer", token, actor, role, validated: true }),

      setValidated: (validated) => set({ validated }),
      setLoading: (loading) => set({ loading }),

      logout: () =>
        set({
          mode: "none",
          actor: null,
          role: null,
          token: null,
          validated: false,
        }),

      isAuthenticated: () => {
        const state = get();
        return state.validated && state.actor !== null;
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({
        mode: state.mode,
        actor: state.actor,
        role: state.role,
        token: state.token,
      }),
    }
  )
);
