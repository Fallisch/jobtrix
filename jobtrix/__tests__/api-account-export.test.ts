/**
 * @jest-environment node
 */
import bcrypt from "bcrypt";
import { GET } from "@/app/api/account/export/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

const mockedGetServerSession = jest.mocked(getServerSession);

describe("GET /api/account/export", () => {
  const email = `account-export-test-${Date.now()}@example.com`;
  let userId: string;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash("password", 10);
    const user = await prisma.user.create({ data: { email, passwordHash } });
    userId = user.id;

    await prisma.userProfile.create({
      data: {
        userId,
        name: "Max Mustermann",
        education: [{ id: "1", institution: "TU Berlin", degree: "B.Sc.", year: "2015" }],
        experience: [{ id: "1", company: "Acme GmbH", position: "Entwickler", period: "01/2020 - 12/2022", tasks: "Backend" }],
        qualifications: [{ label: "TypeScript", value: 80 }],
        interests: [{ label: "Reisen", value: 60 }],
      },
    });

    await prisma.applicationHistoryEntry.create({
      data: {
        userId,
        emailSubject: "Bewerbung als Entwickler",
        coverLetter: "Anschreiben-Text",
        cv: "Lebenslauf-Text",
        profileSnapshot: { name: "Max Mustermann" },
      },
    });

    await prisma.access.create({ data: { userId, package: "lifetime" } });
  });

  afterAll(async () => {
    await prisma.applicationHistoryEntry.deleteMany({ where: { userId } });
    await prisma.access.deleteMany({ where: { userId } });
    await prisma.userProfile.deleteMany({ where: { userId } });
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

  it("liefert profile, applicationHistory und account-Infos als Download mit erwarteten Top-Level-Schlüsseln", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: userId }, expires: "" });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Disposition")).toContain("attachment");

    expect(data.profile.name).toBe("Max Mustermann");
    expect(data.profile.education).toEqual([{ id: "1", institution: "TU Berlin", degree: "B.Sc.", year: "2015" }]);
    expect(data.profile.experience).toEqual([{ id: "1", company: "Acme GmbH", position: "Entwickler", period: "01/2020 - 12/2022", tasks: "Backend" }]);
    expect(data.profile.qualifications).toEqual([{ label: "TypeScript", value: 80 }]);
    expect(data.profile.interests).toEqual([{ label: "Reisen", value: 60 }]);

    expect(data.applicationHistory).toHaveLength(1);
    expect(data.applicationHistory[0].emailSubject).toBe("Bewerbung als Entwickler");

    expect(data.account.email).toBe(email);
    expect(data.account.package).toBe("lifetime");
    expect(data.account).toHaveProperty("createdAt");
  });
});
