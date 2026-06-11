/**
 * @jest-environment node
 */
jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

const mockSessionsCreate = jest.fn();
jest.mock("stripe", () =>
  jest.fn().mockImplementation(() => ({
    checkout: { sessions: { create: mockSessionsCreate } },
  }))
);

import { POST } from "@/app/api/checkout/route";
import { getServerSession } from "next-auth/next";
import { NextRequest } from "next/server";

const mockedGetServerSession = jest.mocked(getServerSession);

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/checkout", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  mockSessionsCreate.mockReset();
  mockedGetServerSession.mockReset();
});

describe("POST /api/checkout", () => {
  it("liefert 401 ohne Session", async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const res = await POST(makeRequest({ package: "limited" }));

    expect(res.status).toBe(401);
  });

  it("liefert 400 bei ungültigem Paket", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: "user-1" }, expires: "" });

    const res = await POST(makeRequest({ package: "unknown" }));

    expect(res.status).toBe(400);
  });

  it("erzeugt eine Stripe-Checkout-Session für 'limited' mit Karte und SEPA-Lastschrift und liefert die Checkout-URL", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: "user-1" }, expires: "" });
    mockSessionsCreate.mockResolvedValue({ url: "https://checkout.stripe.com/test-session-limited" });

    const res = await POST(makeRequest({ package: "limited" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.url).toBe("https://checkout.stripe.com/test-session-limited");
    expect(mockSessionsCreate).toHaveBeenCalledTimes(1);

    const args = mockSessionsCreate.mock.calls[0][0];
    expect(args.mode).toBe("payment");
    expect(args.payment_method_types).toEqual(expect.arrayContaining(["card", "sepa_debit"]));
    expect(args.line_items[0].price_data.unit_amount).toBe(999);
    expect(args.client_reference_id).toBe("user-1");
  });

  it("erzeugt eine Stripe-Checkout-Session für 'lifetime' mit dem Lifetime-Preis", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: "user-1" }, expires: "" });
    mockSessionsCreate.mockResolvedValue({ url: "https://checkout.stripe.com/test-session-lifetime" });

    const res = await POST(makeRequest({ package: "lifetime" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.url).toBe("https://checkout.stripe.com/test-session-lifetime");

    const args = mockSessionsCreate.mock.calls[0][0];
    expect(args.line_items[0].price_data.unit_amount).toBe(2999);
    expect(args.metadata).toMatchObject({ userId: "user-1", package: "lifetime" });
  });
});
