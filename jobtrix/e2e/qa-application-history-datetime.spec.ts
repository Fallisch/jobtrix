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

test.describe("Issue #28 – Uhrzeit in Bewerbungshistorie-Einträgen anzeigen", () => {
  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test("Liste und Detailansicht zeigen Datum und Uhrzeit eines Eintrags", async ({ page }) => {
    const email = uniqueEmail("e2e-history-datetime");
    const userId = await registerAndLogin(page, email, "Correct-1");

    await prisma.applicationHistoryEntry.create({
      data: {
        userId,
        jobTitle: "Cloud Engineer",
        companyName: "Delta GmbH",
        emailSubject: "Bewerbung als Cloud Engineer",
        coverLetter: "Sehr geehrte Damen und Herren, Anschreiben",
        cv: "Lebenslauf",
        profileSnapshot: PROFILE_SNAPSHOT,
      },
    });

    await page.goto("/de/application-history");
    await expect(page.getByText("Cloud Engineer")).toBeVisible();
    await expect(page.getByText(/\d{1,2}:\d{2}/)).toBeVisible();

    await page.getByRole("link", { name: "Anzeigen" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Cloud Engineer");
    await expect(page.getByText(/\d{1,2}:\d{2}/)).toBeVisible();
  });
});
