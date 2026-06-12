import { test, expect, Page } from "@playwright/test";
import { prisma } from "../lib/prisma";

const PROFILE = {
  name: "Max Mustermann",
  address: "Musterstraße 1, 12345 Berlin",
  birthdate: "1990-01-01",
  photo: null,
  education: [{ id: "1", institution: "TU Berlin", degree: "B.Sc. Informatik", year: "2015" }],
  qualifications: ["TypeScript", "React"],
  interests: [],
};

async function registerAndLogin(page: Page, email: string, password: string): Promise<string> {
  await page.goto("/de/register");
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

test.describe("Issue #23 – Bewerbungshistorie", () => {
  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test("Generierung mit Stellentitel erscheint in der Historie und PDFs können erneut heruntergeladen werden", async ({ page }) => {
    test.setTimeout(180_000);

    const email = `e2e-history-${Date.now()}@example.com`;
    const userId = await registerAndLogin(page, email, "correct-password");

    await page.goto("/de/generate");
    await page.evaluate((p) => {
      localStorage.setItem("jobtrix_profile", JSON.stringify(p));
    }, PROFILE);
    await page.reload();

    await page.getByRole("textbox", { name: /Stellenanzeige/i }).fill("Wir suchen einen erfahrenen TypeScript-Entwickler für unser Team.");
    await page.getByRole("textbox", { name: /Stellentitel/i }).fill("TypeScript-Entwickler");
    await page.getByRole("button", { name: /Bewerbung generieren/i }).click();

    await page.waitForSelector("textarea[aria-label='Anschreiben']", { timeout: 120_000 });

    await page.goto("/de/application-history");
    await expect(page.getByText("TypeScript-Entwickler")).toBeVisible();

    await page.getByRole("link", { name: "Anzeigen" }).first().click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("TypeScript-Entwickler");

    const downloadPromise1 = page.waitForEvent("download");
    const downloadPromise2 = page.waitForEvent("download");
    await page.getByRole("button", { name: "PDF erneut herunterladen" }).click();
    const [download1, download2] = await Promise.all([downloadPromise1, downloadPromise2]);

    expect(download1.suggestedFilename()).toMatch(/\.pdf$/);
    expect(download2.suggestedFilename()).toMatch(/\.pdf$/);

    await prisma.user.delete({ where: { id: userId } });
  });
});
