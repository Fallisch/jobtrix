import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { ProfileData } from "@/lib/profile-storage";

interface GenerateRequest {
  jobPosting: string;
  companyName?: string;
  contactPerson?: string;
  profile: ProfileData;
}

function buildPrompt(req: GenerateRequest): string {
  const { jobPosting, companyName, contactPerson, profile } = req;

  const eduText = profile.education
    .map((e) => `${e.degree} – ${e.institution} (${e.year})`)
    .join("\n");
  const qualText = profile.qualifications.join(", ");

  return `Du bist ein Karriereberater und erstellst professionelle deutsche Bewerbungsunterlagen.

Erstelle auf Basis der folgenden Daten:
1. Ein professionelles deutsches Anschreiben
2. Einen strukturierten deutschen Lebenslauf

Bewerber:
Name: ${profile.name}
Adresse: ${profile.address}
Geburtsdatum: ${profile.birthdate}
Ausbildung:
${eduText}
Qualifikationen: ${qualText}

${companyName ? `Unternehmen: ${companyName}` : ""}
${contactPerson ? `Ansprechpartner: ${contactPerson}` : ""}

Stellenanzeige:
${jobPosting}

Antworte im folgenden Format – nutze exakt diese Trennstruktur:

ANSCHREIBEN: [vollständiges Anschreiben hier]

LEBENSLAUF: [vollständiger Lebenslauf hier]`;
}

function parseResponse(text: string): { coverLetter: string; cv: string } {
  const cvIndex = text.indexOf("\n\nLEBENSLAUF:");
  if (cvIndex === -1) {
    const parts = text.split("LEBENSLAUF:");
    const coverLetter = parts[0].replace(/^ANSCHREIBEN:\s*/, "").trim();
    const cv = (parts[1] ?? "").trim();
    return { coverLetter, cv };
  }
  const coverLetter = text.slice(0, cvIndex).replace(/^ANSCHREIBEN:\s*/, "").trim();
  const cv = text.slice(cvIndex + "\n\nLEBENSLAUF:".length).trim();
  return { coverLetter, cv };
}

export async function POST(request: NextRequest) {
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

    const { coverLetter, cv } = parseResponse(text);
    return NextResponse.json({ coverLetter, cv });
  } catch {
    return NextResponse.json({ error: "Generierung fehlgeschlagen. Bitte versuche es erneut." }, { status: 500 });
  }
}
