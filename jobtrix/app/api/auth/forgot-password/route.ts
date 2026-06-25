import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateResetToken } from "@/lib/reset-token";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/validation-schemas";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!(await checkRateLimit(`forgot-password:${ip}`))) {
    return NextResponse.json({ error: "tooManyRequests" }, { status: 429 });
  }

  const body = await request.json();
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalidInput" }, { status: 400 });
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = generateResetToken(user.id, user.passwordHash);
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const resetUrl = `${baseUrl}/de/reset-password?token=${token}`;
    await sendPasswordResetEmail({ to: user.email, resetUrl });
    await logAudit("password_reset_requested", { userId: user.id, ip });
  }

  return NextResponse.json({ ok: true });
}
