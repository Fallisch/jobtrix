import { test, expect, Page } from "@playwright/test";
import { prisma } from "../lib/prisma";

const PROFILE_FOR_GENERATE_API = {
  name: "Max Mustermann",
  address: "Musterstraße 1, 12345 Berlin",
  birthdate: "1990-01-01",
  photo: null,
  education: [{ id: "1", institution: "TU Berlin", degree: "B.Sc. Informatik", year: "2015" }],
  qualifications: [{ label: "TypeScript", value: 80 }],
  interests: [],
};

const PROFILE_FOR_LOCAL_STORAGE = {
  name: "Max Mustermann",
  address: "Musterstraße 1, 12345 Berlin",
  birthdate: "1990-01-01",
  photo: null,
  education: [{ id: "1", institution: "TU Berlin", degree: "B.Sc. Informatik", year: "2015" }],
  qualifications: ["TypeScript", "React"],
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

test.describe("Issue #22 – Ablauf des zeitlich begrenzten Zugangs", () => {
  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test("abgelaufener Zugang führt bei Generierungsversuch zu /pricing", async ({ page }) => {
    const email = `e2e-access-expired-${Date.now()}@example.com`;
    const userId = await registerAndLogin(page, email, "correct-password");

    const validUntil = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await prisma.access.create({ data: { userId, freeGenerationUsed: true, package: "limited", validUntil } });

    await page.goto("/de/generate");
    await page.evaluate((p) => {
      localStorage.setItem("jobtrix_profile", JSON.stringify(p));
    }, PROFILE_FOR_LOCAL_STORAGE);
    await page.reload();

    await page.getByRole("textbox", { name: /Stellenanzeige/i }).fill("Wir suchen einen Entwickler.");
    await page.getByRole("button", { name: /Bewerbung generieren/i }).click();
    await expect(page).toHaveURL(/\/de\/pricing/);

    await prisma.access.deleteMany({ where: { userId } });
  });

  test("gültiger zeitlich begrenzter Zugang zeigt Datum auf Profilseite und erlaubt Generierung", async ({ page }) => {
    const email = `e2e-access-valid-${Date.now()}@example.com`;
    const userId = await registerAndLogin(page, email, "correct-password");

    const validUntil = new Date("2099-12-31T00:00:00.000Z");
    await prisma.access.create({ data: { userId, freeGenerationUsed: true, package: "limited", validUntil } });

    await page.goto("/de/profile");
    await expect(page.getByText(/gültig bis 31\.12\.2099/)).toBeVisible();

    const res = await page.request.post("/api/generate", {
      data: { jobPosting: "Wir suchen einen Entwickler.", profile: PROFILE_FOR_GENERATE_API },
    });
    expect(res.status()).not.toBe(402);

    await prisma.access.deleteMany({ where: { userId } });
  });
});
