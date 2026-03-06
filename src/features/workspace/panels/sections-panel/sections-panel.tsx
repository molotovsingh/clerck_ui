import { useState } from "react";
import { useDraftSections } from "@/hooks/use-drafts";
import type { MatterCapabilities } from "@/types/access";
import { canPerform } from "@/lib/capability-check";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingSpinner } from "@/components/common/loading";
import { EmptyState } from "@/components/common/empty-state";
import { cn } from "@/lib/cn";
import { FileText, Edit3, Wand2, MessageSquare, AlertTriangle } from "lucide-react";
import { AmendDialog } from "./amend-dialog";
import { RegenerateDialog } from "./regenerate-dialog";
import { CommentsDialog } from "./comments-dialog";

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

      {regenKey && (
        <RegenerateDialog
          matterId={matterId}
          draftId={draftId}
          sectionKey={regenKey}
          onClose={() => setRegenKey(null)}
        />
      )}

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
