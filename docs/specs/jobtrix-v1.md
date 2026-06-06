# JobTRIX – Automatische Bewerbungserstellung (V1)

## Problem Statement

Wer aktiv einen Job sucht, verbringt Stunden damit, für jede Stelle manuell ein individuelles Anschreiben und einen aktuellen Lebenslauf zu erstellen. Der Prozess ist repetitiv, zeitaufwändig und frustrierend – besonders wenn viele Bewerbungen gleichzeitig laufen. Es fehlt ein Werkzeug, das aus einer beliebigen Stellenanzeige automatisch professionelle Bewerbungsunterlagen erzeugt, die individuell auf die Stelle zugeschnitten sind.

## Solution

JobTRIX ist eine Web-App (PWA), die Stellensuchenden ermöglicht, eine Stellenanzeige einzufügen und daraus automatisch ein maßgeschneidertes Anschreiben sowie einen vollständigen Lebenslauf zu generieren – als PDF zum Herunterladen und als fertiger E-Mail-Entwurf. Die persönlichen Daten des Nutzers (Profil) werden einmalig angelegt und sind jederzeit editierbar. Die App ist über den Browser nutzbar und kann auf dem Handy-Startbildschirm installiert werden.

## User Stories

1. Als Jobsuchender möchte ich beim ersten Start ein Nutzerprofil anlegen können, damit die App meine persönlichen Daten für alle Bewerbungen kennt.
2. Als Jobsuchender möchte ich im Profil meinen Namen, Adresse, Geburtsdatum, ein Foto sowie meine Ausbildung und Qualifikationen hinterlegen können, damit diese Angaben in jeden generierten Lebenslauf einfließen.
3. Als Jobsuchender möchte ich mein Profil jederzeit bearbeiten können, damit geänderte Qualifikationen oder eine neue Adresse sofort in künftigen Bewerbungen berücksichtigt werden.
4. Als Jobsuchender möchte ich den Text einer Stellenanzeige in ein Textfeld einfügen können, damit die App die Anforderungen der Stelle analysieren kann.
5. Als Jobsuchender möchte ich nach dem Einfügen der Stellenanzeige per Knopfdruck eine Bewerbung generieren lassen, damit ich ohne manuellen Aufwand ein fertiges Dokument erhalte.
6. Als Jobsuchender möchte ich ein automatisch generiertes Anschreiben erhalten, das auf die Stellenanzeige und mein Profil zugeschnitten ist, damit ich mich direkt bewerben kann.
7. Als Jobsuchender möchte ich einen automatisch generierten Lebenslauf erhalten, der meine Profildaten übersichtlich darstellt, damit ich kein separates Dokument pflegen muss.
8. Als Jobsuchender möchte ich Anschreiben und Lebenslauf als PDF herunterladen können, damit ich die Unterlagen per E-Mail oder Uploadformular einreichen kann.
9. Als Jobsuchender möchte ich einen fertigen E-Mail-Entwurf erhalten (Betreff + Anschreiben als Text), damit ich die Bewerbung direkt aus meinem E-Mail-Programm versenden kann.
10. Als Jobsuchender möchte ich generierten Text vor dem Export bearbeiten können, damit ich Korrekturen oder persönliche Anpassungen vornehmen kann.
11. Als Jobsuchender möchte ich die App auf meinem Smartphone-Startbildschirm installieren können (PWA), damit ich sie wie eine native App nutzen kann.
12. Als Jobsuchender möchte ich, dass die App schnell und flüssig reagiert, damit der Bewerbungsprozess angenehm und effizient ist.
13. Als Jobsuchender möchte ich ein helles, professionelles Design sehen, das Vertrauen weckt und einfach zu bedienen ist.

## Implementation Decisions

### Architektur

- **Framework:** Next.js (App Router) – vereint Frontend und Backend in einem Projekt, gut für PWA geeignet, kurze Time-to-Deployment.
- **Laufzeit:** Node.js (Serverless-kompatibel für spätere Deployments auf Vercel o. ä.)
- **Datenhaltung:** Lokaler Browser-Storage (localStorage / IndexedDB) für Nutzerprofil in V1 – kein Backend-Login, keine Datenbank. Vereinfacht Setup und Deadline-Einhaltung erheblich.
- **PWA:** manifest.json + Service Worker über next-pwa, ermöglicht Installation auf Mobilgeräten.

### Module

- **Profilmodul:** Formular zur Eingabe und Bearbeitung der persönlichen Daten (Name, Adresse, Geburtsdatum, Foto-Upload, Ausbildungseinträge, Qualifikationen). Persistenz im Browser.
- **Stelleneingabe-Modul:** Großes Textfeld zum Einfügen einer Stellenanzeige; optionales Feld für Firmenname und Ansprechpartner.
- **Generierungs-Engine:** Ruft die Claude API (Anthropic) auf, übergibt Stellentext + Profildaten, erhält strukturiertes Anschreiben und Lebenslauf zurück. Prompt-Design auf professionellen, deutschen Bewerbungsstandard ausgerichtet.
- **Editor-Modul:** Inline-Bearbeitung des generierten Textes vor dem Export (einfaches Rich-Text-Feld).
- **Export-Modul:** PDF-Generierung via react-pdf (clientseitig), E-Mail-Entwurf als kopierbare Textausgabe mit Betreffvorschlag.

