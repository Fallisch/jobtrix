import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { logAudit } from "@/lib/audit";

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "50", 10) || 50));
  const offset = (page - 1) * limit;

  const where = { status: { in: ["refunded", "partially_refunded"] } };

  const [refunds, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { refundedAt: "desc" },
      skip: offset,
      take: limit,
    }),
    prisma.payment.count({ where }),
  ]);

  return NextResponse.json({ refunds, total, page, limit });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const { paymentId, amount } = (await request.json()) as {
    paymentId?: string;
    amount?: number;
  };

  if (!paymentId) {
    return NextResponse.json({ error: "missing_payment_id" }, { status: 400 });
  }

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) {
    return NextResponse.json({ error: "payment_not_found" }, { status: 404 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const refundParams: Stripe.RefundCreateParams = {
    payment_intent: payment.stripePaymentId,
  };

  if (amount && amount > 0) {
    refundParams.amount = amount;
  }

  const refund = await stripe.refunds.create(refundParams);

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      refundedAt: new Date(),
      refundAmount: refund.amount,
      status: refund.amount === payment.amount ? "refunded" : "partially_refunded",
    },
  });

  await logAudit("payment_refunded", {
    userId: admin.userId,
    detail: `admin_refund:${payment.stripePaymentId} amount:${refund.amount}`,
  });

  return NextResponse.json({ success: true, refundId: refund.id });
}
