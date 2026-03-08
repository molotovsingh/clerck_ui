/**
 * Integration tests for the workspace bootstrap path.
 *
 * These go one level above the unit tests: instead of fully mocking
 * useWorkspace, they exercise the real hook with a mocked QueryClient
 * and fetch layer to verify the loading → loaded → view transition.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WorkspacePage } from "../workspace-page";
import { MatterStatus } from "@/types/enums";

// --- Router mock (typed route API) ---

vi.mock("@tanstack/react-router", () => ({
  getRouteApi: () => ({
    useParams: () => ({ matterId: "MAT-INT-1" }),
  }),
}));

// --- Workspace store mock ---

let mockMode = "review";
const mockSetSelectedMatterId = vi.fn();
vi.mock("@/stores/workspace-store", () => ({
  useWorkspaceStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      mode: mockMode,
      selectedMatterId: null,
      setSelectedMatterId: mockSetSelectedMatterId,
    }),
}));

// --- Auth store mock ---

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: {
    getState: () => ({
      mode: "dev-headers" as const,
      actor: "integration-test",
      role: "admin",
      token: null,
    }),
  },
}));

// --- Child component mocks (we test routing, not child rendering) ---

vi.mock("@/components/common/loading", () => ({
  LoadingPage: () => <div data-testid="loading">Loading…</div>,
}));

vi.mock("@/components/common/error-display", () => ({
  ErrorDisplay: ({ error }: { error: Error }) => (
    <div data-testid="error">{error.message}</div>
  ),
}));

vi.mock("../intake-view", () => ({
  IntakeView: () => <div data-testid="intake-view" />,
}));

vi.mock("../full-workspace-view", () => ({
  FullWorkspaceView: () => <div data-testid="full-workspace-view" />,
}));

vi.mock("../ide-view", () => ({
  IdeView: () => <div data-testid="ide-view" />,
}));

// --- Helpers ---

function makeWorkspacePayload(status: MatterStatus) {
  return {
    matter: { public_id: "MAT-INT-1", name: "Test", status },
    workflow_state: {
      matter_public_id: "MAT-INT-1",
      matter_status: status,
      capabilities: { intake_context_write: status === MatterStatus.INTAKE },
      readiness: { intake_gate_passed: true },
      next_actions: [],
      write_blocked_by_handoff_actor: null,
    },
    self_access: {
      actor: "integration-test",
      role: "owner",
      capabilities: {},
      write_blocked_by_handoff_actor: null,
    },
    summary: { counts: {}, latest: {} },
    collections: {},
    included: [],
    generated_at: new Date().toISOString(),
    stale_after_seconds: 30,
  };
}

const fetchSpy = vi.fn();

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

// --- Tests ---

describe("workspace bootstrap integration", () => {
  beforeEach(() => {
    mockMode = "review";
    fetchSpy.mockReset();
    globalThis.fetch = fetchSpy;
  });

  afterEach(cleanup);

  it("transitions from loading to full-workspace-view on successful fetch", async () => {
    fetchSpy.mockReturnValue(
      Promise.resolve(
        new Response(
          JSON.stringify(makeWorkspacePayload(MatterStatus.UNDER_REVIEW)),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      )
    );

    renderWithQuery(<WorkspacePage />);

    // Initially shows loading
    expect(screen.getByTestId("loading")).toBeInTheDocument();

    // After fetch resolves, shows full workspace
    await waitFor(() => {
      expect(screen.getByTestId("full-workspace-view")).toBeInTheDocument();
    });
  });

  it("shows intake view for intake-status matters", async () => {
    fetchSpy.mockReturnValue(
      Promise.resolve(
        new Response(
          JSON.stringify(makeWorkspacePayload(MatterStatus.INTAKE)),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      )
    );

    renderWithQuery(<WorkspacePage />);

    await waitFor(() => {
      expect(screen.getByTestId("intake-view")).toBeInTheDocument();
    });
  });

  it("shows error when fetch fails", async () => {
    fetchSpy.mockReturnValue(
      Promise.resolve(
        new Response(JSON.stringify({ message: "Server error" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        })
      )
    );

    renderWithQuery(<WorkspacePage />);

    await waitFor(() => {
      expect(screen.getByTestId("error")).toBeInTheDocument();
    });
  });

  it("calls the workspace endpoint with correct matterId", async () => {
    fetchSpy.mockReturnValue(
      Promise.resolve(
        new Response(
          JSON.stringify(makeWorkspacePayload(MatterStatus.UNDER_REVIEW)),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      )
    );

    renderWithQuery(<WorkspacePage />);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled();
    });

    const calledUrl = fetchSpy.mock.calls[0]![0];
    expect(calledUrl).toContain("/api/v1/matters/MAT-INT-1/workspace");
  });
});
