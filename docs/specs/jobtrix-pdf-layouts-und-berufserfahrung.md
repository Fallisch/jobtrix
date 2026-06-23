# JobTRIX – Neue PDF-Layouts (Akzent & Traditionell) und Berufserfahrungseinträge

## Problem Statement

JobTRIX bietet aktuell zwei PDF-Layouts zur Auswahl (Klassisch, Modern). Nutzer wünschen mehr Auswahl – insbesondere ein nüchternes, schwarz-weißes Layout im klassischen deutschen Bewerbungsstil für konservative Branchen (Industrie, Handwerk, Pflege, Behörden) sowie ein foto-basiertes, modernes Layout nach einer bereits vorliegenden Beispielvorlage. Zudem fehlt im Nutzerprofil bislang ein strukturiertes Feld für die bisherige Berufserfahrung – nur Ausbildung wird erfasst. Dadurch können weder die KI-generierten Texte noch die visuellen Layouts die tatsächliche berufliche Laufbahn des Nutzers angemessen abbilden.

## Solution

Diese Phase erweitert das Nutzerprofil um Berufserfahrungseinträge (Firma, Position, Zeitraum, Aufgaben) und führt zwei neue PDF-Layouts ein:

- **"Akzent"**: Foto-Banner-Layout mit Farbverlauf, wählbarer Akzentfarbe, Zeitstrahl-Darstellung des beruflichen Werdegangs und Fortschrittsbalken für Qualifikationen/Interessen – basierend auf der vorliegenden Beispielvorlage (`jobtrix/Beispiel Layout/`).
- **"Traditionell"**: Nüchternes, schwarz-weißes, tabellarisches Layout im klassischen deutschen Bewerbungsstil mit kleinem Foto im Kopfbereich.

Alle vier Layouts (Klassisch, Modern, Akzent, Traditionell) berücksichtigen künftig die neuen Berufserfahrungseinträge, und die KI-Generierung bezieht sie in Anschreiben und Lebenslauf-Texte mit ein. Die Layout-Auswahl wird auf vier Optionen erweitert, und beim erneuten Export aus der Bewerbungshistorie bleiben das gewählte Layout, die Akzentfarbe und der CV-Stil erhalten.

## User Stories

1. Als Jobsuchender möchte ich im Profil Berufserfahrungseinträge (Firma, Position, Zeitraum, Aufgaben) anlegen können, damit meine bisherige Berufstätigkeit in Bewerbungen einfließt.
2. Als Jobsuchender möchte ich Berufserfahrungseinträge bearbeiten und entfernen können, damit ich mein Profil aktuell halten kann.
3. Als Jobsuchender mit einem bestehenden Profil ohne Berufserfahrungseinträge möchte ich mein Profil weiterhin uneingeschränkt nutzen können, damit der Übergang reibungslos verläuft.
4. Als Jobsuchender möchte ich, dass die KI-Generierung meine Berufserfahrung berücksichtigt, damit Anschreiben und Lebenslauf-Text konkret auf meine tatsächliche Laufbahn eingehen.
5. Als Jobsuchender möchte ich beim Layout für meine Bewerbung zwischen vier Optionen wählen können (Klassisch, Modern, Akzent, Traditionell), damit ich das für mich passende Erscheinungsbild auswähle.
6. Als Jobsuchender möchte ich beim Layout "Akzent" ein großes Foto im Kopfbereich mit farbigem Banner sehen, damit meine Bewerbung einen persönlichen, modernen Eindruck macht.
7. Als Jobsuchender möchte ich beim Layout "Akzent" die Akzentfarbe des Banners auswählen können (wie bereits bei "Modern"), damit ich die Farbgestaltung an meinen Geschmack anpassen kann.
8. Als Jobsuchender möchte ich beim Layout "Akzent" meinen beruflichen Werdegang als Zeitstrahl und meine Ausbildungsstationen darunter sehen, damit mein Lebenslauf übersichtlich und chronologisch wirkt.
9. Als Jobsuchender möchte ich beim Layout "Akzent" meine Qualifikationen und Interessen als Fortschrittsbalken sehen (wie bei "Modern"), damit meine Stärken auf einen Blick erkennbar sind.
10. Als Jobsuchender möchte ich beim Layout "Traditionell" einen nüchternen, schwarz-weißen, tabellarischen Lebenslauf erhalten, damit ich mich auch bei konservativen Arbeitgebern klassisch bewerben kann.
11. Als Jobsuchender möchte ich beim Layout "Traditionell" ein kleines Foto im Kopfbereich sehen, damit der Lebenslauf dem gewohnten deutschen Format entspricht.
12. Als Jobsuchender möchte ich beim Layout "Modern" zusätzlich zu meiner Ausbildung auch meine Berufserfahrung in der linken Spalte sehen, damit der Lebenslauf vollständiger ist.
13. Als Jobsuchender möchte ich über den bestehenden CV-Stil-Schalter (Klassisch/Amerikanisch) auch die Reihenfolge meiner Berufserfahrung steuern können, damit Berufserfahrung und Ausbildung konsistent sortiert dargestellt werden.
14. Als Jobsuchender möchte ich, dass beim erneuten Herunterladen aus der Bewerbungshistorie das ursprünglich gewählte Layout inklusive Akzentfarbe und CV-Stil verwendet wird, damit das PDF unverändert wie beim ersten Export aussieht.
15. Als Jobsuchender möchte ich die neuen Layout-Namen und das Berufserfahrungs-Formular sowohl auf Deutsch als auch auf Englisch sehen, damit die durchgängige Zweisprachigkeit erhalten bleibt.

