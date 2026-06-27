import { test, expect } from "@playwright/test";

test.describe("Issue #25 – Sprachpräfix nach Profil-Speichern erhalten", () => {
  test("Story: Profil unter /en/profile speichern bleibt auf /en", async ({ page }) => {
    const email = `e2e-locale-en-${Date.now()}@example.com`;
    const password = "Correct-1";

    await page.goto("/en/register");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByLabel("Confirm password").fill(password);
    await page.getByLabel(/terms and conditions/i).check();
    await page.getByRole("button", { name: "Register" }).click();

    await expect(page).toHaveURL(/\/en\/onboarding/);

    await page.goto("/en/profile");
    await page.getByLabel(/^name/i).fill("Max Mustermann");
    await page.getByPlaceholder("Institution").fill("TU Berlin");

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/profile") && res.request().method() === "POST"
      ),
      page.getByRole("button", { name: "Save" }).click(),
    ]);
    expect(response.ok()).toBe(true);

    await expect(page).toHaveURL(/^http:\/\/localhost:3000\/en(\/.*)?$/);

    await page.screenshot({ path: "docs/qa-locale-redirect-en.png", fullPage: true });
  });

  test("Story: Profil unter /de/profile speichern bleibt auf /de", async ({ page }) => {
    const email = `e2e-locale-de-${Date.now()}@example.com`;
    const password = "Correct-1";

    await page.goto("/de/register");
    await page.getByLabel("E-Mail").fill(email);
    await page.getByLabel("Passwort", { exact: true }).fill(password);
    await page.getByLabel("Passwort bestätigen").fill(password);
    await page.getByLabel(/AGB und die Datenschutzbestimmungen/).check();
    await page.getByRole("button", { name: "Registrieren" }).click();

    await expect(page).toHaveURL(/\/de\/onboarding/);

    await page.goto("/de/profile");
    await page.getByLabel(/^name/i).fill("Max Mustermann");
    await page.getByPlaceholder("Institution").fill("TU Berlin");

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/profile") && res.request().method() === "POST"
      ),
      page.getByRole("button", { name: "Speichern" }).click(),
    ]);
    expect(response.ok()).toBe(true);

    await expect(page).toHaveURL(/^http:\/\/localhost:3000\/de(\/.*)?$/);

    await page.screenshot({ path: "docs/qa-locale-redirect-de.png", fullPage: true });
  });
});
