import { useMatters } from "@/hooks/use-matters";
import { Link } from "@tanstack/react-router";
import { StatusBadge } from "@/components/common/status-badge";
import { LoadingSpinner } from "@/components/common/loading";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, ArrowRight, Clock } from "lucide-react";
import { formatLabel } from "@/lib/format-label";
import { formatRelative } from "@/lib/format-date";

export function LawyerMatterSelector() {
  const { data: matters, isLoading } = useMatters();
  if (isLoading) return <LoadingSpinner />;
  if (!matters?.length) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No matters yet"
        description="Create a matter from the Matters page first"
      />
    );
  }
  return (
    <div className="space-y-3">
      {matters.map((m) => (
        <Link
          key={m.public_id}
          to="/lawyer/$matterId"
          params={{ matterId: m.public_id }}
          className="group block rounded-lg border p-4 hover:border-primary/30 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{m.name}</p>
                <StatusBadge status={m.status} />
              </div>
              <p className="text-sm text-muted-foreground">{m.client_name}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs font-normal">
              {formatLabel(m.matter_class)}
            </Badge>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelative(m.updated_at)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
