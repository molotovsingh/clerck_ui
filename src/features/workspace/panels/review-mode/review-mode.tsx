import { useState } from "react";
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";
import type { MatterCapabilities } from "@/types/access";
import { EvidenceClaimsList, type SelectedItem } from "./evidence-claims-list";
import { ReviewDetailPanel } from "./review-detail-panel";

interface Props {
  matterId: string;
  capabilities?: MatterCapabilities;
}

export function ReviewMode({ matterId, capabilities }: Props) {
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);

  return (
    <PanelGroup orientation="horizontal" className="flex-1">
      <Panel defaultSize={40} minSize={25}>
        <EvidenceClaimsList
          matterId={matterId}
          capabilities={capabilities}
          selectedItem={selectedItem}
          onSelectItem={setSelectedItem}
        />
      </Panel>
      <PanelResizeHandle className="w-1 bg-border hover:bg-primary/20 transition-colors" />
      <Panel defaultSize={60} minSize={30}>
        <ReviewDetailPanel matterId={matterId} selectedItem={selectedItem} />
      </Panel>
    </PanelGroup>
  );
}
