import { useState } from "react";
import { useEvidence, useDuplicates, useEvidenceSearch } from "@/hooks/use-evidence";
import { useClaims, useCreateClaim } from "@/hooks/use-claims";
import { ClaimKind } from "@/types/enums";
import type { MatterCapabilities } from "@/types/access";
import { canPerform } from "@/lib/capability-check";
import { formatLabel } from "@/lib/format-label";
import { formatRelative } from "@/lib/format-date";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingSpinner } from "@/components/common/loading";
import { EmptyState } from "@/components/common/empty-state";
import { FormDialog } from "@/components/common/form-dialog";
import { cn } from "@/lib/cn";
import { FileText, Search, Copy, Quote, Plus } from "lucide-react";
import { toast } from "sonner";

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

function CreateClaimForm({
  matterId,
  onSuccess,
}: {
  matterId: string;
  onSuccess: () => void;
}) {
  const [text, setText] = useState("");
  const [kind, setKind] = useState<ClaimKind>(ClaimKind.QUOTE);
  const [sourceRefs, setSourceRefs] = useState("");
  const create = useCreateClaim(matterId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create.mutateAsync({
        text,
        kind,
        source_refs: sourceRefs
          ? sourceRefs.split(",").map((s) => s.trim())
          : [],
      });
      toast.success("Claim added");
      onSuccess();
    } catch {
      /* error displayed via create.error */
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Claim Text</Label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label>Kind</Label>
        <Select value={kind} onValueChange={(v) => setKind(v as ClaimKind)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(ClaimKind).map((k) => (
              <SelectItem key={k} value={k}>
                {formatLabel(k)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Evidence References</Label>
        <Input
          value={sourceRefs}
          onChange={(e) => setSourceRefs(e.target.value)}
          placeholder="e.g. contract.pdf, page 3"
        />
      </div>
      {create.error && (
        <p className="text-sm text-destructive">{create.error.message}</p>
      )}
      <Button type="submit" className="w-full" disabled={create.isPending}>
        {create.isPending ? "Creating..." : "Create Claim"}
      </Button>
    </form>
  );
}
