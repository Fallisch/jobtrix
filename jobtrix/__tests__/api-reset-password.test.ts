/**
 * @jest-environment node
 */
import bcrypt from "bcrypt";
import { POST } from "@/app/api/auth/reset-password/route";
import { prisma } from "@/lib/prisma";
import { generateResetToken } from "@/lib/reset-token";
import { NextRequest } from "next/server";

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/auth/reset-password", () => {
  const email = `reset-password-test-${Date.now()}@example.com`;
  let userId: string;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash("old-password", 10);
    const user = await prisma.user.create({ data: { email, passwordHash } });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it("setzt das Passwort mit gueltigem Token neu", async () => {
    const token = generateResetToken(userId);
    const res = await POST(makeRequest({ token, password: "neues-passwort" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ ok: true });

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    expect(await bcrypt.compare("neues-passwort", user.passwordHash)).toBe(true);
  });

  it("lehnt ein ungueltiges Token ab", async () => {
    const res = await POST(makeRequest({ token: "ungueltiges-token", password: "neues-passwort" }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("invalid_token");
  });

  it("lehnt ein abgelaufenes Token ab", async () => {
    const realNow = Date.now;
    jest.spyOn(Date, "now").mockReturnValue(realNow() - 2 * 60 * 60 * 1000);
    const expiredToken = generateResetToken(userId);
    Date.now = realNow;

    const res = await POST(makeRequest({ token: expiredToken, password: "neues-passwort" }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("invalid_token");
  });
});
