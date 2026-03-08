import { useEvidence } from "@/hooks/use-evidence";
import { useClaims } from "@/hooks/use-claims";
import type { SelectedItem } from "./evidence-claims-list";
import { Badge } from "@/components/ui/badge";
import { formatLabel } from "@/lib/format-label";
import { formatRelative } from "@/lib/format-date";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Quote, Link as LinkIcon } from "lucide-react";

interface Props {
  matterId: string;
  selectedItem: SelectedItem | null;
}

export function ReviewDetailPanel({ matterId, selectedItem }: Props) {
  if (!selectedItem) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <div className="text-center">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Select an item to view details</p>
        </div>
      </div>
    );
  }

  if (selectedItem.type === "evidence") {
    return <EvidenceDetail matterId={matterId} evidenceId={selectedItem.id} />;
  }

  return <ClaimDetail matterId={matterId} claimId={selectedItem.id} />;
}

function EvidenceDetail({
  matterId,
  evidenceId,
}: {
  matterId: string;
  evidenceId: number;
}) {
  const { data: evidence } = useEvidence(matterId);
  const { data: claims } = useClaims(matterId);
  const item = evidence?.find((e) => e.id === evidenceId);

  if (!item) return null;

  // Find claims that reference this evidence file
  const relatedClaims = claims?.filter((c) =>
    c.source_refs?.some(
      (ref) =>
        ref.toLowerCase().includes(item.original_name.toLowerCase()) ||
        ref.includes(String(item.id))
    )
  );

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">{item.original_name}</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Type</span>
              <p>
                <Badge variant="outline">{item.suffix}</Badge>
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Size</span>
              <p>{(item.size_bytes / 1024).toFixed(1)} KB</p>
            </div>
            {item.source_relative_path && (
              <div className="col-span-2">
                <span className="text-muted-foreground">Path</span>
                <p className="text-xs font-mono truncate">
                  {item.source_relative_path}
                </p>
              </div>
            )}
            <div className="col-span-2">
              <span className="text-muted-foreground">SHA256</span>
              <p className="text-xs font-mono truncate">{item.sha256}</p>
            </div>
          </div>
        </div>

        {relatedClaims && relatedClaims.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
              <LinkIcon className="h-3.5 w-3.5" />
              Related Claims ({relatedClaims.length})
            </h4>
            <div className="space-y-2">
              {relatedClaims.map((c) => (
                <div key={c.id} className="rounded border p-2 text-sm">
                  <div className="flex items-center gap-2 mb-1">
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
      </div>
    </ScrollArea>
  );
}

function ClaimDetail({
  matterId,
  claimId,
}: {
  matterId: string;
  claimId: number;
}) {
  const { data: claims } = useClaims(matterId);
  const { data: evidence } = useEvidence(matterId);
  const item = claims?.find((c) => c.id === claimId);

  if (!item) return null;

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Quote className="h-5 w-5 text-muted-foreground" />
            <Badge variant="outline">{formatLabel(item.kind)}</Badge>
            <span className="text-xs text-muted-foreground">
              {formatRelative(item.created_at)}
            </span>
          </div>
          <p className="text-sm whitespace-pre-wrap">{item.text}</p>
        </div>

        {item.source_refs?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
              <LinkIcon className="h-3.5 w-3.5" />
              Source References
            </h4>
            <div className="space-y-1">
              {item.source_refs.map((ref, i) => {
                const matchedEvidence = evidence?.find(
                  (e) =>
                    e.original_name.toLowerCase().includes(ref.toLowerCase()) ||
                    ref.includes(String(e.id))
                );
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded border px-2 py-1.5 text-sm"
                  >
                    <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{ref}</span>
                    {matchedEvidence && (
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {matchedEvidence.suffix}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
