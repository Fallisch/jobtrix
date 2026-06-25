import { ProfileData } from "@/lib/profile-storage";

export interface GenerateRequest {
  jobPosting: string;
  jobTitle?: string;
  companyName?: string;
  contactPerson?: string;
  profile: ProfileData;
  cvStyle?: "classic" | "american";
  template?: "classic" | "modern" | "traditional" | "accent" | "creative";
  accentColor?: string;
  isInitiativbewerbung?: boolean;
  targetCompany?: string;
  workMode?: "remote" | "homeoffice" | "hybrid" | "onsite";
  hints?: string;
}

export function buildPrompt(req: GenerateRequest): string {
  const { jobPosting, companyName, contactPerson, profile, cvStyle, isInitiativbewerbung, targetCompany, workMode, hints } = req;

  const workModeLabels: Record<string, string> = {
    remote: "Remote",
    homeoffice: "Homeoffice",
    hybrid: "Hybrid",
    onsite: "Vor Ort",
  };
  const workModeHint = workMode ? `\nBevorzugte Arbeitsform: ${workModeLabels[workMode]}. Erwähne diese Präferenz passend im Anschreiben.` : "";

  const eduText = profile.education
    .map((e) => `${e.degree} – ${e.institution} (${e.year})`)
    .join("\n");
  const expText = profile.experience
    .map((e) => `${e.position} – ${e.company} (${e.period})\n${e.tasks}`)
    .join("\n");
  const qualText = profile.qualifications.map((q) => q.label).join(", ");
  const interestsText = profile.interests.map((i) => i.label).join(", ");

  const effectiveCompany = isInitiativbewerbung ? targetCompany : companyName;

  const jobSection = isInitiativbewerbung
    ? `Art der Bewerbung: Initiativbewerbung${targetCompany ? ` bei ${targetCompany}` : ""}
Erstelle ein allgemeines Anschreiben ohne Bezug auf eine konkrete Stellenanzeige. Das Anschreiben soll die Stärken und Qualifikationen des Bewerbers hervorheben und das Interesse am Unternehmen begründen.`
    : `Stellenanzeige:\n${jobPosting}`;

  const emailHinweis = isInitiativbewerbung
    ? `Der E-Mail-Text soll sich auf das Unternehmen beziehen (Initiativbewerbung), nicht auf eine konkrete Stelle.`
    : `Der E-Mail-Text soll sich kurz auf die ausgeschriebene Stelle beziehen.`;

  const betreffHinweis = isInitiativbewerbung
    ? `1. Einen Betreffvorschlag für die Bewerbungs-E-Mail (Format: "Initiativbewerbung – [Name des Bewerbers]")`
    : `1. Einen Betreffvorschlag für die Bewerbungs-E-Mail (Format: "Bewerbung als [erkannter Stellentitel aus der Stellenanzeige] – [Name des Bewerbers]")`;

  const hauptteilHinweis = isInitiativbewerbung
    ? `- Hauptteil (Interest & Desire): Hebe die Qualifikationen und Erfahrungen des Bewerbers hervor und zeige, welchen Mehrwert er dem Unternehmen bieten kann – ohne Bezug auf eine konkrete Stelle.`
    : `- Hauptteil (Interest & Desire): Verknüpfe die Qualifikationen und Erfahrungen des Bewerbers konkret mit den Anforderungen aus der Stellenanzeige und zeige den Mehrwert für das Unternehmen – keine reine Aufzählung von Eigenschaften.`;

  const today = new Date();
  const todayFormatted = `${String(today.getDate()).padStart(2, "0")}.${String(today.getMonth() + 1).padStart(2, "0")}.${today.getFullYear()}`;
  const city = profile.address?.match(/\d{5}\s+(.+)/)?.[1] ?? "";

  return `Du bist ein Karriereberater und erstellst professionelle deutsche Bewerbungsunterlagen.

Erstelle auf Basis der folgenden Daten:
${betreffHinweis}
2. Ein professionelles deutsches Anschreiben
3. Einen strukturierten deutschen Lebenslauf
4. Einen kurzen E-Mail-Text (3–5 Sätze) für die Bewerbungs-E-Mail

Heutiges Datum: ${todayFormatted}${city ? ` (Ort des Bewerbers: ${city})` : ""}

Bewerber:
Name: ${profile.name}
Adresse: ${profile.address}
E-Mail: ${profile.email || "nicht angegeben"}
Telefon: ${profile.phone || "nicht angegeben"}
Geburtsdatum: ${profile.birthdate}
Ausbildung:
${eduText}
${profile.experience.length > 0 ? `Berufserfahrung:\n${expText}\n` : ""}Qualifikationen: ${qualText}
${profile.interests.length > 0 ? `Persönliche Interessen: ${interestsText}` : ""}

${effectiveCompany ? `Unternehmen: ${effectiveCompany}` : ""}
${contactPerson ? `Ansprechpartner: ${contactPerson}` : ""}

${jobSection}${workModeHint}${hints ? `\nZusätzliche Hinweise des Bewerbers:\n${hints}` : ""}

${cvStyle === "american" ? "Sortiere Berufserfahrung und Ausbildung antichronologisch – neuester Eintrag zuerst.\n\n" : ""}Schreibstil – halte diese Regeln strikt ein:
- Schreibe auf einem professionellen, gehobenen Niveau — wie ein erfahrener Personalberater, nicht wie ein Chatbot.
- Verwende eine natürliche, leicht variierte Satzstruktur: mische kürzere mit längeren Sätzen, aber halte den Ton stets seriös und geschliffen.
- Vermeide typische KI-Floskeln und abgedroschene Phrasen wie „Ich freue mich sehr", „Als leidenschaftlicher", „Mit großer Begeisterung" oder „Ich bin überzeugt".
- Vermeide auch zu umgangssprachliche oder lässige Formulierungen — kein Slang, keine saloppen Redewendungen, keine verkürzten Sätze wie Aufzählungen.
- Sachlich, selbstbewusst und authentisch — ohne aufgesetzte Begeisterung, aber auch ohne Unterwürfigkeit.
- Vermeide austauschbare Schlussfloskeln im Anschreiben wie „Ich freue mich auf ein persönliches Gespräch" oder „Über eine Einladung zum Vorstellungsgespräch würde ich mich sehr freuen" – formuliere den letzten Satz konkret und individuell.
- Beginne nicht mehrere Sätze hintereinander mit „Ich" – variiere die Satzanfänge bewusst.
- Jeder Absatz soll in vollständigen, ausformulierten Sätzen geschrieben sein — keine Stichpunkte oder Halbsätze im Anschreiben.

Formale Anforderungen an das Anschreiben:
- Das Anschreiben MUSS das heutige Datum enthalten, formatiert als „Ort, TT. Monat JJJJ" (z. B. „${city || "Berlin"}, ${today.getDate()}. ${["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"][today.getMonth()]} ${today.getFullYear()}").
- Verwende ausschließlich die E-Mail-Adresse und Telefonnummer aus den Bewerberdaten oben — erfinde keine Kontaktdaten.

Aufbau des Anschreibens (AIDA-Prinzip) – halte diese Struktur ein:
- Einstieg (Attention): Kein Standardeinstieg wie „Mit großem Interesse habe ich Ihre Stellenanzeige gelesen" oder „Hiermit bewerbe ich mich auf die Position als..." – starte mit einem konkreten, individuellen Aufhänger zu Unternehmen, Aufgabe oder eigener Motivation.
${hauptteilHinweis}
- Schluss (Action): Selbstbewusster, individueller Abschluss mit konkretem nächsten Schritt (siehe Regel zu Schlussfloskeln oben).

Aufbau des E-Mail-Texts:
- Schreibe genau 3–5 kurze Sätze: höfliche Anrede, ${emailHinweis} Verweis auf die Anhänge (Anschreiben und Lebenslauf), Grußformel mit dem Namen des Bewerbers.
- Der E-Mail-Text ist KEIN zweites Anschreiben – halte ihn kurz und professionell.

KRITISCH – Sektions-Trennung (ein Verstoß macht die Antwort unbrauchbar):
- Jede Sektion MUSS mit ihrem exakten Marker beginnen: BETREFF:, ANSCHREIBEN:, LEBENSLAUF:, E-MAIL:
- Der LEBENSLAUF MUSS alle Profildaten enthalten: Ausbildung, Berufserfahrung, Qualifikationen, Interessen und persönliche Daten. Der Lebenslauf MUSS die längste Sektion sein.
- Die E-MAIL-Sektion enthält NUR einen kurzen Text (3–5 Sätze, maximal 5 Zeilen). Absolut KEINE Profildaten, KEINE Qualifikationen, KEINE Berufserfahrung im E-Mail-Text. Wenn der E-Mail-Text länger als 5 Sätze wird, ist etwas falsch.
- Keine HINWEIS-Blöcke: Es ist verboten, Zeilen wie "HINWEIS:", "Hinweis:" oder ähnliche Meta-Kommentare einzufügen.

Wichtig: Schreibe Anschreiben und Lebenslauf in reinem Klartext ohne Markdown-Formatierung –
also ohne Sternchen (**fett**), ohne Raute-Überschriften (#, ##), ohne Tabellen (| ... |) und
ohne Trennlinien (---). Verwende stattdessen normale Absätze, Zeilenumbrüche und ggf. einfache
Aufzählungen mit "-" am Zeilenanfang.

Antworte im folgenden Format – nutze exakt diese Trennstruktur:

BETREFF: [Betreffzeile hier]

ANSCHREIBEN: [vollständiges Anschreiben hier]

LEBENSLAUF: [vollständiger Lebenslauf hier]

E-MAIL: [kurzer E-Mail-Text hier]`;
}
