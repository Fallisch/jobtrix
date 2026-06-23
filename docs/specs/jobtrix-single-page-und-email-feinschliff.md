# JobTRIX – Single-Page-Experience und E-Mail-Feinschliff

## Problem Statement

JobTRIX hat aktuell eine funktional vollständige Generierungsseite (`/generate`), bei der Stellensuche, Eingabefelder und Ergebnisse untereinander angeordnet sind. Der Nutzer versteht beim Öffnen der Seite jedoch nicht sofort, was die App kann und wie er sie nutzen soll – es fehlt ein klarer, selbsterklärender Einstieg. Zudem verwendet der E-Mail-Entwurf den vollständigen Anschreiben-Text als E-Mail-Body. Das Ergebnis liest sich wie ein zweites Anschreiben statt wie eine kurze, professionelle Bewerbungs-E-Mail. In Deutschland ist eine Bewerbungs-E-Mail typischerweise 3–5 Sätze lang: Bezug auf die Stelle, Verweis auf die Anhänge und eine freundliche Grußformel.

## Solution

Diese Phase vereint zwei zusammenhängende Verbesserungen, die JobTRIX als fertige App abrunden:

1. **Single-Page-Experience**: Die Generierungsseite wird so umgestaltet, dass der Nutzer auf den ersten Blick versteht, was er hier tun kann. Stellensuche und Generierung bleiben auf einer Seite, aber der Einstieg wird klarer und selbsterklärender – der Nutzer wird visuell durch den Ablauf geführt (Stelle finden oder eingeben → Bewerbung generieren → Ergebnis bearbeiten und exportieren). Das Ziel ist nicht ein Redesign, sondern eine bessere Struktur und Führung auf der bestehenden Seite.

2. **E-Mail-Entwurf kürzen**: Der E-Mail-Entwurf wird als eigener, kurzer Text generiert – getrennt vom Anschreiben. Die KI erzeugt zusätzlich zum Anschreiben eine knappe Bewerbungs-E-Mail (3–5 Sätze), die auf die Stelle Bezug nimmt, auf die Anhänge verweist und mit einer freundlichen Grußformel endet.

## User Stories

1. Als Jobsuchender möchte ich beim Öffnen der Generierungsseite sofort verstehen, was ich hier tun kann und wie der Ablauf funktioniert, damit ich ohne Erklärung loslegen kann.
2. Als Jobsuchender möchte ich visuell durch die Schritte geführt werden (Stelle finden → Bewerbung generieren → Ergebnis exportieren), damit der Prozess intuitiv und übersichtlich ist.
3. Als Jobsuchender möchte ich die Stellensuche und die manuelle Eingabe einer Stellenanzeige auf derselben Seite nutzen können wie die Generierung, damit ich nicht zwischen Seiten wechseln muss.
4. Als Jobsuchender möchte ich einen kurzen, professionellen E-Mail-Entwurf erhalten, der sich auf das Wesentliche beschränkt (Bezug auf die Stelle, Verweis auf Anhänge, Grußformel), damit ich ihn direkt in mein E-Mail-Programm kopieren kann.
5. Als Jobsuchender möchte ich, dass der E-Mail-Entwurf unabhängig vom Anschreiben ist, damit der E-Mail-Text nicht wie ein zweites Anschreiben wirkt.
6. Als Jobsuchender möchte ich den E-Mail-Entwurf wie bisher kopieren können (Betreff und Body separat), damit mein Arbeitsablauf beim Versenden der Bewerbung unverändert bleibt.
7. Als Jobsuchender möchte ich bei einer Initiativbewerbung ebenfalls einen passenden kurzen E-Mail-Entwurf erhalten, der auf die Initiativbewerbung zugeschnitten ist.

## Implementation Decisions

### Single-Page-Experience – Strukturverbesserung

Die bestehende Generierungsseite (`/generate`) wird nicht durch eine neue Seite ersetzt, sondern strukturell verbessert. Die Änderungen betreffen ausschließlich das Layout und die visuelle Führung der `GenerateForm`-Komponente:

