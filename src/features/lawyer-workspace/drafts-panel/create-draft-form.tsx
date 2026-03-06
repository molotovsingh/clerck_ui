import { useState } from "react";
import { useCreateDraft } from "@/hooks/use-drafts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  matterId: string;
  onSuccess: () => void;
}

export function CreateDraftForm({ matterId, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState("pleading");
  const create = useCreateDraft(matterId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create.mutateAsync({ title, doc_type: docType });
      toast.success("Draft created");
      onSuccess();
    } catch { /* error displayed via create.error */ }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Statement of Claim"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Document Type</Label>
        <Input
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          placeholder="pleading"
          required
        />
      </div>
      {create.error && (
        <p className="text-sm text-destructive">{create.error.message}</p>
      )}
      <Button type="submit" className="w-full" disabled={create.isPending}>
        {create.isPending ? "Creating..." : "Create Draft"}
      </Button>
    </form>
  );
}
