import { useState } from "react";
import { useEvidence, useDuplicates, useEvidenceSearch } from "@/hooks/use-evidence";
import { useClaims } from "@/hooks/use-claims";
import type { MatterCapabilities } from "@/types/access";
import { canPerform } from "@/lib/capability-check";
import { formatLabel } from "@/lib/format-label";
import { formatRelative } from "@/lib/format-date";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingSpinner } from "@/components/common/loading";
import { EmptyState } from "@/components/common/empty-state";
import { FormDialog } from "@/components/common/form-dialog";
import { CreateClaimForm } from "@/features/workspace/panels/claims-panel/create-claim-form";
import { cn } from "@/lib/cn";
import { FileText, Search, Copy, Quote, Plus } from "lucide-react";

export interface SelectedItem {
  type: "evidence" | "claim";
  id: number;
}

interface Props {
  matterId: string;
  capabilities?: MatterCapabilities;
  selectedItem: SelectedItem | null;
  onSelectItem: (item: SelectedItem | null) => void;
}

export function EvidenceClaimsList({
  matterId,
  capabilities,
  selectedItem,
  onSelectItem,
}: Props) {
  const [view, setView] = useState<"evidence" | "claims">("evidence");

  return (
    <div className="flex h-full flex-col">
      {/* Toggle */}
      <div className="flex items-center gap-1 border-b px-3 py-2">
        <button
          onClick={() => setView("evidence")}
          className={cn(
            "rounded-md px-3 py-1 text-sm font-medium transition-colors",
            view === "evidence"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          Evidence
        </button>
        <button
          onClick={() => setView("claims")}
          className={cn(
            "rounded-md px-3 py-1 text-sm font-medium transition-colors",
            view === "claims"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          Claims
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {view === "evidence" ? (
            <EvidenceList
              matterId={matterId}
              selectedItem={selectedItem}
              onSelectItem={onSelectItem}
            />
          ) : (
            <ClaimsList
              matterId={matterId}
              capabilities={capabilities}
              selectedItem={selectedItem}
              onSelectItem={onSelectItem}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function EvidenceList({
  matterId,
  selectedItem,
  onSelectItem,
}: {
  matterId: string;
  selectedItem: SelectedItem | null;
  onSelectItem: (item: SelectedItem | null) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: evidence, isLoading } = useEvidence(matterId);
  const { data: duplicates } = useDuplicates(matterId);
  const { data: searchResults } = useEvidenceSearch(matterId, searchQuery);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search evidence..."
          className="pl-9"
        />
      </div>

      {searchQuery.length >= 2 && searchResults ? (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            {searchResults.total_hits} hits for "{searchResults.query}"
          </p>
          {searchResults.hits.map((hit) => (
            <div
              key={hit.id}
              className={cn(
                "rounded border p-2 text-sm cursor-pointer hover:bg-muted transition-colors",
                selectedItem?.type === "evidence" &&
                  selectedItem.id === hit.id &&
                  "bg-muted border-primary"
              )}
              onClick={() => onSelectItem({ type: "evidence", id: hit.id })}
            >
              <p className="font-medium">{hit.original_name}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {hit.snippet}
              </p>
            </div>
          ))}
        </div>
      ) : isLoading ? (
        <LoadingSpinner />
      ) : !evidence?.length ? (
        <EmptyState
          icon={FileText}
          title="No evidence files"
          description="Upload evidence in Clerk Intake to get started"
        />
      ) : (
        <div className="space-y-0.5">
          {evidence.map((e) => (
            <div
              key={e.id}
              className={cn(
                "flex items-center justify-between rounded px-2 py-1.5 text-sm cursor-pointer hover:bg-muted transition-colors",
                selectedItem?.type === "evidence" &&
                  selectedItem.id === e.id &&
                  "bg-muted border-l-2 border-l-primary"
              )}
              onClick={() => onSelectItem({ type: "evidence", id: e.id })}
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{e.original_name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className="text-xs">
                  {e.suffix}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {(e.size_bytes / 1024).toFixed(0)}K
                </span>
              </div>
            </div>
          ))}

          {duplicates && duplicates.length > 0 && (
            <div className="mt-3 border-t pt-2">
              <p className="text-xs font-medium text-muted-foreground mb-1 px-2 flex items-center gap-1">
                <Copy className="h-3 w-3" />
                {duplicates.length} duplicate group{duplicates.length > 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ClaimsList({
  matterId,
  capabilities,
  selectedItem,
  onSelectItem,
}: {
  matterId: string;
  capabilities?: MatterCapabilities;
  selectedItem: SelectedItem | null;
  onSelectItem: (item: SelectedItem | null) => void;
}) {
  const { data: claims, isLoading } = useClaims(matterId);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {claims?.length ?? 0} claims
        </span>
        {canPerform(capabilities, "claim_write") && (
          <FormDialog
            title="Create Claim"
            description="Add a new claim to this matter"
            trigger={
              <Button variant="outline" size="sm">
                <Plus className="h-3 w-3" />
                Add
              </Button>
            }
          >
            {(close) => (
              <CreateClaimForm matterId={matterId} onSuccess={close} />
            )}
          </FormDialog>
        )}
      </div>

      {!claims?.length ? (
        <EmptyState
          icon={Quote}
          title="No claims yet"
          description="Claims are automatically identified from evidence"
        />
      ) : (
        <div className="space-y-1.5">
          {claims.map((c) => (
            <div
              key={c.id}
              className={cn(
                "rounded border p-2 text-sm cursor-pointer hover:bg-muted/50 transition-colors",
                selectedItem?.type === "claim" &&
                  selectedItem.id === c.id &&
                  "bg-muted border-primary"
              )}
              onClick={() => onSelectItem({ type: "claim", id: c.id })}
            >
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {formatLabel(c.kind)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatRelative(c.created_at)}
                </span>
              </div>
              <p className="line-clamp-2">{c.text}</p>
              {c.source_refs?.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {c.source_refs.map((ref, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {ref}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
