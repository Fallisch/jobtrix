import { ProfileData } from "@/lib/profile-storage";

export interface GenerateRequest {
  jobPosting: string;
  jobTitle?: string;
  companyName?: string;
  contactPerson?: string;
  profile: ProfileData;
  cvStyle?: "classic" | "american";
  template?: "classic" | "modern" | "traditional";
}

export function buildPrompt(req: GenerateRequest): string {
  const { jobPosting, companyName, contactPerson, profile, cvStyle } = req;

  const eduText = profile.education
    .map((e) => `${e.degree} – ${e.institution} (${e.year})`)
    .join("\n");
  const expText = profile.experience
    .map((e) => `${e.position} – ${e.company} (${e.period})\n${e.tasks}`)
    .join("\n");
  const qualText = profile.qualifications.map((q) => q.label).join(", ");
  const interestsText = profile.interests.map((i) => i.label).join(", ");

  return `Du bist ein Karriereberater und erstellst professionelle deutsche Bewerbungsunterlagen.

Erstelle auf Basis der folgenden Daten:
1. Einen Betreffvorschlag für die Bewerbungs-E-Mail (Format: "Bewerbung als [erkannter Stellentitel aus der Stellenanzeige] – [Name des Bewerbers]")
2. Ein professionelles deutsches Anschreiben
3. Einen strukturierten deutschen Lebenslauf

Bewerber:
Name: ${profile.name}
Adresse: ${profile.address}
Geburtsdatum: ${profile.birthdate}
Ausbildung:
${eduText}
${profile.experience.length > 0 ? `Berufserfahrung:\n${expText}\n` : ""}Qualifikationen: ${qualText}
${profile.interests.length > 0 ? `Persönliche Interessen: ${interestsText}` : ""}

${companyName ? `Unternehmen: ${companyName}` : ""}
${contactPerson ? `Ansprechpartner: ${contactPerson}` : ""}

Stellenanzeige:
${jobPosting}

${cvStyle === "american" ? "Sortiere Berufserfahrung und Ausbildung antichronologisch – neuester Eintrag zuerst.\n\n" : ""}Schreibstil – halte diese Regeln strikt ein:
- Verwende eine natürliche, leicht unregelmäßige Satzstruktur: variiere Satzlänge und Satzbau bewusst, mische kurze Sätze mit längeren.
- Vermeide typische KI-Floskeln und abgedroschene Phrasen wie „Ich freue mich sehr", „Als leidenschaftlicher", „Mit großer Begeisterung" oder „Ich bin überzeugt".
- Bevorzuge einen direkten, persönlichen Ton – schreibe so, wie ein Mensch tatsächlich spricht und denkt.
- Keine übertriebene Förmlichkeit oder aufgesetzte Begeisterung; sachlich und authentisch bleiben.
- Vermeide austauschbare Schlussfloskeln im Anschreiben wie „Ich freue mich auf ein persönliches Gespräch" oder „Über eine Einladung zum Vorstellungsgespräch würde ich mich sehr freuen" – formuliere den letzten Satz konkret und individuell.
- Beginne nicht mehrere Sätze hintereinander mit „Ich" – variiere die Satzanfänge bewusst.

Aufbau des Anschreibens (AIDA-Prinzip) – halte diese Struktur ein:
- Einstieg (Attention): Kein Standardeinstieg wie „Mit großem Interesse habe ich Ihre Stellenanzeige gelesen" oder „Hiermit bewerbe ich mich auf die Position als..." – starte mit einem konkreten, individuellen Aufhänger zu Unternehmen, Aufgabe oder eigener Motivation.
- Hauptteil (Interest & Desire): Verknüpfe die Qualifikationen und Erfahrungen des Bewerbers konkret mit den Anforderungen aus der Stellenanzeige und zeige den Mehrwert für das Unternehmen – keine reine Aufzählung von Eigenschaften.
- Schluss (Action): Selbstbewusster, individueller Abschluss mit konkretem nächsten Schritt (siehe Regel zu Schlussfloskeln oben).

Wichtig: Schreibe Anschreiben und Lebenslauf in reinem Klartext ohne Markdown-Formatierung –
also ohne Sternchen (**fett**), ohne Raute-Überschriften (#, ##), ohne Tabellen (| ... |) und
ohne Trennlinien (---). Verwende stattdessen normale Absätze, Zeilenumbrüche und ggf. einfache
Aufzählungen mit "-" am Zeilenanfang.

Antworte im folgenden Format – nutze exakt diese Trennstruktur:

BETREFF: [Betreffzeile hier]

ANSCHREIBEN: [vollständiges Anschreiben hier]

LEBENSLAUF: [vollständiger Lebenslauf hier]`;
}
