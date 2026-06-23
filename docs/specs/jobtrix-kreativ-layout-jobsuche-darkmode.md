# JobTRIX – Layout "Kreativ", Arbeitsagentur-Jobsuche und Dark Mode

## Problem Statement

JobTRIX bietet aktuell vier PDF-Layouts (Klassisch, Modern, Akzent, Traditionell), aber kein Layout mit einem verspielten, farbenfrohen Charakter für Nutzer, die einen kreativeren Eindruck hinterlassen möchten. Zudem muss der Nutzer passende Stellenanzeigen bisher vollständig auf externen Jobportalen suchen und den Anzeigentext manuell in das Generierungs-Formular einfügen – es gibt keine integrierte Suche nach offenen Stellen. Schließlich bietet die App nur ein helles Farbschema, was vielen Nutzern aufgrund persönlicher Vorliebe oder der Geräte-Systemeinstellung nicht entspricht.

## Solution

Diese Phase ergänzt JobTRIX um drei unabhängige Verbesserungen:

- Ein fünftes PDF-Layout **"Kreativ"** mit einem farbenfrohen, verspielten Design (grafische Icon-Elemente, asymmetrische Spalten-Aufteilung mit breiter farbiger Seitenleiste, rundes Foto), das die bestehende Akzentfarben-Auswahl nutzt.
- Eine neue **Jobsuche über die Jobsuche-API der Bundesagentur für Arbeit**, direkt im Generierungs-Formular: Der Nutzer sucht nach Berufsfeld und Ort, erhält eine Trefferliste und kann eine Stellenanzeige per Klick übernehmen.
- Ein **Dark Mode** als 1:1-dunkle Variante des bestehenden Designs, markentreu in dunklem Blaugrau, mit Speicherung der Präferenz im Nutzerkonto, automatischer Übernahme der Geräte-Systemeinstellung beim ersten Besuch und sanftem Übergang zwischen den Modi.

## User Stories

### Layout "Kreativ"

1. Als Jobsuchender möchte ich beim Layout für meine Bewerbung eine fünfte Option "Kreativ" wählen können, damit ich ein farbenfrohes, verspieltes Erscheinungsbild für meine Bewerbung nutzen kann.
2. Als Jobsuchender möchte ich beim Layout "Kreativ" grafische Icon-Elemente bei Kontaktdaten, Sprachen/Interessen und Qualifikationen sehen, damit meine Bewerbung lebendig und modern wirkt.
3. Als Jobsuchender möchte ich beim Layout "Kreativ" eine asymmetrische Spalten-Aufteilung mit einer breiten, farbigen Seitenleiste sehen, damit sich das Layout deutlich von den anderen vier Layouts abhebt.
4. Als Jobsuchender möchte ich beim Layout "Kreativ" mein Profilfoto rund statt eckig dargestellt sehen, damit das Design einen verspielten Charakter erhält.
5. Als Jobsuchender möchte ich beim Layout "Kreativ" die Akzentfarbe aus der bestehenden Palette wählen können (wie bei "Modern" und "Akzent"), damit ich die Farbgestaltung an meinen Geschmack anpassen kann.
6. Als Jobsuchender möchte ich, dass das Layout "Kreativ" meine Berufserfahrung und Ausbildung berücksichtigt (analog zu den anderen strukturierten Layouts), damit der Lebenslauf vollständig ist.
7. Als Jobsuchender möchte ich, dass beim erneuten Export aus der Bewerbungshistorie das Layout "Kreativ" inklusive Akzentfarbe und CV-Stil korrekt wieder verwendet wird, damit das PDF unverändert bleibt.
8. Als Jobsuchender möchte ich den Layout-Namen "Kreativ" sowohl auf Deutsch als auch auf Englisch sehen, damit die durchgängige Zweisprachigkeit erhalten bleibt.

### Jobsuche über die Arbeitsagentur-API

