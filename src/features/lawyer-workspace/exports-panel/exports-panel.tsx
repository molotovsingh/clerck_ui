import { useState } from "react";
import { useArtifacts, useCreateExport } from "@/hooks/use-artifacts";
import { ArtifactKind } from "@/types/enums";
import type { MatterCapabilities } from "@/types/access";
import { canPerform } from "@/lib/capability-check";
import { formatLabel } from "@/lib/format-label";
import { downloadUrl } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/loading";
import { EmptyState } from "@/components/common/empty-state";
import { Plus, Package, Download } from "lucide-react";
import { formatDateTime } from "@/lib/format-date";

interface Props {
  matterId: string;
  capabilities?: MatterCapabilities;
}

export function ExportsPanel({ matterId, capabilities }: Props) {
  const { data: artifacts, isLoading } = useArtifacts(matterId);
  const [open, setOpen] = useState(false);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Exports</h3>
        {canPerform(capabilities, "export") && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-3 w-3" />
                Export
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Export</DialogTitle>
                <DialogDescription>Generate an export package</DialogDescription>
              </DialogHeader>
              <CreateExportForm
                matterId={matterId}
                onSuccess={() => setOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!artifacts?.length ? (
        <EmptyState icon={Package} title="No exports yet" />
      ) : (
        <div className="space-y-2">
          {artifacts.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded border p-2 text-sm">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{formatLabel(a.kind)}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDateTime(a.created_at)}
                </p>
              </div>
              <a
                href={downloadUrl(`/artifacts/${a.id}/download`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Download className="h-4 w-4" />
                </Button>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateExportForm({
  matterId,
  onSuccess,
}: {
  matterId: string;
  onSuccess: () => void;
}) {
  const [kind, setKind] = useState<ArtifactKind>(ArtifactKind.SHAREABLE_PACK);
  const [approvedBy, setApprovedBy] = useState("");
  const create = useCreateExport(matterId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create.mutateAsync({
        kind,
        approved_by: approvedBy || undefined,
      });
      onSuccess();
    } catch { /* error displayed via create.error */ }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Export Type</Label>
        <Select value={kind} onValueChange={(v) => setKind(v as ArtifactKind)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[
              ArtifactKind.SHAREABLE_PACK,
              ArtifactKind.COURT_BUNDLE,
              ArtifactKind.LIQUIDTEXT_PACK,
            ].map((k) => (
              <SelectItem key={k} value={k}>
                {formatLabel(k)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Approved By (optional)</Label>
        <Input
          value={approvedBy}
          onChange={(e) => setApprovedBy(e.target.value)}
          placeholder="Partner name"
        />
      </div>
      {create.error && (
        <p className="text-sm text-destructive">{create.error.message}</p>
      )}
      <Button type="submit" className="w-full" disabled={create.isPending}>
        {create.isPending ? "Creating..." : "Create Export"}
      </Button>
    </form>
  );
}
