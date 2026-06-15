/**
 * @jest-environment node
 */
import bcrypt from "bcrypt";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/account/delete/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
}));

const mockedGetServerSession = jest.mocked(getServerSession);
const mockedCompare = jest.mocked(bcrypt.compare);

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/account/delete", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/account/delete", () => {
  let userId: string;
  let email: string;

  beforeEach(async () => {
    email = `account-delete-test-${Date.now()}-${Math.random()}@example.com`;
    const user = await prisma.user.create({ data: { email, passwordHash: "irrelevant-hash" } });
    userId = user.id;
    mockedGetServerSession.mockReset();
    mockedCompare.mockReset();
  });

  afterEach(async () => {
    await prisma.user.deleteMany({ where: { email } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("liefert 401 ohne Session", async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const res = await POST(makeRequest({ password: "irrelevant" }));

    expect(res.status).toBe(401);
  });

  it("lehnt falsches Passwort ab, ohne das Konto zu löschen", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: userId }, expires: "" });
    mockedCompare.mockResolvedValue(false as never);

    const deleteSpy = jest.spyOn(prisma.user, "delete");

    const res = await POST(makeRequest({ password: "falsches-passwort" }));

    expect(res.status).toBe(401);
    expect(deleteSpy).not.toHaveBeenCalled();

    const stillExists = await prisma.user.findUnique({ where: { id: userId } });
    expect(stillExists).not.toBeNull();

    deleteSpy.mockRestore();
  });

  it("löscht das Konto bei korrektem Passwort", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: userId }, expires: "" });
    mockedCompare.mockResolvedValue(true as never);

    const res = await POST(makeRequest({ password: "richtiges-passwort" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ success: true });

    const deleted = await prisma.user.findUnique({ where: { id: userId } });
    expect(deleted).toBeNull();
  });
});
