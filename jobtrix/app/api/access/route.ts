import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const access = await prisma.access.findUnique({ where: { userId: session.user.id } });

  return NextResponse.json({
    package: access?.package ?? "none",
    validUntil: access?.validUntil ?? null,
    subscriptionStatus: access?.subscriptionStatus ?? null,
  });
}
