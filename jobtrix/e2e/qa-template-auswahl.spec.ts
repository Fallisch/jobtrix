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

test.describe("Template-Auswahl – QA (Issue #8)", () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page, uniqueEmail("e2e-template"), "Correct-1");
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
    const templateSection = page.getByText("Layout:").locator("xpath=..");
    await expect(templateSection.getByRole("button", { name: "Klassisch", exact: true })).toBeVisible();
    await expect(templateSection.getByRole("button", { name: "Modern", exact: true })).toBeVisible();
  });

  test("AC: Layout 'Kreativ' ist auswählbar und zeigt Akzentfarben-Palette", async ({ page }) => {
    const templateSection = page.getByText("Layout:").locator("xpath=..");
    const creativeBtn = templateSection.getByRole("button", { name: "Kreativ", exact: true });
    await expect(creativeBtn).toBeVisible();

    await creativeBtn.click();
    await expect(creativeBtn).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("color-palette")).toBeVisible();
  });

  test("AC: Klassisch ist standardmäßig aktiv (aria-pressed=true)", async ({ page }) => {
    const templateSection = page.getByText("Layout:").locator("xpath=..");
    const klassischBtn = templateSection.getByRole("button", { name: "Klassisch", exact: true });
    const modernBtn = templateSection.getByRole("button", { name: "Modern", exact: true });
    await expect(klassischBtn).toHaveAttribute("aria-pressed", "true");
    await expect(modernBtn).toHaveAttribute("aria-pressed", "false");
  });

  test("AC: Template-Umschalten auf Modern funktioniert", async ({ page }) => {
    const templateSection = page.getByText("Layout:").locator("xpath=..");
    await templateSection.getByRole("button", { name: "Modern", exact: true }).click();
    await expect(templateSection.getByRole("button", { name: "Modern", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(templateSection.getByRole("button", { name: "Klassisch", exact: true })).toHaveAttribute("aria-pressed", "false");
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

  test("AC: PDF-Download-Buttons für beide Templates sichtbar und nach Bestätigung aktiv", async ({ page }) => {
    const coverLetterPdfButton = page.getByRole("button", { name: /Anschreiben als PDF/i });
    const cvPdfButton = page.getByRole("button", { name: /Lebenslauf als PDF/i });

    await expect(coverLetterPdfButton).toBeVisible();
    await expect(cvPdfButton).toBeVisible();
    await expect(coverLetterPdfButton).toBeDisabled();
    await expect(cvPdfButton).toBeDisabled();

    await page.getByTestId("cover-letter-agree-checkbox").check();
    await page.getByTestId("cv-agree-checkbox").check();

    await expect(coverLetterPdfButton).toBeEnabled();
    await expect(cvPdfButton).toBeEnabled();
  });
});
