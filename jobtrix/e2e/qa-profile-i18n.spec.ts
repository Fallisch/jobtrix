import { test, expect } from "@playwright/test";
import { registerAndLogin, uniqueEmail } from "./helpers/auth";

test.describe("Issue #15 – Profilseite ins Sprachsystem (DE/EN) einbinden", () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page, uniqueEmail("e2e-profile-i18n"), "correct-password");
    await page.goto("/de/profile");
    await page.evaluate(() => localStorage.clear());
  });

  test("Story: Profilseite zeigt deutsche Texte (Standard)", async ({ page }) => {
    await page.goto("/de/profile");

    await expect(page.getByRole("heading", { name: "Profil", level: 1 })).toBeVisible();
    await expect(page.getByLabel(/^name/i)).toBeVisible();
    await expect(page.getByLabel(/^adresse$/i)).toBeVisible();
    await expect(page.getByLabel(/^e-mail$/i)).toBeVisible();
    await expect(page.getByLabel(/^telefon$/i)).toBeVisible();
    await expect(page.getByLabel(/^geburtsdatum$/i)).toBeVisible();
    await expect(page.getByLabel(/^foto$/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ausbildung *" })).toBeVisible();
    await expect(page.getByPlaceholder("Abschluss")).toBeVisible();
    await expect(page.getByPlaceholder("Jahr")).toBeVisible();
    await expect(page.getByRole("button", { name: "Entfernen" })).toBeVisible();
    await expect(page.getByRole("button", { name: /ausbildung hinzufügen/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Qualifikationen" })).toBeVisible();
    await expect(page.getByPlaceholder("z. B. TypeScript")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Persönliche Interessen" })).toBeVisible();
    await expect(page.getByPlaceholder("z. B. Fotografie")).toBeVisible();
    await expect(page.getByRole("button", { name: /interesse hinzufügen/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Speichern" })).toBeVisible();

    await page.screenshot({ path: "docs/qa-profile-de.png", fullPage: true });
  });

  test("Story: Profilseite zeigt englische Texte nach Sprachumschaltung", async ({ page }) => {
    await page.goto("/en/profile");

    await expect(page.getByRole("heading", { name: "Profile", level: 1 })).toBeVisible();
    await expect(page.getByLabel(/^name/i)).toBeVisible();
    await expect(page.getByLabel(/^address$/i)).toBeVisible();
    await expect(page.getByLabel(/^email$/i)).toBeVisible();
    await expect(page.getByLabel(/^phone$/i)).toBeVisible();
    await expect(page.getByLabel(/date of birth/i)).toBeVisible();
    await expect(page.getByLabel(/^photo$/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Education *" })).toBeVisible();
    await expect(page.getByPlaceholder("Degree")).toBeVisible();
    await expect(page.getByPlaceholder("Year")).toBeVisible();
    await expect(page.getByRole("button", { name: "Remove" })).toBeVisible();
    await expect(page.getByRole("button", { name: /add education/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Qualifications" })).toBeVisible();
    await expect(page.getByPlaceholder("e.g. TypeScript")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Personal interests" })).toBeVisible();
    await expect(page.getByPlaceholder("e.g. Photography")).toBeVisible();
    await expect(page.getByRole("button", { name: /add interest/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Save" })).toBeVisible();

    await page.screenshot({ path: "docs/qa-profile-en.png", fullPage: true });
  });

  test("Story: Validierungsfehler erscheinen auf Englisch", async ({ page }) => {
    await page.goto("/en/profile");

    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Name is required")).toBeVisible();

    await page.getByRole("button", { name: "Remove" }).click();
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("At least one education entry is required")).toBeVisible();

    await page.screenshot({ path: "docs/qa-profile-en-errors.png", fullPage: true });
  });
});
