import { useClaims } from "@/hooks/use-claims";
import type { MatterCapabilities } from "@/types/access";
import { canPerform } from "@/lib/capability-check";
import { formatLabel } from "@/lib/format-label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/loading";
import { EmptyState } from "@/components/common/empty-state";
import { FormDialog } from "@/components/common/form-dialog";
import { CreateClaimForm } from "./create-claim-form";
import { Plus, Quote } from "lucide-react";
import { formatRelative } from "@/lib/format-date";

interface Props {
  matterId: string;
  capabilities?: MatterCapabilities;
}

export function ClaimsPanel({ matterId, capabilities }: Props) {
  const { data: claims, isLoading } = useClaims(matterId);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Claims {claims && `(${claims.length})`}
        </h3>
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
          description="Claims are automatically identified from your uploaded evidence"
        />
      ) : (
        <div className="space-y-2">
          {claims.map((c) => (
            <div key={c.id} className="rounded border p-2 text-sm">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {formatLabel(c.kind)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatRelative(c.created_at)}
                </span>
              </div>
              <p>{c.text}</p>
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
