import { test, expect, Page } from "@playwright/test";

async function registerAndLogin(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/de/register");
  await page.getByLabel("E-Mail").fill(email);
  await page.getByLabel("Passwort", { exact: true }).fill(password);
  await page.getByLabel("Passwort bestätigen").fill(password);
  await page.getByLabel(/AGB und die Datenschutzbestimmungen/).check();
  await page.getByRole("button", { name: "Registrieren" }).click();
  await expect(page).toHaveURL(/\/de\/onboarding/);
}

test.describe("Issue #27 – Übersetztes Label für Foto-Upload-Button im Profil", () => {
  test("Story: Foto-Upload-Button zeigt deutschen Text und Upload funktioniert weiterhin", async ({ page }) => {
    const email = `e2e-photo-button-${Date.now()}@example.com`;
    await registerAndLogin(page, email, "Correct-1");

    await page.goto("/de/profile");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await expect(page.getByRole("button", { name: "Datei auswählen" })).toBeVisible();

    // Accessibility: Input bleibt über Label erreichbar
    const input = page.getByLabel(/^foto$/i);
    await expect(input).toBeAttached();

    const testImagePath = "/home/faltrix/Projekte/Faltrix-Automaten/jobtrix/public/icons/icon-512x512.png";
    await input.setInputFiles(testImagePath);

    await expect(page.getByRole("img", { name: /vorschau/i })).toBeVisible({ timeout: 8000 });

    await page.screenshot({ path: "docs/qa-photo-upload-de.png", fullPage: true });
  });

  test("Story: Foto-Upload-Button zeigt englischen Text", async ({ page }) => {
    const email = `e2e-photo-button-en-${Date.now()}@example.com`;
    await registerAndLogin(page, email, "Correct-1");

    await page.goto("/en/profile");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("button", { name: "Choose file" })).toBeVisible();
    await expect(page.getByLabel(/^photo$/i)).toBeAttached();

    await page.screenshot({ path: "docs/qa-photo-upload-en.png", fullPage: true });
  });
});
