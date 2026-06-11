/**
 * @jest-environment node
 */
import bcrypt from "bcrypt";
import { GET } from "@/app/api/access/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

const mockedGetServerSession = jest.mocked(getServerSession);

describe("GET /api/access", () => {
  const email = `access-test-${Date.now()}@example.com`;
  let userId: string;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash("password", 10);
    const user = await prisma.user.create({ data: { email, passwordHash } });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.access.deleteMany({ where: { userId } });
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

  it("liefert package 'none' und validUntil null wenn kein Access-Datensatz existiert", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: userId }, expires: "" });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ package: "none", validUntil: null });
  });

  it("liefert package und Gültigkeitsdatum bei aktivem zeitlich begrenztem Zugang", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: userId }, expires: "" });
    const validUntil = new Date("2026-12-31T00:00:00.000Z");
    await prisma.access.create({ data: { userId, freeGenerationUsed: true, package: "limited", validUntil } });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.package).toBe("limited");
    expect(new Date(data.validUntil)).toEqual(validUntil);
  });

  it("liefert package 'lifetime' ohne Gültigkeitsdatum bei Lifetime-Zugang", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: userId }, expires: "" });
    await prisma.access.update({ where: { userId }, data: { package: "lifetime", validUntil: null } });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ package: "lifetime", validUntil: null });
  });
});
