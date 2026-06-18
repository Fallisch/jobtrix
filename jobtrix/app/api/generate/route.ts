import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkAccess } from "@/lib/access";
import { buildPrompt, GenerateRequest } from "@/lib/build-prompt";
import { parseResponse } from "./parse-response";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const access = await prisma.access.findUnique({ where: { userId } });
  const decision = checkAccess(access);
  if (!decision.allowed) {
    return NextResponse.json({ error: decision.reason }, { status: 402 });
  }

  if (decision.markFreeGenerationUsed) {
    await prisma.access.upsert({
      where: { userId },
      create: { userId, freeGenerationUsed: true },
      update: { freeGenerationUsed: true },
    });
  }

  try {
    const body = (await request.json()) as GenerateRequest;
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

    await prisma.applicationHistoryEntry.create({
      data: {
        userId,
        jobTitle: body.jobTitle,
        companyName: body.companyName,
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
    console.error("[/api/generate] Fehler:", err);
    return NextResponse.json({ error: "Generierung fehlgeschlagen. Bitte versuche es erneut." }, { status: 500 });
  }
}
