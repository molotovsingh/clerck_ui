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

  it("returns empty suggestions and defaults when no data is available yet", () => {
    mockUseQuery.mockReturnValue({ data: undefined });

    const result = useMatterClassOptions();

    expect(result.suggestions).toEqual([]);
    expect(result.customSupported).toBe(true);
    expect(result.defaultClass).toBeUndefined();
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

  it("returns empty suggestions when API returns empty list", () => {
    mockUseQuery.mockReturnValue({
      data: {
        suggested_matter_classes: [],
        custom_matter_class_supported: false,
        default_matter_class: "general_dispute",
      },
    });

    const result = useMatterClassOptions("abc-123");

    expect(result.suggestions).toEqual([]);
    expect(result.customSupported).toBe(false);
    expect(result.defaultClass).toBe("general_dispute");
  });

  it("maps suggested_matter_classes through formatLabel", () => {
    mockUseQuery.mockReturnValue({
      data: {
        suggested_matter_classes: ["debt_recovery", "employment_dispute"],
        custom_matter_class_supported: true,
        default_matter_class: "debt_recovery",
      },
    });

    const result = useMatterClassOptions("abc-123");

    expect(result.suggestions).toEqual([
      { value: "debt_recovery", label: "Debt Recovery" },
      { value: "employment_dispute", label: "Employment Dispute" },
    ]);
    expect(result.customSupported).toBe(true);
    expect(result.defaultClass).toBe("debt_recovery");
  });
});
