import { createHash, createHmac, timingSafeEqual } from "crypto";

const TOKEN_VALIDITY_MS = 60 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is required for reset tokens");
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

function passwordFingerprint(passwordHash: string): string {
  return createHash("sha256").update(passwordHash).digest("base64url");
}

interface ResetTokenPayload {
  userId: string;
  pwfp: string;
  exp: number;
}

function decodePayload(payload: string): ResetTokenPayload | null {
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof data.userId !== "string" || typeof data.pwfp !== "string" || typeof data.exp !== "number") {
      return null;
    }
    return data as ResetTokenPayload;
  } catch {
    return null;
  }
}

export function generateResetToken(userId: string, passwordHash: string): string {
  const payload = Buffer.from(
    JSON.stringify({ userId, pwfp: passwordFingerprint(passwordHash), exp: Date.now() + TOKEN_VALIDITY_MS })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeResetTokenUserId(token: string): string | null {
  const [payload] = token.split(".");
  if (!payload) return null;
  return decodePayload(payload)?.userId ?? null;
}

export function verifyResetToken(token: string, passwordHash: string): { userId: string } | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  const data = decodePayload(payload);
  if (!data) return null;
  if (Date.now() > data.exp) return null;
  if (data.pwfp !== passwordFingerprint(passwordHash)) return null;

  return { userId: data.userId };
}