### Technische Entscheidungen

- Die KI-Generierung (Anschreiben + Lebenslauf) erfolgt über die **Claude API** (Anthropic). Der API-Key wird serverseitig in einer Umgebungsvariable gehalten und nie an den Client weitergegeben.
- PDF-Generierung erfolgt **clientseitig** mit react-pdf – kein separater Server nötig.
- Der E-Mail-Entwurf wird als kopierbarer Text ausgegeben; kein direktes E-Mail-Protokoll (SMTP/mailto) in V1.
- Foto-Upload wird als Base64 im localStorage gespeichert; in V1 kein Cloud-Storage.
- Die App funktioniert **ohne Login** – alle Daten bleiben lokal im Browser des Nutzers.

### Visual Direction

- **Modus:** Hell (Light Mode) als Standard; Dark Mode optional in V2.
- **Farbpalette:** Primärfarbe Dunkelblau (#1E3A5F) für Vertrauen und Professionalität, Akzentfarbe Mittelblau (#2F80ED) für Aktionen (Buttons, Links), Hintergrund Reinweiß (#FFFFFF) mit hellgrauen Karten (#F7F8FA), Text Dunkelgrau (#1A1A2E).
- **Typografie:** Inter (Google Fonts) – modern, klar lesbar, professionell auf allen Bildschirmgrößen.
- **Animationen:** Framer Motion für seitenübergreifende Übergänge (fade + slide), Ladeanimation beim Generieren (pulsierende Karte), Micro-Interactions auf Buttons und Formfeldern. Animationen sollen schnell sein (< 300ms) und nie blockieren.
- **Stil:** Großzügige Weißräume, klare Hierarchien, keine unnötigen Dekorationselemente. Karten mit leichtem Schatten, abgerundete Ecken (border-radius 12px).
- **Responsive:** Mobile-first Design – die App soll auf einem 375px-Bildschirm genauso gut funktionieren wie im Desktop-Browser.

## Testing Decisions

Ein guter Test prüft ausschließlich das beobachtbare Verhalten aus Nutzersicht – nicht interne Implementierungsdetails oder Zwischenzustände. Tests sollen robust gegen Refactorings sein.

### Zu testende Module

- **Profilmodul:** Speichern und Laden von Profildaten (localStorage), Validierung von Pflichtfeldern, korrekte Persistenz nach Seitenreload.
- **Generierungs-Engine:** Korrekte Übergabe von Stellentext und Profildaten an die API (Mocking des Claude-API-Calls), Verarbeitung der Antwort, Fehlerbehandlung bei API-Ausfall.
- **Export-Modul:** PDF enthält Nutzerdaten und generierten Text, E-Mail-Entwurf enthält Betreff und Anschreiben.
- **End-to-End:** Nutzer legt Profil an → fügt Stellenanzeige ein → generiert Bewerbung → lädt PDF herunter. Dieser Flow muss vollständig durchgehen.

### Teststrategie

- Unit-Tests mit **Jest + React Testing Library** für Profilmodul und Generierungs-Engine.
- E2E-Tests mit **Playwright** für den vollständigen Bewerbungsflow.
- Die Claude API wird in Tests **gemockt** – echte API-Calls nur manuell.

## Out of Scope

- Automatisches Versenden von Bewerbungen per E-Mail oder über Jobportale.
- Web-Scraping von Stellenportalen (Stepstone, Indeed, Monster, etc.).
- Nutzerverwaltung, Login, Accounts oder Cloud-Synchronisation.
- Interviewvorbereitung oder Coaching-Funktionen.
- Mehrsprachige Bewerbungen (nur Deutsch in V1).
- Dark Mode.
- Mehrere Profile pro Gerät.
- Bewerbungs-Tracking (welche Stellen beworben, Status etc.).

## Further Notes

- Im Projektordner befindet sich eine `Gmail.zip` – es ist zu prüfen, ob diese Ressource für einen späteren Gmail-Integration-Ansatz beim E-Mail-Export relevant ist.
- Die Deadline ist der **12. Juni 2026** – der Scope von V1 ist bewusst eng gehalten, um dieses Datum einhalten zu können. Funktionen wie Dark Mode, Portal-Integration oder Interview-Coaching sind explizit für spätere Phasen vorgesehen.
- Die KI-Qualität der generierten Bewerbungen ist der zentrale Mehrwert der App. Prompt Engineering für professionelle, deutsche Bewerbungsstandards sollte früh priorisiert werden.
- PWA-Installation sollte beim ersten Besuch auf Mobilgeräten aktiv kommuniziert werden (Install-Banner).
