import { useState } from "react";
import { useAuthTokens, useCreateToken, useRevokeToken } from "@/hooks/use-auth";
import { Role } from "@/types/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/common/loading";
import { ErrorDisplay } from "@/components/common/error-display";
import { EmptyState } from "@/components/common/empty-state";
import { formatDateTime } from "@/lib/format-date";
import { formatLabel } from "@/lib/format-label";
import { Plus, Key, Trash2, Copy } from "lucide-react";

export function TokenManager() {
  const { data: tokens, isLoading, error, refetch } = useAuthTokens();
  const [open, setOpen] = useState(false);
  const [createdToken, setCreatedToken] = useState<string | null>(null);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} onRetry={refetch} />;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          API Tokens {tokens && `(${tokens.length})`}
        </h2>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setCreatedToken(null); }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New Token
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create API Token</DialogTitle>
              <DialogDescription>
                Create a new API token for authentication
              </DialogDescription>
            </DialogHeader>
            {createdToken ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Token created. Copy it now — you won't see it again.
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-muted p-2 text-xs break-all">
                    {createdToken}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigator.clipboard.writeText(createdToken)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Button className="w-full" onClick={() => { setOpen(false); setCreatedToken(null); }}>
                  Done
                </Button>
              </div>
            ) : (
              <CreateTokenForm
                onSuccess={(token) => setCreatedToken(token)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {!tokens?.length ? (
        <EmptyState
          icon={Key}
          title="No tokens yet"
          description="Create an API token to use bearer auth"
        />
      ) : (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((t) => (
                <TokenRow key={t.id} token={t} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TokenRow({ token }: { token: { id: number; actor: string; role: Role; created_at: string; revoked_at: string | null } }) {
  const revoke = useRevokeToken();

  return (
    <tr className="border-b last:border-0 hover:bg-muted/30">
      <td className="px-4 py-3 text-sm font-mono">{token.id}</td>
      <td className="px-4 py-3 text-sm">{token.actor}</td>
      <td className="px-4 py-3">
        <Badge variant="secondary">{formatLabel(token.role)}</Badge>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatDateTime(token.created_at)}
      </td>
      <td className="px-4 py-3">
        {token.revoked_at ? (
          <Badge variant="destructive">Revoked</Badge>
        ) : (
          <Badge variant="secondary">Active</Badge>
        )}
      </td>
      <td className="px-4 py-3">
        {!token.revoked_at && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => revoke.mutate(token.id)}
            disabled={revoke.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
        {revoke.error && (
          <span className="text-xs text-destructive">Failed</span>
        )}
      </td>
    </tr>
  );
}

function CreateTokenForm({ onSuccess }: { onSuccess: (token: string) => void }) {
  const [actor, setActor] = useState("");
  const [role, setRole] = useState<Role>(Role.RECORDS_OWNER);
  const createToken = useCreateToken();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createToken.mutateAsync({ actor, role });
      if (result.token) onSuccess(result.token);
    } catch { /* error displayed via createToken.error */ }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          value={actor}
          onChange={(e) => setActor(e.target.value)}
          placeholder="Jane Smith"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Role</Label>
        <Select value={role} onValueChange={(v) => setRole(v as Role)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(Role).map((r) => (
              <SelectItem key={r} value={r}>{formatLabel(r)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {createToken.error && (
        <p className="text-sm text-destructive">{createToken.error.message}</p>
      )}
      <Button type="submit" className="w-full" disabled={createToken.isPending}>
        {createToken.isPending ? "Creating..." : "Create Token"}
      </Button>
    </form>
  );
}
