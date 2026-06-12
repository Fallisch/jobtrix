import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const entry = await prisma.applicationHistoryEntry.findUnique({ where: { id: params.id } });
  if (!entry || entry.userId !== session.user.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(entry);
}
