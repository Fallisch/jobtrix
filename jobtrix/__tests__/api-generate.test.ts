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
  qualifications: ["TypeScript", "React"],
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

  it("übergibt Profil und Stellentext an Claude API", async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: "ANSCHREIBEN: text\n\nLEBENSLAUF: text" }],
    });

    await POST(makeRequest({ jobPosting: "Senior Developer gesucht", profile }));

    expect(mockCreate).toHaveBeenCalledTimes(1);
    const promptText = JSON.stringify(mockCreate.mock.calls[0][0]);
    expect(promptText).toContain("Senior Developer gesucht");
    expect(promptText).toContain("Max Mustermann");
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

  it("gibt Fehler 500 zurück wenn Claude API fehlschlägt", async () => {
    mockCreate.mockRejectedValue(new Error("API nicht erreichbar"));

    const res = await POST(makeRequest({ jobPosting: "Stelle", profile }));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toHaveProperty("error");
  });
});
