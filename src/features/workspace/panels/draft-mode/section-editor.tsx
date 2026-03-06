import { useState } from "react";
import { useDraftSections } from "@/hooks/use-drafts";
import type { MatterCapabilities } from "@/types/access";
import { canPerform } from "@/lib/capability-check";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Edit3,
  Wand2,
  MessageSquare,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";
import { AmendDialog } from "../sections-panel/amend-dialog";
import { RegenerateDialog } from "../sections-panel/regenerate-dialog";
import { CommentsDialog } from "../sections-panel/comments-dialog";

interface Props {
  matterId: string;
  draftId: number | null;
  capabilities?: MatterCapabilities;
}

export function SectionEditor({ matterId, draftId, capabilities }: Props) {
  const selectedSectionKey = useWorkspaceStore((s) => s.selectedSectionKey);
  const setAiDrawerOpen = useWorkspaceStore((s) => s.setAiDrawerOpen);
  const { data: sections } = useDraftSections(matterId, draftId ?? 0);
  const [amendKey, setAmendKey] = useState<string | null>(null);
  const [regenKey, setRegenKey] = useState<string | null>(null);
  const [commentsKey, setCommentsKey] = useState<string | null>(null);

  if (!draftId) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p className="text-sm">Select a draft to begin editing</p>
      </div>
    );
  }

  const section = sections?.find((s) => s.section_key === selectedSectionKey);

  if (!section) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p className="text-sm">Select a section from the sidebar</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Section header with actions */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{section.heading}</h3>
          {section.stale && (
            <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-300">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Stale
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {canPerform(capabilities, "draft_write") && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={() => setAmendKey(section.section_key)}
              >
                <Edit3 className="h-3 w-3" />
                Amend
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={() => setRegenKey(section.section_key)}
              >
                <Wand2 className="h-3 w-3" />
                Rewrite
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => setCommentsKey(section.section_key)}
          >
            <MessageSquare className="h-3 w-3" />
            Comments
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => setAiDrawerOpen(true)}
          >
            <MessageCircle className="h-3 w-3" />
            AI Notes
          </Button>
        </div>
      </div>

      {/* Section content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {section.content}
          </p>
        </div>
      </ScrollArea>

      {/* Source refs footer */}
      {section.source_refs?.length > 0 && (
        <div className="border-t px-4 py-2">
          <div className="flex flex-wrap gap-1">
            <span className="text-xs text-muted-foreground mr-1">Sources:</span>
            {section.source_refs.map((ref, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {ref}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Dialogs */}
      {amendKey && draftId && (
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
      {regenKey && draftId && (
        <RegenerateDialog
          matterId={matterId}
          draftId={draftId}
          sectionKey={regenKey}
          onClose={() => setRegenKey(null)}
        />
      )}
      {commentsKey && draftId && (
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
