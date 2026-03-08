import { CheckCircle2 } from "lucide-react";

interface Props {
  step: number;
  done: boolean;
  active: boolean;
}

export function StepIndicator({ step, done, active }: Props) {
  if (done) {
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-white shadow-sm">
        <CheckCircle2 className="h-4 w-4" />
      </span>
    );
  }
  if (active) {
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm ring-2 ring-primary/20">
        {step}
      </span>
    );
  }
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
      {step}
    </span>
  );
}
