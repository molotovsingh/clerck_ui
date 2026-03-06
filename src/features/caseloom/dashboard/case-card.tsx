// @ts-nocheck — v1 CaseLoom retired, superseded by caseloom-v2
import { Link } from "@tanstack/react-router";
import type { Matter } from "@/types/matters";
import { StatusBadge } from "@/components/common/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatLabel } from "@/lib/format-label";
import { formatRelative } from "@/lib/format-date";
import { ArrowRight, Clock } from "lucide-react";

interface CaseCardProps {
  matter: Matter;
}

export function CaseCard({ matter }: CaseCardProps) {
  return (
    <Link
      to="/caseloom/$matterId"
      params={{ matterId: matter.public_id }}
      className="group block rounded-lg border bg-card p-4 transition-colors hover:border-[#C9A66B]/40 hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold truncate">{matter.name}</p>
            <StatusBadge status={matter.status} />
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {matter.client_name}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        <Badge variant="outline" className="text-xs font-normal">
          {formatLabel(matter.matter_class)}
        </Badge>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatRelative(matter.updated_at)}
        </span>
      </div>
    </Link>
  );
}
