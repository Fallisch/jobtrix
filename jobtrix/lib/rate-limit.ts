import { prisma } from "@/lib/prisma";

export const RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX
  ? parseInt(process.env.RATE_LIMIT_MAX, 10)
  : 5;

export const RATE_LIMIT_WINDOW_MS = process.env.RATE_LIMIT_WINDOW_MS
  ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10)
  : 15 * 60 * 1000;

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
      // upsert statt create: vermeidet Unique-Constraint-Fehler, wenn zwei
      // parallele Requests mit gleichem Key gleichzeitig den Eintrag anlegen.
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
  } catch (err) {
    // Fail-open: Rate-Limiting läuft als erstes in register/login/reset. Ein
    // DB-Fehler/-Hang hier darf den Auth-Flow nicht hart killen (sonst hängt
    // der Login-Button). Lieber kurz ungedrosselt als gar kein Login.
    console.error(`checkRateLimit fehlgeschlagen (fail-open) für key=${key}:`, err);
    return true;
  }
}

export function getClientIp(req: { headers: { get: (key: string) => string | null } }): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}
