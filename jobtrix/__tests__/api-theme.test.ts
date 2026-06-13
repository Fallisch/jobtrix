/**
 * @jest-environment node
 */
import bcrypt from "bcrypt";
import { GET, POST } from "@/app/api/theme/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

const mockedGetServerSession = jest.mocked(getServerSession);

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/theme", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("GET/POST /api/theme", () => {
  const email = `theme-test-${Date.now()}@example.com`;
  let userId: string;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash("password", 10);
    const user = await prisma.user.create({ data: { email, passwordHash } });
    userId = user.id;
  });

  afterAll(async () => {
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

  it("liefert Default 'system', wenn noch keine Präferenz gespeichert wurde", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: userId }, expires: "" });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.themePreference).toBe("system");
  });

  it("speichert eine Präferenz per POST und liefert sie per GET zurück", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: userId }, expires: "" });

    const postRes = await POST(makeRequest({ themePreference: "dark" }));
    expect(postRes.status).toBe(200);

    const getRes = await GET();
    const data = await getRes.json();
    expect(data.themePreference).toBe("dark");
  });

  it("lehnt ungültige Werte per POST ab", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: userId }, expires: "" });

    const res = await POST(makeRequest({ themePreference: "blue" }));
    expect(res.status).toBe(400);
  });

  it("lehnt POST ohne Session ab", async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const res = await POST(makeRequest({ themePreference: "dark" }));
    expect(res.status).toBe(401);
  });
});
