import { Link } from "@tanstack/react-router";
import { useMatters } from "@/hooks/use-matters";
import { Scale } from "lucide-react";

export function LandingPage() {
  const { data: matters } = useMatters();
  const count = matters?.length ?? 0;

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="grid gap-6 sm:grid-cols-2 max-w-3xl w-full">
        <Link
          to="/clerk"
          className="group flex flex-col items-center gap-4 rounded-xl border-2 border-transparent bg-card p-8 text-center shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <Scale className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Firmcase</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Intake, review, and draft workspace
            </p>
          </div>
          {count > 0 && (
            <span className="text-xs text-muted-foreground">
              {count} matter{count !== 1 ? "s" : ""}
            </span>
          )}
        </Link>

        <Link
          to="/caseloom-v2"
          className="group flex flex-col items-center gap-4 rounded-xl border-2 border-transparent bg-card p-8 text-center shadow-sm transition-all hover:border-[#C9A66B]/40 hover:shadow-md"
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-xl"
            style={{
              background: "linear-gradient(135deg, #C9A66B, #8C6A35)",
            }}
          >
            <span className="text-lg font-extrabold text-[#0E1117]">CL</span>
          </div>
          <div>
            <h2 className="text-lg font-bold">CaseLoom</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Dashboard, onboarding & IDE
            </p>
          </div>
          {count > 0 && (
            <span className="text-xs text-muted-foreground">
              {count} matter{count !== 1 ? "s" : ""}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
