import { test, expect } from "@playwright/test";
import { registerAndLogin, uniqueEmail } from "./helpers/auth";
import { prisma } from "../lib/prisma";
import * as fs from "fs";
import * as zlib from "zlib";

const ACCENT_COLOR = "#1A5C38";

// @react-pdf/renderer schreibt Hintergrundfarben als RGB-Tripel (0..1) gefolgt
// vom Operator "scn" in den Content-Stream. Aus der Akzentfarbe wird derselbe
// String berechnet, der beim Rendern erzeugt wird.
function hexToFillOperator(hex: string): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  return `${[r, g, b].map((c) => c / 255).join(" ")} scn`;
}

const PROFILE_SNAPSHOT = {
  name: "Lena Testmann",
  address: "Teststraße 42, 10115 Berlin",
  email: "",
  phone: "",
  birthdate: "1995-06-15",
  photo: null,
  education: [
    { id: "1", institution: "FU Berlin", degree: "B.Sc. Informatik", year: "2015" },
    { id: "2", institution: "HU Berlin", degree: "M.Sc. Informatik", year: "2019" },
  ],
  experience: [
    { id: "1", company: "Firma A", position: "Junior Entwickler", period: "01/2016 - 12/2018", tasks: "Frontend-Entwicklung" },
    { id: "2", company: "Firma B", position: "Senior Entwickler", period: "01/2019 - 12/2022", tasks: "Backend-Entwicklung" },
  ],
  qualifications: [{ label: "TypeScript", value: 80 }],
  interests: [{ label: "Schach", value: 50 }],
};

function decodePdfStreams(buf: Buffer): string {
  const streamRe = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let content = "";
  let match: RegExpExecArray | null;
  while ((match = streamRe.exec(buf.toString("latin1"))) !== null) {
    try {
      content += zlib.inflateSync(Buffer.from(match[1], "latin1")).toString("latin1");
    } catch {
      // kein Flate-Stream (z. B. Fonts), ignorieren
    }
  }
  return content;
}

function extractText(content: string): string {
  let text = "";
  const hexRe = /<([0-9a-fA-F]+)>/g;
  let hexMatch: RegExpExecArray | null;
  while ((hexMatch = hexRe.exec(content)) !== null) {
    for (let i = 0; i < hexMatch[1].length; i += 2) {
      text += String.fromCharCode(parseInt(hexMatch[1].substr(i, 2), 16));
    }
  }
  return text;
}

test.describe("Issue #39 – Akzentfarbe und CV-Stil in Bewerbungshistorie", () => {
  test("Re-Export aus der Bewerbungshistorie behält Akzentfarbe (Modern) und CV-Stil (amerikanisch) bei", async ({ page }) => {
    const userId = await registerAndLogin(page, uniqueEmail("e2e-history-accent"), "Correct-1");

    const entry = await prisma.applicationHistoryEntry.create({
      data: {
        userId,
        jobTitle: "Senior Developer",
        companyName: "Acme GmbH",
        emailSubject: "Bewerbung als Senior Developer – Lena Testmann",
        coverLetter: "Sehr geehrte Damen und Herren,\n\nIch bewerbe mich hiermit.",
        cv: "Lena Testmann\n\nLebenslauf-Inhalt",
        profileSnapshot: PROFILE_SNAPSHOT,
        template: "modern",
        accentColor: ACCENT_COLOR,
        cvStyle: "american",
      },
    });

    await page.goto(`/de/application-history/${entry.id}`);
    await page.waitForSelector("h1");

    const downloads: import("@playwright/test").Download[] = [];
    page.on("download", (d) => downloads.push(d));

    await page.getByRole("button", { name: "PDF erneut herunterladen" }).click();
    await expect.poll(() => downloads.length).toBe(2);

    const cvDownload = downloads.find((d) => d.suggestedFilename() === "lebenslauf.pdf")!;
    const letterDownload = downloads.find((d) => d.suggestedFilename() === "anschreiben.pdf")!;

    const cvBuf = fs.readFileSync((await cvDownload.path())!);
    const letterBuf = fs.readFileSync((await letterDownload.path())!);

    const fillOperator = hexToFillOperator(ACCENT_COLOR);
    const cvContent = decodePdfStreams(cvBuf);
    const letterContent = decodePdfStreams(letterBuf);

    // Akzentfarbe wird im Lebenslauf-Header (modern-cv-header) und in der
    // Anschreiben-Sidebar (modern-sidebar) als Hintergrundfarbe verwendet.
    expect(cvContent).toContain(fillOperator);
    expect(letterContent).toContain(fillOperator);

    // CV-Stil "american": Berufserfahrung und Ausbildung antichronologisch.
    const cvText = extractText(cvContent);
    expect(cvText.indexOf("Firma B")).toBeGreaterThanOrEqual(0);
    expect(cvText.indexOf("Firma A")).toBeGreaterThan(cvText.indexOf("Firma B"));
    expect(cvText.indexOf("HU Berlin")).toBeGreaterThanOrEqual(0);
    expect(cvText.indexOf("FU Berlin")).toBeGreaterThan(cvText.indexOf("HU Berlin"));

    await prisma.applicationHistoryEntry.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
  });

  test("Re-Export aus der Bewerbungshistorie-Übersicht (Liste) behält Akzentfarbe (Modern) bei", async ({ page }) => {
    const userId = await registerAndLogin(page, uniqueEmail("e2e-history-list-accent"), "Correct-1");

    await prisma.applicationHistoryEntry.create({
      data: {
        userId,
        jobTitle: "Senior Developer",
        companyName: "Acme GmbH",
        emailSubject: "Bewerbung als Senior Developer – Lena Testmann",
        coverLetter: "Sehr geehrte Damen und Herren,\n\nIch bewerbe mich hiermit.",
        cv: "Lena Testmann\n\nLebenslauf-Inhalt",
        profileSnapshot: PROFILE_SNAPSHOT,
        template: "modern",
        accentColor: ACCENT_COLOR,
        cvStyle: "american",
      },
    });

    await page.goto("/de/application-history");
    await page.waitForSelector("h1");

    const downloads: import("@playwright/test").Download[] = [];
    page.on("download", (d) => downloads.push(d));

    await page.getByRole("button", { name: "PDF erneut herunterladen" }).first().click();
    await expect.poll(() => downloads.length).toBe(2);

    const cvDownload = downloads.find((d) => d.suggestedFilename() === "lebenslauf.pdf")!;
    const letterDownload = downloads.find((d) => d.suggestedFilename() === "anschreiben.pdf")!;

    const cvBuf = fs.readFileSync((await cvDownload.path())!);
    const letterBuf = fs.readFileSync((await letterDownload.path())!);

    const fillOperator = hexToFillOperator(ACCENT_COLOR);
    const cvContent = decodePdfStreams(cvBuf);
    const letterContent = decodePdfStreams(letterBuf);

    // Akzentfarbe wird im Lebenslauf-Header (modern-cv-header) und in der
    // Anschreiben-Sidebar (modern-sidebar) als Hintergrundfarbe verwendet.
    expect(cvContent).toContain(fillOperator);
    expect(letterContent).toContain(fillOperator);

    await prisma.applicationHistoryEntry.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
  });
});
