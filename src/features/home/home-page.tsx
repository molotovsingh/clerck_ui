import { Link } from "@tanstack/react-router";
import { ClipboardList, Scale, FileText, Brain, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function HomePage() {
  return (
    <div className="flex h-full flex-col items-center gap-16 px-8 py-16">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-2xl">
        <h1 className="text-5xl font-bold tracking-tight">Clerck</h1>
        <p className="text-xl text-muted-foreground italic">
          Litigation, untangled.
        </p>
        <p className="text-muted-foreground">
          The open platform for litigation teams to organize evidence, analyze
          claims, and draft filings — with AI at every step.
        </p>
      </div>

      {/* Product cards */}
      <div className="flex flex-wrap justify-center gap-6">
        <Link
          to="/matters"
          className="group flex h-64 w-80 flex-col items-center justify-center gap-3 rounded-xl border-2 border-border bg-card p-6 transition-colors hover:border-primary hover:bg-accent"
        >
          <ClipboardList className="h-10 w-10 text-muted-foreground group-hover:text-primary" />
          <span className="text-lg font-semibold">Matters</span>
          <span className="text-sm font-medium text-muted-foreground">
            Evidence workspace
          </span>
          <span className="text-xs text-muted-foreground text-center">
            Upload documents, track claims across parties, review readiness, and
            generate court-ready filings.
          </span>
        </Link>
        <Link
          to="/caseloom-v2"
          className="group flex h-64 w-80 flex-col items-center justify-center gap-3 rounded-xl border-2 border-border bg-card p-6 transition-colors hover:border-primary hover:bg-accent"
        >
          <Scale className="h-10 w-10 text-muted-foreground group-hover:text-primary" />
          <span className="text-lg font-semibold">CaseLoom</span>
          <span className="text-sm font-medium text-muted-foreground">
            Case IDE
          </span>
          <span className="text-xs text-muted-foreground text-center">
            Guided case onboarding, AI-driven analysis, timeline extraction, and
            an interactive research chat.
          </span>
        </Link>
      </div>

      {/* Value props */}
      <div className="grid grid-cols-1 gap-8 max-w-3xl sm:grid-cols-3">
        <ValueProp
          icon={FileText}
          title="Organize"
          description="Centralize evidence, claims, and filings in one place per matter."
        />
        <ValueProp
          icon={Brain}
          title="Analyze"
          description="AI jobs extract timelines, score claim readiness, and flag gaps."
        />
        <ValueProp
          icon={Users}
          title="Collaborate"
          description="Role-based access for clerks, reviewers, drafters, and admins."
        />
      </div>

      {/* Footer */}
      <div className="mt-auto w-full max-w-3xl space-y-4">
        <Separator />
        <p className="text-center text-xs text-muted-foreground">
          Clerck v1.0 · Open Source · Built for litigation teams
        </p>
      </div>
    </div>
  );
}

function ValueProp({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <Icon className="h-6 w-6 text-muted-foreground" />
      <span className="text-sm font-semibold">{title}</span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </div>
  );
}
