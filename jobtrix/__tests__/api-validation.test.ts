/**
 * @jest-environment node
 */
import { POST as registerPOST } from "@/app/api/auth/register/route";
import { POST as forgotPOST } from "@/app/api/auth/forgot-password/route";
import { POST as resetPOST } from "@/app/api/auth/reset-password/route";
import { POST as profilePOST } from "@/app/api/profile/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

jest.mock("@/lib/email", () => ({
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
}));

// Mock session for profile route
jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn().mockResolvedValue({
    user: { id: "validation-test-user-id" },
  }),
}));

function req(url: string, body: object) {
  return new NextRequest(`http://localhost${url}`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("Zod-Eingabevalidierung", () => {
  describe("POST /api/auth/register", () => {
    it("gibt 400 bei ungültiger E-Mail zurück", async () => {
      const res = await registerPOST(
        req("/api/auth/register", { email: "kein-email", password: "Password1!" })
      );
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toHaveProperty("error");
    });

    it("gibt 400 bei zu kurzem Passwort zurück", async () => {
      const res = await registerPOST(
        req("/api/auth/register", { email: "valid@example.com", password: "123" })
      );
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toHaveProperty("error");
    });

    it("gibt 400 bei fehlenden Feldern zurück", async () => {
      const res = await registerPOST(req("/api/auth/register", {}));
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toHaveProperty("error");
    });
  });

  describe("POST /api/auth/forgot-password", () => {
    it("gibt 400 bei ungültiger E-Mail zurück", async () => {
      const res = await forgotPOST(
        req("/api/auth/forgot-password", { email: "kein-email" })
      );
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toHaveProperty("error");
    });

    it("gibt 200 mit identischem Body für existierende E-Mail zurück", async () => {
      const email = `fp-exists-${Date.now()}@example.com`;
      const bcrypt = await import("bcrypt");
      await prisma.user.create({
        data: { email, passwordHash: await bcrypt.hash("pw", 10) },
      });
      try {
        const res = await forgotPOST(req("/api/auth/forgot-password", { email }));
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data).toEqual({ ok: true });
      } finally {
        await prisma.user.deleteMany({ where: { email } });
      }
    });

    it("gibt 200 mit identischem Body für nicht-existierende E-Mail zurück", async () => {
      const res = await forgotPOST(
        req("/api/auth/forgot-password", { email: "gibts-nicht@example.com" })
      );
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ ok: true });
    });
  });

  describe("POST /api/auth/reset-password", () => {
    it("gibt 400 bei zu kurzem Passwort zurück", async () => {
      const res = await resetPOST(
        req("/api/auth/reset-password", { token: "sometoken", password: "123" })
      );
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toHaveProperty("error");
    });

    it("gibt 400 bei fehlenden Feldern zurück", async () => {
      const res = await resetPOST(req("/api/auth/reset-password", {}));
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toHaveProperty("error");
    });
  });

  describe("POST /api/profile", () => {
    it("gibt 400 bei überlangem name-Feld zurück", async () => {
      const res = await profilePOST(
        req("/api/profile", {
          name: "a".repeat(300),
          address: "",
          email: "",
          phone: "",
          birthdate: "",
          photo: null,
          education: [],
          experience: [],
          qualifications: [],
          interests: [],
        })
      );
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toHaveProperty("error");
    });

    it("gibt 400 bei ungültigem E-Mail-Format im Profil zurück", async () => {
      const res = await profilePOST(
        req("/api/profile", {
          name: "Test User",
          address: "",
          email: "kein-email",
          phone: "",
          birthdate: "",
          photo: null,
          education: [{ degree: "Bachelor", school: "Uni", year: "2020" }],
          experience: [],
          qualifications: [],
          interests: [],
        })
      );
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toHaveProperty("error");
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
