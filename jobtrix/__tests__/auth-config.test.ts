/**
 * @jest-environment node
 */
import bcrypt from "bcrypt";
import { authOptions, verifyCredentials } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

describe("NextAuth-Konfiguration", () => {
  const email = `auth-test-${Date.now()}@example.com`;
  const password = "correct-password";
  let userId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: { email, passwordHash: await bcrypt.hash(password, 10) },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it("nutzt JWT-Sessions (Credentials Provider erlaubt keine datenbankgestützten Sessions), den Prisma-Adapter und einen Credentials Provider", () => {
    expect(authOptions.session?.strategy).toBe("jwt");
    expect(authOptions.adapter).toBeDefined();
    expect(authOptions.providers.find((p) => p.id === "credentials")).toBeDefined();
  });

  it("Sessions bleiben standardmäßig 30 Tage gültig", () => {
    expect(authOptions.session?.maxAge).toBe(30 * 24 * 60 * 60);
  });

  it("authorisiert einen User mit korrekten Zugangsdaten", async () => {
    const user = await verifyCredentials(email, password);

    expect(user).toMatchObject({ email });
  });

  it("lehnt einen User mit falschem Passwort ab", async () => {
    const user = await verifyCredentials(email, "wrong-password");

    expect(user).toBeNull();
  });

  it("jwt-Callback speichert die User-ID im Token beim Login", async () => {
    const token = await authOptions.callbacks!.jwt!({
      token: {},
      user: { id: userId, email, name: null },
    } as never);

    expect(token.id).toBe(userId);
  });

  it("session-Callback prüft den User live in der Datenbank und reichert die Session mit aktuellen Daten an", async () => {
    const session = (await authOptions.callbacks!.session!({
      session: { user: { email: "stale@example.com", name: "Alt" }, expires: "2099-01-01T00:00:00.000Z" },
      token: { id: userId },
    } as never)) as { user: { id: string; email: string; name: string | null } };

    expect(session.user.id).toBe(userId);
    expect(session.user.email).toBe(email);
  });
});
