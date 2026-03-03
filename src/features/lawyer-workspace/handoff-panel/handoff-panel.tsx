import { useState } from "react";
import {
  useHandoffs,
  useActiveHandoff,
  useCreateHandoff,
  useResolveHandoff,
} from "@/hooks/use-handoffs";
import { HandoffStatus } from "@/types/enums";
import type { MatterCapabilities } from "@/types/access";
import type { HandoffRequest } from "@/types/handoffs";
import { canPerform } from "@/lib/capability-check";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/common/status-badge";
import { LoadingSpinner } from "@/components/common/loading";
import { EmptyState } from "@/components/common/empty-state";
import { Plus, ArrowRightLeft, Check, X } from "lucide-react";
import { formatRelative } from "@/lib/format-date";

interface Props {
  matterId: string;
  capabilities?: MatterCapabilities;
}

export function HandoffPanel({ matterId, capabilities }: Props) {
  const { data: handoffs, isLoading } = useHandoffs(matterId);
  const { data: active } = useActiveHandoff(matterId);
  const [open, setOpen] = useState(false);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-3">
      {active?.active_handoff_id && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Transfer</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>
              Currently being edited by{" "}
              <Badge variant="outline">{active.active_target_actor}</Badge>
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Transfers</h3>
        {canPerform(capabilities, "handoff_write") && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-3 w-3" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Transfer Editing Access</DialogTitle>
                <DialogDescription>
                  Transfer editing access to another user
                </DialogDescription>
              </DialogHeader>
              <CreateHandoffForm
                matterId={matterId}
                onSuccess={() => setOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!handoffs?.length ? (
        <EmptyState icon={ArrowRightLeft} title="No transfers" />
      ) : (
        <div className="space-y-2">
          {handoffs.map((h) => (
            <HandoffRow key={h.id} matterId={matterId} handoff={h} />
          ))}
        </div>
      )}
    </div>
  );
}

function HandoffRow({
  matterId,
  handoff,
}: {
  matterId: string;
  handoff: HandoffRequest;
}) {
  const resolve = useResolveHandoff(matterId, handoff.id);

  return (
    <div className="rounded border p-2 text-sm">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{handoff.requested_by}</span>
          <span className="text-muted-foreground">&rarr;</span>
          <span className="font-medium">{handoff.target_actor}</span>
        </div>
        <StatusBadge status={handoff.status} />
      </div>
      {handoff.note && (
        <p className="text-xs text-muted-foreground mb-1">{handoff.note}</p>
      )}
      <p className="text-xs text-muted-foreground">
        {formatRelative(handoff.created_at)}
      </p>
      {handoff.status === HandoffStatus.PENDING && (
        <div className="flex gap-1 mt-2">
          <Button
            size="sm"
            variant="outline"
            className="text-green-600"
            onClick={() =>
              resolve.mutate({ status: HandoffStatus.ACCEPTED })
            }
            disabled={resolve.isPending}
          >
            <Check className="h-3 w-3" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600"
            onClick={() =>
              resolve.mutate({ status: HandoffStatus.DECLINED })
            }
            disabled={resolve.isPending}
          >
            <X className="h-3 w-3" />
            Decline
          </Button>
        </div>
      )}
      {resolve.error && (
        <p className="mt-1 text-xs text-destructive">{resolve.error.message}</p>
      )}
    </div>
  );
}

function CreateHandoffForm({
  matterId,
  onSuccess,
}: {
  matterId: string;
  onSuccess: () => void;
}) {
  const [targetActor, setTargetActor] = useState("");
  const [note, setNote] = useState("");
  const create = useCreateHandoff(matterId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create.mutateAsync({
        target_actor: targetActor,
        note: note || undefined,
      });
      onSuccess();
    } catch { /* error displayed via create.error */ }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Transfer to</Label>
        <Input
          value={targetActor}
          onChange={(e) => setTargetActor(e.target.value)}
          required
          placeholder="Jane Smith"
        />
      </div>
      <div className="space-y-2">
        <Label>Note (optional)</Label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Please review the latest draft sections..."
          rows={3}
        />
      </div>
      {create.error && (
        <p className="text-sm text-destructive">{create.error.message}</p>
      )}
      <Button type="submit" className="w-full" disabled={create.isPending}>
        {create.isPending ? "Transferring..." : "Transfer Access"}
      </Button>
    </form>
  );
}
