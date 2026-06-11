import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_VALIDITY_MS = 60 * 60 * 1000;

function sign(payload: string): string {
  return createHmac("sha256", process.env.NEXTAUTH_SECRET ?? "").update(payload).digest("base64url");
}

export function generateResetToken(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ userId, exp: Date.now() + TOKEN_VALIDITY_MS })).toString(
    "base64url"
  );
  return `${payload}.${sign(payload)}`;
}

export function verifyResetToken(token: string): { userId: string } | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof data.userId !== "string" || typeof data.exp !== "number") return null;
    if (Date.now() > data.exp) return null;
    return { userId: data.userId };
  } catch {
    return null;
  }
}
