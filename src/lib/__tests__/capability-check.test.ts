import { describe, it, expect } from "vitest";
import { canPerform } from "../capability-check";
import type { MatterCapabilities } from "@/types/access";

const allFalse: MatterCapabilities = {
  intake_context_write: false,
  draft_read: false,
  draft_comment: false,
  draft_write: false,
  claim_write: false,
  handoff_write: false,
  status_write: false,
  queue_jobs: false,
  export: false,
  upload_evidence: false,
  manage_access: false,
  compliance_write: false,
};

describe("canPerform", () => {
  it("returns true when capability is granted", () => {
    const caps = { ...allFalse, draft_read: true };
    expect(canPerform(caps, "draft_read")).toBe(true);
  });

  it("returns false when capability is not granted", () => {
    expect(canPerform(allFalse, "draft_read")).toBe(false);
  });

  it("returns false for null capabilities", () => {
    expect(canPerform(null, "draft_read")).toBe(false);
  });

  it("returns false for undefined capabilities", () => {
    expect(canPerform(undefined, "draft_read")).toBe(false);
  });
});
