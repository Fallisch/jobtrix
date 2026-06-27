import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkAccess } from "@/lib/access";
import { buildPrompt, GenerateRequest } from "@/lib/build-prompt";
import { parseResponse } from "./parse-response";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateRequestSchema } from "@/lib/validation-schemas";

function extractJobTitle(text: string): string | undefined {
  const patterns = [
    /(?:Stellentitel|Jobtitel|Position|Stelle)\s*[:\-–]\s*(.+)/i,
    /(?:wir suchen|gesucht)\s*(?:eine[n]?\s+)?(.+?)[\s,.(]/i,
    /^(.+?)\s*\(m\/w\/d\)/im,
    /^(.+?)\s*\(w\/m\/d\)/im,
    /^(.+?)\s*\(d\/m\/w\)/im,
    /^(.+?)\s*\(all genders\)/im,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) {
      const title = m[1].trim().slice(0, 200);
      if (title.length >= 3) return title;
    }
  }
  const firstLine = text.trim().split("\n")[0]?.trim();
  if (firstLine && firstLine.length >= 3 && firstLine.length <= 120) return firstLine;
  return undefined;
}

function extractCompanyName(text: string): string | undefined {
  const patterns = [
    /(?:Firma|Unternehmen|Company|Arbeitgeber)\s*[:\-–]\s*(.+)/i,
    /(?:bei|bei der|bei dem)\s+(.+?)\s+(?:suchen|bieten|sind)/i,
    /(?:Die|Das|Der)\s+(.+?)\s+(?:sucht|bietet|ist ein)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) {
      const name = m[1].trim().replace(/[.,;]+$/, "").slice(0, 200);
      if (name.length >= 2) return name;
    }
  }
  return undefined;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  if (!(await checkRateLimit(`generate:${userId}`, 10))) {
    return NextResponse.json({ error: "tooManyRequests" }, { status: 429 });
  }

  const access = await prisma.access.findUnique({ where: { userId } });
  const decision = checkAccess(access);
  if (!decision.allowed) {
    return NextResponse.json({ error: decision.reason }, { status: 402 });
  }

  try {
    const raw = await request.json();
    const parsed = generateRequestSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalidInput" }, { status: 400 });
    }
    const body = parsed.data as GenerateRequest;
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "ai_not_configured" }, { status: 503 });
    }
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: buildPrompt(body) }],
    });

    const text = message.content
      .filter((c) => c.type === "text")
      .map((c) => (c as { type: "text"; text: string }).text)
      .join("");

    const { emailSubject, coverLetter, cv, emailBody } = parseResponse(text);

    if (decision.markFreeGenerationUsed) {
      await prisma.access.upsert({
        where: { userId },
        create: { userId, freeGenerationUsed: true },
        update: { freeGenerationUsed: true },
      });
    }

    const jobTitle = body.jobTitle || extractJobTitle(body.jobPosting) || null;
    const companyName = body.companyName || body.targetCompany || extractCompanyName(body.jobPosting) || null;

    await prisma.applicationHistoryEntry.create({
      data: {
        userId,
        jobTitle,
        companyName,
        emailSubject,
        coverLetter,
        cv,
        emailBody,
        profileSnapshot: body.profile as object,
        template: body.template ?? "classic",
        accentColor: body.accentColor,
        cvStyle: body.cvStyle,
      },
    });

    return NextResponse.json({ emailSubject, coverLetter, cv, emailBody });
  } catch (err) {
    console.error("[/api/generate] Fehler:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ error: "Generierung fehlgeschlagen. Bitte versuche es erneut." }, { status: 500 });
  }
}
