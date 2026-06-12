import { test, expect } from "@playwright/test";
import { registerAndLogin, uniqueEmail } from "./helpers/auth";

test.describe("Issue #6 – Foto-Komprimierung und Speicherfehler", () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page, uniqueEmail("e2e-foto"), "correct-password");
  });

  test("Story 1: Foto hochladen, Profil speichern und nach Reload noch vorhanden", async ({ page }) => {
    const testImagePath = "/home/faltrix/Projekte/Faltrix-Automaten/jobtrix/public/icons/icon-512x512.png";

    await page.goto("/de/profile");
    await page.getByLabel(/name/i).fill("Max Mustermann");
    await page.getByPlaceholder(/institution/i).fill("TU Berlin");

    const input = page.locator('input[type="file"]');
    await input.setInputFiles(testImagePath);

    await expect(page.getByRole("img", { name: /vorschau/i })).toBeVisible({ timeout: 8000 });

    await page.getByRole("button", { name: /speichern/i }).click();
    await page.waitForURL("**/de", { timeout: 10000 });

    await page.goto("/de/profile");
    await expect(page.getByRole("img", { name: /vorschau/i })).toBeVisible({ timeout: 5000 });

    const res = await page.request.get("/api/profile");
    const saved = await res.json();
    // Komprimierung hat stattgefunden: Canvas gibt JPEG aus
    expect(saved?.photo).toMatch(/^data:image\/jpeg/);

    await page.screenshot({ path: "docs/qa-foto-gross.png" });
  });

  test("Story 2: Fehlermeldung bei fehlgeschlagenem Speichern", async ({ page }) => {
    await page.route("**/api/profile", (route) => {
      if (route.request().method() === "POST") {
        return route.fulfill({ status: 500, contentType: "application/json", body: "{}" });
      }
      return route.continue();
    });

    await page.goto("/de/profile");
    await page.getByLabel(/name/i).fill("Max Mustermann");
    await page.getByPlaceholder(/institution/i).fill("TU Berlin");
    await page.getByRole("button", { name: /speichern/i }).click();

    await expect(page.getByText(/profil konnte nicht gespeichert werden/i)).toBeVisible({ timeout: 3000 });
    await page.screenshot({ path: "docs/qa-foto-fehler.png" });
  });
});
