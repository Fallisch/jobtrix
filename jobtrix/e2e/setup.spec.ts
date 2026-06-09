import { test, expect } from "@playwright/test";

test.describe("Projekt-Setup – Grundlegendes Layout", () => {
  test("App lädt und zeigt den Header mit JobTRIX", async ({ page }) => {
    await page.goto("/");

    const header = page.getByRole("banner");
    await expect(header).toBeVisible();
    await expect(page.getByRole("link", { name: "JobTRIX" })).toBeVisible();
  });

  test("Manifest ist erreichbar und korrekt konfiguriert", async ({ page }) => {
    const response = await page.goto("/manifest.json");
    expect(response?.status()).toBe(200);

    const manifest = await response?.json();
    expect(manifest.name).toBe("JobTRIX");
    expect(manifest.display).toBe("standalone");
    expect(manifest.theme_color).toBe("#1E3A5F");
  });

  test("Seite hat korrekte Metadaten (Titel JobTRIX)", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("JobTRIX");
  });
});
