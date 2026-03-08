import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { api } from "../client";

// --- Auth store mock ---

let mockAuthState: {
  mode: "none" | "dev-headers" | "bearer";
  actor: string | null;
  role: string | null;
  token: string | null;
} = {
  mode: "none",
  actor: null,
  role: null,
  token: null,
};

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: {
    getState: () => mockAuthState,
  },
}));

// --- Fetch mock ---

const fetchSpy = vi.fn();

beforeEach(() => {
  fetchSpy.mockReset();
  globalThis.fetch = fetchSpy;
  mockAuthState = { mode: "none", actor: null, role: null, token: null };
});

afterEach(() => {
  vi.restoreAllMocks();
});

function respondJson(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  );
}

describe("client auth headers", () => {
  it("sends dev-headers when mode is dev-headers", async () => {
    mockAuthState = {
      mode: "dev-headers",
      actor: "alice@firm.co",
      role: "admin",
      token: null,
    };
    fetchSpy.mockReturnValue(respondJson({ ok: true }));

    await api.get("/test");

    const [, init] = fetchSpy.mock.calls[0]!;
    expect(init.headers["X-Firmcase-Actor"]).toBe("alice@firm.co");
    expect(init.headers["X-Firmcase-Role"]).toBe("admin");
    expect(init.headers["Authorization"]).toBeUndefined();
  });

  it("sends bearer token when mode is bearer", async () => {
    mockAuthState = {
      mode: "bearer",
      actor: "bob@firm.co",
      role: "reviewer",
      token: "fc_tok_abc123",
    };
    fetchSpy.mockReturnValue(respondJson({ ok: true }));

    await api.get("/test");

    const [, init] = fetchSpy.mock.calls[0]!;
    expect(init.headers["Authorization"]).toBe("Bearer fc_tok_abc123");
    expect(init.headers["X-Firmcase-Actor"]).toBeUndefined();
  });

  it("sends no auth headers when mode is none", async () => {
    fetchSpy.mockReturnValue(respondJson({ ok: true }));

    await api.get("/test");

    const [, init] = fetchSpy.mock.calls[0]!;
    expect(init.headers["Authorization"]).toBeUndefined();
    expect(init.headers["X-Firmcase-Actor"]).toBeUndefined();
  });

  it("includes Content-Type for POST with JSON body", async () => {
    mockAuthState = {
      mode: "dev-headers",
      actor: "alice@firm.co",
      role: "admin",
      token: null,
    };
    fetchSpy.mockReturnValue(respondJson({ id: 1 }));

    await api.post("/test", { body: { name: "Test" } });

    const [, init] = fetchSpy.mock.calls[0]!;
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(init.body)).toEqual({ name: "Test" });
  });

  it("throws ApiError on non-ok response", async () => {
    fetchSpy.mockReturnValue(
      Promise.resolve(
        new Response(JSON.stringify({ message: "Not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        })
      )
    );

    await expect(api.get("/missing")).rejects.toThrow("Not found");
  });
});
