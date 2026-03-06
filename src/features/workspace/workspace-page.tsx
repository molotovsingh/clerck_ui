import { useParams } from "@tanstack/react-router";
import { useWorkspace } from "@/hooks/use-matters";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { MatterStatus } from "@/types/enums";
import { canPerform } from "@/lib/capability-check";
import { LoadingPage } from "@/components/common/loading";
import { ErrorDisplay } from "@/components/common/error-display";
import { IntakeView } from "./intake-view";
import { FullWorkspaceView } from "./full-workspace-view";
import { IdeView } from "./ide-view";

export function WorkspacePage() {
  const { matterId } = useParams({ strict: false }) as { matterId: string };
  const { data: workspace, isLoading, error } = useWorkspace(matterId);
  const mode = useWorkspaceStore((s) => s.mode);

  if (isLoading) return <LoadingPage />;
  if (error) return <ErrorDisplay error={error} />;
  if (!workspace) return <ErrorDisplay error={new Error("Matter not found")} />;

  const { workflow_state } = workspace;
  const capabilities = workflow_state.capabilities;
  const status = workflow_state.matter_status;

  // IDE mode (CaseLoom fullscreen)
  if (mode === "ide") {
    return <IdeView matterId={matterId} workspace={workspace} />;
  }

  // Intake phase — show sequential intake cards
  if (
    status === MatterStatus.INTAKE &&
    canPerform(capabilities, "intake_context_write")
  ) {
    return <IntakeView matterId={matterId} workspace={workspace} />;
  }

  // Full workspace — review/draft modes
  return <FullWorkspaceView matterId={matterId} workspace={workspace} />;
}
