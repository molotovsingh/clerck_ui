import { useState } from "react";
import {
  useDraftSections,
  useAmendSection,
  useRegenerateSection,
  useSectionComments,
  useCreateSectionComment,
} from "@/hooks/use-drafts";
import { useAiThreads } from "@/hooks/use-ai-threads";
import type { MatterCapabilities } from "@/types/access";
import { canPerform } from "@/lib/capability-check";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { LoadingSpinner } from "@/components/common/loading";
import { EmptyState } from "@/components/common/empty-state";
import { cn } from "@/lib/cn";
import {
  FileText,
  Edit3,
  Wand2,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { formatRelative } from "@/lib/format-date";

interface Props {
  matterId: string;
  draftId: number;
  selectedSectionKey: string | null;
  onSelectSection: (key: string | null) => void;
  capabilities?: MatterCapabilities;
}

export function SectionsPanel({
  matterId,
  draftId,
  selectedSectionKey,
  onSelectSection,
  capabilities,
}: Props) {
  const { data: sections, isLoading } = useDraftSections(matterId, draftId);
  const [amendKey, setAmendKey] = useState<string | null>(null);
  const [regenKey, setRegenKey] = useState<string | null>(null);
  const [commentsKey, setCommentsKey] = useState<string | null>(null);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-t">
        <h3 className="text-sm font-semibold">Sections</h3>
      </div>

      {!sections?.length ? (
        <EmptyState icon={FileText} title="No sections" />
      ) : (
        <ScrollArea className="flex-1">
          <div className="space-y-2 px-2 pb-2">
            {sections
              .sort((a, b) => a.order_index - b.order_index)
              .map((s) => (
                <div
                  key={s.section_key}
                  className={cn(
                    "rounded border p-2 text-sm cursor-pointer hover:bg-muted/50 transition-colors",
                    selectedSectionKey === s.section_key && "bg-muted border-primary",
                    s.stale && "border-yellow-300"
                  )}
                  onClick={() => onSelectSection(s.section_key)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{s.heading}</span>
                      {s.stale && (
                        <AlertTriangle className="h-3 w-3 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {canPerform(capabilities, "draft_write") && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAmendKey(s.section_key);
                            }}
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRegenKey(s.section_key);
                            }}
                          >
                            <Wand2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCommentsKey(s.section_key);
                        }}
                      >
                        <MessageSquare className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                    {s.content}
                  </p>
                  {s.source_refs?.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {s.source_refs.map((ref, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {ref}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </ScrollArea>
      )}

      {/* Amend Dialog */}
      {amendKey && (
        <AmendDialog
          matterId={matterId}
          draftId={draftId}
          sectionKey={amendKey}
          currentContent={
            sections?.find((s) => s.section_key === amendKey)?.content ?? ""
          }
          onClose={() => setAmendKey(null)}
        />
      )}

      {/* Regenerate Dialog (AI) */}
      {regenKey && (
        <RegenerateDialog
          matterId={matterId}
          draftId={draftId}
          sectionKey={regenKey}
          onClose={() => setRegenKey(null)}
        />
      )}

      {/* Comments Dialog */}
      {commentsKey && (
        <CommentsDialog
          matterId={matterId}
          draftId={draftId}
          sectionKey={commentsKey}
          onClose={() => setCommentsKey(null)}
        />
      )}
    </div>
  );
}

function AmendDialog({
  matterId,
  draftId,
  sectionKey,
  currentContent,
  onClose,
}: {
  matterId: string;
  draftId: number;
  sectionKey: string;
  currentContent: string;
  onClose: () => void;
}) {
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

function RegenerateDialog({
  matterId,
  draftId,
  sectionKey,
  onClose,
}: {
  matterId: string;
  draftId: number;
  sectionKey: string;
  onClose: () => void;
}) {
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

function CommentsDialog({
  matterId,
  draftId,
  sectionKey,
  onClose,
}: {
  matterId: string;
  draftId: number;
  sectionKey: string;
  onClose: () => void;
}) {
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
