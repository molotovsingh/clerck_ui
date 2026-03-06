import { useState } from "react";
import { useRegenerateSection } from "@/hooks/use-drafts";
import { toast } from "sonner";
import { useAiThreads } from "@/hooks/use-ai-threads";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { Wand2 } from "lucide-react";

interface Props {
  matterId: string;
  draftId: number;
  sectionKey: string;
  onClose: () => void;
}

export function RegenerateDialog({
  matterId,
  draftId,
  sectionKey,
  onClose,
}: Props) {
  const [instruction, setInstruction] = useState("");
  const [changeSummary, setChangeSummary] = useState("");
  const [threadId, setThreadId] = useState<string>("");
  const regen = useRegenerateSection(matterId, draftId, sectionKey);
  const { data: threads } = useAiThreads(matterId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await regen.mutateAsync({
        instruction,
        change_summary: changeSummary,
        ...(threadId ? { thread_public_id: threadId } : {}),
      });
      toast.success("Section rewritten");
      onClose();
    } catch { /* error displayed via regen.error */ }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rewrite Section with AI</DialogTitle>
          <DialogDescription>
            Use AI to rewrite this section's content based on your instruction
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Instruction for AI</Label>
            <Textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              required
              rows={4}
              placeholder="Rewrite to focus on the breach of contract elements..."
            />
          </div>
          <div className="space-y-2">
            <Label>Include Discussion (optional)</Label>
            <Select value={threadId} onValueChange={(v) => setThreadId(v === "none" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {threads?.map((t) => (
                  <SelectItem key={t.thread_public_id} value={t.thread_public_id}>
                    {t.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Include a discussion to give the AI more context
            </p>
          </div>
          <div className="space-y-2">
            <Label>Change Summary</Label>
            <Input
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              required
              placeholder="AI rewrite"
            />
          </div>
          {regen.error && (
            <p className="text-sm text-destructive">{regen.error.message}</p>
          )}
          <Button type="submit" disabled={regen.isPending}>
            <Wand2 className="h-4 w-4" />
            {regen.isPending ? "Rewriting..." : "Rewrite"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
