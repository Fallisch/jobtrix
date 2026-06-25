/**
 * @jest-environment node
 */
import { checkRateLimit, RATE_LIMIT_MAX } from "@/lib/rate-limit";
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

describe("checkRateLimit – In-Memory-Backstop bei DB-Fehler", () => {
  beforeAll(() => {
    process.env.ENABLE_RATE_LIMIT_IN_TESTS = "1";
  });
  afterAll(() => {
    delete process.env.ENABLE_RATE_LIMIT_IN_TESTS;
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("erlaubt Requests wenn DB ausfällt (In-Memory-Fallback)", async () => {
    mockedFindUnique.mockRejectedValue(new Error("DB down"));
    await expect(checkRateLimit("mem-fallback-1")).resolves.toBe(true);
  });

  it("blockiert nach max Versuchen auch bei DB-Ausfall", async () => {
    mockedFindUnique.mockRejectedValue(new Error("DB down"));
    const key = `mem-block-${Date.now()}`;
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      await expect(checkRateLimit(key)).resolves.toBe(true);
    }
    await expect(checkRateLimit(key)).resolves.toBe(false);
  });

  it("erlaubt Requests mit custom max auch bei DB-Ausfall", async () => {
    mockedFindUnique.mockRejectedValue(new Error("DB down"));
    const key = `mem-custom-${Date.now()}`;
    const customMax = 3;
    for (let i = 0; i < customMax; i++) {
      await expect(checkRateLimit(key, customMax)).resolves.toBe(true);
    }
    await expect(checkRateLimit(key, customMax)).resolves.toBe(false);
  });

  it("gibt true zurück, wenn der upsert beim Anlegen wirft", async () => {
    mockedFindUnique.mockResolvedValue(null);
    mockedUpsert.mockRejectedValue(new Error("connection reset"));
    await expect(checkRateLimit(`mem-upsert-${Date.now()}`)).resolves.toBe(true);
  });
});
