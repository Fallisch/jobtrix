/**
 * @jest-environment node
 */
import bcrypt from "bcrypt";
import { POST } from "@/app/api/auth/register/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/auth/register", () => {
  const email = `register-test-${Date.now()}@example.com`;

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it("legt einen neuen User mit bcrypt-gehashtem Passwort an", async () => {
    const res = await POST(makeRequest({ email, password: "correct-password" }));
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data).toMatchObject({ email });

    const user = await prisma.user.findUnique({ where: { email } });
    expect(user).not.toBeNull();
    expect(user!.passwordHash).not.toBe("correct-password");
    expect(await bcrypt.compare("correct-password", user!.passwordHash)).toBe(true);
  });

  it("verhindert doppelte E-Mail-Adressen", async () => {
    const res = await POST(makeRequest({ email, password: "another-password" }));
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data).toHaveProperty("error");
  });

  it("liefert eine Fehlermeldung bei fehlenden Zugangsdaten", async () => {
    const res = await POST(makeRequest({ email: "" , password: "" }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toHaveProperty("error");
  });
});
