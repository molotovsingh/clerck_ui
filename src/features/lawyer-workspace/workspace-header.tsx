import { Link } from "@tanstack/react-router";
import type { MatterCapabilities } from "@/types/access";
import type { MatterStatus } from "@/types/enums";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { StatusBadge } from "@/components/common/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkspaceStatusLine } from "./workspace-status-line";
import { WorkspaceJobsIndicator } from "./workspace-jobs-indicator";
import { ArrowLeft, AlertCircle, Settings, Eye, PenTool, Monitor } from "lucide-react";
import { canPerform } from "@/lib/capability-check";
import { cn } from "@/lib/cn";

interface Props {
  matterId: string;
  matterName: string;
  clientName: string;
  matterStatus: MatterStatus;
  writeBlocked: string | null;
  capabilities?: MatterCapabilities;
}

export function WorkspaceHeader({
  matterId,
  matterName,
  clientName,
  matterStatus,
  writeBlocked,
  capabilities,
}: Props) {
  const mode = useWorkspaceStore((s) => s.mode);
  const setMode = useWorkspaceStore((s) => s.setMode);
  const openSettings = useWorkspaceStore((s) => s.openSettings);

  return (
    <div className="border-b">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left: nav + matter info */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
          <h2 className="font-semibold">{matterName}</h2>
          <span className="text-sm text-muted-foreground">{clientName}</span>
          <StatusBadge status={matterStatus} />
        </div>

        {/* Right: status line + jobs + settings */}
        <div className="flex items-center gap-2">
          <WorkspaceStatusLine matterId={matterId} />
          <WorkspaceJobsIndicator matterId={matterId} capabilities={capabilities} />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => openSettings()}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Handoff banner */}
      {writeBlocked && (
        <div className="flex items-center gap-2 border-t bg-yellow-50 px-4 py-1.5 text-sm text-yellow-800">
          <AlertCircle className="h-4 w-4" />
          Editing locked — <Badge variant="outline">{writeBlocked}</Badge> is working on this
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex items-center gap-1 border-t px-4 py-1">
        <ModeButton
          active={mode === "review"}
          onClick={() => setMode("review")}
          icon={<Eye className="h-3.5 w-3.5" />}
          label="Review"
        />
        <ModeButton
          active={mode === "draft"}
          onClick={() => setMode("draft")}
          icon={<PenTool className="h-3.5 w-3.5" />}
          label="Draft"
        />
        {canPerform(capabilities, "draft_read") && (
          <ModeButton
            active={mode === "ide"}
            onClick={() => setMode("ide")}
            icon={<Monitor className="h-3.5 w-3.5" />}
            label="IDE"
          />
        )}
      </div>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
