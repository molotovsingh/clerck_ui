import { useMatters } from "@/hooks/use-matters";
import { Link } from "@tanstack/react-router";
import { StatusBadge } from "@/components/common/status-badge";
import { LoadingSpinner } from "@/components/common/loading";
import { EmptyState } from "@/components/common/empty-state";
import { FolderOpen } from "lucide-react";
import { formatLabel } from "@/lib/format-label";

export function ClerkMatterSelector() {
  const { data: matters, isLoading } = useMatters();
  if (isLoading) return <LoadingSpinner />;
  if (!matters?.length) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No matters yet"
        description="Create your first matter above to get started"
      />
    );
  }
  return (
    <div className="space-y-2">
      {matters.map((m) => (
        <Link
          key={m.public_id}
          to="/clerk/$matterId"
          params={{ matterId: m.public_id }}
          className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted transition-colors"
        >
          <div>
            <p className="font-medium">{m.name}</p>
            <p className="text-sm text-muted-foreground">
              {m.client_name}
              <span className="mx-1.5 text-muted-foreground/50">&middot;</span>
              {formatLabel(m.matter_class)}
            </p>
          </div>
          <StatusBadge status={m.status} />
        </Link>
      ))}
    </div>
  );
}
