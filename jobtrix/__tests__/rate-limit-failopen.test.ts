/**
 * @jest-environment node
 */
import { checkRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    rateLimitEntry: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockedFindUnique = prisma.rateLimitEntry.findUnique as jest.Mock;
const mockedUpsert = prisma.rateLimitEntry.upsert as jest.Mock;

describe("checkRateLimit – fail-open bei DB-Fehler", () => {
  beforeAll(() => {
    // Test-Bypass deaktivieren, damit die echte DB-Logik durchläuft.
    process.env.ENABLE_RATE_LIMIT_IN_TESTS = "1";
  });
  afterAll(() => {
    delete process.env.ENABLE_RATE_LIMIT_IN_TESTS;
  });
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("gibt true zurück, wenn die DB-Abfrage wirft (Auth darf nicht hart failen)", async () => {
    mockedFindUnique.mockRejectedValue(new Error("DB down"));
    await expect(checkRateLimit("failopen-key")).resolves.toBe(true);
  });

  it("gibt true zurück, wenn der upsert beim Anlegen wirft", async () => {
    mockedFindUnique.mockResolvedValue(null);
    mockedUpsert.mockRejectedValue(new Error("connection reset"));
    await expect(checkRateLimit("failopen-key-2")).resolves.toBe(true);
  });
});
