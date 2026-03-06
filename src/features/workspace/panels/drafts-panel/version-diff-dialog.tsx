import { useState, useEffect } from "react";
import { useDraftVersions, useDraftCompare } from "@/hooks/use-drafts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/common/loading";

interface Props {
  matterId: string;
  draftId: number;
  onClose: () => void;
}

export function VersionDiffDialog({ matterId, draftId, onClose }: Props) {
  const { data: versions } = useDraftVersions(matterId, draftId);
  const maxVersion = versions?.length ? Math.max(...versions.map((v) => v.version_number)) : 0;
  const [fromVersion, setFromVersion] = useState(0);
  const [toVersion, setToVersion] = useState(0);

  useEffect(() => {
    if (maxVersion > 0 && toVersion === 0) {
      setFromVersion(Math.max(1, maxVersion - 1));
      setToVersion(maxVersion);
    }
  }, [maxVersion, toVersion]);

  const { data: diff, isLoading } = useDraftCompare(
    matterId,
    draftId,
    fromVersion,
    toVersion
  );

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Compare Versions</DialogTitle>
          <DialogDescription>
            Compare versions of this draft
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Label>From</Label>
            <Input
              type="number"
              min={1}
              max={maxVersion}
              value={fromVersion}
              onChange={(e) => setFromVersion(Number(e.target.value))}
              className="w-20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label>To</Label>
            <Input
              type="number"
              min={1}
              max={maxVersion}
              value={toVersion}
              onChange={(e) => setToVersion(Number(e.target.value))}
              className="w-20"
            />
          </div>
          {diff && (
            <div className="flex gap-2 text-sm">
              <span className="text-green-600">+{diff.added_lines}</span>
              <span className="text-red-600">-{diff.removed_lines}</span>
            </div>
          )}
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : diff?.unified_diff ? (
          <pre className="rounded bg-muted p-3 text-xs overflow-auto whitespace-pre-wrap font-mono">
            {diff.unified_diff}
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground">No differences found</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
