import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getPricingConfig } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import { checkAccess } from "@/lib/access";
import { checkRateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";

const PACKAGE_NAMES: Record<"limited" | "lifetime", string> = {
  limited: "JobTRIX – Zeitlich begrenzter Zugang",
  lifetime: "JobTRIX – Lifetime-Zugang",
};

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!(await checkRateLimit(`checkout:${session.user.id}`, 5))) {
    return NextResponse.json({ error: "tooManyRequests" }, { status: 429 });
  }

  const { package: pkg } = (await request.json()) as { package?: string };
  if (pkg !== "limited" && pkg !== "lifetime") {
    return NextResponse.json({ error: "invalid_package" }, { status: 400 });
  }

  const access = await prisma.access.findUnique({ where: { userId: session.user.id } });
  const decision = checkAccess(access);
  if (decision.allowed && !decision.markFreeGenerationUsed) {
    return NextResponse.json({ error: "already_has_access" }, { status: 409 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "payment_not_configured" }, { status: 503 });
  }

  const config = getPricingConfig();
  const priceEur = config[pkg].priceEur;
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card", "sepa_debit", "paypal"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: { name: PACKAGE_NAMES[pkg] },
          unit_amount: Math.round(priceEur * 100),
        },
        quantity: 1,
      },
    ],
    client_reference_id: session.user.id,
    metadata: { userId: session.user.id, package: pkg },
    success_url: `${baseUrl}/pricing?status=success`,
    cancel_url: `${baseUrl}/pricing?status=cancelled`,
  });

  await logAudit("checkout_created", { userId: session.user.id, detail: pkg });

  return NextResponse.json({ url: checkoutSession.url });
}