9. Als Jobsuchender möchte ich im Generierungs-Formular nach offenen Stellen anhand von Berufsfeld und Ort suchen können, damit ich passende Stellenanzeigen finde, ohne externe Jobportale besuchen zu müssen.
10. Als Jobsuchender möchte ich die Suchergebnisse als Liste mit Titel, Firma und Ort sehen, damit ich schnell einen Überblick über passende Stellen bekomme.
11. Als Jobsuchender möchte ich einen Treffer auswählen können, damit die zugehörige Stellenbeschreibung – sofern verfügbar – automatisch in das Eingabefeld für die Stellenanzeige übernommen wird.
12. Als Jobsuchender möchte ich, wenn ein Treffer keinen vollständigen Beschreibungstext liefert, einen Link zur Originalanzeige erhalten, damit ich den Text bei Bedarf selbst öffnen und einfügen kann.
13. Als Jobsuchender möchte ich weiterhin die Möglichkeit haben, eine Stellenanzeige manuell einzufügen, damit ich auch arbeiten kann, wenn die Suche keine passenden Treffer liefert oder mein Berufsfeld nicht abdeckt.
14. Als Jobsuchender möchte ich, wenn die Arbeitsagentur-API nicht erreichbar ist, ohne Fehlermeldung weiterarbeiten können (leere Trefferliste, manueller Pfad bleibt verfügbar), damit ich nicht durch technische Probleme blockiert werde.
15. Als Jobsuchender möchte ich den neuen Suchbereich sowohl auf Deutsch als auch auf Englisch nutzen können, damit die durchgängige Zweisprachigkeit erhalten bleibt.

### Dark Mode

16. Als Jobsuchender möchte ich JobTRIX in einem dunklen Farbschema nutzen können, damit ich die App auch bei persönlicher Vorliebe oder in dunklen Umgebungen angenehm verwenden kann.
17. Als Jobsuchender möchte ich, dass JobTRIX beim ersten Besuch automatisch die Hell/Dunkel-Einstellung meines Geräts übernimmt, damit ich nicht manuell umschalten muss.
18. Als Jobsuchender möchte ich über einen Umschalter im Header manuell zwischen Hell- und Dunkelmodus wechseln können, damit ich die Darstellung unabhängig von der Geräteeinstellung wählen kann.
19. Als Jobsuchender möchte ich, dass meine Dark-Mode-Präferenz in meinem Nutzerkonto gespeichert wird, damit sie auf allen meinen Geräten gleich ist.
20. Als Jobsuchender möchte ich beim Wechsel zwischen Hell- und Dunkelmodus einen sanften Übergang sehen, damit der Wechsel nicht abrupt wirkt.
21. Als Jobsuchender möchte ich, dass alle bestehenden Seiten (Profil, Generierung, Bewerbungshistorie, Login, Registrierung, Bezahlseite) im Dunkelmodus korrekt und gut lesbar dargestellt werden, damit die App durchgängig nutzbar bleibt.
22. Als noch nicht angemeldeter Jobsuchender möchte ich, dass Login- und Registrierungsseite ebenfalls die Geräte-Systemeinstellung berücksichtigen, damit die App von Anfang an konsistent wirkt.

## Implementation Decisions

### PDF-Layout "Kreativ"

- Template-Bezeichner: `creative`. Der Layout-Typ in `lib/pdf-documents.tsx` wird von `"classic" | "modern" | "traditional" | "accent"` auf `"classic" | "modern" | "traditional" | "accent" | "creative"` erweitert.
- **Struktur**: Asymmetrische zweispaltige Aufteilung mit einer breiten, farbigen Seitenleiste (in der gewählten Akzentfarbe) auf der linken Seite, die das runde Profilfoto, Kontaktdaten sowie Qualifikationen und Interessen mit grafischen Icon-Elementen enthält. Die breitere rechte Spalte zeigt den beruflichen Werdegang: zuerst die Berufserfahrungseinträge (primär), darunter die Ausbildungseinträge (sekundär) als eigener Abschnitt – analog zur bestehenden Trennung bei "Akzent", jedoch mit verspielterer, grafischer Gestaltung (z. B. Icon-Bullets statt reiner Fortschrittsbalken).
- **Anschreiben**: nutzt denselben Seitenleisten-Stil (farbige Leiste mit rundem Foto und Kontaktdaten links, einspaltiger Brieftext rechts).
- **Akzentfarbe**: "Kreativ" nutzt die bestehende Akzentfarben-Palette (gleiche sechs Farben wie bei "Modern"/"Akzent") über das bestehende `accentColor`-Prop – keine eigene Farbpalette.
- **CV-Stil (Klassisch/Amerikanisch)**: gilt für "Kreativ" analog zu den anderen strukturierten Layouts für Berufserfahrung und Ausbildung, als zwei getrennte, jeweils eigenständig sortierte Abschnitte.

