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

  if (!(await checkRateLimit(`account-export:${session.user.id}`, 3))) {
    return NextResponse.json({ error: "tooManyRequests" }, { status: 429 });
  }

  const { password } = (await request.json()) as { password?: string };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const isValid = !!password && !!user && (await bcrypt.compare(password, user.passwordHash));
  if (!isValid) {
    return NextResponse.json({ error: "wrong_password" }, { status: 401 });
  }

  const [profile, applicationHistory, access] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId: session.user.id } }),
    prisma.applicationHistoryEntry.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.access.findUnique({ where: { userId: session.user.id } }),
  ]);

  await logAudit("account_exported", { userId: session.user.id });

  const response = NextResponse.json({
    profile,
    applicationHistory,
    account: {
      email: user.email,
      createdAt: user.createdAt,
      package: access?.package ?? "none",
      validUntil: access?.validUntil ?? null,
    },
  });
  response.headers.set("Content-Disposition", 'attachment; filename="meine-daten.json"');
  return response;
}
