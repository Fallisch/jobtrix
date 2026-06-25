import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

const AUDIT_LOG_RETENTION_DAYS = 90;

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${cronSecret}`;
  const authBuffer = Buffer.from(authHeader);
  const expectedBuffer = Buffer.from(expected);
  if (authBuffer.length !== expectedBuffer.length || !timingSafeEqual(authBuffer, expectedBuffer)) {
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
