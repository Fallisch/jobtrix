/**
 * @jest-environment node
 */
import { POST } from "@/app/api/webhooks/resend/route";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const WEBHOOK_SECRET = "whsec_test_secret_key";

function sign(payload: string, secret: string): string {
  const msgId = "msg_test123";
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const toSign = `${msgId}.${timestamp}.${payload}`;
  const signature = crypto
    .createHmac("sha256", Buffer.from(secret.replace("whsec_", ""), "base64"))
    .update(toSign)
    .digest("base64");
  return JSON.stringify({ msgId, timestamp, signature: `v1,${signature}` });
}

function makeRequest(body: object, headers?: Record<string, string>): Request {
  const payload = JSON.stringify(body);
  const signed = headers ?? (() => {
    const msgId = "msg_test123";
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const toSign = `${msgId}.${timestamp}.${payload}`;
    const sig = crypto
      .createHmac("sha256", Buffer.from(WEBHOOK_SECRET.replace("whsec_", ""), "base64"))
      .update(toSign)
      .digest("base64");
    return {
      "svix-id": msgId,
      "svix-timestamp": timestamp,
      "svix-signature": `v1,${sig}`,
    };
  })();

  return new Request("http://localhost/api/webhooks/resend", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...signed },
    body: payload,
  });
}

const bouncePayload = {
  type: "email.bounced",
  data: {
    email_id: "bounce-event-test-001",
    from: "noreply@jobtrix.de",
    to: ["recipient@example.com"],
    created_at: "2026-06-25T10:00:00.000Z",
  },
};

const complaintPayload = {
  type: "email.complained",
  data: {
    email_id: "complaint-event-test-001",
    from: "noreply@jobtrix.de",
    to: ["spammer@example.com"],
    created_at: "2026-06-25T11:00:00.000Z",
  },
};

beforeAll(() => {
  process.env.RESEND_WEBHOOK_SECRET = WEBHOOK_SECRET;
});

afterAll(async () => {
  await prisma.auditLog.deleteMany({
    where: { action: { in: ["email_bounced", "email_complained"] } },
  });
  await prisma.processedWebhookEvent.deleteMany({
    where: { eventId: { startsWith: "bounce-event-test" } },
  });
  await prisma.processedWebhookEvent.deleteMany({
    where: { eventId: { startsWith: "complaint-event-test" } },
  });
  await prisma.$disconnect();
});

describe("POST /api/webhooks/resend", () => {
  it("liefert 503 wenn RESEND_WEBHOOK_SECRET nicht konfiguriert ist", async () => {
    const original = process.env.RESEND_WEBHOOK_SECRET;
    delete process.env.RESEND_WEBHOOK_SECRET;

    const res = await POST(makeRequest(bouncePayload, {
      "svix-id": "msg_1",
      "svix-timestamp": "123",
      "svix-signature": "v1,invalid",
    }));

    process.env.RESEND_WEBHOOK_SECRET = original;
    expect(res.status).toBe(503);
  });

  it("liefert 400 bei ungültiger Signatur", async () => {
    const res = await POST(makeRequest(bouncePayload, {
      "svix-id": "msg_bad",
      "svix-timestamp": Math.floor(Date.now() / 1000).toString(),
      "svix-signature": "v1,invalidsignature",
    }));

    expect(res.status).toBe(400);
  });

  it("verarbeitet ein Bounce-Event und erstellt einen AuditLog-Eintrag", async () => {
    const res = await POST(makeRequest(bouncePayload));

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.received).toBe(true);

    const log = await prisma.auditLog.findFirst({
      where: { action: "email_bounced" },
      orderBy: { createdAt: "desc" },
    });
    expect(log).not.toBeNull();
    expect(log!.detail).toContain("recipient@example.com");
  });

  it("verarbeitet ein Complaint-Event und erstellt einen AuditLog-Eintrag", async () => {
    const res = await POST(makeRequest(complaintPayload));

    expect(res.status).toBe(200);

    const log = await prisma.auditLog.findFirst({
      where: { action: "email_complained" },
      orderBy: { createdAt: "desc" },
    });
    expect(log).not.toBeNull();
    expect(log!.detail).toContain("spammer@example.com");
  });

  it("verarbeitet dasselbe Event nicht doppelt (Idempotenz)", async () => {
    const idempotentPayload = {
      type: "email.bounced",
      data: {
        email_id: "bounce-event-test-idempotent",
        from: "noreply@jobtrix.de",
        to: ["test@example.com"],
        created_at: "2026-06-25T12:00:00.000Z",
      },
    };

    const res1 = await POST(makeRequest(idempotentPayload));
    expect(res1.status).toBe(200);

    const countBefore = await prisma.auditLog.count({
      where: { action: "email_bounced", detail: { contains: "test@example.com" } },
    });

    const res2 = await POST(makeRequest(idempotentPayload));
    expect(res2.status).toBe(200);

    const countAfter = await prisma.auditLog.count({
      where: { action: "email_bounced", detail: { contains: "test@example.com" } },
    });
    expect(countAfter).toBe(countBefore);
  });

  it("ignoriert unbekannte Event-Typen graceful", async () => {
    const unknownPayload = {
      type: "email.delivered",
      data: {
        email_id: "delivered-event-test-001",
        from: "noreply@jobtrix.de",
        to: ["ok@example.com"],
        created_at: "2026-06-25T13:00:00.000Z",
      },
    };

    const res = await POST(makeRequest(unknownPayload));
    expect(res.status).toBe(200);
  });
});
