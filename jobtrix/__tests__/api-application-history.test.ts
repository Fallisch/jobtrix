/**
 * @jest-environment node
 */
import bcrypt from "bcrypt";
import { GET } from "@/app/api/application-history/route";
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

describe("GET /api/application-history", () => {
  const email = `app-history-test-${Date.now()}@example.com`;
  let userId: string;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash("password", 10);
    const user = await prisma.user.create({ data: { email, passwordHash } });
    userId = user.id;
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

    const res = await GET();

    expect(res.status).toBe(401);
  });

  it("liefert eine leere Liste falls noch keine Bewerbungen generiert wurden", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: userId }, expires: "" });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual([]);
  });

  it("liefert Bewerbungshistorie-Einträge absteigend nach Erstellungsdatum sortiert", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: userId }, expires: "" });

    await prisma.applicationHistoryEntry.create({
      data: {
        userId,
        jobTitle: "Erste Bewerbung",
        emailSubject: "Betreff 1",
        coverLetter: "Anschreiben 1",
        cv: "Lebenslauf 1",
        profileSnapshot,
      },
    });
    await prisma.applicationHistoryEntry.create({
      data: {
        userId,
        jobTitle: "Zweite Bewerbung",
        emailSubject: "Betreff 2",
        coverLetter: "Anschreiben 2",
        cv: "Lebenslauf 2",
        profileSnapshot,
      },
    });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data[0].jobTitle).toBe("Zweite Bewerbung");
    expect(data[1].jobTitle).toBe("Erste Bewerbung");
  });

  it("isoliert die Bewerbungshistorie strikt pro Nutzerkonto", async () => {
    const otherEmail = `app-history-test-other-${Date.now()}@example.com`;
    const otherPasswordHash = await bcrypt.hash("password", 10);
    const otherUser = await prisma.user.create({ data: { email: otherEmail, passwordHash: otherPasswordHash } });

    try {
      await prisma.applicationHistoryEntry.create({
        data: {
          userId: otherUser.id,
          jobTitle: "Fremde Bewerbung",
          emailSubject: "Betreff",
          coverLetter: "Anschreiben",
          cv: "Lebenslauf",
          profileSnapshot,
        },
      });

      mockedGetServerSession.mockResolvedValue({ user: { id: userId }, expires: "" });
      const res = await GET();
      const data = await res.json();

      const titles = (data as Array<{ jobTitle: string }>).map((e) => e.jobTitle);
      expect(titles).not.toContain("Fremde Bewerbung");
    } finally {
      await prisma.applicationHistoryEntry.deleteMany({ where: { userId: otherUser.id } });
      await prisma.user.delete({ where: { id: otherUser.id } });
    }
  });
});
