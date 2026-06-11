/**
 * @jest-environment node
 */
import bcrypt from "bcrypt";
import { authOptions, verifyCredentials } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

describe("NextAuth-Konfiguration", () => {
  const email = `auth-test-${Date.now()}@example.com`;
  const password = "correct-password";

  beforeAll(async () => {
    await prisma.user.create({
      data: { email, passwordHash: await bcrypt.hash(password, 10) },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it("nutzt eine datenbankgestützte Session-Strategie, den Prisma-Adapter und einen Credentials Provider", () => {
    expect(authOptions.session?.strategy).toBe("database");
    expect(authOptions.adapter).toBeDefined();
    expect(authOptions.providers.find((p) => p.id === "credentials")).toBeDefined();
  });

  it("authorisiert einen User mit korrekten Zugangsdaten", async () => {
    const user = await verifyCredentials(email, password);

    expect(user).toMatchObject({ email });
  });

  it("lehnt einen User mit falschem Passwort ab", async () => {
    const user = await verifyCredentials(email, "wrong-password");

    expect(user).toBeNull();
  });
});
