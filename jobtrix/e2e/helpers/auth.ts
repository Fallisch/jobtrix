import { expect, Page } from "@playwright/test";

export async function registerAndLogin(page: Page, email: string, password: string): Promise<string> {
  await page.goto("/de/register");
  // Wartet, bis die initialen NextAuth-Requests (Session/CSRF) abgeschlossen sind,
  // um eine Race Condition bei den CSRF-Cookies zu vermeiden (siehe Issue #24).
  await page.waitForLoadState("networkidle");
  await page.getByLabel("E-Mail").fill(email);
  await page.getByLabel("Passwort", { exact: true }).fill(password);
  await page.getByLabel("Passwort bestätigen").fill(password);
  await page.getByLabel(/AGB und die Datenschutzbestimmungen/).check();
  await page.getByRole("button", { name: "Registrieren" }).click();
  await expect(page).toHaveURL(/\/de\/profile/);

  const sessionRes = await page.request.get("/api/auth/session");
  const session = await sessionRes.json();
  return session.user.id as string;
}

export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}@example.com`;
}
