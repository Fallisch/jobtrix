/**
 * @jest-environment node
 */
import { GET as getPayments } from "@/app/api/admin/payments/route";
import { GET as getRevenue } from "@/app/api/admin/revenue/route";
import { GET as getCustomers } from "@/app/api/admin/customers/route";
import { GET as getRefunds } from "@/app/api/admin/refunds/route";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

const mockedGetServerSession = jest.mocked(getServerSession);

function makeRequest(params?: Record<string, string>): Request {
  const url = new URL("http://localhost/api/admin/test");
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  }
  return new Request(url);
}

describe("Admin-API", () => {
  beforeEach(() => {
    mockedGetServerSession.mockReset();
  });

  describe("Zugriffsschutz", () => {
    it("verweigert Zugriff ohne Session", async () => {
      mockedGetServerSession.mockResolvedValue(null);

      const res = await getPayments(makeRequest() as never);
      expect(res.status).toBe(403);
    });

    it("verweigert Zugriff für normale User", async () => {
      mockedGetServerSession.mockResolvedValue({ user: { id: "user-1" }, expires: "" });

      const res = await getPayments(makeRequest() as never);
      expect(res.status).toBe(403);
    });
  });

  describe("mit Admin-Zugriff", () => {
    let adminId: string;

    beforeAll(async () => {
      const admin = await prisma.user.create({
        data: {
          email: `admin-test-${Date.now()}@example.com`,
          passwordHash: "not-a-real-hash",
          role: "admin",
        },
      });
      adminId = admin.id;
    });

    afterAll(async () => {
      await prisma.payment.deleteMany({ where: { userId: adminId } });
      await prisma.user.delete({ where: { id: adminId } });
      await prisma.$disconnect();
    });

    beforeEach(() => {
      mockedGetServerSession.mockResolvedValue({ user: { id: adminId }, expires: "" });
    });

    it("GET /api/admin/payments liefert paginierte Zahlungen", async () => {
      const res = await getPayments(makeRequest() as never);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.payments).toBeDefined();
      expect(data.total).toBeDefined();
      expect(data.page).toBe(1);
    });

    it("GET /api/admin/revenue liefert Umsatzübersicht", async () => {
      const res = await getRevenue();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.totalRevenue).toBeDefined();
      expect(data.monthlyRevenue).toBeDefined();
      expect(data.totalPayments).toBeDefined();
      expect(data.refundedTotal).toBeDefined();
      expect(data.revenueByPackage).toBeDefined();
      expect(data.dailyRevenue).toBeDefined();
    });

    it("GET /api/admin/customers liefert paginierte Kundenliste", async () => {
      const res = await getCustomers(makeRequest() as never);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.customers).toBeDefined();
      expect(data.total).toBeGreaterThanOrEqual(1);
    });

    it("GET /api/admin/customers unterstützt Suche nach E-Mail", async () => {
      const res = await getCustomers(makeRequest({ search: "admin-test" }) as never);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.customers.length).toBeGreaterThanOrEqual(1);
    });

    it("GET /api/admin/refunds liefert Erstattungsliste", async () => {
      const res = await getRefunds(makeRequest() as never);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.refunds).toBeDefined();
      expect(data.total).toBeDefined();
    });

    it("GET /api/admin/payments unterstützt Statusfilter", async () => {
      const res = await getPayments(makeRequest({ status: "succeeded" }) as never);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.payments).toBeDefined();
    });
  });
});
