import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "payment_not_configured" }, { status: 503 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.stripeCustomerId) {
    return NextResponse.json({ invoices: [] });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const list = await stripe.invoices.list({ customer: user.stripeCustomerId, limit: 24 });

  const invoices = list.data.map((inv) => ({
    id: inv.id,
    number: inv.number,
    amountPaid: inv.amount_paid,
    currency: inv.currency,
    status: inv.status,
    created: inv.created,
    invoicePdf: inv.invoice_pdf,
    hostedInvoiceUrl: inv.hosted_invoice_url,
  }));

  return NextResponse.json({ invoices });
}
