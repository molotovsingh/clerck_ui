import type { MatterWorkspaceOut } from "@/types/workspace";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { WorkspaceHeader } from "@/features/lawyer-workspace/workspace-header";
import { WorkspaceSettingsDialog } from "@/features/lawyer-workspace/workspace-settings-dialog";
import { FilingWizard } from "@/features/lawyer-workspace/filing-wizard";
import { ReviewMode } from "@/features/lawyer-workspace/review-mode/review-mode";
import { DraftMode } from "@/features/lawyer-workspace/draft-mode/draft-mode";

interface Props {
  matterId: string;
  workspace: MatterWorkspaceOut;
}

export function FullWorkspaceView({ matterId, workspace }: Props) {
  const { matter, self_access, workflow_state } = workspace;
  const capabilities = workflow_state.capabilities;
  const writeBlocked = self_access.write_blocked_by_handoff_actor;
  const mode = useWorkspaceStore((s) => s.mode);

  return (
    <div className="flex h-full flex-col">
      <WorkspaceHeader
        matterId={matterId}
        matterName={matter.name}
        clientName={matter.client_name}
        matterStatus={matter.status}
        writeBlocked={writeBlocked}
        capabilities={capabilities}
      />

      {mode === "draft" ? (
        <DraftMode matterId={matterId} capabilities={capabilities} />
      ) : (
        <ReviewMode matterId={matterId} capabilities={capabilities} />
      )}

      <WorkspaceSettingsDialog
        matterId={matterId}
        capabilities={capabilities}
      />
      <FilingWizard matterId={matterId} matterStatus={matter.status} />
    </div>
  );
}
