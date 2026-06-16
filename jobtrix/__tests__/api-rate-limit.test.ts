/**
 * @jest-environment node
 */
import { POST as registerPOST } from "@/app/api/auth/register/route";
import { POST as forgotPasswordPOST } from "@/app/api/auth/forgot-password/route";
import { POST as resetPasswordPOST } from "@/app/api/auth/reset-password/route";
import { verifyCredentials } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from "@/lib/rate-limit";
import { NextRequest } from "next/server";

jest.mock("@/lib/email", () => ({
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
}));

beforeAll(() => {
  process.env.ENABLE_RATE_LIMIT_IN_TESTS = "1";
});

afterAll(() => {
  delete process.env.ENABLE_RATE_LIMIT_IN_TESTS;
});

function testIp(label: string) {
  return `test-rl-${label}-${Date.now()}-${Math.random()}`;
}

function registerReq(ip: string, email: string) {
  return new NextRequest("http://localhost/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password: "Password1!" }),
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
  });
}

function forgotReq(ip: string, email: string) {
  return new NextRequest("http://localhost/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
  });
}

function resetReq(ip: string) {
  return new NextRequest("http://localhost/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token: "invalid-token", password: "NewPassword1!" }),
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
  });
}

async function exhaustRateLimit(
  action: (i: number) => Promise<Response>
) {
  for (let i = 0; i < RATE_LIMIT_MAX; i++) {
    await action(i);
  }
}

describe("Rate-Limiting Auth-Endpunkte", () => {
  afterAll(async () => {
    await prisma.rateLimitEntry.deleteMany({
      where: { key: { startsWith: "test-rl-" } },
    });
    await prisma.$disconnect();
  });

  describe("POST /api/auth/register", () => {
    it("antwortet nach N+1 Versuchen mit 429", async () => {
      const ip = testIp("register");
      const email = (i: number) => `rl-reg-${ip}-${i}@example.com`;
      await exhaustRateLimit((i) => registerPOST(registerReq(ip, email(i))));
      const res = await registerPOST(registerReq(ip, email(99)));
      expect(res.status).toBe(429);
    });

    it("lässt Anfragen nach Ablauf des Zeitfensters wieder durch", async () => {
      const ip = testIp("register-window");
      const email = (i: number) => `rl-reg-win-${ip}-${i}@example.com`;
      await exhaustRateLimit((i) => registerPOST(registerReq(ip, email(i))));

      // Fenster auf abgelaufen setzen
      const key = `register:${ip}`;
      await prisma.rateLimitEntry.update({
        where: { key },
        data: { windowStart: new Date(Date.now() - RATE_LIMIT_WINDOW_MS - 1000) },
      });

      const res = await registerPOST(registerReq(ip, email(99)));
      expect(res.status).not.toBe(429);
    });
  });

  describe("POST /api/auth/forgot-password", () => {
    it("antwortet nach N+1 Versuchen mit 429", async () => {
      const ip = testIp("forgot");
      await exhaustRateLimit(() =>
        forgotPasswordPOST(forgotReq(ip, "nonexistent@example.com"))
      );
      const res = await forgotPasswordPOST(
        forgotReq(ip, "nonexistent@example.com")
      );
      expect(res.status).toBe(429);
    });

    it("lässt Anfragen nach Ablauf des Zeitfensters wieder durch", async () => {
      const ip = testIp("forgot-window");
      await exhaustRateLimit(() =>
        forgotPasswordPOST(forgotReq(ip, "nonexistent@example.com"))
      );

      const key = `forgot-password:${ip}`;
      await prisma.rateLimitEntry.update({
        where: { key },
        data: { windowStart: new Date(Date.now() - RATE_LIMIT_WINDOW_MS - 1000) },
      });

      const res = await forgotPasswordPOST(
        forgotReq(ip, "nonexistent@example.com")
      );
      expect(res.status).not.toBe(429);
    });
  });

  describe("POST /api/auth/reset-password", () => {
    it("antwortet nach N+1 Versuchen mit 429", async () => {
      const ip = testIp("reset");
      await exhaustRateLimit(() => resetPasswordPOST(resetReq(ip)));
      const res = await resetPasswordPOST(resetReq(ip));
      expect(res.status).toBe(429);
    });

    it("lässt Anfragen nach Ablauf des Zeitfensters wieder durch", async () => {
      const ip = testIp("reset-window");
      await exhaustRateLimit(() => resetPasswordPOST(resetReq(ip)));

      const key = `reset-password:${ip}`;
      await prisma.rateLimitEntry.update({
        where: { key },
        data: { windowStart: new Date(Date.now() - RATE_LIMIT_WINDOW_MS - 1000) },
      });

      const res = await resetPasswordPOST(resetReq(ip));
      expect(res.status).not.toBe(429);
    });
  });

  describe("NextAuth Login (verifyCredentials)", () => {
    const loginEmail = `rl-login-${Date.now()}@example.com`;
    const loginIp = testIp("login");

    beforeAll(async () => {
      const bcrypt = await import("bcrypt");
      const hash = await bcrypt.hash("Password1!", 10);
      await prisma.user.create({ data: { email: loginEmail, passwordHash: hash } });
    });

    afterAll(async () => {
      await prisma.user.deleteMany({ where: { email: loginEmail } });
      await prisma.rateLimitEntry.deleteMany({ where: { key: `login:${loginEmail}` } });
    });

    it("blockiert nach N+1 fehlgeschlagenen Login-Versuchen", async () => {
      for (let i = 0; i < RATE_LIMIT_MAX; i++) {
        await verifyCredentials(loginEmail, "wrong-password", loginIp);
      }
      const result = await verifyCredentials(loginEmail, "Password1!", loginIp);
      expect(result).toBeNull();
    });

    it("lässt Login nach Ablauf des Zeitfensters wieder zu", async () => {
      const email2 = `rl-login2-${Date.now()}@example.com`;
      const bcrypt = await import("bcrypt");
      const hash = await bcrypt.hash("Password1!", 10);
      await prisma.user.create({ data: { email: email2, passwordHash: hash } });

      try {
        for (let i = 0; i < RATE_LIMIT_MAX; i++) {
          await verifyCredentials(email2, "wrong-password", loginIp + "-2");
        }
        const key = `login:${email2}`;
        await prisma.rateLimitEntry.update({
          where: { key },
          data: { windowStart: new Date(Date.now() - RATE_LIMIT_WINDOW_MS - 1000) },
        });
        const result = await verifyCredentials(email2, "Password1!", loginIp + "-2");
        expect(result).not.toBeNull();
      } finally {
        await prisma.user.deleteMany({ where: { email: email2 } });
        await prisma.rateLimitEntry.deleteMany({ where: { key: `login:${email2}` } });
      }
    });
  });
});
