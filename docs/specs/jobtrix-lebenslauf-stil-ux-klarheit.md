# JobTRIX – UX-Klarheit: Lebenslauf-Stil-Bezeichnungen und Dark-Mode-Umschalter

## Problem Statement

Diese Phase behebt zwei Stellen, an denen die App für Nutzer ohne Vorkenntnisse schwer verständlich oder schwer bedienbar ist:

1. **Lebenslauf-Stil-Bezeichnungen:** Die Auswahl bietet aktuell „Klassisch" und „Amerikanisch". Die Bezeichnung „Amerikanisch" ist für viele Nutzer nicht selbsterklärend – es ist unklar, was der Begriff inhaltlich bedeutet. Das eigentliche Ziel der Auswahl – die zeitliche Reihenfolge der Lebenslauf-Einträge – ist aus dem Label nicht ableitbar.

2. **Dark-Mode-Umschalter:** Der Umschalter im Header ist ein kleines Icon (20 × 20 px) ohne Textlabel. Für Nutzer, die die App zum ersten Mal verwenden, ist nicht offensichtlich, dass dieser Knopf das Farbschema umschaltet, noch wo er sich befindet.

## Solution

### Lebenslauf-Stil-Bezeichnungen

Die Bezeichnungen der beiden Lebenslauf-Stile werden in inhaltsbeschreibende Labels geändert:

- „Klassisch" → **„Ältestes zuerst"**
- „Amerikanisch" → **„Neuestes zuerst (Empfohlen)"**

Auf Englisch:

- „Classic" → **„Oldest first"**
- „American" → **„Newest first (Recommended)"**

Das Auswahl-Label wird von „Lebenslauf-Stil" zu **„Reihenfolge Einträge"** präzisiert.

### Dark-Mode-Umschalter

Der Umschalter wird vergrößert und erhält ein sichtbares Textlabel neben dem Icon:

- Icon-Größe: von `w-5 h-5` auf `w-5 h-5` (Icon bleibt), aber der Button bekommt einen sichtbaren Hintergrund (Pill-Form), sodass die Klickfläche klar erkennbar ist.
- Textlabel neben dem Icon: „Hell" / „Dunkel" (DE) bzw. „Light" / „Dark" (EN) – zeigt den aktuellen Modus an.
- Das Label ist kein eigenständiger Klickbereich, sondern Teil desselben Buttons.

Die interne Logik des Umschalters bleibt unverändert.

## User Stories

### Lebenslauf-Stil

1. Als Jobsuchender möchte ich beim Lebenslauf-Stil sofort verstehen, was die Auswahl bewirkt, damit ich keine Erklärung oder Vorkenntnisse benötige.
2. Als Jobsuchender möchte ich, dass der empfohlene Stil (neuestes zuerst) als solcher gekennzeichnet ist, damit ich ohne Nachdenken die für Bewerber heute üblichste Reihenfolge wähle.
3. Als Jobsuchender möchte ich, dass mein Lebenslauf-PDF bei „Neuestes zuerst" die jüngsten Berufserfahrungs- und Ausbildungseinträge oben anzeigt, damit Arbeitgeber meine aktuellste Erfahrung zuerst sehen.
4. Als Jobsuchender möchte ich, dass mein Lebenslauf-PDF bei „Ältestes zuerst" die ältesten Berufserfahrungs- und Ausbildungseinträge oben anzeigt, damit ich den klassisch-chronologischen Aufbau wählen kann.
5. Als Jobsuchender möchte ich die neuen Bezeichnungen sowohl auf Deutsch als auch auf Englisch sehen, damit die durchgängige Zweisprachigkeit der App erhalten bleibt.

### Dark-Mode-Umschalter

6. Als Jobsuchender möchte ich den Dark-Mode-Umschalter im Header auf Anhieb erkennen, damit ich das Farbschema ohne Suchen umschalten kann.
7. Als Jobsuchender möchte ich neben dem Icon ein kurzes Textlabel sehen, das den aktuellen Modus zeigt, damit ich sofort weiß, was der Knopf tut.
8. Als Jobsuchender möchte ich, dass der Umschalter auch auf kleinen Bildschirmen (Mobil) gut bedienbar bleibt, damit die App auf allen Geräten komfortabel nutzbar ist.

## Implementation Decisions

### Lebenslauf-Stil-Bezeichnungen

