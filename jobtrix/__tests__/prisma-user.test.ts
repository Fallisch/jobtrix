/**
 * @jest-environment node
 */
import { prisma } from "@/lib/prisma";

describe("Prisma User", () => {
  afterEach(async () => {
    await prisma.user.deleteMany({ where: { email: { startsWith: "smoke-test-" } } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("legt einen User an und liest ihn per findUnique wieder aus", async () => {
    const email = `smoke-test-${Date.now()}@example.com`;

    const created = await prisma.user.create({
      data: { email, passwordHash: "hashed-password" },
    });

    const found = await prisma.user.findUnique({ where: { id: created.id } });

    expect(found).not.toBeNull();
    expect(found?.email).toBe(email);
    expect(found?.passwordHash).toBe("hashed-password");
  });
});
