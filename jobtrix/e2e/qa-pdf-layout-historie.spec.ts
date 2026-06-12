import { test, expect, Page } from "@playwright/test";
import { prisma } from "../lib/prisma";

const PROFILE = {
  name: "Lena Beispiel",
  address: "Beispielweg 7, 12345 Berlin",
  birthdate: "1991-04-02",
  photo: null,
  education: [{ id: "1", institution: "FU Berlin", degree: "B.Sc. Informatik", year: "2016" }],
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

test.describe("Issue #26 – PDF-Layout in Bewerbungshistorie speichern und beim Re-Export verwenden", () => {
  test("Generierung mit Layout 'Modern' wird gespeichert und beim Re-Export aus der Historie verwendet", async ({ page }) => {
    test.setTimeout(300_000);

    const email = `e2e-pdf-layout-${Date.now()}@example.com`;
    const userId = await registerAndLogin(page, email, "correct-password");
    await prisma.access.create({ data: { userId, package: "lifetime" } });

    await page.goto("/de/generate");
    await page.evaluate((p) => {
      localStorage.setItem("jobtrix_profile", JSON.stringify(p));
    }, PROFILE);
    await page.reload();

    // 1. Generierung mit Default-Layout "Klassisch"
    await page.getByRole("textbox", { name: /Stellenanzeige/i }).fill("Wir suchen eine TypeScript-Entwicklerin für unser Team.");
    await page.getByRole("button", { name: /Bewerbung generieren/i }).click();
    await page.waitForSelector("textarea[aria-label='Anschreiben']", { timeout: 120_000 });

    const templateSection = page.getByText("Layout:").locator("xpath=..");

    await expect(templateSection.getByRole("button", { name: "Klassisch", exact: true })).toHaveAttribute("aria-pressed", "true");

    // 2. Auf "Modern" umstellen und erneut generieren
    await templateSection.getByRole("button", { name: "Modern", exact: true }).click();
    await expect(templateSection.getByRole("button", { name: "Modern", exact: true })).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { name: /Bewerbung generieren/i }).click();
    await page.waitForSelector("textarea[aria-label='Anschreiben']", { timeout: 120_000 });

    // 3. In der Historie sollte der neueste Eintrag mit Layout "modern" gespeichert sein
    const entries = await prisma.applicationHistoryEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    expect(entries).toHaveLength(2);
    expect(entries[0].template).toBe("modern");
    expect(entries[1].template).toBe("classic");

    // 4. Re-Export aus der Bewerbungshistorie für den "modern"-Eintrag
    await page.goto("/de/application-history");
    const downloadPromise1 = page.waitForEvent("download");
    const downloadPromise2 = page.waitForEvent("download");
    await page.getByRole("button", { name: "PDF erneut herunterladen" }).first().click();
    const [download1, download2] = await Promise.all([downloadPromise1, downloadPromise2]);

    expect(download1.suggestedFilename()).toMatch(/\.pdf$/);
    expect(download2.suggestedFilename()).toMatch(/\.pdf$/);

    await page.screenshot({ path: "docs/qa-pdf-layout-historie.png", fullPage: true });

    await prisma.applicationHistoryEntry.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
  });
});
