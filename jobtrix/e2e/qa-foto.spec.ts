import { test, expect } from "@playwright/test";
import fs from "fs";

test.describe("Issue #6 – Foto-Komprimierung und Quota-Fehler", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/de/profile");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("Story 1: Foto hochladen, Profil speichern und nach Reload noch vorhanden", async ({ page }) => {
    const testImagePath = "/home/faltrix/Projekte/Faltrix-Automaten/jobtrix/public/icons/icon-512x512.png";

    await page.getByLabel(/name/i).fill("Max Mustermann");
    await page.getByPlaceholder(/institution/i).fill("TU Berlin");

    const input = page.locator('input[type="file"]');
    await input.setInputFiles(testImagePath);

    await expect(page.getByRole("img", { name: /vorschau/i })).toBeVisible({ timeout: 8000 });

    await page.getByRole("button", { name: /speichern/i }).click();
    await page.waitForURL("**/de", { timeout: 10000 });

    await page.goto("/de/profile");
    await expect(page.getByRole("img", { name: /vorschau/i })).toBeVisible({ timeout: 5000 });

    const photo: string = await page.evaluate(() => {
      const raw = localStorage.getItem("jobtrix_profile");
      if (!raw) return "";
      return JSON.parse(raw).photo ?? "";
    });
    // Komprimierung hat stattgefunden: Canvas gibt JPEG aus
    expect(photo).toMatch(/^data:image\/jpeg/);

    await page.screenshot({ path: "docs/qa-foto-gross.png" });
  });

  test("Story 2: Fehlermeldung bei gesimuliertem Quota-Fehler", async ({ page }) => {
    await page.addInitScript(() => {
      const orig = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key: string) {
        if (key === "jobtrix_profile") throw new DOMException("QuotaExceededError", "QuotaExceededError");
        orig.apply(this, arguments as unknown as [string, string]);
      };
    });

    await page.goto("/de/profile");
    await page.getByLabel(/name/i).fill("Max Mustermann");
    await page.getByPlaceholder(/institution/i).fill("TU Berlin");
    await page.getByRole("button", { name: /speichern/i }).click();

    await expect(page.getByText(/profil konnte nicht gespeichert werden/i)).toBeVisible({ timeout: 3000 });
    await page.screenshot({ path: "docs/qa-foto-fehler.png" });
  });
});
