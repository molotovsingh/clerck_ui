import { lazy, Suspense, useState } from "react";
import {
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
} from "@tanstack/react-router";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingPage } from "@/components/common/loading";

const DevConsolePage = lazy(() =>
  import("@/features/dev-console/dev-console-page").then((m) => ({
    default: m.DevConsolePage,
  }))
);
const ClerkIntakePage = lazy(() =>
  import("@/features/clerk-intake/clerk-intake-page").then((m) => ({
    default: m.ClerkIntakePage,
  }))
);
const LawyerWorkspacePage = lazy(() =>
  import("@/features/lawyer-workspace/lawyer-workspace-page").then((m) => ({
    default: m.LawyerWorkspacePage,
  }))
);
const LandingPage = lazy(() =>
  import("@/features/landing/landing-page").then((m) => ({
    default: m.LandingPage,
  }))
);
const CaseLoomV2DashboardPage = lazy(() =>
  import("@/features/caseloom-v2/caseloom-v2-dashboard-page").then((m) => ({
    default: m.CaseLoomV2DashboardPage,
  }))
);
const CaseLoomV2OnboardingPage = lazy(() =>
  import("@/features/caseloom-v2/caseloom-v2-onboarding-page").then((m) => ({
    default: m.CaseLoomV2OnboardingPage,
  }))
);
const CaseLoomV2IDEPage = lazy(() =>
  import("@/features/caseloom-v2/caseloom-v2-ide-page").then((m) => ({
    default: m.CaseLoomV2IDEPage,
  }))
);

function LazyRoute({ Component }: { Component: React.ComponentType }) {
  return (
    <Suspense fallback={<LoadingPage />}>
      <Component />
    </Suspense>
  );
}

const rootRoute = createRootRoute({
  component: () => (
    <AuthGuard>
      <AppShell>
        <Outlet />
      </AppShell>
    </AuthGuard>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <LazyRoute Component={LandingPage} />,
});

// Dev Console
const devRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dev",
  component: () => <LazyRoute Component={DevConsolePage} />,
});

// Clerk Intake — landing page with inline matter creation
const clerkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/clerk",
  component: () => (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Matters</h1>
        <p className="text-sm text-muted-foreground">
          Create a new matter or select an existing one to continue
        </p>
      </div>
      <InlineCreateMatter />
      <ClerkMatterSelector />
    </div>
  ),
});

const clerkMatterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/clerk/$matterId",
  component: () => <LazyRoute Component={ClerkIntakePage} />,
});

// Lawyer Workspace
const lawyerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/lawyer",
  component: () => (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Lawyer Workspace</h1>
        <p className="text-sm text-muted-foreground">
          Review drafts, evidence, and readiness for your matters
        </p>
      </div>
      <LawyerMatterSelector />
    </div>
  ),
});

const lawyerMatterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/lawyer/$matterId",
  component: () => <LazyRoute Component={LawyerWorkspacePage} />,
});

// CaseLoom
const caseLoomV2Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/caseloom-v2",
  component: () => <LazyRoute Component={CaseLoomV2DashboardPage} />,
});

const caseLoomV2OnboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/caseloom-v2/onboarding",
  component: () => <LazyRoute Component={CaseLoomV2OnboardingPage} />,
});

const caseLoomV2MatterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/caseloom-v2/$matterId",
  component: () => <LazyRoute Component={CaseLoomV2IDEPage} />,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  devRoute,
  clerkRoute,
  clerkMatterRoute,
  lawyerRoute,
  lawyerMatterRoute,
  caseLoomV2Route,
  caseLoomV2OnboardingRoute,
  caseLoomV2MatterRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ── Matter selectors & inline creation for landing pages ───────────
import { useMatters, useCreateMatter } from "@/hooks/use-matters";
import { Link, useRouter } from "@tanstack/react-router";
import { StatusBadge } from "@/components/common/status-badge";
import { LoadingSpinner } from "@/components/common/loading";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FolderOpen, Plus, ChevronUp, Clock, ArrowRight } from "lucide-react";
import { formatLabel } from "@/lib/format-label";
import { formatRelative } from "@/lib/format-date";
import { Badge } from "@/components/ui/badge";

const MATTER_CLASSES = [
  { value: "general_dispute", label: "General Dispute" },
  { value: "debt_recovery", label: "Debt Recovery" },
  { value: "employment_dispute", label: "Employment Dispute" },
  { value: "regulatory_enforcement", label: "Regulatory Enforcement" },
] as const;

function InlineCreateMatter() {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [matterClass, setMatterClass] = useState("general_dispute");
  const createMatter = useCreateMatter();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createMatter.mutateAsync({
        name,
        client_name: clientName,
        matter_class: matterClass,
      });
      setName("");
      setClientName("");
      setExpanded(false);
      router.navigate({
        to: "/clerk/$matterId",
        params: { matterId: result.public_id },
      });
    } catch { /* error displayed via createMatter.error */ }
  };

  if (!expanded) {
    return (
      <Button
        variant="outline"
        className="w-full justify-start gap-2"
        onClick={() => setExpanded(true)}
      >
        <Plus className="h-4 w-4" />
        New Matter
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">New Matter</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setExpanded(false)}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Matter Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Smith v. Jones"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Client Name</Label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="John Smith"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Matter Type</Label>
            <Select value={matterClass} onValueChange={setMatterClass}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MATTER_CLASSES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {createMatter.error && (
            <p className="text-sm text-destructive">
              {createMatter.error.message}
            </p>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={createMatter.isPending}
          >
            {createMatter.isPending ? "Creating..." : "Create & Start Intake"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ClerkMatterSelector() {
  const { data: matters, isLoading } = useMatters();
  if (isLoading) return <LoadingSpinner />;
  if (!matters?.length) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No matters yet"
        description="Create your first matter above to get started"
      />
    );
  }
  return (
    <div className="space-y-2">
      {matters.map((m) => (
        <Link
          key={m.public_id}
          to="/clerk/$matterId"
          params={{ matterId: m.public_id }}
          className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted transition-colors"
        >
          <div>
            <p className="font-medium">{m.name}</p>
            <p className="text-sm text-muted-foreground">
              {m.client_name}
              <span className="mx-1.5 text-muted-foreground/50">&middot;</span>
              {formatLabel(m.matter_class)}
            </p>
          </div>
          <StatusBadge status={m.status} />
        </Link>
      ))}
    </div>
  );
}

function LawyerMatterSelector() {
  const { data: matters, isLoading } = useMatters();
  if (isLoading) return <LoadingSpinner />;
  if (!matters?.length) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No matters yet"
        description="Create a matter from the Matters page first"
      />
    );
  }
  return (
    <div className="space-y-3">
      {matters.map((m) => (
        <Link
          key={m.public_id}
          to="/lawyer/$matterId"
          params={{ matterId: m.public_id }}
          className="group block rounded-lg border p-4 hover:border-primary/30 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{m.name}</p>
                <StatusBadge status={m.status} />
              </div>
              <p className="text-sm text-muted-foreground">{m.client_name}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs font-normal">
              {formatLabel(m.matter_class)}
            </Badge>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelative(m.updated_at)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
