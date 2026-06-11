/**
 * @jest-environment node
 */
import bcrypt from "bcrypt";
import { POST } from "@/app/api/auth/forgot-password/route";
import { prisma } from "@/lib/prisma";
import { verifyResetToken } from "@/lib/reset-token";
import { NextRequest } from "next/server";

const mockSendPasswordResetEmail = jest.fn().mockResolvedValue(undefined);
jest.mock("@/lib/email", () => ({
  sendPasswordResetEmail: (...args: unknown[]) => mockSendPasswordResetEmail(...args),
}));

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/auth/forgot-password", () => {
  const email = `forgot-password-test-${Date.now()}@example.com`;
  let userId: string;
  let passwordHash: string;

  beforeAll(async () => {
    passwordHash = await bcrypt.hash("old-password", 10);
    const user = await prisma.user.create({ data: { email, passwordHash } });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  beforeEach(() => {
    mockSendPasswordResetEmail.mockClear();
  });

  it("sendet eine Reset-E-Mail mit gueltigem Token, wenn der Account existiert", async () => {
    const res = await POST(makeRequest({ email }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ ok: true });

    expect(mockSendPasswordResetEmail).toHaveBeenCalledTimes(1);
    const { to, resetUrl } = mockSendPasswordResetEmail.mock.calls[0][0];
    expect(to).toBe(email);

    const token = new URL(resetUrl).searchParams.get("token") ?? "";
    expect(verifyResetToken(token, passwordHash)).toEqual({ userId });
  });

  it("liefert dieselbe Antwort, wenn der Account nicht existiert, ohne E-Mail zu versenden", async () => {
    const res = await POST(makeRequest({ email: "nicht-vorhanden@example.com" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ ok: true });
    expect(mockSendPasswordResetEmail).not.toHaveBeenCalled();
  });
});
