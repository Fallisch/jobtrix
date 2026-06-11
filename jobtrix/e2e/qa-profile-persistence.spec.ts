import { test, expect } from "@playwright/test";

test.describe("Issue #19 – Profil aus Datenbank statt localStorage", () => {
  test("Story: Profil speichern -> neu einloggen -> gespeicherte Daten sind weiterhin vorhanden", async ({
    page,
    browser,
  }) => {
    const email = `e2e-profile-${Date.now()}@example.com`;
    const password = "correct-password";
    const name = "Erika Musterfrau";
    const institution = "TU Berlin";

    await page.goto("/de/register");
    await page.getByLabel("E-Mail").fill(email);
    await page.getByLabel("Passwort", { exact: true }).fill(password);
    await page.getByLabel("Passwort bestätigen").fill(password);
    await page.getByLabel(/AGB und die Datenschutzbestimmungen/).check();
    await page.getByRole("button", { name: "Registrieren" }).click();

    await expect(page).toHaveURL(/\/de\/profile/);

    await page.getByLabel(/^name/i).fill(name);
    await page.getByPlaceholder("Institution").fill(institution);

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/profile") && res.request().method() === "POST"
      ),
      page.getByRole("button", { name: "Speichern" }).click(),
    ]);
    expect(response.ok()).toBe(true);

    const context = await browser.newContext();
    const newPage = await context.newPage();

    await newPage.goto("/de/login");
    await newPage.getByLabel("E-Mail").fill(email);
    await newPage.getByLabel("Passwort").fill(password);
    await newPage.getByRole("button", { name: "Anmelden" }).click();

    await expect(newPage).toHaveURL(/\/de\/profile/);
    await expect(newPage.getByLabel(/^name/i)).toHaveValue(name);
    await expect(newPage.getByPlaceholder("Institution")).toHaveValue(institution);

    await context.close();
  });
});
