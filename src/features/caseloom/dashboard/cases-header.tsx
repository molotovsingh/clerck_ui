import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CasesHeaderProps {
  onNewMatter: () => void;
}

export function CasesHeader({ onNewMatter }: CasesHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{
            background: "linear-gradient(135deg, #C9A66B, #8C6A35)",
          }}
        >
          <span className="text-xs font-extrabold text-[#0E1117]">CL</span>
        </div>
        <div>
          <h1 className="text-xl font-bold">Cases</h1>
          <p className="text-sm text-muted-foreground">
            Select a case or create a new one
          </p>
        </div>
      </div>
      <Button size="sm" className="gap-2" onClick={onNewMatter}>
        <Plus className="h-4 w-4" />
        New Matter
      </Button>
    </div>
  );
}
