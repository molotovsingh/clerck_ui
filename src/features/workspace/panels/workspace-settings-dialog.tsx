import { lazy, Suspense } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkspaceStore, type SettingsTab } from "@/stores/workspace-store";
import type { MatterCapabilities } from "@/types/access";
import { AccessPanel } from "./access-panel/access-panel";
import { HandoffPanel } from "./handoff-panel/handoff-panel";
import { LoadingSpinner } from "@/components/common/loading";
import { ScrollArea } from "@/components/ui/scroll-area";

const AnalyticsPanel = lazy(() =>
  import("./analytics-panel/analytics-panel").then(m => ({ default: m.AnalyticsPanel }))
);

interface Props {
  matterId: string;
  capabilities?: MatterCapabilities;
}

export function WorkspaceSettingsDialog({ matterId, capabilities }: Props) {
  const open = useWorkspaceStore((s) => s.settingsDialogOpen);
  const tab = useWorkspaceStore((s) => s.settingsTab);
  const closeSettings = useWorkspaceStore((s) => s.closeSettings);
  const store = useWorkspaceStore;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && closeSettings()}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage access, transfers, and analytics for this matter
          </DialogDescription>
        </DialogHeader>
        <Tabs
          value={tab}
          onValueChange={(v) => store.setState({ settingsTab: v as SettingsTab })}
        >
          <TabsList className="w-full">
            <TabsTrigger value="access" className="flex-1">Access</TabsTrigger>
            <TabsTrigger value="transfers" className="flex-1">Transfers</TabsTrigger>
            <TabsTrigger value="analytics" className="flex-1">Analytics</TabsTrigger>
          </TabsList>
          <ScrollArea className="h-[55vh] mt-4">
            <TabsContent value="access" className="m-0">
              <AccessPanel matterId={matterId} capabilities={capabilities} />
            </TabsContent>
            <TabsContent value="transfers" className="m-0">
              <HandoffPanel matterId={matterId} capabilities={capabilities} />
            </TabsContent>
            <TabsContent value="analytics" className="m-0">
              <Suspense fallback={<div className="flex justify-center py-12"><LoadingSpinner /></div>}>
                <AnalyticsPanel matterId={matterId} />
              </Suspense>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
