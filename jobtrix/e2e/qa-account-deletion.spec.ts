import { test, expect } from "@playwright/test";
import { registerAndLogin, uniqueEmail } from "./helpers/auth";

test.describe("Issue #49 – Konto-Löschung im Bereich 'Konto & Datenschutz'", () => {
  test("Datenexport anstoßen, Konto mit korrektem Passwort löschen -> abgemeldet, alte Zugangsdaten funktionieren nicht mehr", async ({ page }) => {
    const email = uniqueEmail("e2e-account-delete");
    const password = "Correct-1";

    await registerAndLogin(page, email, password);

    await page.goto("/de/profile");
    await expect(page.getByRole("heading", { name: /konto & datenschutz/i })).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /meine daten herunterladen/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("meine-daten.json");

    await page.getByRole("button", { name: /^konto löschen$/i }).click();
    await page.getByLabel(/aktuelles passwort/i).fill(password);
    await page.getByRole("button", { name: /konto endgültig löschen/i }).click();

    await expect(page).toHaveURL("http://localhost:3000/de");

    await page.goto("/de/profile");
    await expect(page).toHaveURL(/\/de\/login/);

    await page.waitForLoadState("networkidle");
    await page.getByLabel("E-Mail").fill(email);
    await page.getByLabel("Passwort").fill(password);
    await page.getByRole("button", { name: "Anmelden" }).click();

    await expect(page.getByText("E-Mail oder Passwort ist falsch")).toBeVisible();
    await expect(page).toHaveURL(/\/de\/login/);
  });
});
