import { test, expect } from "@playwright/test";

test.describe("Issue #59 – Marketing-Landingpage: Hero und kein Redirect", () => {
  test("Besucher ohne Login bleibt auf /de – kein Redirect auf /profile oder /login", async ({ page }) => {
    await page.goto("/de");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/de\/?$/);
  });

  test("Hero: h1 und CTA-Button mit Link auf /register sichtbar", async ({ page }) => {
    await page.goto("/de");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/de\/?$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /registrier/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /registrier/i })).toHaveAttribute("href", /\/register/);
  });

  test("Englische Landingpage – keine Weiterleitung, Überschrift sichtbar", async ({ page }) => {
    await page.goto("/en");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/en\/?$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
