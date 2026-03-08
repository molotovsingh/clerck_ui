import { test, expect } from "@playwright/test";

/**
 * Smoke test: authenticate via dev-headers, navigate to a matter workspace,
 * and verify that at least one panel renders.
 *
 * Requires the backend running on :8080 (or the Vite proxy configured).
 */

const AUTH_STATE = {
  state: {
    mode: "dev-headers",
    actor: "smoke-test",
    role: "admin",
    token: null,
  },
  version: 0,
};

test.describe("Smoke test", () => {
  test.beforeEach(async ({ page }) => {
    // Seed auth into localStorage so AuthGuard lets us through
    await page.addInitScript((auth) => {
      localStorage.setItem("firmcase-auth", JSON.stringify(auth));
    }, AUTH_STATE);
  });

  test("home page renders and links to Matters", async ({ page }) => {
    await page.goto("/");
    // Target the h1 specifically to avoid matching the footer "Clerck v1.0 …"
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Clerck");
    // The Matters product card should be visible
    await expect(
      page.getByRole("link", { name: /matters/i })
    ).toBeVisible();
  });

  test("matters list loads after auth", async ({ page }) => {
    await page.goto("/matters");
    // The AppShell header should be visible on /matters
    await expect(page.locator("header")).toBeVisible();
    // Page heading should say "Matters"
    await expect(
      page.getByRole("heading", { name: /matters/i })
    ).toBeVisible();
  });

  test("create matter and open workspace", async ({ page }) => {
    await page.goto("/matters");

    // Click "New Matter" to expand the creation form
    await page.getByRole("button", { name: /new matter/i }).click();

    // Fill in matter details using the label-linked inputs
    await page.getByLabel(/matter name/i).fill("E2E Smoke Matter");
    await page.getByLabel(/client name/i).fill("Smoke Client");

    // Submit
    await page.getByRole("button", { name: /create matter/i }).click();

    // Should navigate to /matters/$matterId — workspace page
    // Matter IDs vary by backend (e.g. MAT-XXXX or mat_XXXX)
    await page.waitForURL(/\/matters\/(?!$).+/, { timeout: 10_000 });

    // Verify something from the workspace loaded (any heading or panel content)
    await expect(
      page.locator("h1, h2, [data-testid='workspace'], [data-testid='intake-view']").first()
    ).toBeVisible({ timeout: 10_000 });
  });
});
