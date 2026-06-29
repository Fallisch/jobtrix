/**
 * @jest-environment node
 */
jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

const mockInvoicesList = jest.fn();
jest.mock("stripe", () =>
  jest.fn().mockImplementation(() => ({
    invoices: { list: mockInvoicesList },
  }))
);

jest.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: jest.fn() } },
}));

import { GET } from "@/app/api/invoices/route";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";

const mockedGetServerSession = jest.mocked(getServerSession);
const mockedFindUnique = jest.mocked(prisma.user.findUnique);

beforeAll(() => {
  process.env.STRIPE_SECRET_KEY = "sk_test_fake";
});

beforeEach(() => {
  mockInvoicesList.mockReset();
  mockedGetServerSession.mockReset();
  mockedFindUnique.mockReset();
});

describe("GET /api/invoices", () => {
  it("liefert 401 ohne Session", async () => {
    mockedGetServerSession.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("liefert eine leere Liste, wenn der Nutzer keinen Stripe-Customer hat", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: "user-1" }, expires: "" });
    mockedFindUnique.mockResolvedValue({ id: "user-1", stripeCustomerId: null } as never);
    const res = await GET();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.invoices).toEqual([]);
    expect(mockInvoicesList).not.toHaveBeenCalled();
  });

  it("mappt Stripe-Rechnungen auf das API-Format inklusive PDF-Link", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: "user-1" }, expires: "" });
    mockedFindUnique.mockResolvedValue({ id: "user-1", stripeCustomerId: "cus_123" } as never);
    mockInvoicesList.mockResolvedValue({
      data: [
        {
          id: "in_1",
          number: "INV-1",
          amount_paid: 999,
          currency: "eur",
          status: "paid",
          created: 1718000000,
          invoice_pdf: "https://stripe.com/inv_1.pdf",
          hosted_invoice_url: "https://stripe.com/hosted_1",
        },
      ],
    });

    const res = await GET();
    const data = await res.json();

    expect(mockInvoicesList).toHaveBeenCalledWith({ customer: "cus_123", limit: 24 });
    expect(data.invoices).toEqual([
      {
        id: "in_1",
        number: "INV-1",
        amountPaid: 999,
        currency: "eur",
        status: "paid",
        created: 1718000000,
        invoicePdf: "https://stripe.com/inv_1.pdf",
        hostedInvoiceUrl: "https://stripe.com/hosted_1",
      },
    ]);
  });
});
