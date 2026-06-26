import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getPricingConfig } from "@/lib/pricing";
import { logAudit } from "@/lib/audit";

interface InvoiceData {
  id: string;
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null;
  subscription: string | Stripe.Subscription | null;
  payment_intent: string | Stripe.PaymentIntent | null;
  amount_paid: number;
  amount_due: number;
  currency: string;
}

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  const existing = await prisma.processedWebhookEvent.findUnique({ where: { eventId: event.id } });
  if (existing) {
    return NextResponse.json({ received: true });
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event);
      break;
    case "invoice.payment_succeeded":
      await handleInvoicePaymentSucceeded(event);
      break;
    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event);
      break;
    case "charge.refunded":
      await handleChargeRefunded(event);
      break;
  }

  await prisma.processedWebhookEvent.create({ data: { eventId: event.id } });
  await logAudit("webhook_processed", { detail: `${event.type}:${event.id}` });

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session.metadata?.userId;
  const pkg = session.metadata?.package;

  if (!userId || !pkg) return;

  const stripePaymentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : typeof session.subscription === "string"
        ? session.subscription
        : session.id;

  const amountTotal = session.amount_total ?? 0;

  await prisma.payment.upsert({
    where: { stripePaymentId },
    create: {
      userId,
      stripePaymentId,
      amount: amountTotal,
      currency: session.currency ?? "eur",
      status: "succeeded",
      package: pkg,
    },
    update: {},
  });

  if (pkg === "monthly" || pkg === "yearly") {
    const subscriptionId =
      typeof session.subscription === "string" ? session.subscription : null;

    await prisma.access.upsert({
      where: { userId },
      create: {
        userId,
        freeGenerationUsed: true,
        package: pkg,
        validUntil: null,
        stripePaymentId,
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: "active",
      },
      update: {
        package: pkg,
        validUntil: null,
        stripePaymentId,
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: "active",
      },
    });

    await logAudit("subscription_created", { userId, detail: `${pkg}:${subscriptionId}` });
    return;
  }

  if (pkg === "limited" || pkg === "lifetime") {
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

    await logAudit("payment_succeeded", { userId, detail: `${pkg}:${stripePaymentId}` });
  }
}

async function handleInvoicePaymentSucceeded(event: Stripe.Event) {
  const invoice = event.data.object as unknown as InvoiceData;
  const customerId = typeof invoice.customer === "string" ? invoice.customer : null;
  if (!customerId) return;

  const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
  if (!user) return;

  const subscriptionId =
    typeof invoice.subscription === "string" ? invoice.subscription : null;

  if (subscriptionId) {
    await prisma.access.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        freeGenerationUsed: true,
        package: "monthly",
        subscriptionStatus: "active",
        stripeSubscriptionId: subscriptionId,
        stripePaymentId: invoice.payment_intent as string | null,
      },
      update: {
        subscriptionStatus: "active",
        stripePaymentId: invoice.payment_intent as string | null,
      },
    });
  }

  if (invoice.payment_intent && typeof invoice.payment_intent === "string") {
    const existingPayment = await prisma.payment.findUnique({
      where: { stripePaymentId: invoice.payment_intent },
    });

    if (!existingPayment) {
      await prisma.payment.create({
        data: {
          userId: user.id,
          stripePaymentId: invoice.payment_intent,
          amount: invoice.amount_paid ?? 0,
          currency: invoice.currency ?? "eur",
          status: "succeeded",
          package: "subscription_renewal",
        },
      });
    }
  }

  await logAudit("payment_succeeded", {
    userId: user.id,
    detail: `invoice:${invoice.id}`,
  });
}

async function handleInvoicePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as unknown as InvoiceData;
  const customerId = typeof invoice.customer === "string" ? invoice.customer : null;
  if (!customerId) return;

  const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
  if (!user) return;

  await prisma.access.updateMany({
    where: { userId: user.id },
    data: { subscriptionStatus: "past_due" },
  });

  if (invoice.payment_intent && typeof invoice.payment_intent === "string") {
    await prisma.payment.upsert({
      where: { stripePaymentId: invoice.payment_intent },
      create: {
        userId: user.id,
        stripePaymentId: invoice.payment_intent,
        amount: invoice.amount_due ?? 0,
        currency: invoice.currency ?? "eur",
        status: "failed",
        package: "subscription_renewal",
      },
      update: { status: "failed" },
    });
  }

  await logAudit("payment_failed", {
    userId: user.id,
    detail: `invoice:${invoice.id}`,
  });
}

async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId = typeof subscription.customer === "string" ? subscription.customer : null;
  if (!customerId) return;

  const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
  if (!user) return;

  const status = subscription.status;
  const isActive = status === "active" || status === "trialing";

  await prisma.access.updateMany({
    where: { userId: user.id, stripeSubscriptionId: subscription.id },
    data: {
      subscriptionStatus: status,
      validUntil: isActive ? null : new Date(),
    },
  });

  await logAudit("subscription_updated", {
    userId: user.id,
    detail: `${subscription.id}:${status}`,
  });
}

async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId = typeof subscription.customer === "string" ? subscription.customer : null;
  if (!customerId) return;

  const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
  if (!user) return;

  await prisma.access.updateMany({
    where: { userId: user.id, stripeSubscriptionId: subscription.id },
    data: {
      package: "none",
      subscriptionStatus: "cancelled",
      stripeSubscriptionId: null,
      validUntil: new Date(),
    },
  });

  await logAudit("subscription_cancelled", {
    userId: user.id,
    detail: subscription.id,
  });
}

async function handleChargeRefunded(event: Stripe.Event) {
  const charge = event.data.object as Stripe.Charge;
  const paymentIntentId =
    typeof charge.payment_intent === "string" ? charge.payment_intent : null;

  if (paymentIntentId) {
    await prisma.payment.updateMany({
      where: { stripePaymentId: paymentIntentId },
      data: {
        refundedAt: new Date(),
        refundAmount: charge.amount_refunded,
        status: charge.refunded ? "refunded" : "partially_refunded",
      },
    });
  }

  const customerId = typeof charge.customer === "string" ? charge.customer : null;
  const user = customerId
    ? await prisma.user.findFirst({ where: { stripeCustomerId: customerId } })
    : null;

  await logAudit("payment_refunded", {
    userId: user?.id,
    detail: `charge:${charge.id} amount:${charge.amount_refunded}`,
  });
}
