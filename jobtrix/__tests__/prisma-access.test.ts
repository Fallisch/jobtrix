/**
 * @jest-environment node
 */
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

describe("Prisma Access", () => {
  const email = `access-smoke-${Date.now()}@example.com`;
  let userId: string;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash("password", 10);
    const user = await prisma.user.create({ data: { email, passwordHash } });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.access.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it("legt einen Access-Datensatz an und liest ihn per findUnique wieder aus", async () => {
    const created = await prisma.access.create({
      data: { userId, freeGenerationUsed: true, package: "limited" },
    });

    const found = await prisma.access.findUnique({ where: { userId } });

    expect(found).not.toBeNull();
    expect(found?.id).toBe(created.id);
    expect(found?.freeGenerationUsed).toBe(true);
    expect(found?.package).toBe("limited");
    expect(found?.validUntil).toBeNull();
  });
});
