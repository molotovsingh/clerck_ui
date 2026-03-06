import { lazy, Suspense } from "react";
import {
  createRouter,
  createRootRoute,
  createRoute,
  redirect,
  Outlet,
} from "@tanstack/react-router";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingPage } from "@/components/common/loading";

const MatterLauncher = lazy(() =>
  import("@/features/matters/matter-launcher").then((m) => ({
    default: m.MatterLauncher,
  }))
);
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

// --- Core routes ---

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <LazyRoute Component={MatterLauncher} />,
});

const devRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dev",
  component: () => <LazyRoute Component={DevConsolePage} />,
});

// Matter detail routes — temporary, will collapse into /$matterId in Phase 3
const clerkMatterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/clerk/$matterId",
  component: () => <LazyRoute Component={ClerkIntakePage} />,
});

const lawyerMatterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/lawyer/$matterId",
  component: () => <LazyRoute Component={LawyerWorkspacePage} />,
});

const caseLoomV2MatterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/caseloom-v2/$matterId",
  component: () => <LazyRoute Component={CaseLoomV2IDEPage} />,
});

// --- Redirects from old landing routes ---

const clerkRedirect = createRoute({
  getParentRoute: () => rootRoute,
  path: "/clerk",
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});

const lawyerRedirect = createRoute({
  getParentRoute: () => rootRoute,
  path: "/lawyer",
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});

const caseLoomV2Redirect = createRoute({
  getParentRoute: () => rootRoute,
  path: "/caseloom-v2",
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});

const caseLoomV2OnboardingRedirect = createRoute({
  getParentRoute: () => rootRoute,
  path: "/caseloom-v2/onboarding",
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  devRoute,
  clerkMatterRoute,
  lawyerMatterRoute,
  caseLoomV2MatterRoute,
  clerkRedirect,
  lawyerRedirect,
  caseLoomV2Redirect,
  caseLoomV2OnboardingRedirect,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
