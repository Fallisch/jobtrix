import { ProfileData } from "@/lib/profile-storage";

export interface GenerateRequest {
  jobPosting: string;
  companyName?: string;
  contactPerson?: string;
  profile: ProfileData;
  cvStyle?: "classic" | "american";
}

export function buildHumanizePrompt(coverLetter: string, cv: string): string {
  return `Du bekommst ein Anschreiben und einen Lebenslauf, die von einer KI erstellt wurden. Schreibe beide Texte so um, dass sie nicht mehr als KI-Text erkannt werden.

Techniken die du zwingend anwenden musst:

Satzlänge extrem variieren: Manche Sätze nur 4–6 Wörter. Andere deutlich länger, mit Nebensatz. Kein gleichmäßiger Rhythmus.

Nie zweimal hintereinander mit „Ich" beginnen. Wechsle zu Verben, Zeitangaben, Beobachtungen.

Gelegentlich einen Absatz aus nur einem kurzen Satz bestehen lassen.

Keine drei gleichlangen Listenpunkte. Wenn aufgezählt wird, dann ungleichmäßig.

Den Schluss des Anschreibens konkret und direkt formulieren – keine Floskel wie „Über eine Einladung zum Gespräch würde ich mich sehr freuen".

Behalte alle Fakten (Name, Ausbildung, Qualifikationen, Stelle) exakt bei. Ändere nur Stil und Struktur.

ANSCHREIBEN:
${coverLetter}

LEBENSLAUF:
${cv}

Antworte im folgenden Format – nutze exakt diese Trennstruktur:

ANSCHREIBEN: [umgeschriebenes Anschreiben hier]

LEBENSLAUF: [umgeschriebener Lebenslauf hier]`;
}

export function buildPrompt(req: GenerateRequest): string {
  const { jobPosting, companyName, contactPerson, profile, cvStyle } = req;

  const eduText = profile.education
    .map((e) => `${e.degree} – ${e.institution} (${e.year})`)
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
Qualifikationen: ${qualText}
${profile.interests.length > 0 ? `Persönliche Interessen: ${interestsText}` : ""}

${companyName ? `Unternehmen: ${companyName}` : ""}
${contactPerson ? `Ansprechpartner: ${contactPerson}` : ""}

Stellenanzeige:
${jobPosting}

${cvStyle === "american" ? "Sortiere Berufserfahrung und Ausbildung antichronologisch – neuester Eintrag zuerst.\n\n" : ""}Schreibstil – diese Regeln sind entscheidend, um nicht als KI-Text erkannt zu werden:

Satzstruktur und Rhythmus:
- Variiere Satzlänge stark und absichtlich. Manche Sätze sollten sehr kurz sein. Andere wiederum deutlich länger und mit Nebensatz, der die eigentliche Aussage erst im Nachgang präzisiert.
- Beginne Sätze nie zweimal hintereinander mit „Ich". Starte stattdessen abwechselnd mit Verben, Adverbien, Zeitangaben oder einer Beobachtung.
- Lass Absätze bewusst unterschiedlich lang sein: manchmal ein einzelner Satz, manchmal drei bis vier.

Konkretheit statt Allgemeinheit:
- Ersetze abstrakte Aussagen durch konkrete. Statt „Ich bringe viel Erfahrung mit" lieber: welche Situation, welches Ergebnis.
- Nutze die Qualifikationen und den Werdegang aus den Profildaten für spezifische, nachvollziehbare Formulierungen.

Verbotene Muster (niemals verwenden):
- „Ich freue mich sehr", „Mit großer Begeisterung", „Als leidenschaftlicher", „Ich bin überzeugt", „Ich bin motiviert"
- Drei-Punkte-Aufzählungen im Fließtext, die alle gleich lang sind
- Sätze, die mit „Dies", „Das", „Dabei" beginnen und dann etwas Offensichtliches zusammenfassen
- Schlussformeln wie „Über eine Einladung zum Gespräch würde ich mich sehr freuen"

Ton:
- Direkt, sachlich, leicht persönlich – wie ein Mensch, der weiß was er kann, aber nicht übertreibt.
- Keine aufgesetzte Begeisterung. Keine Floskeln. Kein Marketingsprech.

Wichtig: Schreibe Anschreiben und Lebenslauf in reinem Klartext ohne Markdown-Formatierung –
also ohne Sternchen (**fett**), ohne Raute-Überschriften (#, ##), ohne Tabellen (| ... |) und
ohne Trennlinien (---). Verwende stattdessen normale Absätze, Zeilenumbrüche und ggf. einfache
Aufzählungen mit "-" am Zeilenanfang.

Antworte im folgenden Format – nutze exakt diese Trennstruktur:

BETREFF: [Betreffzeile hier]

ANSCHREIBEN: [vollständiges Anschreiben hier]

LEBENSLAUF: [vollständiger Lebenslauf hier]`;
}
