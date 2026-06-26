import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalRevenue,
    monthlyRevenue,
    lastMonthRevenue,
    totalPayments,
    refundedTotal,
    revenueByPackage,
    dailyRevenue,
  ] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: "succeeded" },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { status: "succeeded", createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { status: "succeeded", createdAt: { gte: startOfLastMonth, lt: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.payment.count({ where: { status: "succeeded" } }),
    prisma.payment.aggregate({
      where: { status: { in: ["refunded", "partially_refunded"] } },
      _sum: { refundAmount: true },
    }),
    prisma.payment.groupBy({
      by: ["package"],
      where: { status: "succeeded" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.$queryRawUnsafe<Array<{ day: string; total: bigint }>>(
      `SELECT DATE("createdAt") as day, SUM(amount) as total
       FROM "Payment"
       WHERE status = 'succeeded' AND "createdAt" >= $1
       GROUP BY DATE("createdAt")
       ORDER BY day`,
      thirtyDaysAgo,
    ),
  ]);

  return NextResponse.json({
    totalRevenue: totalRevenue._sum.amount ?? 0,
    monthlyRevenue: monthlyRevenue._sum.amount ?? 0,
    lastMonthRevenue: lastMonthRevenue._sum.amount ?? 0,
    totalPayments,
    refundedTotal: refundedTotal._sum.refundAmount ?? 0,
    revenueByPackage: revenueByPackage.map((r) => ({
      package: r.package,
      total: r._sum.amount ?? 0,
      count: r._count,
    })),
    dailyRevenue: dailyRevenue.map((d) => ({
      day: d.day,
      total: Number(d.total),
    })),
  });
}
