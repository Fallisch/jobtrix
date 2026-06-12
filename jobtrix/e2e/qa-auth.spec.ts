import { test, expect } from "@playwright/test";
import { uniqueEmail } from "./helpers/auth";

test.describe("Issue #17 – Registrierung, Login, Logout & Routenschutz", () => {
  test("Story: Geschützte Seite ohne Login leitet zu /de/login weiter", async ({ page }) => {
    await page.goto("/de/profile");
    await expect(page).toHaveURL(/\/de\/login/);
    await expect(page.getByRole("heading", { name: "Anmelden" })).toBeVisible();
  });

  test("Story: Registrieren -> automatisch eingeloggt -> Profile/Generate erreichbar -> Logout -> Routenschutz greift wieder", async ({ page }) => {
    const email = uniqueEmail("e2e-auth");
    const password = "correct-password";

    await page.goto("/de/register");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Registrieren" })).toBeVisible();

    await page.getByLabel("E-Mail").fill(email);
    await page.getByLabel("Passwort", { exact: true }).fill(password);
    await page.getByLabel("Passwort bestätigen").fill(password);
    await page.getByLabel(/AGB und die Datenschutzbestimmungen/).check();
    await page.getByRole("button", { name: "Registrieren" }).click();

    await expect(page).toHaveURL(/\/de\/profile/);

    await page.goto("/de/generate");
    await expect(page).toHaveURL(/\/de\/generate/);

    await page.getByRole("button", { name: "Abmelden" }).click();
    await expect(page).toHaveURL("http://localhost:3000/de");

    await page.goto("/de/profile");
    await expect(page).toHaveURL(/\/de\/login/);

    await page.goto("/de/generate");
    await expect(page).toHaveURL(/\/de\/login/);
  });

  test("Story: Login mit falschen Zugangsdaten zeigt Fehlermeldung", async ({ page }) => {
    await page.goto("/de/login");
    // Wartet, bis die initialen NextAuth-Requests (Session/CSRF) abgeschlossen sind,
    // um eine Race Condition bei den CSRF-Cookies zu vermeiden (siehe Issue #24).
    await page.waitForLoadState("networkidle");

    await page.getByLabel("E-Mail").fill("nicht-existent@example.com");
    await page.getByLabel("Passwort").fill("falsches-passwort");
    await page.getByRole("button", { name: "Anmelden" }).click();

    await expect(page.getByText("E-Mail oder Passwort ist falsch")).toBeVisible();
    await expect(page).toHaveURL(/\/de\/login/);
  });
});
