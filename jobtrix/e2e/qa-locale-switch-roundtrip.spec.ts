import { test, expect } from "@playwright/test";

test.describe("Issue #233 – Sprachwechsel DE→EN→DE ohne 404", () => {
  test("Story: mehrfaches Umschalten der Sprache bleibt auf gültigen Seiten", async ({ page }) => {
    await page.goto("/de");
    await page.waitForLoadState("networkidle");

    // DE → EN
    await page.getByRole("button", { name: /switch to english/i }).first().click();
    await expect(page).toHaveURL(/\/en(\/|$)/);
    await expect(page.locator("text=404")).toHaveCount(0);

    // EN → DE (der Schritt, der zuvor einen 404 erzeugte)
    await page.getByRole("button", { name: /switch to deutsch/i }).first().click();
    await expect(page).toHaveURL(/\/de(\/|$)/);
    await expect(page.locator("text=404")).toHaveCount(0);

    // DE → EN erneut, um den Roundtrip abzusichern
    await page.getByRole("button", { name: /switch to english/i }).first().click();
    await expect(page).toHaveURL(/\/en(\/|$)/);
    await expect(page.locator("text=404")).toHaveCount(0);
  });
});
