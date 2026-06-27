import { test, expect } from "@playwright/test";
import { registerAndLogin, uniqueEmail } from "./helpers/auth";

const PROFILE = {
  name: "Max Mustermann",
  address: "Musterstraße 1, 12345 Berlin",
  birthdate: "1990-01-01",
  photo: null,
  education: [{ id: "1", institution: "TU Berlin", degree: "B.Sc. Informatik", year: "2015" }],
  qualifications: ["TypeScript", "React"],
};

test.describe("Generate Page – QA", () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page, uniqueEmail("e2e-generate"), "Correct-1");
    await page.goto("/de/generate");
    await page.evaluate((p) => {
      localStorage.setItem("jobtrix_profile", JSON.stringify(p));
    }, PROFILE);
    await page.reload();
  });

  test("AC: /de/generate lädt ohne Server-Fehler (HTTP 200)", async ({ page }) => {
    const response = await page.goto("/de/generate");
    expect(response?.status()).toBe(200);
  });

  test("AC: Eingabemaske mit allen Feldern vorhanden", async ({ page }) => {
    await expect(page.getByRole("textbox", { name: /Stellenanzeige/i })).toBeVisible();
    await expect(page.getByRole("textbox", { name: /Firmenname/i })).toBeVisible();
    await expect(page.getByRole("textbox", { name: /Ansprechpartner/i })).toBeVisible();
  });

  test("AC: Button deaktiviert wenn Stellenanzeige leer", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Bewerbung generieren/i })).toBeDisabled();
  });

  test("User Story 4+5: Stellenanzeige einfügen aktiviert Button", async ({ page }) => {
    await page.getByRole("textbox", { name: /Stellenanzeige/i }).fill("Wir suchen einen erfahrenen TypeScript-Entwickler.");
    await expect(page.getByRole("button", { name: /Bewerbung generieren/i })).toBeEnabled();
  });

  test("AC: Button deaktiviert ohne Profil", async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem("jobtrix_profile"));
    await page.reload();
    await page.getByRole("textbox", { name: /Stellenanzeige/i }).fill("Wir suchen einen Entwickler.");
    await expect(page.getByRole("button", { name: /Bewerbung generieren/i })).toBeDisabled();
  });

  test("AC: Fehlerbehandlung – zeigt Fehlermeldung wenn API fehlschlägt", async ({ page }) => {
    await page.route("**/api/generate", (route) =>
      route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "Generierung fehlgeschlagen." }) })
    );
    await page.getByRole("textbox", { name: /Stellenanzeige/i }).fill("Wir suchen einen Entwickler.");
    await page.getByRole("button", { name: /Bewerbung generieren/i }).click();
    await expect(page.locator('[role="alert"]').filter({ hasText: /Generierung/ })).toBeVisible();
  });

  test("AC: Lade-Animation erscheint während Generierung", async ({ page }) => {
    await page.route("**/api/generate", async (route) => {
      await new Promise((r) => setTimeout(r, 300));
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ coverLetter: "Anschreiben", cv: "Lebenslauf" }) });
    });
    await page.getByRole("textbox", { name: /Stellenanzeige/i }).fill("Wir suchen einen Entwickler.");
    await page.getByRole("button", { name: /Bewerbung generieren/i }).click();
    await expect(page.getByTestId("loading-animation")).toBeVisible();
  });

  test("AC: Anschreiben und Lebenslauf getrennt angezeigt nach Generierung", async ({ page }) => {
    await page.route("**/api/generate", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ coverLetter: "Sehr geehrte Damen und Herren", cv: "Max Mustermann – Lebenslauf" }) })
    );
    await page.getByRole("textbox", { name: /Stellenanzeige/i }).fill("Wir suchen einen Entwickler.");
    await page.getByRole("button", { name: /Bewerbung generieren/i }).click();
    // textarea index: 0 = Stellenanzeige, 1 = Anschreiben, 2 = Lebenslauf
    await expect(page.locator("textarea").nth(1)).toHaveValue("Sehr geehrte Damen und Herren");
    await expect(page.locator("textarea").nth(2)).toHaveValue("Max Mustermann – Lebenslauf");
  });
});
