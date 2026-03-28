import { useState } from "react";
import { useCreateExport } from "@/hooks/use-artifacts";
import { ArtifactKind } from "@/types/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatLabel } from "@/lib/format-label";
import { toast } from "sonner";
import { ArrowLeft, Package } from "lucide-react";

interface Props {
  matterId: string;
  onBack: () => void;
  onNext: () => void;
}

export function ExportStep({ matterId, onBack, onNext }: Props) {
  const [kind, setKind] = useState<ArtifactKind>(ArtifactKind.COURT_BUNDLE);
  const [approvedBy, setApprovedBy] = useState("");
  const create = useCreateExport(matterId);

  const handleExport = async () => {
    try {
      await create.mutateAsync({
        kind,
        approved_by: approvedBy || undefined,
      });
      toast.success("Export created");
      onNext();
    } catch {
      /* error displayed via create.error */
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Step 2: Create Export
        </DialogTitle>
        <DialogDescription>
          Generate an export package for filing
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 my-4">
        <div className="space-y-2">
          <Label>Export Type</Label>
          <Select
            value={kind}
            onValueChange={(v) => setKind(v as ArtifactKind)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                ArtifactKind.COURT_BUNDLE,
                ArtifactKind.SHAREABLE_PACK,
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
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onNext}>
            Skip
          </Button>
          <Button onClick={handleExport} disabled={create.isPending}>
            {create.isPending ? "Creating..." : "Create Export"}
          </Button>
        </div>
      </DialogFooter>
    </>
  );
}