## Implementation Decisions

### Datenmodell (neu/erweitert)

- **Berufserfahrungseintrag** (neuer Eintragstyp, analog zum bestehenden Ausbildungseintrag): Firma, Position, Zeitraum (Freitext wie beim Jahresfeld der Ausbildung, z. B. "01/2025 - heute"), Aufgaben/Tätigkeiten (Freitext, mehrzeilig für Stichpunkte).
- **Nutzerprofil** erhält ein neues Feld für eine Liste von Berufserfahrungseinträgen, analog zur bestehenden Ausbildungsliste. Das Feld ist optional (leere Liste zulässig) – bestehende Profile ohne Berufserfahrungseinträge bleiben ohne Änderung gültig und müssen nicht migriert werden.
- **Bewerbungshistorie-Eintrag** erhält zwei zusätzliche Felder: die zum Zeitpunkt der Generierung gewählte Akzentfarbe und den gewählten CV-Stil. Bisher wurde nur das Layout selbst gespeichert (siehe #26); Akzentfarbe und CV-Stil gingen beim Re-Export verloren. Beide neuen Felder sind optional bzw. mit dem bestehenden Standardwert versehen, sodass ältere Einträge weiterhin funktionieren.

### Generierungs-Engine

- Der Prompt für die KI-Generierung (Anschreiben + Lebenslauf-Text) wird um die Berufserfahrungseinträge als strukturierte Eingabe ergänzt, damit generierte Texte konkrete Stationen, Firmen und Tätigkeiten referenzieren können. Die bestehende Sortierlogik (chronologisch/amerikanisch) gilt analog zur Ausbildung auch für die Berufserfahrung.

### PDF-Templates

- **Layout "Akzent"** (neu, Template-Bezeichner `accent`):
  - Kopfbereich wie bei "Modern" mit wählbarer Akzentfarbe, jedoch als großformatiges Foto-Banner mit Farbverlauf; Name groß auf einem Farbband darunter.
  - Zweispaltiger Body: linke Spalte zeigt den beruflichen Werdegang als Zeitstrahl mit Pfeil-Markern – zuerst die Berufserfahrungseinträge (primär), darunter die Ausbildungseinträge (sekundär) als eigener Abschnitt. Rechte Spalte zeigt Qualifikationen und Interessen als Fortschrittsbalken (wie bei "Modern").
  - Anschreiben nutzt denselben Banner-Header (Foto, Name, "Bewerbung"-Band, Akzentstreifen in der gewählten Farbe), darunter einspaltiger Brieftext wie bei den bestehenden Layouts.
- **Layout "Traditionell"** (neu, Template-Bezeichner `traditional`):
  - Vollständig schwarz-weiß/grau, keine Akzentfarbe wählbar.
  - Kopfbereich: Name und Kontaktdaten links, kleines rechteckiges Foto oben rechts.
  - Body tabellarisch: je ein Abschnitt für Berufserfahrung und Ausbildung, jeweils als Tabelle mit schmaler Zeitraum-Spalte links und Inhalt (Position/Firma bzw. Abschluss/Institution inkl. Aufgaben-Stichpunkten) rechts.
  - Qualifikationen und Interessen als einfache Aufzählungsliste ohne Balken.
  - Anschreiben im formalen Briefstil (Absender-/Empfängerblock, Datum, Betreff), ebenfalls schwarz-weiß, mit demselben kleinen Foto oben rechts wie im Lebenslauf.
- **Layout "Modern"** (erweitert): linke Spalte zeigt zusätzlich zur Ausbildung einen neuen Abschnitt "Berufserfahrung" (gleiches Eintrags-Styling wie die bestehenden Ausbildungseinträge, ergänzt um Aufgaben-Stichpunkte).
- **Layout "Klassisch"**: keine strukturelle Änderung – der KI-generierte Lebenslauf-Text berücksichtigt die neuen Berufserfahrungsdaten automatisch über den erweiterten Prompt.
- **CV-Stil (Klassisch/Amerikanisch)**: gilt künftig sowohl für Berufserfahrung als auch für Ausbildung in allen Layouts, die diese strukturiert darstellen (Modern, Akzent, Traditionell). Berufserfahrung und Ausbildung bleiben dabei zwei getrennte, jeweils eigenständig sortierte Abschnitte (keine gemeinsame, vermischte Chronologie).

### Layout-Auswahl & Profilformular (UI)

- Die bestehende Layout-Auswahl (aktuell zwei Buttons "Klassisch"/"Modern") wird auf vier Optionen erweitert: Klassisch, Modern, Akzent, Traditionell – im bestehenden Button-Toggle-Stil.
- Die Akzentfarben-Palette wird bei "Modern" und "Akzent" angezeigt; bei "Klassisch" und "Traditionell" bleibt sie ausgeblendet (kein Farboption für "Traditionell").
- Das Profilformular erhält einen neuen Abschnitt "Berufserfahrung", analog zum bestehenden Abschnitt "Ausbildung" (Liste mit Hinzufügen-/Entfernen-Buttons, Felder für Firma, Position, Zeitraum, Aufgaben). Das Feld ist optional, d. h. ohne Mindestanzahl an Einträgen gültig.

### Bewerbungshistorie & Re-Export

- Beim erneuten PDF-Export aus der Bewerbungshistorie (#26) werden Layout, Akzentfarbe und CV-Stil aus dem gespeicherten Eintrag verwendet, sodass das erneut heruntergeladene PDF dem ursprünglichen Export entspricht.

### Visual Direction

Die bestehende V1/V2-Linie (Hellmodus, Primärfarbe Dunkelblau `#1E3A5F`, Akzentfarbe Mittelblau `#2F80ED`, Inter, Framer-Motion-Übergänge unter 300ms, Karten mit `border-radius: 12px`) bleibt für die App-UI unverändert.

- **Profilformular "Berufserfahrung"**: folgt exakt dem bestehenden Muster des Abschnitts "Ausbildung" (Karten-Layout, `border-gray-300`, `focus:ring-accent`, Hinzufügen-/Entfernen-Buttons im bestehenden Stil).
- **Layout-Auswahl**: vierte Option im bestehenden Button-Toggle, gleiche Größe/Abstände wie bisher, keine neuen visuellen Muster.
- **PDF-Layout "Akzent"**: Foto-Banner mit Farbverlauf in der gewählten Akzentfarbe, Name groß und weiß auf dunklem Farbband, Zeitstrahl mit Pfeil-Markern für Berufserfahrung/Ausbildung, Fortschrittsbalken für Qualifikationen/Interessen – visuell an die vorliegende Beispielvorlage (`jobtrix/Beispiel Layout/`) angelehnt.
- **PDF-Layout "Traditionell"**: durchgehend schwarz-weiß/grau, tabellarischer Aufbau, kleines rechteckiges Foto oben rechts, keine Farbflächen oder Balken – bewusster Kontrast zu den übrigen drei Layouts.

## Testing Decisions

Wie in den Vorphasen gilt: Ein guter Test prüft das beobachtbare Verhalten aus Nutzersicht (sichtbare/strukturelle PDF-Elemente, Formularverhalten), nicht interne Implementierungsdetails, und bleibt robust gegenüber Refactorings.

### Zu testende Module

- **PDF-Templates**: Tests für "Akzent" und "Traditionell" analog zu den bestehenden Tests für "Modern" in `PdfDocuments.test.tsx` – Prüfung der strukturellen Elemente (Foto-Banner, Zeitstrahl-Einträge bzw. Tabellenzeilen für Berufserfahrung/Ausbildung), Akzentfarben-Override für "Akzent", und dass "Traditionell" unabhängig von einer übergebenen Akzentfarbe schwarz-weiß bleibt.
- **Profilformular**: Tests für Hinzufügen/Bearbeiten/Entfernen von Berufserfahrungseinträgen, analog zu den bestehenden Tests für Ausbildungseinträge; Test, dass bestehende Profile ohne Berufserfahrungseinträge weiterhin valide sind und gespeichert werden können.
- **Generierungs-Route**: Test, dass Berufserfahrungseinträge im an die KI übergebenen Prompt enthalten sind (Claude-API-Call gemockt, analog zu `generate-route.test.ts`).
- **Layout-Auswahl**: Tests für die Vier-Optionen-Auswahl in `GenerateForm.test.tsx` und das Ein-/Ausblenden der Akzentfarben-Palette je nach gewähltem Layout.
- **Bewerbungshistorie**: Test, dass Akzentfarbe und CV-Stil beim Anlegen eines Eintrags gespeichert und beim Re-Export korrekt wieder verwendet werden (Erweiterung von `qa-pdf-layout-historie.spec.ts`).

### Teststrategie

- Unit- und Komponententests mit **Jest + React Testing Library**, konsistent zu den bestehenden Tests in `__tests__/`.
- E2E-Tests mit **Playwright**: Erweiterung von `qa-template-auswahl.spec.ts` um die beiden neuen Layout-Optionen sowie ein neuer/erweiterter Flow – Berufserfahrungseintrag im Profil anlegen → Bewerbung generieren → generierter Text berücksichtigt die Berufserfahrung → PDF mit Layout "Akzent" bzw. "Traditionell" enthält die Berufserfahrungs-Sektion.
- Prisma-Migrationen für die neuen Felder (Berufserfahrung im Nutzerprofil, Akzentfarbe/CV-Stil im Bewerbungshistorie-Eintrag) werden analog zu bisherigen Migrationen geprüft: Migration läuft durch, Standardwerte für bestehende Zeilen sind gültig.
- Die Claude API wird in automatisierten Tests weiterhin **gemockt**.

## Out of Scope

- Ein fünftes Layout "Kreativ" – vorgemerkt als erster Kandidat für die nächste Phase.
- Produktionsreife/Hosting-Infrastruktur (Cloudflare, Render, CI/CD, Sentry, PostHog) sowie DSGVO-Prozesse (Löschkonzept, AVV, Dokumentation) – eigene Folgephase.
- Arbeitsagentur-Jobsuche-Integration und Abonnements/wiederkehrende Zahlungen – weiterhin out of scope wie in der V2-Phase-1-SPEC festgelegt.
- Rückwirkende Anreicherung bereits gespeicherter Bewerbungshistorie-Einträge (`profileSnapshot`) um Berufserfahrungsdaten – neue Einträge enthalten die Daten, ältere bleiben unverändert.
- Eine gemeinsame, zeitlich vermischte Chronologie aus Berufserfahrung und Ausbildung (wie im Beispiel-Layout) – beide bleiben getrennte Abschnitte.

## Further Notes

- Zeitrahmen: Juli 2026 als grobe Zielmarke. Angesichts der bisherigen Entwicklungsgeschwindigkeit (33 Issues in unter einer Woche) ist der volle Umfang dieser Phase – Berufserfahrungs-Feld plus zwei neue Layouts – darin realistisch erreichbar; keine Reduktion des Umfangs erforderlich.
- "Kreativ" als fünftes Layout ist der erste inhaltliche Kandidat für die nächste Phase.
- Nach Abschluss dieser Phase sollte das Glossar (`docs/UBIQUITOUS_LANGUAGE.md`) um den Begriff **Berufserfahrungseintrag** sowie die neuen Layout-Namen **Akzent** und **Traditionell** ergänzt werden.
- Die vorliegende Beispielvorlage (`jobtrix/Beispiel Layout/`) dient als visuelle Referenz für "Akzent" und kann nach Umsetzung aus dem Projektordner entfernt werden.
