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
  const strengthsText = profile.strengths.join(", ");

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
${profile.strengths.length > 0 ? `Persönliche Stärken: ${strengthsText}` : ""}

${companyName ? `Unternehmen: ${companyName}` : ""}
${contactPerson ? `Ansprechpartner: ${contactPerson}` : ""}

Stellenanzeige:
${jobPosting}

Antworte im folgenden Format – nutze exakt diese Trennstruktur:

ANSCHREIBEN: [vollständiges Anschreiben hier]

LEBENSLAUF: [vollständiger Lebenslauf hier]`;
}

const SECTION_MARKER = /\*{0,2}\s*(ANSCHREIBEN|LEBENSLAUF)\s*:\s*\*{0,2}/gi;

function isNoiseLine(line: string, label: string): boolean {
  const trimmed = line.trim();
  if (trimmed === "") return true;
  if (/^[#*\-_=:\s]*[#*\-_=][#*\-_=:\s]*$/.test(trimmed)) return true;
  if (new RegExp(`^[#*\\s]*${label}[#*:\\s]*$`, "i").test(trimmed)) return true;
  return false;
}

function cleanSection(section: string, label: string): string {
  const lines = section.split("\n");
  let start = 0;
  while (start < lines.length && isNoiseLine(lines[start], label)) start++;
  let end = lines.length;
  while (end > start && isNoiseLine(lines[end - 1], label)) end--;
  return lines.slice(start, end).join("\n").trim();
}

function parseResponse(text: string): { coverLetter: string; cv: string } {
  const markers = [...text.matchAll(SECTION_MARKER)];
  const anschreiben = markers.find((m) => m[1].toUpperCase() === "ANSCHREIBEN");
  const lebenslauf = markers.find((m) => m[1].toUpperCase() === "LEBENSLAUF");

  const coverStart = anschreiben ? anschreiben.index + anschreiben[0].length : 0;
  const coverEnd = lebenslauf ? lebenslauf.index : text.length;
  const cvStart = lebenslauf ? lebenslauf.index + lebenslauf[0].length : text.length;

  return {
    coverLetter: cleanSection(text.slice(coverStart, coverEnd), "Anschreiben"),
    cv: cleanSection(text.slice(cvStart), "Lebenslauf"),
  };
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
  } catch (err) {
    console.error("[/api/generate] Fehler:", err);
    return NextResponse.json({ error: "Generierung fehlgeschlagen. Bitte versuche es erneut." }, { status: 500 });
  }
}