### Layout-Auswahl & Profilformular (UI)

- Die bestehende Layout-Auswahl in `GenerateForm.tsx` wird von vier auf fünf Optionen erweitert: Klassisch, Modern, Akzent, Traditionell, Kreativ – im bestehenden Button-Toggle-Stil.
- Die Akzentfarben-Palette wird bei "Kreativ" zusätzlich zu "Modern" und "Akzent" angezeigt; bei "Klassisch" und "Traditionell" bleibt sie wie bisher ausgeblendet.

### Bewerbungshistorie & Re-Export

- "Kreativ" wird wie die übrigen Layouts über das bestehende `template`-Feld des `ApplicationHistoryEntry` (inkl. `accentColor` und `cvStyle`) gespeichert und beim Re-Export korrekt wieder erzeugt. Da `template` bereits ein freier String ist, ist keine Schema-Änderung für diesen Teil notwendig.

### Jobsuche über die Arbeitsagentur-API

#### Neues Modul: Arbeitsagentur-Suche

- Neue serverseitige API-Route (analog zu den bestehenden Routen unter `app/api/`), die die Jobsuche-API der Bundesagentur für Arbeit mit Berufsfeld und Ort als Parametern abfragt und die Treffer in ein einheitliches internes Format überführt: Titel, Firma, Ort, Beschreibungstext (sofern von der API geliefert) und Link zur Originalanzeige.
- Neue Umgebungsvariable für den API-Zugang (z. B. `ARBEITSAGENTUR_API_KEY`), analog zur bestehenden Konvention in `.env.example`.
- **Voraussetzung**: Die Registrierung für den kostenlosen API-Zugang bei der Bundesagentur für Arbeit ist eine vorbereitende, vom Entwickler selbst durchzuführende Aufgabe, bevor dieses Modul umgesetzt werden kann. Sie kann parallel zur Umsetzung von Dark Mode und Layout "Kreativ" erfolgen.

#### UI-Integration im Generierungs-Formular

- Neuer Bereich **"Stelle suchen"** oberhalb des bestehenden Textfelds "Stellenanzeige": zwei Eingabefelder (Berufsfeld, Ort) und ein Such-Button.
- Suchergebnisse werden als Liste von Karten im bestehenden Karten-Stil mit Titel, Firma, Ort und einem Link "Original ansehen" angezeigt.
- **Klick auf eine Trefferkarte**:
  - Liefert die API einen Beschreibungstext, wird dieser automatisch in das Textfeld "Stellenanzeige" übernommen (vorhandener Inhalt wird ersetzt).
  - Liefert die API keinen Beschreibungstext, öffnet sich die Originalanzeige in einem neuen Tab; das Textfeld bleibt unverändert, der Nutzer kopiert den Text wie bisher manuell.
- Das bestehende manuelle Einfügen in das Textfeld "Stellenanzeige" bleibt unverändert und jederzeit zusätzlich verfügbar – etwa wenn die Trefferliste leer ist oder das gesuchte Berufsfeld nicht abgedeckt wird.
- **Fehlerbehandlung**: Liefert die Arbeitsagentur-API keine Treffer oder ist nicht erreichbar, wird einheitlich eine leere Trefferliste angezeigt ("keine Treffer gefunden") – ohne technischen Fehlerhinweis. Der manuelle Pfad bleibt davon unberührt verfügbar.

### Dark Mode

#### Theming-Infrastruktur

- Einführung von `next-themes` (oder einer äquivalenten React-Context-Lösung) zur Verwaltung des Theme-Zustands (`light` | `dark`).
- `tailwind.config.ts` wird auf `darkMode: 'class'` umgestellt. Die bestehenden Farbtoken (`primary`, `accent`, `background`, `surface`, `text`) werden um dunkle Gegenstücke ergänzt, gesteuert über CSS-Variablen in `app/globals.css`, die je nach `.dark`-Klasse auf dem `<html>`-Element unterschiedliche Werte annehmen.
- **Dunkle Farbwerte**: Hintergrund in sehr dunklem Blaugrau (`#121826`), Karten/Oberflächen in einem etwas helleren Blaugrau-Ton, Textfarbe in hellem Grau/Weiß. Primärfarbe (`#1E3A5F`) und Akzentfarbe (`#2F80ED`) bleiben markentypisch erhalten und werden bei Bedarf leicht aufgehellt, um ausreichenden Kontrast auf dunklem Grund sicherzustellen.
- Der Wechsel zwischen Hell- und Dunkelmodus erhält eine kurze CSS-Transition für Farbwerte (unter 300 ms), analog zu den bestehenden Framer-Motion-Übergängen.

