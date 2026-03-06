import { useParams } from "@tanstack/react-router";
import { useMatter } from "@/hooks/use-matters";
import { useAccessSelf } from "@/hooks/use-access";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { LoadingPage } from "@/components/common/loading";
import { ErrorDisplay } from "@/components/common/error-display";
import { WorkspaceHeader } from "./workspace-header";
import { WorkspaceSettingsDialog } from "./workspace-settings-dialog";
import { FilingWizard } from "./filing-wizard";
import { ReviewMode } from "./review-mode/review-mode";
import { DraftMode } from "./draft-mode/draft-mode";

export function LawyerWorkspacePage() {
  const { matterId } = useParams({ strict: false }) as { matterId: string };
  const { data: matter, isLoading, error } = useMatter(matterId);
  const { data: accessSelf } = useAccessSelf(matterId);
  const mode = useWorkspaceStore((s) => s.mode);

  if (isLoading) return <LoadingPage />;
  if (error) return <ErrorDisplay error={error} />;
  if (!matter) return <ErrorDisplay error={new Error("Matter not found")} />;

  const writeBlocked = accessSelf?.write_blocked_by_handoff_actor ?? null;

  return (
    <div className="flex h-full flex-col">
      <WorkspaceHeader
        matterId={matterId}
        matterName={matter.name}
        clientName={matter.client_name}
        matterStatus={matter.status}
        writeBlocked={writeBlocked}
        capabilities={accessSelf?.capabilities}
      />

      {/* Mode content */}
      {mode === "review" ? (
        <ReviewMode
          matterId={matterId}
          capabilities={accessSelf?.capabilities}
        />
      ) : (
        <DraftMode
          matterId={matterId}
          capabilities={accessSelf?.capabilities}
        />
      )}

      {/* Dialogs */}
      <WorkspaceSettingsDialog
        matterId={matterId}
        capabilities={accessSelf?.capabilities}
      />
      <FilingWizard matterId={matterId} matterStatus={matter.status} />
    </div>
  );
}
