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

const HomePage = lazy(() =>
  import("@/features/home/home-page").then((m) => ({
    default: m.HomePage,
  }))
);
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
const WorkspacePage = lazy(() =>
  import("@/features/workspace/workspace-page").then((m) => ({
    default: m.WorkspacePage,
  }))
);
const CaseLoomV2DashboardPage = lazy(() =>
  import("@/features/ide-v2/caseloom-v2-dashboard-page").then((m) => ({
    default: m.CaseLoomV2DashboardPage,
  }))
);
const CaseLoomV2OnboardingPage = lazy(() =>
  import("@/features/ide-v2/caseloom-v2-onboarding-page").then((m) => ({
    default: m.CaseLoomV2OnboardingPage,
  }))
);
const CaseLoomV2IDEPage = lazy(() =>
  import("@/features/ide-v2/caseloom-v2-ide-page").then((m) => ({
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
  component: () => <LazyRoute Component={HomePage} />,
});

const mattersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/matters",
  component: () => <LazyRoute Component={MatterLauncher} />,
});

const devRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dev",
  component: () => <LazyRoute Component={DevConsolePage} />,
});

const matterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/matters/$matterId",
  component: () => <LazyRoute Component={WorkspacePage} />,
});

// --- Legacy redirects (safe to remove once old bookmarks expire) ---

const clerkRedirect = createRoute({
  getParentRoute: () => rootRoute,
  path: "/clerk",
  beforeLoad: () => {
    throw redirect({ to: "/matters" });
  },
});

const clerkMatterRedirect = createRoute({
  getParentRoute: () => rootRoute,
  path: "/clerk/$matterId",
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/matters/$matterId", params: { matterId: params.matterId } });
  },
});

const lawyerRedirect = createRoute({
  getParentRoute: () => rootRoute,
  path: "/lawyer",
  beforeLoad: () => {
    throw redirect({ to: "/matters" });
  },
});

const lawyerMatterRedirect = createRoute({
  getParentRoute: () => rootRoute,
  path: "/lawyer/$matterId",
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/matters/$matterId", params: { matterId: params.matterId } });
  },
});

// --- CaseLoom v2 routes (own full-screen layout, bypasses AppShell) ---

const caseLoomLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "caseloom-layout",
  component: () => (
    <Suspense fallback={<LoadingPage />}>
      <Outlet />
    </Suspense>
  ),
});

const caseLoomDashboardRoute = createRoute({
  getParentRoute: () => caseLoomLayoutRoute,
  path: "/caseloom-v2",
  component: () => <LazyRoute Component={CaseLoomV2DashboardPage} />,
});

const caseLoomOnboardingRoute = createRoute({
  getParentRoute: () => caseLoomLayoutRoute,
  path: "/caseloom-v2/onboarding",
  component: () => <LazyRoute Component={CaseLoomV2OnboardingPage} />,
});

const caseLoomMatterRoute = createRoute({
  getParentRoute: () => caseLoomLayoutRoute,
  path: "/caseloom-v2/$matterId",
  component: () => <LazyRoute Component={CaseLoomV2IDEPage} />,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  mattersRoute,
  devRoute,
  matterRoute,
  // CaseLoom v2
  caseLoomLayoutRoute.addChildren([
    caseLoomDashboardRoute,
    caseLoomOnboardingRoute,
    caseLoomMatterRoute,
  ]),
  // Legacy redirects
  clerkRedirect,
  clerkMatterRedirect,
  lawyerRedirect,
  lawyerMatterRedirect,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
