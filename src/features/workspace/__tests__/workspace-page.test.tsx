import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { WorkspacePage } from "../workspace-page";
import { MatterStatus } from "@/types/enums";

// --- Mocks ---

vi.mock("@tanstack/react-router", () => ({
  getRouteApi: () => ({
    useParams: () => ({ matterId: "m-1" }),
  }),
}));

const mockUseWorkspace = vi.fn();
vi.mock("@/hooks/use-matters", () => ({
  useWorkspace: (...args: unknown[]) => mockUseWorkspace(...args),
}));

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

vi.mock("@/components/common/loading", () => ({
  LoadingPage: () => <div data-testid="loading" />,
}));

vi.mock("@/components/common/error-display", () => ({
  ErrorDisplay: ({ error }: { error: Error }) => (
    <div data-testid="error">{error.message}</div>
  ),
}));

const StubIntake = () => <div data-testid="intake-view" />;
vi.mock("../intake-view", () => ({
  IntakeView: StubIntake,
  default: StubIntake,
}));

const StubFull = () => <div data-testid="full-workspace-view" />;
vi.mock("../full-workspace-view", () => ({
  FullWorkspaceView: StubFull,
  default: StubFull,
}));

const StubIde = () => <div data-testid="ide-view" />;
vi.mock("../ide-view", () => ({
  IdeView: StubIde,
  default: StubIde,
}));

// --- Helpers ---

function makeWorkspace(
  status: MatterStatus,
  capabilities: Record<string, boolean> = {}
) {
  return {
    workflow_state: {
      matter_status: status,
      capabilities,
    },
  };
}

// --- Tests ---

describe("WorkspacePage", () => {
  afterEach(cleanup);

  beforeEach(() => {
    mockMode = "review";
    mockUseWorkspace.mockReset();
  });

  it("renders loading state", () => {
    mockUseWorkspace.mockReturnValue({ isLoading: true, data: undefined, error: null });
    render(<WorkspacePage />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("renders error state", () => {
    mockUseWorkspace.mockReturnValue({
      isLoading: false,
      data: undefined,
      error: new Error("Network fail"),
    });
    render(<WorkspacePage />);
    expect(screen.getByTestId("error")).toHaveTextContent("Network fail");
  });

  it("renders not-found when workspace is null", () => {
    mockUseWorkspace.mockReturnValue({ isLoading: false, data: null, error: null });
    render(<WorkspacePage />);
    expect(screen.getByTestId("error")).toHaveTextContent("Matter not found");
  });

  it("renders IdeView when mode is ide", async () => {
    mockMode = "ide";
    mockUseWorkspace.mockReturnValue({
      isLoading: false,
      error: null,
      data: makeWorkspace(MatterStatus.UNDER_REVIEW),
    });
    render(<WorkspacePage />);
    expect(await screen.findByTestId("ide-view")).toBeInTheDocument();
  });

  it("renders IntakeView for intake status with capability", async () => {
    mockUseWorkspace.mockReturnValue({
      isLoading: false,
      error: null,
      data: makeWorkspace(MatterStatus.INTAKE, { intake_context_write: true }),
    });
    render(<WorkspacePage />);
    expect(await screen.findByTestId("intake-view")).toBeInTheDocument();
  });

  it("renders FullWorkspaceView for non-intake status", async () => {
    mockUseWorkspace.mockReturnValue({
      isLoading: false,
      error: null,
      data: makeWorkspace(MatterStatus.UNDER_REVIEW),
    });
    render(<WorkspacePage />);
    expect(await screen.findByTestId("full-workspace-view")).toBeInTheDocument();
  });

  it("renders FullWorkspaceView for intake without write capability", async () => {
    mockUseWorkspace.mockReturnValue({
      isLoading: false,
      error: null,
      data: makeWorkspace(MatterStatus.INTAKE, { intake_context_write: false }),
    });
    render(<WorkspacePage />);
    expect(await screen.findByTestId("full-workspace-view")).toBeInTheDocument();
  });
});
