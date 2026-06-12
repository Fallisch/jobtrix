import { test, expect } from "@playwright/test";
import { registerAndLogin, uniqueEmail } from "./helpers/auth";

const PROFILE = {
  name: "Anna Beispiel",
  address: "Hauptstraße 5, 10115 Berlin",
  birthdate: "1992-03-15",
  photo: null,
  education: [{ id: "1", institution: "HU Berlin", degree: "M.Sc.", year: "2018" }],
  qualifications: ["Python", "SQL"],
  interests: ["Datenanalyse"],
};

const MOCK_RESULT = {
  coverLetter: "Sehr geehrte Damen und Herren",
  cv: "Anna Beispiel – Lebenslauf",
  emailSubject: "Bewerbung",
};

test.describe("Farbpalette Modern-Template – QA (Issue #11)", () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page, uniqueEmail("e2e-farbe"), "correct-password");
    await page.goto("/de/generate");
    await page.evaluate((p) => {
      localStorage.setItem("jobtrix_profile", JSON.stringify(p));
    }, PROFILE);
    await page.reload();
    await page.route("**/api/generate", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_RESULT) })
    );
    await page.getByRole("textbox", { name: /Stellenanzeige/i }).fill("Wir suchen eine Entwicklerin.");
    await page.getByRole("button", { name: /Bewerbung generieren/i }).click();
    await expect(page.locator("textarea").nth(1)).toHaveValue("Sehr geehrte Damen und Herren");
  });

  test("AC: Farbpalette ist bei Klassisch-Template nicht sichtbar", async ({ page }) => {
    const palette = page.getByTestId("color-palette");
    await expect(palette).not.toBeVisible();
  });

  test("AC: Farbpalette erscheint mit mindestens 5 Optionen wenn Modern aktiv", async ({ page }) => {
    await page.getByRole("button", { name: /Modern/i }).click();
    const palette = page.getByTestId("color-palette");
    await expect(palette).toBeVisible();
    const buttons = palette.locator("button");
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test("AC: Farbpalette verschwindet beim Zurückschalten auf Klassisch", async ({ page }) => {
    await page.getByRole("button", { name: /Modern/i }).click();
    await expect(page.getByTestId("color-palette")).toBeVisible();

    await page.getByRole("button", { name: /Klassisch/i }).nth(1).click();
    await expect(page.getByTestId("color-palette")).not.toBeVisible();
  });

  test("AC: Standardfarbe #1E3A5F ist initial ausgewählt", async ({ page }) => {
    await page.getByRole("button", { name: /Modern/i }).click();
    const defaultBtn = page.getByRole("button", { name: /Farbe #1E3A5F/i });
    await expect(defaultBtn).toHaveAttribute("aria-pressed", "true");
  });

  test("AC: Farbwechsel setzt aria-pressed auf neue Farbe", async ({ page }) => {
    await page.getByRole("button", { name: /Modern/i }).click();

    await page.getByRole("button", { name: /Farbe #1A5C38/i }).click();
    await expect(page.getByRole("button", { name: /Farbe #1A5C38/i })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: /Farbe #1E3A5F/i })).toHaveAttribute("aria-pressed", "false");
  });
});
