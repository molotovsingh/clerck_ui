import { useCaseLoomStore } from "@/stores/caseloom-store";
import { CaseLoomTabBar } from "./caseloom-tab-bar";
import { CaseLoomBreadcrumb } from "./caseloom-breadcrumb";
import { CaseLoomDocViewer } from "./caseloom-doc-viewer";

interface CaseLoomEditorProps {
  matterId: string;
}

export function CaseLoomEditor({ matterId }: CaseLoomEditorProps) {
  const activeDraftId = useCaseLoomStore((s) => s.activeDraftId);
  const openTabs = useCaseLoomStore((s) => s.openTabs);

  if (openTabs.length === 0 || !activeDraftId) {
    return (
      <div
        className="flex flex-1 flex-col items-center justify-center"
        style={{ background: "var(--cl-bg)" }}
      >
        <div className="text-3xl mb-2" style={{ color: "var(--cl-dim)" }}>
          {"\u25C8"}
        </div>
        <p className="text-sm" style={{ color: "var(--cl-muted)" }}>
          Select a document from the sidebar
        </p>
        <p className="mt-1 text-[11px]" style={{ color: "var(--cl-dim)" }}>
          Open a draft from OUTPUTS to start editing
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-1 flex-col overflow-hidden"
      style={{ background: "var(--cl-bg)" }}
    >
      <CaseLoomTabBar matterId={matterId} />
      <CaseLoomBreadcrumb matterId={matterId} />
      <CaseLoomDocViewer matterId={matterId} draftId={activeDraftId} />
    </div>
  );
}
