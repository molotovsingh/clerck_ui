import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { authApi } from "@/api/endpoints/auth";
import { Role } from "@/types/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Scale, ChevronDown, ChevronUp } from "lucide-react";

export function LoginPage() {
  const [showBearerForm, setShowBearerForm] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Scale className="h-10 w-10 text-primary" />
          <h1 className="text-2xl font-bold">Firmcase-OS</h1>
          <p className="text-sm text-muted-foreground">
            Litigation Evidence Management
          </p>
        </div>
        {showBearerForm ? (
          <>
            <BearerTokenForm />
            <button
              type="button"
              onClick={() => setShowBearerForm(false)}
              className="mt-3 flex w-full items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ChevronUp className="h-3 w-3" />
              Back to sign in
            </button>
          </>
        ) : (
          <>
            <DevHeadersForm />
            <button
              type="button"
              onClick={() => setShowBearerForm(true)}
              className="mt-3 flex w-full items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ChevronDown className="h-3 w-3" />
              Sign in with API token
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function DevHeadersForm() {
  const [actor, setActor] = useState("admin");
  const [role, setRole] = useState<Role>(Role.ADMIN);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setDevHeaders } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Temporarily set headers so the API call can use them
    setDevHeaders(actor, role);

    try {
      await authApi.me();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
      useAuthStore.getState().logout();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your name to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="actor">Your Name</Label>
            <Input
              id="actor"
              value={actor}
              onChange={(e) => setActor(e.target.value)}
              placeholder="e.g. Jane Smith"
              required
            />
          </div>
          {showAdvanced ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="role">Role</Label>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Hide
                </button>
              </div>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Role).map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAdvanced(true)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Advanced options
            </button>
          )}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function BearerTokenForm() {
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setBearerToken, logout } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Temporarily set the token so the API call uses it
    setBearerToken(token, "", Role.ADMIN);

    try {
      const me = await authApi.me();
      setBearerToken(token, me.actor, me.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid token");
      logout();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bearer Token</CardTitle>
        <CardDescription>
          Authenticate with an API token (fc_tok_*)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">API Token</Label>
            <Input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="fc_tok_..."
              required
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verifying..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
