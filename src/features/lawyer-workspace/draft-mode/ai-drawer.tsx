import { useWorkspaceStore } from "@/stores/workspace-store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { AiThreadsPanel } from "../ai-panel/ai-threads-panel";

interface Props {
  matterId: string;
}

export function AiDrawer({ matterId }: Props) {
  const open = useWorkspaceStore((s) => s.aiDrawerOpen);
  const setOpen = useWorkspaceStore((s) => s.setAiDrawerOpen);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="p-0 flex flex-col">
        <SheetHeader className="px-4 pt-4 pb-2">
          <SheetTitle>AI Notes</SheetTitle>
          <SheetDescription>
            Discussion threads for coordinating with your team
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-hidden px-4 pb-4">
          <AiThreadsPanel matterId={matterId} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