- **Klarer Einstieg**: Am Anfang der Seite wird ein kurzer, erklärender Bereich ergänzt, der dem Nutzer in einem Satz sagt, was er hier tun kann (z. B. „Finde eine Stelle und erstelle deine Bewerbung in Minuten"). Kein Marketing-Text, sondern eine funktionale Orientierung.
- **Visuelle Schrittführung**: Die Seite wird in klar erkennbare Bereiche gegliedert, die den Ablauf widerspiegeln: (1) Stelle finden oder eingeben, (2) Optionen wählen und generieren, (3) Ergebnis bearbeiten und exportieren. Jeder Bereich erhält eine deutliche visuelle Trennung (z. B. Überschriften, Abschnitte mit Karten-Design).
- **Keine neue Route**: Die Route `/generate` bleibt bestehen. Es wird keine neue Seite erstellt.
- **Keine neuen Funktionen**: Es werden keine neuen Features hinzugefügt – nur die bestehenden Elemente werden besser angeordnet und beschriftet.
- **Bestehende visuelle Linie**: Das Design (Farben, Abstände, Schriftgrößen, Dark Mode) bleibt unverändert.

### E-Mail-Entwurf – Eigener kurzer Text

Aktuell wird der E-Mail-Body mit dem vollständigen Anschreiben-Text befüllt (`<EmailDraft subject={result.emailSubject} body={editedCoverLetter} />`). Das wird geändert:

- **Prompt-Erweiterung**: Der Prompt in `build-prompt.ts` wird um eine vierte Ausgabe erweitert: `E-MAIL`. Die KI generiert neben BETREFF, ANSCHREIBEN und LEBENSLAUF einen eigenen kurzen E-Mail-Text (3–5 Sätze).
- **E-Mail-Anweisungen im Prompt**: Der E-Mail-Text soll enthalten: (1) Höfliche Anrede (mit Ansprechpartner falls vorhanden), (2) Bezug auf die Stelle oder bei Initiativbewerbung auf das Unternehmen, (3) Hinweis dass die Bewerbungsunterlagen (Anschreiben und Lebenslauf) als Anhang beigefügt sind, (4) Freundliche Grußformel mit Name. Kein zweites Anschreiben – keine inhaltliche Wiederholung der Qualifikationen.
- **Parsing**: Die `parseResponse()`-Funktion in der Generate-Route wird um das Parsen der E-MAIL-Sektion erweitert.
- **API-Response**: Das `GenerateResult`-Interface erhält ein neues Feld `emailBody: string` neben dem bestehenden `emailSubject`.
- **Frontend**: Die `EmailDraft`-Komponente erhält den neuen `emailBody` statt des `editedCoverLetter`. Der E-Mail-Body wird nicht editierbar gemacht – er ist ein kurzer, fertiger Text zum Kopieren.
- **Bewerbungshistorie**: Der `emailBody` wird zusammen mit den anderen Feldern im Bewerbungshistorie-Eintrag gespeichert, damit er beim erneuten Aufrufen verfügbar ist.

### Antwortformat im Prompt

Das Antwortformat wird erweitert auf:

```
BETREFF: [Betreffzeile]
ANSCHREIBEN: [vollständiges Anschreiben]
LEBENSLAUF: [vollständiger Lebenslauf]
E-MAIL: [kurzer E-Mail-Text, 3–5 Sätze]
```

## Testing Decisions

Ein guter Test prüft das beobachtbare Verhalten aus Nutzersicht, nicht interne Implementierungsdetails, und bleibt robust gegenüber Refactorings.

- **E-Mail-Prompt**: Unit-Test für `buildPrompt()`, der prüft, dass der generierte Prompt die E-MAIL-Sektion im Antwortformat enthält und Anweisungen für einen kurzen E-Mail-Text beinhaltet.
- **Response-Parsing**: Unit-Test für `parseResponse()`, der prüft, dass eine Antwort mit vier Sektionen (BETREFF, ANSCHREIBEN, LEBENSLAUF, E-MAIL) korrekt in die vier Felder aufgeteilt wird.
- **API-Response**: Unit-Test für die Generate-Route, der prüft, dass die API-Antwort das Feld `emailBody` enthält.
- **Single-Page-Struktur**: Playwright E2E-Test, der die Generierungsseite aufruft und prüft, dass die Schrittbereiche (Stellensuche, Generierung, Ergebnis) als erkennbare Abschnitte vorhanden sind.
- **E-Mail-Entwurf**: Playwright E2E-Test, der nach einer Generierung prüft, dass der E-Mail-Entwurf angezeigt wird und sich inhaltlich vom Anschreiben unterscheidet (z. B. kürzer als 500 Zeichen).

## Out of Scope

- Neues Seitendesign oder Redesign der App – es wird nur die Struktur verbessert, nicht das visuelle Erscheinungsbild.
- Neue Features (z. B. mehrstufiger Wizard, Fortschrittsbalken, Drag-and-Drop).
- Änderungen am Anschreiben- oder Lebenslauf-Prompt – nur der E-Mail-Teil wird ergänzt.
- Änderungen an der Marketing-Landingpage oder anderen Seiten.
- Editierbarkeit des E-Mail-Entwurfs – der kurze Text ist zum Kopieren gedacht, nicht zum Bearbeiten.

## Further Notes

- Die E-Mail-Sektion wird als letztes im Prompt platziert, damit die KI zuerst Anschreiben und Lebenslauf vollständig ausformuliert und die E-Mail als kurze Zusammenfassung danach generiert.
- Falls die KI die E-MAIL-Sektion in der Antwort weglässt (z. B. bei älteren gespeicherten Einträgen ohne dieses Feld), sollte der Frontend-Code einen Fallback anzeigen (leerer Zustand oder Hinweis „Kein E-Mail-Entwurf verfügbar").
- Bestehende Bewerbungshistorie-Einträge haben kein `emailBody`-Feld – die Anzeige muss damit umgehen können (graceful degradation).
