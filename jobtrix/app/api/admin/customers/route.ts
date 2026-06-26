import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "50", 10) || 50));
  const search = url.searchParams.get("search") ?? "";
  const offset = (page - 1) * limit;

  const where = search
    ? { email: { contains: search, mode: "insensitive" as const } }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        stripeCustomerId: true,
        role: true,
        access: {
          select: {
            package: true,
            validUntil: true,
            subscriptionStatus: true,
            freeGenerationUsed: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  const userIds = users.map((u) => u.id);
  const paymentCounts = await prisma.payment.groupBy({
    by: ["userId"],
    where: { userId: { in: userIds }, status: "succeeded" },
    _count: true,
    _sum: { amount: true },
  });

  const paymentMap = new Map(
    paymentCounts.map((p) => [p.userId, { count: p._count, total: p._sum.amount ?? 0 }]),
  );

  const customers = users.map((u) => ({
    ...u,
    payments: paymentMap.get(u.id) ?? { count: 0, total: 0 },
  }));

  return NextResponse.json({ customers, total, page, limit });
}
