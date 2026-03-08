import { describe, it, expect, beforeEach, vi } from "vitest";
import { downloadUrl } from "../client";

// Mock the auth store to avoid Zustand initialization issues
vi.mock("@/stores/auth-store", () => ({
  useAuthStore: {
    getState: () => ({
      mode: "dev-headers" as const,
      actor: "test-actor",
      role: "admin",
      token: null,
    }),
  },
}));

describe("downloadUrl", () => {
  beforeEach(() => {
    // jsdom defaults window.location.origin to "http://localhost:3000"
  });

  it("prepends API_BASE to the path", () => {
    const url = downloadUrl("/matters/abc/evidence/1/download");
    expect(url).toContain("/api/v1/matters/abc/evidence/1/download");
  });

  it("produces a valid URL", () => {
    const url = downloadUrl("/matters/abc/evidence/1/download");
    expect(() => new URL(url)).not.toThrow();
  });
});
