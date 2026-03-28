import { lazy, Suspense } from "react";
import {
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
} from "@tanstack/react-router";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingPage } from "@/components/common/loading";
import { CreateMatterForm } from "@/features/matters/create-matter-form";
import { ClerkMatterSelector } from "@/features/matters/clerk-matter-selector";
import { LawyerMatterSelector } from "@/features/matters/lawyer-matter-selector";

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
      <CreateMatterForm />
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
