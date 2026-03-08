import { useState } from "react";
import { useSectionComments, useCreateSectionComment } from "@/hooks/use-drafts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/common/loading";
import { formatRelative } from "@/lib/format-date";

interface Props {
  matterId: string;
  draftId: number;
  sectionKey: string;
  onClose: () => void;
}

export function CommentsDialog({
  matterId,
  draftId,
  sectionKey,
  onClose,
}: Props) {
  const { data: comments, isLoading } = useSectionComments(
    matterId,
    draftId,
    sectionKey
  );
  const [content, setContent] = useState("");
  const create = useCreateSectionComment(matterId, draftId, sectionKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create.mutateAsync({ content });
      toast.success("Comment posted");
      setContent("");
    } catch { /* error displayed via create.error */ }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Comments: {sectionKey}</DialogTitle>
          <DialogDescription>Discussion on this section</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[300px]">
          {isLoading ? (
            <LoadingSpinner />
          ) : !comments?.length ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No comments yet
            </p>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="rounded border p-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{c.actor}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelative(c.created_at)}
                    </span>
                  </div>
                  <p className="text-sm">{c.content}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment..."
            required
          />
          <Button type="submit" disabled={create.isPending} size="sm">
            Post
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
