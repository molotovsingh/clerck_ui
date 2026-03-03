import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { authApi } from "@/api/endpoints/auth";
import { LoadingPage } from "@/components/common/loading";
import { LoginPage } from "@/components/auth/login-page";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { mode, validated, loading, setValidated, setLoading, setBearerToken, setDevHeaders, logout } =
    useAuthStore();

  useEffect(() => {
    if (mode === "none") return;
    if (validated) return;

    setLoading(true);
    authApi
      .me()
      .then((me) => {
        if (mode === "bearer") {
          const token = useAuthStore.getState().token;
          if (token) setBearerToken(token, me.actor, me.role);
        } else if (mode === "dev-headers") {
          setDevHeaders(me.actor, me.role);
        }
        setValidated(true);
      })
      .catch(() => {
        logout();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [mode, validated, setValidated, setLoading, setBearerToken, setDevHeaders, logout]);

  if (loading) return <LoadingPage />;
  if (mode === "none" || !validated) return <LoginPage />;

  return <>{children}</>;
}
