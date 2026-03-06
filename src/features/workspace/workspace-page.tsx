import { lazy, Suspense, useEffect } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { useWorkspace } from "@/hooks/use-matters";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { MatterStatus } from "@/types/enums";
import { canPerform } from "@/lib/capability-check";
import { LoadingPage } from "@/components/common/loading";
import { ErrorDisplay } from "@/components/common/error-display";

const IntakeView = lazy(() => import("./intake-view").then(m => ({ default: m.IntakeView })));
const FullWorkspaceView = lazy(() => import("./full-workspace-view").then(m => ({ default: m.FullWorkspaceView })));
const IdeView = lazy(() => import("./ide-view").then(m => ({ default: m.IdeView })));

const routeApi = getRouteApi("/matters/$matterId");

export function WorkspacePage() {
  const { matterId } = routeApi.useParams();
  const { data: workspace, isLoading, error } = useWorkspace(matterId);
  const mode = useWorkspaceStore((s) => s.mode);
  const selectedMatterId = useWorkspaceStore((s) => s.selectedMatterId);
  const setSelectedMatterId = useWorkspaceStore((s) => s.setSelectedMatterId);

  useEffect(() => {
    if (matterId !== selectedMatterId) {
      setSelectedMatterId(matterId);
    }
  }, [matterId, selectedMatterId, setSelectedMatterId]);

  if (isLoading) return <LoadingPage />;
  if (error) return <ErrorDisplay error={error} />;
  if (!workspace) return <ErrorDisplay error={new Error("Matter not found")} />;

  const { workflow_state } = workspace;
  const capabilities = workflow_state.capabilities;
  const status = workflow_state.matter_status;

  // IDE mode (CaseLoom fullscreen)
  if (mode === "ide") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <IdeView matterId={matterId} workspace={workspace} />
      </Suspense>
    );
  }

  // Intake phase — show sequential intake cards
  if (
    status === MatterStatus.INTAKE &&
    canPerform(capabilities, "intake_context_write")
  ) {
    return (
      <Suspense fallback={<LoadingPage />}>
        <IntakeView matterId={matterId} workspace={workspace} />
      </Suspense>
    );
  }

  // Full workspace — review/draft modes
  return (
    <Suspense fallback={<LoadingPage />}>
      <FullWorkspaceView matterId={matterId} workspace={workspace} />
    </Suspense>
  );
}
