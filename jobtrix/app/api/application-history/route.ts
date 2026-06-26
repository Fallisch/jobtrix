import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_LIMIT = 100;

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const rawOffset = parseInt(url.searchParams.get("offset") ?? "0", 10);
  const rawLimit = parseInt(url.searchParams.get("limit") ?? String(MAX_LIMIT), 10);
  const offset = Number.isFinite(rawOffset) && rawOffset >= 0 ? rawOffset : 0;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, MAX_LIMIT) : MAX_LIMIT;

  const where = { userId: session.user.id };

  const [entries, total] = await Promise.all([
    prisma.applicationHistoryEntry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    }),
    prisma.applicationHistoryEntry.count({ where }),
  ]);

  return NextResponse.json({ entries, total });
}
