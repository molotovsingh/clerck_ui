import { useState } from "react";
import { MatterStatus } from "@/types/enums";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ReadinessStep } from "./readiness-step";
import { ExportStep } from "./export-step";
import { StatusAdvanceStep } from "./status-advance-step";

interface Props {
  matterId: string;
  matterStatus: MatterStatus;
}

export function FilingWizard({ matterId, matterStatus }: Props) {
  const open = useWorkspaceStore((s) => s.filingWizardOpen);
  const setOpen = useWorkspaceStore((s) => s.setFilingWizardOpen);
  const [step, setStep] = useState(0);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setStep(0);
      }}
    >
      <DialogContent className="max-w-lg">
        {step === 0 && (
          <ReadinessStep
            matterId={matterId}
            onNext={() => setStep(1)}
          />
        )}
        {step === 1 && (
          <ExportStep
            matterId={matterId}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <StatusAdvanceStep
            matterId={matterId}
            matterStatus={matterStatus}
            onBack={() => setStep(1)}
            onDone={() => {
              setOpen(false);
              setStep(0);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
