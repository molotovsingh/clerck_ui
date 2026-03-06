import { useDraftSections } from "@/hooks/use-drafts";
import { useEvidence } from "@/hooks/use-evidence";
import { useClaims } from "@/hooks/use-claims";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatLabel } from "@/lib/format-label";
import { FileText, Quote, Link as LinkIcon } from "lucide-react";

interface Props {
  matterId: string;
  draftId: number | null;
}

export function SectionContextSidebar({ matterId, draftId }: Props) {
  const selectedSectionKey = useWorkspaceStore((s) => s.selectedSectionKey);
  const { data: sections } = useDraftSections(matterId, draftId ?? 0);
  const { data: evidence } = useEvidence(matterId);
  const { data: claims } = useClaims(matterId);

  const section = sections?.find((s) => s.section_key === selectedSectionKey);

  if (!section) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground p-4">
        <p className="text-sm text-center">
          Select a section to see its source references
        </p>
      </div>
    );
  }

  const sourceRefs = section.source_refs ?? [];

  // Match source refs to evidence items
  const matchedEvidence = evidence?.filter((e) =>
    sourceRefs.some(
      (ref) =>
        ref.toLowerCase().includes(e.original_name.toLowerCase()) ||
        ref.includes(String(e.id))
    )
  );

  // Match source refs to claims
  const matchedClaims = claims?.filter((c) =>
    sourceRefs.some(
      (ref) =>
        ref.includes(String(c.id)) ||
        c.source_refs?.some((sr) => sourceRefs.includes(sr))
    )
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-3 py-2">
        <h4 className="text-sm font-semibold flex items-center gap-1.5">
          <LinkIcon className="h-3.5 w-3.5" />
          Context
        </h4>
        <p className="text-xs text-muted-foreground">
          Sources for "{section.heading}"
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Raw source refs */}
          {sourceRefs.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                References ({sourceRefs.length})
              </p>
              <div className="space-y-1">
                {sourceRefs.map((ref, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded border px-2 py-1.5 text-xs"
                  >
                    <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="truncate">{ref}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched evidence */}
          {matchedEvidence && matchedEvidence.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                Evidence Files ({matchedEvidence.length})
              </p>
              <div className="space-y-1">
                {matchedEvidence.map((e) => (
                  <div
                    key={e.id}
                    className="rounded border p-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate font-medium">
                        {e.original_name}
                      </span>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {e.suffix}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground">
                      {(e.size_bytes / 1024).toFixed(0)} KB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched claims */}
          {matchedClaims && matchedClaims.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                Related Claims ({matchedClaims.length})
              </p>
              <div className="space-y-1.5">
                {matchedClaims.map((c) => (
                  <div key={c.id} className="rounded border p-2 text-xs">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Quote className="h-3 w-3 text-muted-foreground shrink-0" />
                      <Badge variant="outline" className="text-xs">
                        {formatLabel(c.kind)}
                      </Badge>
                    </div>
                    <p className="line-clamp-3">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sourceRefs.length === 0 && (
            <div className="text-center text-xs text-muted-foreground py-8">
              No source references for this section
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
