import { test, expect } from "@playwright/test";
import Stripe from "stripe";
import { prisma } from "../lib/prisma";

const stripe = new Stripe("sk_test_dummy_for_signature_generation");

const PROFILE = {
  name: "Max Mustermann",
  address: "Musterstraße 1, 12345 Berlin",
  birthdate: "1990-01-01",
  photo: null,
  education: [{ id: "1", institution: "TU Berlin", degree: "B.Sc. Informatik", year: "2015" }],
  qualifications: ["TypeScript", "React"],
};

test.describe("Issue #21 – Stripe-Webhook aktiviert Zugang", () => {
  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test("simulierter Webhook-Call aktiviert zeitlich begrenzten Zugang, /api/generate ist danach sofort wieder nutzbar", async ({ page }) => {
    const email = `e2e-webhook-${Date.now()}@example.com`;
    const password = "Correct-1";

    await page.goto("/de/register");
    await page.getByLabel("E-Mail").fill(email);
    await page.getByLabel("Passwort", { exact: true }).fill(password);
    await page.getByLabel("Passwort bestätigen").fill(password);
    await page.getByLabel(/AGB und die Datenschutzbestimmungen/).check();
    await page.getByRole("button", { name: "Registrieren" }).click();
    await expect(page).toHaveURL(/\/de\/onboarding/);

    const sessionRes = await page.request.get("/api/auth/session");
    const session = await sessionRes.json();
    const userId = session.user.id as string;

    // Kostenlose Generierung bereits verbraucht, kein Paket aktiv
    await prisma.access.create({ data: { userId, freeGenerationUsed: true, package: "none" } });

    const requestBody = { jobPosting: "Wir suchen einen Entwickler.", profile: PROFILE };

    const blockedRes = await page.request.post("/api/generate", { data: requestBody });
    expect(blockedRes.status()).toBe(402);
    expect((await blockedRes.json()).error).toBe("access_required");

    const payload = JSON.stringify({
      id: "evt_test_e2e",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_e2e",
          payment_intent: "pi_test_e2e",
          metadata: { userId, package: "limited" },
        },
      },
    });
    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
    });

    const webhookRes = await page.request.post("/api/webhooks/stripe", {
      data: payload,
      headers: { "stripe-signature": signature, "Content-Type": "application/json" },
    });
    expect(webhookRes.status()).toBe(200);

    const allowedRes = await page.request.post("/api/generate", { data: requestBody });
    expect(allowedRes.status()).not.toBe(402);

    await prisma.access.deleteMany({ where: { userId } });
  });

  test("Bezahlseite zeigt Erfolgs- bzw. Abbruchmeldung nach Rückkehr von Stripe", async ({ page }) => {
    await page.goto("/de/pricing?status=success");
    await expect(page.getByRole("status")).toContainText("Zahlung erfolgreich");

    await page.goto("/de/pricing?status=cancelled");
    await expect(page.getByRole("status")).toContainText("Die Zahlung wurde abgebrochen");
  });
});
