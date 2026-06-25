import { prisma } from "@/lib/prisma";

export const RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX
  ? parseInt(process.env.RATE_LIMIT_MAX, 10)
  : 5;

export const RATE_LIMIT_WINDOW_MS = process.env.RATE_LIMIT_WINDOW_MS
  ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10)
  : 15 * 60 * 1000;

interface MemoryEntry {
  attempts: number;
  windowStart: number;
}

const memoryStore = new Map<string, MemoryEntry>();

const MEMORY_CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupMemoryStore(now: number): void {
  if (now - lastCleanup < MEMORY_CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  memoryStore.forEach((v, k) => {
    if (now - v.windowStart > RATE_LIMIT_WINDOW_MS) memoryStore.delete(k);
  });
}

function checkMemoryRateLimit(key: string, max: number): boolean {
  const now = Date.now();
  cleanupMemoryStore(now);

  const entry = memoryStore.get(key);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    memoryStore.set(key, { attempts: 1, windowStart: now });
    return true;
  }

  if (entry.attempts >= max) return false;

  entry.attempts++;
  return true;
}

export async function checkRateLimit(key: string, max: number = RATE_LIMIT_MAX): Promise<boolean> {
  if (
    process.env.NODE_ENV === "test" &&
    process.env.ENABLE_RATE_LIMIT_IN_TESTS !== "1"
  ) {
    return true;
  }

  try {
    const now = Date.now();
    const entry = await prisma.rateLimitEntry.findUnique({ where: { key } });

    if (!entry) {
      await prisma.rateLimitEntry.upsert({
        where: { key },
        create: { key, attempts: 1 },
        update: { attempts: { increment: 1 } },
      });
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

    if (entry.attempts >= max) {
      return false;
    }

    await prisma.rateLimitEntry.update({
      where: { key },
      data: { attempts: { increment: 1 } },
    });
    return true;
  } catch {
    return checkMemoryRateLimit(key, max);
  }
}

export function getClientIp(req: { headers: { get: (key: string) => string | null } }): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}
