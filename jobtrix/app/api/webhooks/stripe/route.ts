import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getPricingConfig } from "@/lib/pricing";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET ?? "");
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  const existing = await prisma.processedWebhookEvent.findUnique({ where: { eventId: event.id } });
  if (existing) {
    return NextResponse.json({ received: true });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const pkg = session.metadata?.package;

    if (userId && (pkg === "limited" || pkg === "lifetime")) {
      const stripePaymentId =
        typeof session.payment_intent === "string" ? session.payment_intent : session.id;

      let validUntil: Date | null = null;
      if (pkg === "limited") {
        const config = getPricingConfig();
        validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + config.limited.durationDays);
      }

      await prisma.access.upsert({
        where: { userId },
        create: { userId, freeGenerationUsed: true, package: pkg, validUntil, stripePaymentId },
        update: { package: pkg, validUntil, stripePaymentId },
      });
    }
  }

  await prisma.processedWebhookEvent.create({ data: { eventId: event.id } });

  return NextResponse.json({ received: true });
}
