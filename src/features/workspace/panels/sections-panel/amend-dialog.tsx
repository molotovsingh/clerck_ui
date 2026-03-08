import { useState } from "react";
import { useAmendSection } from "@/hooks/use-drafts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Props {
  matterId: string;
  draftId: number;
  sectionKey: string;
  currentContent: string;
  onClose: () => void;
}

export function AmendDialog({
  matterId,
  draftId,
  sectionKey,
  currentContent,
  onClose,
}: Props) {
  const [content, setContent] = useState(currentContent);
  const [changeSummary, setChangeSummary] = useState("");
  const amend = useAmendSection(matterId, draftId, sectionKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await amend.mutateAsync({
        content,
        change_summary: changeSummary,
      });
      toast.success("Section amended");
      onClose();
    } catch { /* error displayed via amend.error */ }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Amend Section: {sectionKey}</DialogTitle>
          <DialogDescription>Edit the section content directly</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>Change Summary</Label>
            <Input
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              required
              placeholder="Describe your changes"
            />
          </div>
          {amend.error && (
            <p className="text-sm text-destructive">{amend.error.message}</p>
          )}
          <Button type="submit" disabled={amend.isPending}>
            {amend.isPending ? "Saving..." : "Save Amendment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