#### Datenmodell & Persistenz

- Neues Feld `themePreference` (`String`, Default `"system"`, Werte: `"system" | "light" | "dark"`) im `UserProfile`-Modell, analog zum Muster der zuletzt ergänzten optionalen Felder mit Default-Werten.
- Beim ersten Laden – sowohl für nicht angemeldete Besucher als auch für angemeldete Nutzer mit `themePreference = "system"` – wird das Theme anhand der Geräte-/Browser-Einstellung (`prefers-color-scheme`) ermittelt.
- Schaltet ein angemeldeter Nutzer manuell um, wird `themePreference` im Nutzerkonto auf `"light"` bzw. `"dark"` gesetzt und gilt geräteübergreifend, bis sie erneut geändert wird.
- Login-, Registrierungs- und Bezahlseiten (vor Anmeldung) nutzen ausschließlich die Geräte-Systemeinstellung, da hier noch kein Nutzerkonto-Kontext existiert.

#### UI-Umschalter

- Neuer Umschalter (Sonne/Mond-Icon) im bestehenden Header, neben der Sprachauswahl bzw. dem Logout-Element.
- Alle bestehenden Seiten und Komponenten (Profil, Generierung inkl. neuem Suchbereich "Stelle suchen", Bewerbungshistorie, Login, Registrierung, Bezahlseite) erhalten dunkle Gegenstücke für Hintergrund-, Karten- und Textfarben über die neuen Tailwind-`dark:`-Klassen bzw. CSS-Variablen.
- PDF-Exporte (Lebenslauf/Anschreiben, alle fünf Layouts) sind von Dark Mode nicht betroffen und bleiben unverändert in ihrem jeweils definierten, für den Druck optimierten Farbschema.

### Visual Direction

- **Dark Mode**: Hintergrund in sehr dunklem Blaugrau (`#121826`), Karten/Oberflächen in einem helleren Blaugrau-Ton mit dezentem Schatten, Textfarbe in hellem Grau/Weiß. Primär- und Akzentfarbe bleiben markentypisch (Dunkelblau/Mittelblau), bei Bedarf leicht aufgehellt für Kontrast. Sanfter CSS-Übergang (unter 300 ms) beim Wechsel zwischen den Modi.
- **Layout "Kreativ"**: Farbenfrohes, verspieltes Design – breite, farbige Seitenleiste in der gewählten Akzentfarbe mit rundem Foto und Icon-Elementen bei Kontaktdaten, Qualifikationen und Interessen; rechte Spalte zeigt Berufserfahrung (primär) und Ausbildung (sekundär) als eigene Abschnitte. Akzentfarben-Auswahl wie bei "Modern"/"Akzent".
- **Bereich "Stelle suchen"**: folgt dem bestehenden Karten- und Formular-Stil (Eingabefelder `border-gray-300`, `focus:ring-accent`, Trefferkarten mit `border-radius: 12px` im bestehenden Card-Stil).

## Testing Decisions

Wie in den Vorphasen gilt: Ein guter Test prüft das beobachtbare Verhalten aus Nutzersicht, nicht interne Implementierungsdetails, und bleibt robust gegenüber Refactorings.

### Zu testende Module

