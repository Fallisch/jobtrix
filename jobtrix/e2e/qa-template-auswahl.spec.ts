import { test, expect } from "@playwright/test";

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

test.describe("Template-Auswahl – QA (Issue #8)", () => {
  test.beforeEach(async ({ page }) => {
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

  test("AC: Template-Auswahl mit Klassisch und Modern erscheint nach Generierung", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Klassisch/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Modern/i })).toBeVisible();
  });

  test("AC: Klassisch ist standardmäßig aktiv (aria-pressed=true)", async ({ page }) => {
    const klassischBtn = page.getByRole("button", { name: /Klassisch/i });
    const modernBtn = page.getByRole("button", { name: /Modern/i });
    await expect(klassischBtn).toHaveAttribute("aria-pressed", "true");
    await expect(modernBtn).toHaveAttribute("aria-pressed", "false");
  });

  test("AC: Template-Umschalten auf Modern funktioniert", async ({ page }) => {
    await page.getByRole("button", { name: /Modern/i }).click();
    await expect(page.getByRole("button", { name: /Modern/i })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: /Klassisch/i })).toHaveAttribute("aria-pressed", "false");
  });

  test("AC: Template-Auswahl bleibt nach erneutem Generieren erhalten", async ({ page }) => {
    await page.getByRole("button", { name: /Modern/i }).click();
    await expect(page.getByRole("button", { name: /Modern/i })).toHaveAttribute("aria-pressed", "true");

    // Erneut generieren
    await page.getByRole("button", { name: /Bewerbung generieren/i }).click();
    await expect(page.locator("textarea").nth(1)).toHaveValue("Sehr geehrte Damen und Herren");

    // Modern muss noch aktiv sein
    await expect(page.getByRole("button", { name: /Modern/i })).toHaveAttribute("aria-pressed", "true");
  });

  test("AC: PDF-Download-Buttons für beide Templates sichtbar", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Anschreiben als PDF/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Lebenslauf als PDF/i })).toBeVisible();
  });
});
