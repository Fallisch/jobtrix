import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

interface ResendWebhookPayload {
  type: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    created_at: string;
  };
}

function verifySignature(payload: string, headers: Headers, secret: string): boolean {
  const msgId = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signatures = headers.get("svix-signature");

  if (!msgId || !timestamp || !signatures) return false;

  const toSign = `${msgId}.${timestamp}.${payload}`;
  const expected = crypto
    .createHmac("sha256", Buffer.from(secret.replace("whsec_", ""), "base64"))
    .update(toSign)
    .digest("base64");

  const expectedBuf = Buffer.from(expected);
  return signatures.split(" ").some((sig) => {
    const valueBuf = Buffer.from(sig.replace("v1,", ""));
    if (expectedBuf.length !== valueBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, valueBuf);
  });
}

export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const body = await request.text();

  if (!verifySignature(body, request.headers, secret)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  const event: ResendWebhookPayload = JSON.parse(body);

  const existing = await prisma.processedWebhookEvent.findUnique({
    where: { eventId: event.data.email_id },
  });
  if (existing) {
    return NextResponse.json({ received: true });
  }

  await prisma.processedWebhookEvent.create({
    data: { eventId: event.data.email_id },
  });

  const recipients = event.data.to.join(", ");

  if (event.type === "email.bounced") {
    await logAudit("email_bounced", {
      detail: `to:${recipients} email_id:${event.data.email_id}`,
    });
  } else if (event.type === "email.complained") {
    await logAudit("email_complained", {
      detail: `to:${recipients} email_id:${event.data.email_id}`,
    });
  }

  return NextResponse.json({ received: true });
}
