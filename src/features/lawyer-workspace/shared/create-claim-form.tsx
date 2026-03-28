import { useState } from "react";
import { useCreateClaim } from "@/hooks/use-claims";
import { ClaimKind } from "@/types/enums";
import { formatLabel } from "@/lib/format-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface CreateClaimFormProps {
  matterId: string;
  onSuccess: () => void;
}

export function CreateClaimForm({ matterId, onSuccess }: CreateClaimFormProps) {
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
      toast.success("Claim added");
      onSuccess();
    } catch {
      /* error displayed via create.error */
    }
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
              <SelectItem key={k} value={k}>
                {formatLabel(k)}
              </SelectItem>
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
