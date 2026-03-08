import { describe, it, expect } from "vitest";
import { formatLabel } from "../format-label";

describe("formatLabel", () => {
  it("converts snake_case to Title Case", () => {
    expect(formatLabel("general_dispute")).toBe("General Dispute");
  });

  it("converts kebab-case to Title Case", () => {
    expect(formatLabel("under-review")).toBe("Under Review");
  });

  it("returns override for known keys", () => {
    expect(formatLabel("ocr")).toBe("Scan for Text");
    expect(formatLabel("claim_matrix")).toBe("Extract Claims");
    expect(formatLabel("draft_generation")).toBe("Draft Document");
    expect(formatLabel("liquidtext_pack")).toBe("LiquidText Pack");
  });

  it("handles single word", () => {
    expect(formatLabel("admin")).toBe("Admin");
  });
});
