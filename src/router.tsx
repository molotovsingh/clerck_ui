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
const WorkspacePage = lazy(() =>
  import("@/features/workspace/workspace-page").then((m) => ({
    default: m.WorkspacePage,
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

const matterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/$matterId",
  component: () => <LazyRoute Component={WorkspacePage} />,
});

// --- Legacy redirects (safe to remove once old bookmarks expire) ---

const clerkRedirect = createRoute({
  getParentRoute: () => rootRoute,
  path: "/clerk",
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});

const clerkMatterRedirect = createRoute({
  getParentRoute: () => rootRoute,
  path: "/clerk/$matterId",
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/$matterId", params: { matterId: params.matterId } });
  },
});

const lawyerRedirect = createRoute({
  getParentRoute: () => rootRoute,
  path: "/lawyer",
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});

const lawyerMatterRedirect = createRoute({
  getParentRoute: () => rootRoute,
  path: "/lawyer/$matterId",
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/$matterId", params: { matterId: params.matterId } });
  },
});

const caseLoomRedirect = createRoute({
  getParentRoute: () => rootRoute,
  path: "/caseloom-v2",
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});

const caseLoomOnboardingRedirect = createRoute({
  getParentRoute: () => rootRoute,
  path: "/caseloom-v2/onboarding",
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});

const caseLoomMatterRedirect = createRoute({
  getParentRoute: () => rootRoute,
  path: "/caseloom-v2/$matterId",
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/$matterId", params: { matterId: params.matterId } });
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  devRoute,
  matterRoute,
  // Legacy redirects
  clerkRedirect,
  clerkMatterRedirect,
  lawyerRedirect,
  lawyerMatterRedirect,
  caseLoomRedirect,
  caseLoomOnboardingRedirect,
  caseLoomMatterRedirect,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
