/**
 * @jest-environment node
 */
jest.mock("@anthropic-ai/sdk");

import { POST } from "@/app/api/generate/route";
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const MockedAnthropic = jest.mocked(Anthropic);
let mockCreate: jest.Mock;

const profile = {
  name: "Max Mustermann",
  address: "Musterstraße 1, 12345 Berlin",
  birthdate: "1990-01-01",
  photo: null,
  education: [{ id: "1", institution: "TU Berlin", degree: "B.Sc. Informatik", year: "2015" }],
  qualifications: [{ label: "TypeScript", value: 80 }, { label: "React", value: 60 }],
  interests: [{ label: "Reisen", value: 60 }],
};

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/generate", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  mockCreate = jest.fn();
  MockedAnthropic.mockImplementation(() => ({ messages: { create: mockCreate } } as never));
  process.env.ANTHROPIC_API_KEY = "test-key";
});

describe("POST /api/generate", () => {
  it("gibt Anschreiben und Lebenslauf zurück wenn Claude API erfolgreich antwortet", async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: "ANSCHREIBEN: Sehr geehrte Damen\n\nLEBENSLAUF: Max Mustermann" }],
    });

    const res = await POST(makeRequest({ jobPosting: "Wir suchen einen Entwickler", profile }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveProperty("coverLetter");
    expect(data).toHaveProperty("cv");
    expect(typeof data.coverLetter).toBe("string");
    expect(typeof data.cv).toBe("string");
  });

  it("fordert Claude an, einen Betreffvorschlag für die E-Mail zu generieren, und gibt ihn zurück", async () => {
    mockCreate.mockResolvedValue({
      content: [{
        type: "text",
        text: "BETREFF: Bewerbung als Senior Developer – Max Mustermann\n\nANSCHREIBEN: Sehr geehrte Damen\n\nLEBENSLAUF: Max Mustermann",
      }],
    });

    const res = await POST(makeRequest({ jobPosting: "Senior Developer gesucht", profile }));
    const data = await res.json();

    const promptText = JSON.stringify(mockCreate.mock.calls[0][0]);
    expect(promptText).toMatch(/Betreff/i);

    expect(res.status).toBe(200);
    expect(data.emailSubject).toBe("Bewerbung als Senior Developer – Max Mustermann");
  });

  it("übergibt Profil und Stellentext an Claude API (zwei Aufrufe: generieren + humanisieren)", async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: "ANSCHREIBEN: text\n\nLEBENSLAUF: text" }],
    });

    await POST(makeRequest({ jobPosting: "Senior Developer gesucht", profile }));

    expect(mockCreate).toHaveBeenCalledTimes(2);
    const firstCallPrompt = JSON.stringify(mockCreate.mock.calls[0][0]);
    expect(firstCallPrompt).toContain("Senior Developer gesucht");
    expect(firstCallPrompt).toContain("Max Mustermann");
    const secondCallPrompt = JSON.stringify(mockCreate.mock.calls[1][0]);
    expect(secondCallPrompt).toContain("ANSCHREIBEN:");
    expect(secondCallPrompt).toContain("LEBENSLAUF:");
  });

  it("weist Claude an, reinen Klartext ohne Markdown-Formatierung zu liefern", async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: "ANSCHREIBEN: text\n\nLEBENSLAUF: text" }],
    });

    await POST(makeRequest({ jobPosting: "Stelle als Entwickler", profile }));

    const promptText = JSON.stringify(mockCreate.mock.calls[0][0]);
    expect(promptText).toMatch(/ohne Markdown|kein Markdown|reinem Klartext|reinen Klartext/i);
  });

  it("übergibt optionale Felder Firmenname und Ansprechpartner an Claude API", async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: "ANSCHREIBEN: text\n\nLEBENSLAUF: text" }],
    });

    await POST(makeRequest({
      jobPosting: "Stelle als Entwickler",
      companyName: "Acme GmbH",
      contactPerson: "Frau Schmidt",
      profile,
    }));

    const promptText = JSON.stringify(mockCreate.mock.calls[0][0]);
    expect(promptText).toContain("Acme GmbH");
    expect(promptText).toContain("Frau Schmidt");
  });

  it("parst Markdown-formatierte Antworten korrekt (Sternchen-Marker, Präambel-Überschrift, Label-Echo)", async () => {
    mockCreate.mockResolvedValue({
      content: [{
        type: "text",
        text: "# Bewerbungsunterlagen für Max Mustermann\n\n---\n\n**ANSCHREIBEN:**\n\nSehr geehrte Damen und Herren\n\nMit freundlichen Grüßen\n\n---\n\n**LEBENSLAUF: Lebenslauf**\n\n---\n\n**Max Mustermann**\nWerdegang und Qualifikationen",
      }],
    });

    const res = await POST(makeRequest({ jobPosting: "Wir suchen einen Entwickler", profile }));
    const data = await res.json();

    expect(data.coverLetter).toBe("Sehr geehrte Damen und Herren\n\nMit freundlichen Grüßen");
    expect(data.cv).toBe("**Max Mustermann**\nWerdegang und Qualifikationen");
    expect(data.coverLetter).not.toContain("**");
    expect(data.coverLetter).not.toContain("Bewerbungsunterlagen");
    expect(data.cv).not.toMatch(/^[\s#*]*Lebenslauf/i);
  });

  it("gibt Fehler 500 zurück wenn Claude API fehlschlägt", async () => {
    mockCreate.mockRejectedValue(new Error("API nicht erreichbar"));

    const res = await POST(makeRequest({ jobPosting: "Stelle", profile }));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toHaveProperty("error");
  });
});
