import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decodeResetTokenUserId, verifyResetToken } from "@/lib/reset-token";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { resetPasswordSchema } from "@/lib/validation-schemas";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!(await checkRateLimit(`reset-password:${ip}`))) {
    return NextResponse.json({ error: "tooManyRequests" }, { status: 429 });
  }

  const body = await request.json();
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const { token, password } = parsed.data;

  const userId = decodeResetTokenUserId(token);
  const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
  if (!user || !verifyResetToken(token, user.passwordHash)) {
    return NextResponse.json({ error: "invalid_token" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, passwordChangedAt: new Date() },
  });
  await logAudit("password_reset_completed", { userId: user.id, ip });

  return NextResponse.json({ ok: true });
}
