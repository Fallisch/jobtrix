import { prisma } from "@/lib/prisma";

export const RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX
  ? parseInt(process.env.RATE_LIMIT_MAX, 10)
  : 5;

export const RATE_LIMIT_WINDOW_MS = process.env.RATE_LIMIT_WINDOW_MS
  ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10)
  : 15 * 60 * 1000;

export async function checkRateLimit(key: string): Promise<boolean> {
  const now = Date.now();
  const entry = await prisma.rateLimitEntry.findUnique({ where: { key } });

  if (!entry) {
    await prisma.rateLimitEntry.create({ data: { key, attempts: 1 } });
    return true;
  }

  const windowExpired = now - entry.windowStart.getTime() > RATE_LIMIT_WINDOW_MS;

  if (windowExpired) {
    await prisma.rateLimitEntry.update({
      where: { key },
      data: { attempts: 1, windowStart: new Date() },
    });
    return true;
  }

  if (entry.attempts >= RATE_LIMIT_MAX) {
    return false;
  }

  await prisma.rateLimitEntry.update({
    where: { key },
    data: { attempts: { increment: 1 } },
  });
  return true;
}

export function getClientIp(req: { headers: { get: (key: string) => string | null } }): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}
