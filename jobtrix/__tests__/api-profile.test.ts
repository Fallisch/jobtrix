/**
 * @jest-environment node
 */
import bcrypt from "bcrypt";
import { GET, POST } from "@/app/api/profile/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { ProfileData } from "@/lib/profile-storage";

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

const mockedGetServerSession = jest.mocked(getServerSession);

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/profile", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

const profileData: ProfileData = {
  name: "Max Mustermann",
  address: "Musterstraße 1",
  email: "max@example.com",
  phone: "0151 123456",
  birthdate: "1990-01-15",
  photo: null,
  education: [{ id: "1", institution: "TU Berlin", degree: "B.Sc.", year: "2015" }],
  qualifications: [{ label: "TypeScript", value: 80 }],
  interests: [{ label: "Reisen", value: 60 }],
};

describe("GET/POST /api/profile", () => {
  const email = `profile-test-${Date.now()}@example.com`;
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

  it("liefert ein leeres Default-Profil falls noch keins angelegt wurde", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: userId }, expires: "" });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.name).toBe("");
    expect(data.education).toEqual([]);
  });

  it("speichert ein Profil per POST und liefert es per GET zurück", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: userId }, expires: "" });

    const postRes = await POST(makeRequest(profileData));
    expect(postRes.status).toBe(200);

    const getRes = await GET();
    const data = await getRes.json();

    expect(data).toMatchObject(profileData);
  });

  it("aktualisiert ein bestehendes Profil bei erneutem POST", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: userId }, expires: "" });

    await POST(makeRequest(profileData));
    const updated = { ...profileData, name: "Erika Musterfrau" };
    await POST(makeRequest(updated));

    const getRes = await GET();
    const data = await getRes.json();
    expect(data.name).toBe("Erika Musterfrau");
  });

  it("lehnt POST mit ungültigen Daten ab (fehlender Name)", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: userId }, expires: "" });

    const res = await POST(makeRequest({ ...profileData, name: "" }));
    expect(res.status).toBe(400);
  });

  it("isoliert Profile strikt pro Nutzerkonto", async () => {
    const otherEmail = `profile-test-other-${Date.now()}@example.com`;
    const otherPasswordHash = await bcrypt.hash("password", 10);
    const otherUser = await prisma.user.create({ data: { email: otherEmail, passwordHash: otherPasswordHash } });

    try {
      mockedGetServerSession.mockResolvedValue({ user: { id: userId }, expires: "" });
      await POST(makeRequest({ ...profileData, name: "User A" }));

      mockedGetServerSession.mockResolvedValue({ user: { id: otherUser.id }, expires: "" });
      await POST(makeRequest({ ...profileData, name: "User B" }));

      const otherGetRes = await GET();
      const otherData = await otherGetRes.json();
      expect(otherData.name).toBe("User B");

      mockedGetServerSession.mockResolvedValue({ user: { id: userId }, expires: "" });
      const getRes = await GET();
      const data = await getRes.json();
      expect(data.name).toBe("User A");
    } finally {
      await prisma.userProfile.deleteMany({ where: { userId: otherUser.id } });
      await prisma.user.delete({ where: { id: otherUser.id } });
    }
  });
});
