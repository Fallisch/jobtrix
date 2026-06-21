/**
 * @jest-environment node
 */
const mockConstructEvent = jest.fn();
jest.mock("stripe", () =>
  jest.fn().mockImplementation(() => ({
    webhooks: { constructEvent: mockConstructEvent },
  }))
);

import bcrypt from "bcrypt";
import { POST } from "@/app/api/webhooks/stripe/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

function makeRequest(body: string, signature = "valid-signature") {
  return new NextRequest("http://localhost/api/webhooks/stripe", {
    method: "POST",
    body,
    headers: { "stripe-signature": signature },
  });
}

const email = `webhook-test-${Date.now()}@example.com`;
let userId: string;

beforeAll(async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_fake";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_fake";
  const passwordHash = await bcrypt.hash("password", 10);
  const user = await prisma.user.create({ data: { email, passwordHash } });
  userId = user.id;
});

afterAll(async () => {
  await prisma.auditLog.deleteMany({ where: { action: "webhook_processed" } });
  await prisma.processedWebhookEvent.deleteMany({ where: { eventId: { startsWith: "evt_" } } });
  await prisma.access.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });
  await prisma.$disconnect();
});

beforeEach(async () => {
  mockConstructEvent.mockReset();
  await prisma.processedWebhookEvent.deleteMany({ where: { eventId: { startsWith: "evt_" } } });
  await prisma.access.deleteMany({ where: { userId } });
});

describe("POST /api/webhooks/stripe", () => {
  it("liefert 400 bei ungültiger Signatur", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("invalid signature");
    });

    const res = await POST(makeRequest("{}", "invalid"));

    expect(res.status).toBe(400);
  });

  it("aktiviert Lifetime-Zugang bei checkout.session.completed mit package=lifetime", async () => {
    mockConstructEvent.mockReturnValue({
      id: "evt_lifetime_test",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_lifetime",
          payment_intent: "pi_lifetime",
          metadata: { userId, package: "lifetime" },
        },
      },
    });

    const res = await POST(makeRequest(JSON.stringify({})));

    expect(res.status).toBe(200);
    const access = await prisma.access.findUnique({ where: { userId } });
    expect(access?.package).toBe("lifetime");
    expect(access?.validUntil).toBeNull();
    expect(access?.stripePaymentId).toBe("pi_lifetime");
  });

  it("aktiviert zeitlich begrenzten Zugang bei package=limited mit validUntil in der Zukunft", async () => {
    mockConstructEvent.mockReturnValue({
      id: "evt_limited_test",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_limited",
          payment_intent: "pi_limited",
          metadata: { userId, package: "limited" },
        },
      },
    });

    const res = await POST(makeRequest(JSON.stringify({})));

    expect(res.status).toBe(200);
    const access = await prisma.access.findUnique({ where: { userId } });
    expect(access?.package).toBe("limited");
    expect(access?.validUntil).not.toBeNull();
    expect(access!.validUntil!.getTime()).toBeGreaterThan(Date.now());
    expect(access?.stripePaymentId).toBe("pi_limited");
  });

  it("ignoriert andere Event-Typen ohne den Zugang zu veraendern", async () => {
    mockConstructEvent.mockReturnValue({
      id: "evt_other_test",
      type: "payment_intent.created",
      data: { object: {} },
    });

    const res = await POST(makeRequest(JSON.stringify({})));

    expect(res.status).toBe(200);
    const access = await prisma.access.findUnique({ where: { userId } });
    expect(access).toBeNull();
  });
});
