import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [user, profile, applicationHistory, access] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.userProfile.findUnique({ where: { userId: session.user.id } }),
    prisma.applicationHistoryEntry.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.access.findUnique({ where: { userId: session.user.id } }),
  ]);

  const response = NextResponse.json({
    profile,
    applicationHistory,
    account: {
      email: user?.email ?? null,
      createdAt: user?.createdAt ?? null,
      package: access?.package ?? "none",
      validUntil: access?.validUntil ?? null,
    },
  });
  response.headers.set("Content-Disposition", 'attachment; filename="meine-daten.json"');
  return response;
}
