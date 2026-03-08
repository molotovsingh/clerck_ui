import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";

interface Step {
  label: string;
  targetId: string;
  done: boolean;
  active: boolean;
}

interface ProgressRailProps {
  steps: Step[];
}

export function ProgressRail({ steps }: ProgressRailProps) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      className="hidden md:flex sticky top-6 flex-col items-center self-start ml-4"
      aria-label="Intake progress"
    >
      {steps.map((step, i) => (
        <div key={step.targetId} className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => scrollTo(step.targetId)}
            className="group relative flex items-center"
            aria-label={`Go to ${step.label}`}
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all",
                step.done && "bg-green-500 text-white",
                step.active && !step.done && "bg-primary text-primary-foreground ring-4 ring-primary/20 animate-pulse",
                !step.done && !step.active && "bg-muted text-muted-foreground"
              )}
            >
              {step.done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </span>
            <span className="absolute left-10 whitespace-nowrap rounded bg-popover px-2 py-1 text-xs text-popover-foreground shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border">
              {step.label}
            </span>
          </button>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "w-0.5 h-16",
                step.done ? "bg-green-500" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </nav>
  );
}
