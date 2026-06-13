/**
 * @jest-environment node
 */
jest.mock("@anthropic-ai/sdk");
jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

import bcrypt from "bcrypt";
import { POST } from "@/app/api/generate/route";
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";

const MockedAnthropic = jest.mocked(Anthropic);
const mockedGetServerSession = jest.mocked(getServerSession);
let mockCreate: jest.Mock;

const profile = {
  name: "Max Mustermann",
  address: "Musterstraße 1, 12345 Berlin",
  birthdate: "1990-01-01",
  photo: null,
  education: [{ id: "1", institution: "TU Berlin", degree: "B.Sc. Informatik", year: "2015" }],
  experience: [],
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

const email = `generate-test-${Date.now()}@example.com`;
let userId: string;

beforeAll(async () => {
  const passwordHash = await bcrypt.hash("password", 10);
  const user = await prisma.user.create({ data: { email, passwordHash } });
  userId = user.id;
});

afterAll(async () => {
  await prisma.applicationHistoryEntry.deleteMany({ where: { userId } });
  await prisma.access.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });
  await prisma.$disconnect();
});

beforeEach(async () => {
  mockCreate = jest.fn();
  MockedAnthropic.mockImplementation(() => ({ messages: { create: mockCreate } } as never));
  process.env.ANTHROPIC_API_KEY = "test-key";
  mockedGetServerSession.mockResolvedValue({ user: { id: userId }, expires: "" });
  await prisma.access.deleteMany({ where: { userId } });
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

describe("Zugangskontrolle", () => {
  beforeEach(() => {
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: "ANSCHREIBEN: text\n\nLEBENSLAUF: text" }],
    });
  });

  it("liefert 401 ohne Session", async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const res = await POST(makeRequest({ jobPosting: "Stelle", profile }));

    expect(res.status).toBe(401);
  });

  it("erlaubt die erste Generierung kostenlos und markiert sie als verbraucht", async () => {
    const res = await POST(makeRequest({ jobPosting: "Stelle", profile }));

    expect(res.status).toBe(200);
    const access = await prisma.access.findUnique({ where: { userId } });
    expect(access?.freeGenerationUsed).toBe(true);
  });

  it("liefert 'Zugang erforderlich' bei bereits verbrauchter kostenloser Generierung ohne Paket", async () => {
    await prisma.access.create({ data: { userId, freeGenerationUsed: true, package: "none" } });

    const res = await POST(makeRequest({ jobPosting: "Stelle", profile }));
    const data = await res.json();

    expect(res.status).toBe(402);
    expect(data.error).toBe("access_required");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("erlaubt die Generierung bei aktivem Lifetime-Zugang", async () => {
    await prisma.access.create({ data: { userId, freeGenerationUsed: true, package: "lifetime" } });

    const res = await POST(makeRequest({ jobPosting: "Stelle", profile }));

    expect(res.status).toBe(200);
  });

  it("liefert 'Zugang erforderlich' bei abgelaufenem zeitlich begrenztem Zugang", async () => {
    const validUntil = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await prisma.access.create({ data: { userId, freeGenerationUsed: true, package: "limited", validUntil } });

    const res = await POST(makeRequest({ jobPosting: "Stelle", profile }));
    const data = await res.json();

    expect(res.status).toBe(402);
    expect(data.error).toBe("access_required");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("erlaubt die Generierung bei noch gültigem zeitlich begrenztem Zugang", async () => {
    const validUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.access.create({ data: { userId, freeGenerationUsed: true, package: "limited", validUntil } });

    const res = await POST(makeRequest({ jobPosting: "Stelle", profile }));

    expect(res.status).toBe(200);
  });
});

describe("Bewerbungshistorie", () => {
  beforeEach(async () => {
    mockCreate.mockResolvedValue({
      content: [{
        type: "text",
        text: "BETREFF: Bewerbung als Senior Developer – Max Mustermann\n\nANSCHREIBEN: Sehr geehrte Damen und Herren\n\nLEBENSLAUF: Max Mustermann – Lebenslauf",
      }],
    });
    await prisma.applicationHistoryEntry.deleteMany({ where: { userId } });
  });

  afterAll(async () => {
    await prisma.applicationHistoryEntry.deleteMany({ where: { userId } });
  });

  it("legt nach erfolgreicher Generierung einen Bewerbungshistorie-Eintrag mit den korrekten Daten an", async () => {
    const res = await POST(makeRequest({
      jobPosting: "Wir suchen einen Entwickler",
      jobTitle: "Senior Developer",
      companyName: "Acme GmbH",
      profile,
    }));

    expect(res.status).toBe(200);

    const entries = await prisma.applicationHistoryEntry.findMany({ where: { userId } });
    expect(entries).toHaveLength(1);
    expect(entries[0].jobTitle).toBe("Senior Developer");
    expect(entries[0].companyName).toBe("Acme GmbH");
    expect(entries[0].emailSubject).toBe("Bewerbung als Senior Developer – Max Mustermann");
    expect(entries[0].coverLetter).toBe("Sehr geehrte Damen und Herren");
    expect(entries[0].cv).toBe("Max Mustermann – Lebenslauf");
    expect(entries[0].profileSnapshot).toEqual(profile);
  });

  it("speichert das beim Generieren gewählte PDF-Layout 'modern' im Historie-Eintrag", async () => {
    const res = await POST(makeRequest({
      jobPosting: "Wir suchen einen Entwickler",
      profile,
      template: "modern",
    }));

    expect(res.status).toBe(200);

    const entries = await prisma.applicationHistoryEntry.findMany({ where: { userId } });
    expect(entries).toHaveLength(1);
    expect(entries[0].template).toBe("modern");
  });

  it("speichert 'classic' als Layout im Historie-Eintrag, wenn kein Layout angegeben wird", async () => {
    const res = await POST(makeRequest({
      jobPosting: "Wir suchen einen Entwickler",
      profile,
    }));

    expect(res.status).toBe(200);

    const entries = await prisma.applicationHistoryEntry.findMany({ where: { userId } });
    expect(entries).toHaveLength(1);
    expect(entries[0].template).toBe("classic");
  });
});
