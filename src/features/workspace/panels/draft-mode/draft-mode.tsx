import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";
import type { MatterCapabilities } from "@/types/access";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { DraftToc } from "./draft-toc";
import { SectionEditor } from "./section-editor";
import { SectionContextSidebar } from "./section-context-sidebar";
import { AiDrawer } from "./ai-drawer";

interface Props {
  matterId: string;
  capabilities?: MatterCapabilities;
}

export function DraftMode({ matterId, capabilities }: Props) {
  const selectedDraftId = useWorkspaceStore((s) => s.selectedDraftId);

  return (
    <>
      <PanelGroup orientation="horizontal" className="flex-1">
        <Panel defaultSize={20} minSize={15}>
          <DraftToc matterId={matterId} capabilities={capabilities} />
        </Panel>
        <PanelResizeHandle className="w-1 bg-border hover:bg-primary/20 transition-colors" />
        <Panel defaultSize={55} minSize={30}>
          <SectionEditor
            matterId={matterId}
            draftId={selectedDraftId}
            capabilities={capabilities}
          />
        </Panel>
        <PanelResizeHandle className="w-1 bg-border hover:bg-primary/20 transition-colors" />
        <Panel defaultSize={25} minSize={15}>
          <SectionContextSidebar matterId={matterId} draftId={selectedDraftId} />
        </Panel>
      </PanelGroup>
      <AiDrawer matterId={matterId} />
    </>
  );
}
