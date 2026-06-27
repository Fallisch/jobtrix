import { test, expect } from "@playwright/test";
import { registerAndLogin, uniqueEmail } from "./helpers/auth";

test.describe("Skill-Balken individuell anpassbar – QA (Issue #12)", () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page, uniqueEmail("e2e-skill-slider"), "Correct-1");
  });

  test("Slider erscheint nach Hinzufügen einer Qualifikation", async ({ page }) => {
    await page.goto("/de/profile");

    await page.getByPlaceholder(/TypeScript/i).fill("Kommunikation");
    await page.getByRole("button", { name: /^Hinzufügen$/i }).click();

    const slider = page.getByRole("slider", { name: /Kommunikation/i });
    await expect(slider).toBeVisible();
    await expect(slider).toHaveValue("60");

    await page.screenshot({ path: "docs/qa-skill-slider-form.png", fullPage: false });
  });

  test("Slider-Wert wird gespeichert und korrekt geladen", async ({ page }) => {
    await page.goto("/de/profile");

    await page.getByPlaceholder(/TypeScript/i).fill("Projektmanagement");
    await page.getByRole("button", { name: /^Hinzufügen$/i }).click();

    const slider = page.getByRole("slider", { name: /Projektmanagement/i });
    await slider.fill("80");
    await expect(slider).toHaveValue("80");

    await expect(page.getByText("80%")).toBeVisible();
  });

  test("Profil mit individuellen Skill-Werten wird korrekt gespeichert", async ({ page }) => {
    await page.goto("/de/profile");

    await page.getByPlaceholder(/TypeScript/i).fill("Python");
    await page.getByRole("button", { name: /^Hinzufügen$/i }).click();

    const slider = page.getByRole("slider", { name: /Python/i });
    await slider.fill("80");

    await page.getByPlaceholder(/Fotografie/i).fill("Lesen");
    await page.getByRole("button", { name: /Interesse hinzufügen/i }).click();
    const interestSlider = page.getByRole("slider", { name: /Lesen/i });
    await interestSlider.fill("40");

    await page.getByRole("textbox", { name: /Name/i }).fill("Test User");
    await page.getByPlaceholder(/Institution/i).fill("TU Berlin");
    await page.getByRole("button", { name: /Speichern/i }).click();
    await page.waitForURL("**/de");

    const res = await page.request.get("/api/profile");
    const saved = await res.json();

    expect(saved?.qualifications).toContainEqual({ label: "Python", value: 80 });
    expect(saved?.interests).toContainEqual({ label: "Lesen", value: 40 });

    await page.screenshot({ path: "docs/qa-skill-slider-pdf.png", fullPage: false });
  });
});
