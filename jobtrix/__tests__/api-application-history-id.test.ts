/**
 * @jest-environment node
 */
import bcrypt from "bcrypt";
import { GET } from "@/app/api/application-history/[id]/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

const mockedGetServerSession = jest.mocked(getServerSession);

const profileSnapshot = {
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

function makeContext(id: string) {
  return { params: { id } };
}

describe("GET /api/application-history/[id]", () => {
  const email = `app-history-id-test-${Date.now()}@example.com`;
  let userId: string;
  let entryId: string;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash("password", 10);
    const user = await prisma.user.create({ data: { email, passwordHash } });
    userId = user.id;

    const entry = await prisma.applicationHistoryEntry.create({
      data: {
        userId,
        jobTitle: "Senior Developer",
        companyName: "Acme GmbH",
        emailSubject: "Bewerbung als Senior Developer",
        coverLetter: "Sehr geehrte Damen und Herren",
        cv: "Max Mustermann – Lebenslauf",
        profileSnapshot,
      },
    });
    entryId = entry.id;
  });

  afterAll(async () => {
    await prisma.applicationHistoryEntry.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  beforeEach(() => {
    mockedGetServerSession.mockReset();
  });

  it("liefert 401 ohne Session", async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const res = await GET(new Request("http://localhost"), makeContext(entryId));

    expect(res.status).toBe(401);
  });

  it("liefert den vollständigen Eintrag inkl. Anschreiben, E-Mail-Entwurf und Lebenslauf-Daten", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: userId }, expires: "" });

    const res = await GET(new Request("http://localhost"), makeContext(entryId));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.jobTitle).toBe("Senior Developer");
    expect(data.companyName).toBe("Acme GmbH");
    expect(data.emailSubject).toBe("Bewerbung als Senior Developer");
    expect(data.coverLetter).toBe("Sehr geehrte Damen und Herren");
    expect(data.cv).toBe("Max Mustermann – Lebenslauf");
    expect(data.profileSnapshot).toEqual(profileSnapshot);
  });

  it("liefert 404 für eine nicht existierende ID", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: userId }, expires: "" });

    const res = await GET(new Request("http://localhost"), makeContext("nonexistent-id"));

    expect(res.status).toBe(404);
  });

  it("liefert 404 für einen Eintrag eines anderen Nutzerkontos", async () => {
    const otherEmail = `app-history-id-test-other-${Date.now()}@example.com`;
    const otherPasswordHash = await bcrypt.hash("password", 10);
    const otherUser = await prisma.user.create({ data: { email: otherEmail, passwordHash: otherPasswordHash } });

    try {
      mockedGetServerSession.mockResolvedValue({ user: { id: otherUser.id }, expires: "" });

      const res = await GET(new Request("http://localhost"), makeContext(entryId));

      expect(res.status).toBe(404);
    } finally {
      await prisma.user.delete({ where: { id: otherUser.id } });
    }
  });
});
