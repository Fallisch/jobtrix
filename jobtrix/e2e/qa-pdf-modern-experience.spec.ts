import { test, expect } from "@playwright/test";
import { registerAndLogin, uniqueEmail } from "./helpers/auth";
import * as fs from "fs";
import * as zlib from "zlib";

const PROFILE = {
  name: "Lena Testmann",
  address: "Teststraße 42, 10115 Berlin",
  birthdate: "1995-06-15",
  photo: null,
  education: [{ id: "1", institution: "FU Berlin", degree: "B.Sc. Informatik", year: "2019" }],
  experience: [
    {
      id: "1",
      company: "Acme GmbH",
      position: "Entwickler",
      period: "01/2020 - 12/2022",
      tasks: "Backend-Entwicklung",
    },
  ],
  qualifications: [{ label: "TypeScript", value: 80 }],
  interests: [],
};

const MOCK_CV = "Lena Testmann\n\nLebenslauf-Inhalt";

// @react-pdf/renderer schreibt Text als Hex-codierte Helvetica-Zeichen in
// Flate-komprimierten Content-Streams. Zum Prüfen des PDF-Inhalts werden
// alle Streams dekomprimiert und Hex-Strings in Zeichen zurückübersetzt.
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

test.describe("Issue #36 – Berufserfahrung-Sektion im Modern-PDF-Layout", () => {
  test("Story: Profil mit Berufserfahrung + Layout Modern generieren -> PDF enthält Berufserfahrung-Sektion in linker Spalte", async ({
    page,
  }) => {
    await registerAndLogin(page, uniqueEmail("e2e-pdf-modern-experience"), "correct-password");

    await page.goto("/de/generate");
    await page.evaluate((p) => {
      localStorage.setItem("jobtrix_profile", JSON.stringify(p));
    }, PROFILE);
    await page.reload();

    await page.route("**/api/generate", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ coverLetter: "Brief", cv: MOCK_CV, emailSubject: "Bewerbung" }),
      })
    );

    await page.getByRole("textbox", { name: /Stellenanzeige/i }).fill("Wir suchen einen Entwickler.");
    await page.getByRole("button", { name: /Bewerbung generieren/i }).click();
    await page.waitForSelector("textarea[aria-label='Anschreiben']");

    await page.getByRole("button", { name: "Modern", exact: true }).click();
    await page.getByTestId("cv-agree-checkbox").check();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /Lebenslauf als PDF/i }).click(),
    ]);

    const path = await download.path();
    const buf = fs.readFileSync(path!);
    const content = decodePdfStreams(buf);
    const text = extractText(content);

    expect(text).toContain("Berufserfahrung");
    expect(text).toContain("Acme GmbH");
    expect(text).toContain("Entwickler");
    expect(text).toContain("01/2020 - 12/2022");
    expect(text).toContain("Backend-Entwicklung");

    // Berufserfahrung steht in der linken Spalte vor Ausbildung
    expect(text.indexOf("Berufserfahrung")).toBeLessThan(text.indexOf("Ausbildung"));
  });
});
