import type { MatterWorkspaceOut } from "@/types/workspace";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { WorkspaceHeader } from "@/features/workspace/panels/workspace-header";
import { WorkspaceSettingsDialog } from "@/features/workspace/panels/workspace-settings-dialog";
import { FilingWizard } from "@/features/workspace/panels/filing-wizard";
import { ReviewMode } from "@/features/workspace/panels/review-mode/review-mode";
import { DraftMode } from "@/features/workspace/panels/draft-mode/draft-mode";

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
      <FilingWizard matterId={matterId} matterStatus={matter.status} allowedTransitions={workflow_state.allowed_transitions} />
    </div>
  );
}
