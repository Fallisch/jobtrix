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

test.describe("Issue #30 – Löschen-Button für Bewerbungshistorie-Einträge", () => {
  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test("Eintrag kann gelöscht werden und verschwindet ohne Reload aus der Liste", async ({ page }) => {
    const email = uniqueEmail("e2e-history-delete");
    const userId = await registerAndLogin(page, email, "Correct-1");

    await prisma.applicationHistoryEntry.create({
      data: {
        userId,
        jobTitle: "Senior Developer",
        companyName: "Acme GmbH",
        emailSubject: "Bewerbung als Senior Developer",
        coverLetter: "Sehr geehrte Damen und Herren, Anschreiben 1",
        cv: "Lebenslauf 1",
        profileSnapshot: PROFILE_SNAPSHOT,
      },
    });
    await prisma.applicationHistoryEntry.create({
      data: {
        userId,
        jobTitle: "Junior Developer",
        companyName: "Beta AG",
        emailSubject: "Bewerbung als Junior Developer",
        coverLetter: "Sehr geehrte Damen und Herren, Anschreiben 2",
        cv: "Lebenslauf 2",
        profileSnapshot: PROFILE_SNAPSHOT,
      },
    });

    await page.goto("/de/application-history");
    await expect(page.getByText("Senior Developer")).toBeVisible();
    await expect(page.getByText("Junior Developer")).toBeVisible();

    // Neuester Eintrag (Junior Developer) steht in der Liste an erster Stelle.
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Löschen" }).first().click();

    await expect(page.getByText("Junior Developer")).not.toBeVisible();
    await expect(page.getByText("Senior Developer")).toBeVisible();

    await page.reload();
    await expect(page.getByText("Junior Developer")).not.toBeVisible();
    await expect(page.getByText("Senior Developer")).toBeVisible();
  });

  test("Eintrag bleibt erhalten, wenn die Löschen-Bestätigung abgebrochen wird", async ({ page }) => {
    const email = uniqueEmail("e2e-history-delete-cancel");
    const userId = await registerAndLogin(page, email, "Correct-1");

    await prisma.applicationHistoryEntry.create({
      data: {
        userId,
        jobTitle: "Backend Engineer",
        companyName: "Gamma KG",
        emailSubject: "Bewerbung als Backend Engineer",
        coverLetter: "Sehr geehrte Damen und Herren, Anschreiben",
        cv: "Lebenslauf",
        profileSnapshot: PROFILE_SNAPSHOT,
      },
    });

    await page.goto("/de/application-history");
    await expect(page.getByText("Backend Engineer")).toBeVisible();

    page.once("dialog", (dialog) => dialog.dismiss());
    await page.getByRole("button", { name: "Löschen" }).click();

    await expect(page.getByText("Backend Engineer")).toBeVisible();
  });
});
