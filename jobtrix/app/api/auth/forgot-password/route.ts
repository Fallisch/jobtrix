import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateResetToken } from "@/lib/reset-token";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!(await checkRateLimit(`forgot-password:${ip}`))) {
    return NextResponse.json({ error: "tooManyRequests" }, { status: 429 });
  }

  const { email } = (await request.json()) as { email?: string };

  if (email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = generateResetToken(user.id, user.passwordHash);
      const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
      const resetUrl = `${baseUrl}/de/reset-password?token=${token}`;
      await sendPasswordResetEmail({ to: user.email, resetUrl });
    }
  }

  return NextResponse.json({ ok: true });
}