- **PDF-Template "Kreativ"**: Tests analog zu den bestehenden Tests für "Akzent"/"Traditionell" in `PdfDocuments.test.tsx` – Prüfung der strukturellen Elemente (Seitenleiste, rundes Foto, Icon-Bereiche, getrennte Abschnitte für Berufserfahrung und Ausbildung) sowie korrekter Akzentfarben-Override.
- **Layout-Auswahl**: Erweiterung von `GenerateForm.test.tsx` um die fünfte Option "Kreativ" sowie die Anzeige der Akzentfarben-Palette bei "Kreativ".
- **Arbeitsagentur-Suche (API-Route)**: Tests für die neue Such-Route – korrekte Parameter-Übergabe (Berufsfeld, Ort), Mapping der Arbeitsagentur-Antwort auf das interne Trefferformat sowie der Fehlerfall (API nicht erreichbar oder ohne Treffer → leere Trefferliste statt Fehler). Die Arbeitsagentur-API wird in automatisierten Tests gemockt, analog zu `generate-route.test.ts`.
- **"Stelle suchen"-UI**: Tests für Sucheingabe, Anzeige der Trefferliste, Übernahme eines Treffers ins Textfeld "Stellenanzeige" (mit und ohne Beschreibungstext) sowie für eine leere Trefferliste.
- **Dark Mode**: Tests für den Umschalter im Header, Persistenz der Präferenz im Nutzerkonto (Feld `themePreference`) sowie die initiale Übernahme der Geräte-Systemeinstellung bei `"system"`.
- **Bewerbungshistorie & Re-Export**: Test, dass "Kreativ" als Layout korrekt gespeichert und beim Re-Export wieder verwendet wird (Erweiterung von `qa-pdf-layout-historie.spec.ts`).

### Teststrategie

- Unit- und Komponententests mit **Jest + React Testing Library**, konsistent zu den bestehenden Tests in `__tests__/`.
- E2E-Tests mit **Playwright**: Erweiterung von `qa-template-auswahl.spec.ts` um "Kreativ"; neuer E2E-Flow für "Stelle suchen" (Suche → Trefferliste → Übernahme ins Textfeld → Generierung); neuer E2E-Flow für den Dark-Mode-Umschalter (Umschalten → Persistenz nach Reload bzw. erneutem Login).
- Prisma-Migration für `themePreference` im `UserProfile`-Modell: Migration läuft durch, Default `"system"` ist für bestehende Zeilen gültig.
- Die Arbeitsagentur-API wird in automatisierten Tests durchgängig **gemockt**; echte Aufrufe erfolgen nur manuell mit dem registrierten API-Zugang.

## Out of Scope

- Tavily-Integration bzw. "Deep Research" mit KI-gestützter Relevanzanalyse – eigene, deutlich größere Folgephase, falls überhaupt benötigt.
- Dark Mode für PDF-Exporte – Lebenslauf und Anschreiben bleiben in allen fünf Layouts unverändert im jeweils für den Druck definierten, hellen Farbschema.
- Hosting/Produktionsreife, DSGVO-Prozesse (Konto-Löschung, E-Mail-Verifizierung), Abonnements/wiederkehrende Zahlungen und Mandantenfähigkeit/B2B – bleiben wie in den Vorphasen festgelegt spätere Themen.
- Live-Gang der App für echte Nutzer – erst nach Abschluss dieser und ggf. weiterer Phasen.
- Rückwirkende Anreicherung bestehender Bewerbungshistorie-Einträge mit dem Layout "Kreativ" – nur neue Exporte nutzen das neue Layout.
- Eine konkrete visuelle Referenzvorlage (z. B. aus Canva) für "Kreativ" – kann optional vor der Umsetzung ergänzt werden, ist aber keine Voraussetzung für diese SPEC.

## Further Notes

- Zeitrahmen: "schnellstmöglich", kein festes Datum – im bisherigen Tempo der vorherigen Phasen.
- Empfohlene Reihenfolge: (1) Dark-Mode-Infrastruktur (betrifft als Grundlage alle Seiten), (2) Layout "Kreativ" (unabhängig umsetzbar), (3) Arbeitsagentur-Jobsuche (sobald der API-Zugang registriert ist).
- Voraussetzung für die Arbeitsagentur-Jobsuche: Registrierung eines kostenlosen API-Zugangs bei der Bundesagentur für Arbeit durch den Entwickler – kann parallel zu (1) und (2) erfolgen.
- Nach Abschluss dieser Phase sollte das Glossar (`docs/UBIQUITOUS_LANGUAGE.md`) aktualisiert werden: Der Begriff **Trefferliste** wird durch die Arbeitsagentur-Jobsuche neu mit Inhalt gefüllt (bisher nur im Kontext von "Deep Research"/Tavily beschrieben, was in dieser Phase nicht umgesetzt wird) und der Layout-Name **Kreativ** wird ergänzt.
- Falls vor der Umsetzung von "Kreativ" eine konkrete Canva-Vorlage als visuelle Referenz vorliegt, kann diese zusätzlich als Orientierung dienen (analog zur Beispielvorlage für "Akzent" in `jobtrix/Beispiel Layout/`).
