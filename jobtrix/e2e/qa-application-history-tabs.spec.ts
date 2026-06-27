import { test, expect } from "@playwright/test";
import { registerAndLogin, uniqueEmail } from "./helpers/auth";
import { prisma } from "../lib/prisma";

const PROFILE_SNAPSHOT = {
  name: "Max Mustermann",
  address: "Musterstraße 1, 12345 Berlin",
  email: "",
  phone: "",
  birthdate: "1990-01-01",
  photo: null,
  education: [],
  qualifications: [],
  interests: [],
};

test.describe("Issue #31 – Detailansicht zeigt nur Anschreiben oder Lebenslauf statt alles", () => {
  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test("Detailansicht zeigt standardmäßig nur das Anschreiben und wechselt per Tab zu Lebenslauf und E-Mail-Entwurf", async ({ page }) => {
    const email = uniqueEmail("e2e-history-tabs");
    const userId = await registerAndLogin(page, email, "Correct-1");

    await prisma.applicationHistoryEntry.create({
      data: {
        userId,
        jobTitle: "Backend Engineer",
        companyName: "Epsilon GmbH",
        emailSubject: "Bewerbung als Backend Engineer",
        coverLetter: "Sehr geehrte Damen und Herren, Anschreiben-Inhalt",
        cv: "Lebenslauf-Inhalt",
        profileSnapshot: PROFILE_SNAPSHOT,
      },
    });

    await page.goto("/de/application-history");
    await page.getByRole("link", { name: "Anzeigen" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Backend Engineer");

    // Standardmäßig nur Anschreiben sichtbar
    await expect(page.getByText("Anschreiben-Inhalt")).toBeVisible();
    await expect(page.getByText("Lebenslauf-Inhalt")).not.toBeVisible();
    await expect(page.getByText("Bewerbung als Backend Engineer")).not.toBeVisible();

    // Wechsel zu Lebenslauf
    await page.getByRole("tab", { name: "Lebenslauf" }).click();
    await expect(page.getByText("Lebenslauf-Inhalt")).toBeVisible();
    await expect(page.getByText("Anschreiben-Inhalt")).not.toBeVisible();

    // Wechsel zu E-Mail-Entwurf
    await page.getByRole("tab", { name: "E-Mail-Entwurf" }).click();
    await expect(page.getByText("Bewerbung als Backend Engineer")).toBeVisible();
    await expect(page.getByText("Anschreiben-Inhalt")).toBeVisible();
    await expect(page.getByText("Lebenslauf-Inhalt")).not.toBeVisible();
  });
});
