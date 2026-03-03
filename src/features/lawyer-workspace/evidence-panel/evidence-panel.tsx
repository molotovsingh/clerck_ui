import { useState } from "react";
import { useEvidence, useDuplicates, useEvidenceSearch } from "@/hooks/use-evidence";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/loading";
import { EmptyState } from "@/components/common/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Search, Copy } from "lucide-react";

export function EvidencePanel({ matterId }: { matterId: string }) {
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
              className="rounded border p-2 text-sm hover:bg-muted"
            >
              <p className="font-medium">{hit.original_name}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {hit.snippet}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <Tabs defaultValue="files">
          <TabsList className="w-full">
            <TabsTrigger value="files" className="flex-1">
              Files {evidence && `(${evidence.length})`}
            </TabsTrigger>
            <TabsTrigger value="duplicates" className="flex-1">
              Duplicates {duplicates && `(${duplicates.length})`}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="files">
            {isLoading ? (
              <LoadingSpinner />
            ) : !evidence?.length ? (
              <EmptyState
                icon={FileText}
                title="No evidence files"
                description="Upload evidence in Clerk Intake to get started"
              />
            ) : (
              <div className="space-y-1">
                {evidence.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-muted"
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
              </div>
            )}
          </TabsContent>
          <TabsContent value="duplicates">
            {!duplicates?.length ? (
              <EmptyState icon={Copy} title="No duplicates found" />
            ) : (
              <div className="space-y-2">
                {duplicates.map((cluster) => (
                  <div
                    key={cluster.sha256}
                    className="rounded border p-2"
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>{cluster.count} files</span>
                      <span>
                        {(cluster.total_size_bytes / 1024).toFixed(0)}K total
                      </span>
                    </div>
                    {cluster.evidence.map((e) => (
                      <p key={e.id} className="text-sm truncate">
                        {e.original_name}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
