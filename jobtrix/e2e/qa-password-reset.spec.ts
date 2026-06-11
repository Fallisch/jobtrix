import { test, expect } from "@playwright/test";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { generateResetToken } from "../lib/reset-token";

test.describe("Issue #18 – Passwort zurücksetzen per E-Mail", () => {
  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test("Login-Seite verlinkt auf Passwort-vergessen-Seite", async ({ page }) => {
    await page.goto("/de/login");
    await page.getByRole("link", { name: "Passwort vergessen?" }).click();
    await expect(page).toHaveURL(/\/de\/forgot-password/);
  });

  test("Reset anfordern, neues Passwort setzen und damit einloggen", async ({ page }) => {
    const email = `e2e-reset-${Date.now()}@example.com`;
    const oldPassword = "altes-passwort";
    const newPassword = "neues-passwort-123";

    const passwordHash = await bcrypt.hash(oldPassword, 10);
    const user = await prisma.user.create({ data: { email, passwordHash } });

    // Schritt 1: Reset auf der Passwort-vergessen-Seite anfordern
    await page.goto("/de/forgot-password");
    await page.getByLabel("E-Mail").fill(email);
    await page.getByRole("button", { name: "Link anfordern" }).click();
    await expect(
      page.getByText(
        "Wenn ein Konto mit dieser E-Mail-Adresse existiert, haben wir dir einen Link zum Zurücksetzen des Passworts gesendet."
      )
    ).toBeVisible();

    // Schritt 2: Signiertes Reset-Token (entspricht dem Link aus der Brevo-Mail) einlösen
    const token = generateResetToken(user.id, user.passwordHash);
    await page.goto(`/de/reset-password?token=${token}`);
    await page.getByLabel("Neues Passwort").fill(newPassword);
    await page.getByLabel("Passwort bestätigen").fill(newPassword);
    await page.getByRole("button", { name: "Passwort speichern" }).click();
    await expect(
      page.getByText("Dein Passwort wurde erfolgreich geändert. Du kannst dich jetzt anmelden.")
    ).toBeVisible();

    // Schritt 3: Login mit dem neuen Passwort funktioniert
    await page.getByRole("link", { name: "Zum Login" }).click();
    await expect(page).toHaveURL(/\/de\/login/);
    await page.getByLabel("E-Mail").fill(email);
    await page.getByLabel("Passwort", { exact: true }).fill(newPassword);
    await page.getByRole("button", { name: "Anmelden" }).click();
    await expect(page).toHaveURL(/\/de\/profile/);

    await prisma.user.deleteMany({ where: { email } });
  });

  test("Ungültiges Token zeigt verständliche Fehlermeldung mit Link zu /forgot-password", async ({ page }) => {
    await page.goto("/de/reset-password?token=ungueltiges-token");
    await page.getByLabel("Neues Passwort").fill("irgendein-passwort");
    await page.getByLabel("Passwort bestätigen").fill("irgendein-passwort");
    await page.getByRole("button", { name: "Passwort speichern" }).click();

    await expect(page.getByRole("heading", { name: "Link ungültig oder abgelaufen" })).toBeVisible();
    await expect(
      page.getByText("Dieser Link zum Zurücksetzen des Passworts ist ungültig oder abgelaufen.")
    ).toBeVisible();
    await page.getByRole("link", { name: "Neuen Link anfordern" }).click();
    await expect(page).toHaveURL(/\/de\/forgot-password/);
  });
});
