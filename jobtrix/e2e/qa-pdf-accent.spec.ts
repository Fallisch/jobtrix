import { test, expect } from "@playwright/test";
import { registerAndLogin, uniqueEmail } from "./helpers/auth";
import * as fs from "fs";
import * as zlib from "zlib";

const PHOTO =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

const PROFILE = {
  name: "Lena Testmann",
  address: "Teststraße 42, 10115 Berlin",
  birthdate: "1995-06-15",
  photo: PHOTO,
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
  interests: [{ label: "Schach", value: 50 }],
};

const MOCK_CV = "Lena Testmann\n\nLebenslauf-Inhalt";
const MOCK_COVER_LETTER = "Sehr geehrte Damen und Herren,\n\nIch bewerbe mich hiermit.";

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

test.describe("Issue #38 – PDF-Layout 'Akzent'", () => {
  test("Story: Layout Akzent + Akzentfarbe auswählen -> generieren -> Lebenslauf-PDF zeigt Foto-Banner, Zeitstrahl und Fortschrittsbalken, Anschreiben-PDF zeigt Banner-Header mit 'Bewerbung'-Band", async ({
    page,
  }) => {
    await registerAndLogin(page, uniqueEmail("e2e-pdf-accent"), "Correct-1");

    await page.goto("/de/generate");
    await page.evaluate((p) => {
      localStorage.setItem("jobtrix_profile", JSON.stringify(p));
    }, PROFILE);
    await page.reload();

    await page.route("**/api/generate", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ coverLetter: MOCK_COVER_LETTER, cv: MOCK_CV, emailSubject: "Bewerbung" }),
      })
    );

    await page.getByRole("textbox", { name: /Stellenanzeige/i }).fill("Wir suchen einen Entwickler.");
    await page.getByRole("button", { name: /Bewerbung generieren/i }).click();
    await page.waitForSelector("textarea[aria-label='Anschreiben']");

    await page.getByRole("button", { name: "Akzent", exact: true }).click();

    // Akzentfarben-Palette ist bei Akzent sichtbar
    const palette = page.getByTestId("color-palette");
    await expect(palette).toHaveCount(1);
    await palette.getByRole("button", { name: "Farbe #1A5C38" }).click();

    // Lebenslauf-PDF: Foto-Banner, Zeitstrahl (Berufserfahrung/Ausbildung), Fortschrittsbalken (Qualifikationen/Interessen)
    await page.getByTestId("cv-agree-checkbox").check();
    const [cvDownload] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /Lebenslauf als PDF/i }).click(),
    ]);
    const cvBuf = fs.readFileSync((await cvDownload.path())!);
    const cvText = extractText(decodePdfStreams(cvBuf));

    expect(cvBuf.toString("latin1")).toContain("/Image");
    expect(cvText).toContain("LENA TESTMANN");
    expect(cvText).toContain("Berufserfahrung");
    expect(cvText).toContain("Acme GmbH");
    expect(cvText).toContain("Entwickler");
    expect(cvText).toContain("01/2020 - 12/2022");
    expect(cvText).toContain("Ausbildung");
    expect(cvText).toContain("FU Berlin");
    expect(cvText).toContain("Qualifikationen");
    expect(cvText).toContain("TypeScript");
    expect(cvText).toContain("Interessen");
    expect(cvText).toContain("Schach");

    // Anschreiben-PDF: gleicher Banner-Header (Foto, Name, "Bewerbung"-Band)
    await page.getByTestId("cover-letter-agree-checkbox").check();
    const [letterDownload] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /Anschreiben als PDF/i }).click(),
    ]);
    const letterBuf = fs.readFileSync((await letterDownload.path())!);
    const letterText = extractText(decodePdfStreams(letterBuf));

    expect(letterBuf.toString("latin1")).toContain("/Image");
    expect(letterText).toContain("LENA TESTMANN");
    expect(letterText).toContain("BEWERBUNG");
    expect(letterText).toContain("Ich bewerbe mich hiermit");
  });
});
