import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const AUDIT_LOG_RETENTION_DAYS = 90;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - AUDIT_LOG_RETENTION_DAYS);

  const result = await prisma.auditLog.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });

  return NextResponse.json({
    deleted: result.count,
    cutoffDate: cutoff.toISOString(),
  });
}
