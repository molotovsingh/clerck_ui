import { useState } from "react";
import { useClaims, useCreateClaim } from "@/hooks/use-claims";
import { ClaimKind } from "@/types/enums";
import type { MatterCapabilities } from "@/types/access";
import { canPerform } from "@/lib/capability-check";
import { formatLabel } from "@/lib/format-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { EmptyState } from "@/components/common/empty-state";
import { Plus, Quote } from "lucide-react";
import { formatRelative } from "@/lib/format-date";

interface Props {
  matterId: string;
  capabilities?: MatterCapabilities;
}

export function ClaimsPanel({ matterId, capabilities }: Props) {
  const { data: claims, isLoading } = useClaims(matterId);
  const [open, setOpen] = useState(false);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Claims {claims && `(${claims.length})`}
        </h3>
        {canPerform(capabilities, "claim_write") && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Claim</DialogTitle>
                <DialogDescription>Add a new claim to this matter</DialogDescription>
              </DialogHeader>
              <CreateClaimForm
                matterId={matterId}
                onSuccess={() => setOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!claims?.length ? (
        <EmptyState
          icon={Quote}
          title="No claims yet"
          description="Claims are automatically identified from your uploaded evidence"
        />
      ) : (
        <div className="space-y-2">
          {claims.map((c) => (
            <div key={c.id} className="rounded border p-2 text-sm">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {formatLabel(c.kind)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatRelative(c.created_at)}
                </span>
              </div>
              <p>{c.text}</p>
              {c.source_refs?.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {c.source_refs.map((ref, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {ref}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateClaimForm({
  matterId,
  onSuccess,
}: {
  matterId: string;
  onSuccess: () => void;
}) {
  const [text, setText] = useState("");
  const [kind, setKind] = useState<ClaimKind>(ClaimKind.QUOTE);
  const [sourceRefs, setSourceRefs] = useState("");
  const create = useCreateClaim(matterId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create.mutateAsync({
        text,
        kind,
        source_refs: sourceRefs
          ? sourceRefs.split(",").map((s) => s.trim())
          : [],
      });
      onSuccess();
    } catch { /* error displayed via create.error */ }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Claim Text</Label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label>Kind</Label>
        <Select value={kind} onValueChange={(v) => setKind(v as ClaimKind)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(ClaimKind).map((k) => (
              <SelectItem key={k} value={k}>{formatLabel(k)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Evidence References</Label>
        <Input
          value={sourceRefs}
          onChange={(e) => setSourceRefs(e.target.value)}
          placeholder="e.g. contract.pdf, page 3"
        />
      </div>
      {create.error && (
        <p className="text-sm text-destructive">{create.error.message}</p>
      )}
      <Button type="submit" className="w-full" disabled={create.isPending}>
        {create.isPending ? "Creating..." : "Create Claim"}
      </Button>
    </form>
  );
}
