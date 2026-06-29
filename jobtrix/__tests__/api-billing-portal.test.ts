/**
 * @jest-environment node
 */
jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

const mockPortalCreate = jest.fn();
jest.mock("stripe", () =>
  jest.fn().mockImplementation(() => ({
    billingPortal: { sessions: { create: mockPortalCreate } },
  }))
);

jest.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: jest.fn() } },
}));

jest.mock("@/lib/rate-limit", () => ({
  checkRateLimit: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/lib/audit", () => ({
  logAudit: jest.fn().mockResolvedValue(undefined),
}));

import { POST } from "@/app/api/billing-portal/route";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

const mockedGetServerSession = jest.mocked(getServerSession);
const mockedFindUnique = jest.mocked(prisma.user.findUnique);
const mockedCheckRateLimit = jest.mocked(checkRateLimit);

beforeAll(() => {
  process.env.STRIPE_SECRET_KEY = "sk_test_fake";
  process.env.NEXTAUTH_URL = "https://jobtrix.app";
});

beforeEach(() => {
  mockPortalCreate.mockReset();
  mockedGetServerSession.mockReset();
  mockedFindUnique.mockReset();
  mockedCheckRateLimit.mockReset();
  mockedCheckRateLimit.mockResolvedValue(true);
});

describe("POST /api/billing-portal", () => {
  it("liefert 401 ohne Session", async () => {
    mockedGetServerSession.mockResolvedValue(null);
    const res = await POST();
    expect(res.status).toBe(401);
  });

  it("liefert 429 bei überschrittenem Rate-Limit", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: "user-1" }, expires: "" });
    mockedCheckRateLimit.mockResolvedValue(false);
    const res = await POST();
    expect(res.status).toBe(429);
  });

  it("liefert 404 wenn der Nutzer keinen Stripe-Customer hat", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: "user-1" }, expires: "" });
    mockedFindUnique.mockResolvedValue({ id: "user-1", stripeCustomerId: null } as never);
    const res = await POST();
    expect(res.status).toBe(404);
  });

  it("erstellt eine Billing-Portal-Session und liefert die URL", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: "user-1" }, expires: "" });
    mockedFindUnique.mockResolvedValue({ id: "user-1", stripeCustomerId: "cus_123" } as never);
    mockPortalCreate.mockResolvedValue({ url: "https://billing.stripe.com/session/test" });

    const res = await POST();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.url).toBe("https://billing.stripe.com/session/test");
    expect(mockPortalCreate).toHaveBeenCalledWith({
      customer: "cus_123",
      return_url: "https://jobtrix.app/profile",
    });
  });
});
