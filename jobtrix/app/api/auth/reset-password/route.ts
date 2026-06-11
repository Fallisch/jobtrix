import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decodeResetTokenUserId, verifyResetToken } from "@/lib/reset-token";

export async function POST(request: NextRequest) {
  const { token, password } = (await request.json()) as { token?: string; password?: string };

  if (!token || !password) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const userId = decodeResetTokenUserId(token);
  const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
  if (!user || !verifyResetToken(token, user.passwordHash)) {
    return NextResponse.json({ error: "invalid_token" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return NextResponse.json({ ok: true });
}
