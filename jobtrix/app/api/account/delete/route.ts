import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!(await checkRateLimit(`account-delete:${session.user.id}`, 3))) {
    return NextResponse.json({ error: "tooManyRequests" }, { status: 429 });
  }

  const { password } = (await request.json()) as { password?: string };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const isValid = !!password && !!user && (await bcrypt.compare(password, user.passwordHash));
  if (!isValid) {
    return NextResponse.json({ error: "wrong_password" }, { status: 401 });
  }

  await prisma.user.delete({ where: { id: session.user.id } });
  await logAudit("account_deleted", { userId: session.user.id });

  return NextResponse.json({ success: true });
}