- Die Labels werden ausschließlich in den i18n-Dateien `messages/de.json` und `messages/en.json` geändert – keine Änderungen an TypeScript-Typen, Datenbankschemas oder API-Contracts.
- Interne Werte (`"classic"` / `"american"`) in `CvDocument`, `GenerateForm`, `ApplicationHistoryDetail`, `ApplicationHistoryList`, der Generate-API-Route und allen Tests bleiben unberührt.
- Geänderte Schlüssel:
  - `generate.cvStyleLabel`: „Lebenslauf-Stil" → „Reihenfolge Einträge" (DE) / „CV style" → „Entry order" (EN)
  - `generate.cvStyleClassic`: „Klassisch" → „Ältestes zuerst" (DE) / „Classic" → „Oldest first" (EN)
  - `generate.cvStyleAmerican`: „Amerikanisch" → „Neuestes zuerst (Empfohlen)" (DE) / „American" → „Newest first (Recommended)" (EN)

### Sortierlogik (keine Änderung)

- Die Berufserfahrungs- und Ausbildungseinträge werden bereits in allen fünf PDF-Templates (Klassisch, Modern, Traditionell, Akzent, Kreativ) korrekt nach dem gewählten Stil sortiert. Beim Stil „american" wird die Array-Reihenfolge umgekehrt (`[...entries].reverse()`). Diese Logik wird nicht verändert.
- Die Reihenfolge der Eingabe im Profil-Formular ist weiterhin maßgeblich; die Sortierung erfolgt nur beim PDF-Export.

### Dark-Mode-Umschalter

- Der bestehende `ThemeToggle`-Button in `components/ThemeToggle.tsx` wird erweitert:
  - Ein kurzes Textlabel (z. B. „Hell" / „Dunkel" in DE, „Light" / „Dark" in EN) wird neben dem Icon ausgegeben – als `<span>` innerhalb desselben `<button>`-Elements.
  - Der Button erhält eine Pill-Form mit einem dezenten Hintergrund (z. B. `bg-white/10 rounded-full px-3 py-1`), damit die Klickfläche visuell klar abgegrenzt ist.
  - Die Beschriftungen kommen aus den bestehenden i18n-Schlüsseln `nav.toggleToDark` und `nav.toggleToLight`; diese werden auf ein kürzeres Label gekürzt (z. B. von „Zum Dark Mode wechseln" zu „Hell" / „Dunkel"). Alternativ werden zwei neue Schlüssel `nav.modeDark` und `nav.modeLight` für den kurzen Label-Text eingeführt, um `aria-label` und sichtbares Label zu trennen.
  - Das `aria-label` bleibt vollständig beschreibend (z. B. „Zum Dark Mode wechseln"), unabhängig vom sichtbaren Kurzlabel.
  - Auf Mobilgeräten bleibt der Button vollständig sichtbar und klickbar; kein abschneiden durch `overflow-hidden` im Header.

## Testing Decisions

- Gute Tests prüfen ausschließlich sichtbares Verhalten über öffentliche Schnittstellen, nicht interne Implementierungsdetails.
- **Lebenslauf-Stil:** Es werden keine neuen Testdateien benötigt. Die bestehenden Tests prüfen interne Werte (`"classic"` / `"american"`), die sich nicht ändern. Bestehende Tests bleiben unverändert grün.
- **Dark-Mode-Umschalter:** Neuer Unit-Test für `ThemeToggle`, der prüft, dass das sichtbare Textlabel korrekt gerendert wird („Hell" / „Dunkel" je nach aktuellem Modus). Bestehende Tests für ThemeToggle bleiben grün.
- Manuell zu verifizieren (Browser-QA):
  - Die neuen Label-Texte erscheinen korrekt in der Stil-Auswahl auf `/de/generate` und `/en/generate`.
  - Der Dark-Mode-Umschalter ist im Header klar erkennbar und zeigt das Textlabel in beiden Sprachen.

## Out of Scope

- Umbenennung der internen TypeScript-Typen oder Datenbankfelder (`"classic"` / `"american"` bleiben)
- Änderungen am Profil-Formular oder an der Eingabe-Reihenfolge der Einträge
- Änderungen an der PDF-Sortierlogik
- Stripe Live-Modus, rechtliche Pflichtangaben oder sonstige neue Features
- Grundlegende Überarbeitung des Header-Designs

## Further Notes

Die Sortierlogik setzt voraus, dass Nutzer ihre Berufserfahrungs- und Ausbildungseinträge im Profil-Formular in einer konsistenten Reihenfolge (z. B. ältestes zuerst) einpflegen. Die App gibt keine eigene Reihenfolge vor – die Sortierung beim Export dreht lediglich die eingegebene Reihenfolge um oder behält sie bei. Dieser Hinweis ist für den Nutzer aktuell nicht sichtbar; eine spätere Phase könnte einen erläuternden Tooltip ergänzen.
