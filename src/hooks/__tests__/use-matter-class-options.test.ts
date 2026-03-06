import { describe, it, expect, vi, beforeEach } from "vitest";
import { useMatterClassOptions } from "../use-matter-class-options";

const mockUseQuery = vi.fn();
vi.mock("@tanstack/react-query", () => ({ useQuery: (...args: unknown[]) => mockUseQuery(...args) }));
vi.mock("@/api/endpoints/matters", () => ({
  mattersApi: { getComplianceOptions: vi.fn(), getComplianceDefaults: vi.fn() },
}));

describe("useMatterClassOptions", () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
  });

  it("returns empty array when no data is available yet", () => {
    mockUseQuery.mockReturnValue({ data: undefined });

    const result = useMatterClassOptions();

    expect(result).toEqual([]);
  });

  it("calls global defaults endpoint when no matterId", () => {
    mockUseQuery.mockReturnValue({ data: undefined });

    useMatterClassOptions();

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["compliance", "defaults"],
      })
    );
  });

  it("calls matter-scoped endpoint when matterId is provided", () => {
    mockUseQuery.mockReturnValue({ data: undefined });

    useMatterClassOptions("abc-123");

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["compliance", "matter-classes", "abc-123"],
      })
    );
  });

  it("returns empty array when API returns empty list", () => {
    mockUseQuery.mockReturnValue({ data: { allowed_matter_classes: [] } });

    const result = useMatterClassOptions("abc-123");

    expect(result).toEqual([]);
  });

  it("maps API data through formatLabel when available", () => {
    mockUseQuery.mockReturnValue({
      data: { allowed_matter_classes: ["debt_recovery", "employment_dispute"] },
    });

    const result = useMatterClassOptions("abc-123");

    expect(result).toEqual([
      { value: "debt_recovery", label: "Debt Recovery" },
      { value: "employment_dispute", label: "Employment Dispute" },
    ]);
  });
});
