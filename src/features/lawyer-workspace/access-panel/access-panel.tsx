import { useState } from "react";
import { useAccessList, useGrantAccess, useRevokeAccess } from "@/hooks/use-access";
import { MatterAccessRole } from "@/types/enums";
import type { MatterCapabilities } from "@/types/access";
import { canPerform } from "@/lib/capability-check";
import { formatLabel } from "@/lib/format-label";
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
import { LoadingSpinner } from "@/components/common/loading";
import { EmptyState } from "@/components/common/empty-state";
import { FormDialog } from "@/components/common/form-dialog";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { toast } from "sonner";
import { Plus, Users, Trash2 } from "lucide-react";

interface Props {
  matterId: string;
  capabilities?: MatterCapabilities;
}

export function AccessPanel({ matterId, capabilities }: Props) {
  const { data: accessList, isLoading } = useAccessList(matterId);
  const revoke = useRevokeAccess(matterId);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Access Control</h3>
        {canPerform(capabilities, "manage_access") && (
          <FormDialog
            title="Grant Access"
            description="Add a collaborator to this matter"
            trigger={
              <Button variant="outline" size="sm">
                <Plus className="h-3 w-3" />
                Grant
              </Button>
            }
          >
            {(close) => (
              <GrantAccessForm matterId={matterId} onSuccess={close} />
            )}
          </FormDialog>
        )}
      </div>

      {!accessList?.length ? (
        <EmptyState icon={Users} title="No collaborators" />
      ) : (
        <div className="space-y-1">
          {accessList.map((a) => (
            <div
              key={a.actor}
              className="flex items-center justify-between rounded border px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{a.actor}</span>
                <Badge variant="secondary">{formatLabel(a.role)}</Badge>
              </div>
              {canPerform(capabilities, "manage_access") && (
                <ConfirmDialog
                  title="Revoke Access"
                  description={`Remove "${a.actor}" from this matter? They will immediately lose all access and any unsaved work may be lost.`}
                  confirmLabel="Revoke Access"
                  isPending={revoke.isPending}
                  onConfirm={() => revoke.mutate(a.actor, { onSuccess: () => toast.success("Access revoked") })}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  }
                />
              )}
            </div>
          ))}
          {revoke.error && (
            <p className="text-xs text-destructive px-3">{revoke.error.message}</p>
          )}
        </div>
      )}
    </div>
  );
}

function GrantAccessForm({
  matterId,
  onSuccess,
}: {
  matterId: string;
  onSuccess: () => void;
}) {
  const [actor, setActor] = useState("");
  const [role, setRole] = useState<MatterAccessRole>(
    MatterAccessRole.REVIEWER
  );
  const grant = useGrantAccess(matterId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await grant.mutateAsync({ actor, role });
      toast.success("Access granted");
      onSuccess();
    } catch { /* error displayed via grant.error */ }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          value={actor}
          onChange={(e) => setActor(e.target.value)}
          required
          placeholder="Jane Smith"
        />
      </div>
      <div className="space-y-2">
        <Label>Role</Label>
        <Select
          value={role}
          onValueChange={(v) => setRole(v as MatterAccessRole)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(MatterAccessRole).map((r) => (
              <SelectItem key={r} value={r}>
                {formatLabel(r)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {grant.error && (
        <p className="text-sm text-destructive">{grant.error.message}</p>
      )}
      <Button type="submit" className="w-full" disabled={grant.isPending}>
        {grant.isPending ? "Granting..." : "Grant Access"}
      </Button>
    </form>
  );
}
