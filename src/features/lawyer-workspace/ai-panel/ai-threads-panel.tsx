import { useState } from "react";
import {
  useAiThreads,
  useCreateAiThread,
  useAiThreadMessages,
  useCreateAiMessage,
} from "@/hooks/use-ai-threads";
import { AiMessageRole } from "@/types/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
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
import { Plus, MessageCircle, ArrowLeft, Send, Info } from "lucide-react";
import { formatRelative } from "@/lib/format-date";
import { formatLabel } from "@/lib/format-label";
import { cn } from "@/lib/cn";

const MESSAGE_ROLE_LABELS: Record<string, string> = {
  [AiMessageRole.USER]: "You",
  [AiMessageRole.ASSISTANT]: "AI",
  [AiMessageRole.SYSTEM]: "System",
};

export function AiThreadsPanel({ matterId }: { matterId: string }) {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  if (selectedThreadId) {
    return (
      <ThreadMessagesView
        matterId={matterId}
        threadId={selectedThreadId}
        onBack={() => setSelectedThreadId(null)}
      />
    );
  }

  return (
    <ThreadListView
      matterId={matterId}
      onSelectThread={setSelectedThreadId}
    />
  );
}

function ThreadListView({
  matterId,
  onSelectThread,
}: {
  matterId: string;
  onSelectThread: (id: string) => void;
}) {
  const { data: threads, isLoading } = useAiThreads(matterId);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">AI Notes</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-3 w-3" />
              New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start a Discussion</DialogTitle>
              <DialogDescription>Start a discussion to coordinate with collaborators</DialogDescription>
            </DialogHeader>
            <CreateThreadForm
              matterId={matterId}
              onSuccess={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded border border-blue-200 bg-blue-50 p-2 text-xs text-blue-800">
        <div className="flex items-start gap-1.5">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <p>
            Use discussions to coordinate with your team. AI-generated
            content appears in your drafts.
          </p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : !threads?.length ? (
        <EmptyState icon={MessageCircle} title="No discussions yet" description="Start a discussion to coordinate with collaborators" />
      ) : (
        <div className="space-y-1">
          {threads.map((t) => (
            <div
              key={t.thread_public_id}
              className="flex items-center justify-between rounded px-2 py-2 text-sm cursor-pointer hover:bg-muted"
              onClick={() => onSelectThread(t.thread_public_id)}
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{t.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{t.created_by}</span>
                  <span>{formatRelative(t.created_at)}</span>
                </div>
              </div>
              {t.section_key && (
                <Badge variant="outline" className="text-xs shrink-0">
                  {formatLabel(t.section_key)}
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ThreadMessagesView({
  threadId,
  onBack,
}: {
  matterId: string;
  threadId: string;
  onBack: () => void;
}) {
  const { data: messages, isLoading } = useAiThreadMessages(threadId);
  const [content, setContent] = useState("");
  const create = useCreateAiMessage(threadId);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await create.mutateAsync({
        role: AiMessageRole.USER,
        content: content.trim(),
      });
      setContent("");
    } catch { /* error displayed via create.error */ }
  };

  const hasMessages = messages && messages.length > 0;
  const hasOnlyUserMessages =
    hasMessages && messages.every((m) => m.role === AiMessageRole.USER);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-2 py-2 border-b">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-sm font-semibold">Discussion</h3>
        <Badge variant="outline" className="ml-auto text-xs">
          {threadId.slice(0, 8)}
        </Badge>
      </div>

      <ScrollArea className="flex-1 px-2">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-3 py-2">
            {!hasMessages && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No messages yet</p>
                <p className="text-xs mt-1">
                  Add notes or instructions, then include this discussion when rewriting a section
                </p>
              </div>
            )}
            {messages?.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "rounded-lg p-3 text-sm",
                  m.role === AiMessageRole.USER
                    ? "bg-primary/10 ml-4"
                    : m.role === AiMessageRole.ASSISTANT
                      ? "bg-muted mr-4"
                      : "bg-yellow-50 border border-yellow-200"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {MESSAGE_ROLE_LABELS[m.role] ?? formatLabel(m.role)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {m.actor} &middot; {formatRelative(m.created_at)}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            ))}
            {hasOnlyUserMessages && (
              <div className="rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                <div className="flex items-start gap-1.5">
                  <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <p>
                    Discussions are stored for reference — AI doesn't reply here automatically.
                    To get AI-generated content, use the <strong>rewrite</strong>{" "}
                    button on a draft section and include this discussion for context.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {create.error && (
        <p className="px-2 text-xs text-destructive">{create.error.message}</p>
      )}
      <form onSubmit={handleSend} className="flex gap-2 border-t p-2">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a note or instruction..."
        />
        <Button type="submit" size="icon" disabled={create.isPending || !content.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

function CreateThreadForm({
  matterId,
  onSuccess,
}: {
  matterId: string;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const create = useCreateAiThread(matterId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create.mutateAsync({ title });
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
          placeholder="Discuss section approach"
          required
        />
      </div>
      {create.error && (
        <p className="text-sm text-destructive">{create.error.message}</p>
      )}
      <Button type="submit" className="w-full" disabled={create.isPending}>
        {create.isPending ? "Creating..." : "Start Discussion"}
      </Button>
    </form>
  );
}
