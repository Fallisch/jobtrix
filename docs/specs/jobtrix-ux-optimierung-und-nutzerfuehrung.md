# JobTRIX – UX-Optimierung und Nutzerführung

## Problem Statement

JobTRIX ist funktional vollständig, aber die Bedienbarkeit — insbesondere für weniger technikaffine oder eingeschränkte Personen — weist erhebliche Lücken auf. Konkret gibt es fünf Problembereiche:

1. **Fehlende Eingabevalidierung**: Im Onboarding und Profil werden Geburtsdatum, Telefonnummer und Orte nicht validiert. Ein Nutzer kann z. B. „13.44.5555" als Geburtsdatum oder beliebige Zeichenketten als Telefonnummer eingeben. Zeitangaben bei Ausbildung, Qualifikationen und Berufserfahrung erlauben freie Eingaben wie „gestern" statt nur gültige Jahreszahlen.

2. **Lebenslauf-Bug in der Generierung**: Bei bestimmten Konstellationen landen Ausbildung, Qualifikationen, Berufserfahrung und weitere Profildaten im E-Mail-Body statt im Lebenslauf-PDF. Der Lebenslauf bleibt dabei fast leer (nur Name und Adresse). Gleichzeitig werden KI-Hinweise wie „Die angegebene Qualifikation ist nicht verwertbar" direkt in Anschreiben und E-Mail eingebettet statt dem Nutzer separat angezeigt zu werden.

3. **E-Mail-Versand über Jobtrix-Server**: Aktuell versendet Jobtrix die Bewerbungsmail über bewerbung@jobtrix.app via Resend API. Der Empfänger sieht also nicht die E-Mail-Adresse des Bewerbers als Absender, sondern eine generische Jobtrix-Adresse. Das wirkt unprofessionell und kann zu Spam-Filtern führen.

4. **Keine Mobile-Optimierung**: Alle App-Komponenten (Onboarding, Profil, Generierung, E-Mail-Entwurf, Bewerbungshistorie, Login, Register, Header, Footer) haben keine responsive Breakpoints. Auf dem Smartphone ist die Bedienung schlecht — kein Hamburger-Menü, Formulare laufen über den Bildschirmrand, Buttons sind zu klein.

5. **Keine Nutzerführung**: Es gibt weder Hilfetexte, Info-Icons noch ein Tutorial. Der Nutzer muss selbst herausfinden, was wo eingetragen werden soll und wie die App funktioniert.

## Solution

Diese Phase macht Jobtrix kinderleicht bedienbar — auch für Personen ohne technische Erfahrung. Die Lösung umfasst fünf Säulen:

1. **Sofortige Inline-Validierung**: Alle Eingabefelder im Onboarding und Profil erhalten Echtzeit-Validierung. Ungültige Eingaben werden sofort rot markiert mit einer verständlichen Fehlermeldung. Geburtsdatum, Telefonnummer und Orte werden auf Plausibilität geprüft. Zeitangaben bei Ausbildung, Qualifikationen und Berufserfahrung akzeptieren nur gültige Jahreszahlen oder Jahreszahl-Bereiche.

2. **Lebenslauf-Bug beheben und Qualifikations-Hinweis als Popup**: Die Generierungslogik wird korrigiert, sodass Profildaten zuverlässig im Lebenslauf-PDF landen und nicht im E-Mail-Body. KI-Hinweise zu fehlenden oder unzureichenden Qualifikationen werden als freundliches, wegklickbares Popup vor der Generierung angezeigt — nicht in den generierten Dokumenten.

3. **E-Mail-Versand über das Mail-Programm des Nutzers**: Statt über den Jobtrix-Server wird ein mailto-Link verwendet, der das E-Mail-Programm des Nutzers öffnet (Betreff und Text vorausgefüllt). Die PDFs werden gleichzeitig heruntergeladen. Eine Schritt-für-Schritt-Anleitung im Popup erklärt dem Nutzer, wie er die Dateien anhängt — gerätespezifisch für Android und iOS. Die E-Mail-Adresse des Arbeitgebers wird automatisch aus der Stellenanzeige extrahiert und dem Nutzer zur Bestätigung/Korrektur angezeigt.

4. **Mobile First**: Alle App-Komponenten werden responsive umgebaut. Der Header erhält ein Hamburger-Menü für kleine Bildschirme. Formulare, Buttons, Abstände und Schriftgrößen werden für Touch-Bedienung optimiert. Das bestehende Design (Dark Mode, Lila-Akzente) bleibt erhalten.

5. **Nutzerführung mit Info-Icons und Willkommens-Slides**: Formularfelder erhalten kleine Info-Icons, die beim Antippen erklären, was eingetragen werden soll. Beim ersten Besuch nach Registrierung erscheinen durchblätterbare Willkommens-Slides, die den Nutzer durch die wichtigsten Funktionen der App führen.

## User Stories

1. Als Jobsuchender möchte ich beim Eintippen eines ungültigen Geburtsdatums sofort eine rote Markierung und einen Hinweis sehen (z. B. „Bitte gib ein gültiges Datum ein"), damit ich den Fehler direkt korrigieren kann.
2. Als Jobsuchender möchte ich, dass nur echte Telefonnummern akzeptiert werden (Ziffern, optionale Vorwahl mit +, Leerzeichen und Bindestriche), damit keine unsinnigen Eingaben ins Profil gelangen.
3. Als Jobsuchender möchte ich bei Ortseingaben nur plausible Ortsnamen eingeben können (keine Zahlenfolgen oder Sonderzeichen), damit meine Bewerbungsunterlagen seriös wirken.
4. Als Jobsuchender möchte ich bei Ausbildung, Qualifikationen und Berufserfahrung nur gültige Jahreszahlen oder Jahreszahl-Bereiche eingeben können (z. B. „2019" oder „2019 - 2022"), damit keine unsinnigen Zeitangaben wie „gestern" in meinen Unterlagen stehen.
5. Als Jobsuchender möchte ich, dass meine Ausbildung, Qualifikationen und Berufserfahrung vollständig im Lebenslauf-PDF erscheinen und nicht im E-Mail-Text, damit mein Lebenslauf aussagekräftig ist.
6. Als Jobsuchender möchte ich vor der Generierung einen freundlichen Hinweis als Popup sehen, wenn meine Qualifikationen möglicherweise nicht zur Stelle passen, damit ich entscheiden kann, ob ich mein Profil ergänzen oder trotzdem fortfahren möchte.
7. Als Jobsuchender möchte ich, dass KI-Hinweise wie „Qualifikation nicht verwertbar" niemals in meinen generierten Dokumenten (Anschreiben, Lebenslauf, E-Mail) auftauchen, damit meine Bewerbung professionell wirkt.
8. Als Jobsuchender möchte ich meine Bewerbung direkt über mein eigenes E-Mail-Programm versenden, damit die Mail von meiner persönlichen Adresse kommt und beim Arbeitgeber nicht im Spam-Filter landet.
9. Als Jobsuchender möchte ich, dass beim Klick auf „Bewerbung senden" mein E-Mail-Programm mit vorausgefülltem Betreff und Text öffnet und gleichzeitig die PDFs heruntergeladen werden, damit ich nur noch anhängen und absenden muss.
10. Als Jobsuchender möchte ich eine klare, Schritt-für-Schritt-Anleitung sehen, die mir erklärt wie ich die heruntergeladenen PDFs an die E-Mail anhänge — angepasst an mein Gerät (Android/iOS/Desktop), damit ich auch ohne technische Erfahrung zurechtkomme.
11. Als Jobsuchender möchte ich, dass die E-Mail-Adresse des Arbeitgebers automatisch aus der Stellenanzeige extrahiert wird und mir zur Bestätigung angezeigt wird, damit ich sie prüfen und bei Bedarf korrigieren kann.
12. Als Jobsuchender möchte ich Jobtrix auf meinem Smartphone genauso gut bedienen können wie am Desktop, damit ich unterwegs Bewerbungen erstellen kann.
13. Als Jobsuchender möchte ich im Header ein Hamburger-Menü sehen, wenn ich die App auf dem Smartphone nutze, damit die Navigation nicht den Bildschirm überfüllt.
14. Als Jobsuchender möchte ich, dass alle Formulare, Buttons und Texte auf kleinen Bildschirmen gut lesbar und tippbar sind, damit ich nicht zoomen oder scrollen muss um ein Feld zu treffen.
15. Als Jobsuchender möchte ich bei jedem Formularfeld ein kleines Info-Icon sehen, das mir beim Antippen erklärt, was ich dort eintragen soll, damit ich nie ratlos vor einem Feld stehe.
16. Als Jobsuchender möchte ich beim ersten Besuch nach der Registrierung Willkommens-Slides durchblättern können, die mir die wichtigsten Funktionen der App zeigen, damit ich sofort weiß, wie Jobtrix funktioniert.
17. Als Jobsuchender möchte ich die Willkommens-Slides überspringen können, falls ich sie nicht brauche.
18. Als Jobsuchender möchte ich, dass die Willkommens-Slides nur einmalig erscheinen und mich bei späteren Besuchen nicht erneut stören.

## Implementation Decisions

### Modul 1: Eingabevalidierung (Onboarding + Profil)

Aktuell prüft `validateProfile()` in `profile-storage.ts` nur, ob der Name nicht leer ist. Die Validierung wird grundlegend erweitert:

- **Geburtsdatum**: Die drei separaten Felder (birthDay, birthMonth, birthYear) werden bei Eingabe sofort validiert. Tag: 1–31, Monat: 1–12, Jahr: vierstellig und plausibel (z. B. 1920–2015). Zusätzliche Kreuzvalidierung: 30. Februar wird abgelehnt. Anzeige als roter Rahmen + Fehlermeldung unter dem Feld.
- **Telefonnummer**: Regex-Validierung bei Eingabe: erlaubt Ziffern, Leerzeichen, Bindestriche und optionales führendes +. Mindestlänge 6 Zeichen. Muster: `/^\+?[\d\s\-]{6,}$/`.
- **Orte** (Adresse, Geburtsort): Müssen mindestens 2 Buchstaben enthalten, keine reinen Zahlenfolgen. Muster: mindestens zwei aufeinanderfolgende Buchstaben.
- **Jahreszahlen bei Ausbildung, Berufserfahrung, Qualifikationen**: Die bestehenden Freitext-Felder für Zeiträume akzeptieren nur das Format „JJJJ" oder „JJJJ - JJJJ". Validierung per Regex: `/^\d{4}(\s*-\s*\d{4})?$/`. Jahreszahlen müssen im plausiblen Bereich liegen (1950–2030). Die Felder werden als Textfelder beibehalten (kein Date-Picker), aber mit Eingabemaske.
- **Validierungsstrategie**: Validierung wird clientseitig im `onChange`-Handler ausgelöst. Fehlerhafte Felder erhalten sofort die CSS-Klasse für roten Rahmen (`border-red-500`) und eine Fehlermeldung in roter Schrift darunter. Valide Felder zeigen keinen besonderen Zustand. Die gleiche Validierungslogik wird sowohl in `OnboardingForm` als auch in `ProfileForm` verwendet (gemeinsame Validierungsfunktionen).

### Modul 2: Lebenslauf-Bug und Qualifikations-Popup

**Lebenslauf-Bug**: Im aktuellen System generiert Claude vier Sektionen (BETREFF, ANSCHREIBEN, LEBENSLAUF, E-MAIL). Bei den Templates modern/traditional/accent/creative werden die strukturierten Profildaten direkt für das PDF gerendert — der KI-generierte Lebenslauf-Text wird ignoriert. Beim classic-Template wird der KI-Text als Fließtext gerendert. Der Bug tritt auf, wenn die KI die Sektionsgrenzen verwechselt und Lebenslauf-Inhalte in die E-Mail-Sektion schreibt oder der Lebenslauf-Text zu dünn ausfällt. Lösung:

- Der Prompt in `build-prompt.ts` erhält klarere Anweisungen zur strikten Trennung der Sektionen mit expliziten Regeln: „Der LEBENSLAUF-Abschnitt MUSS alle Profildaten (Ausbildung, Berufserfahrung, Qualifikationen, Sprachen, Interessen) enthalten. Der E-MAIL-Abschnitt enthält NUR den kurzen E-Mail-Text, KEINE Profildaten."
- Das `parseResponse()`-Parsing wird robuster gemacht: Validierung, dass die Lebenslauf-Sektion eine Mindestlänge hat und typische CV-Sektionen enthält.
- Für non-classic Templates (die ohnehin strukturierte Profildaten rendern): Sicherstellen, dass alle Profil-Sektionen (education, experience, qualifications, languages, interests) auch bei spärlichen Daten gerendert werden.

**Qualifikations-Popup**: Vor dem Start der Generierung wird geprüft, ob das Profil ausreichend befüllt ist (z. B. mindestens eine Qualifikation, mindestens ein Ausbildungseintrag). Falls nicht, erscheint ein modales Popup mit freundlichem Hinweis und zwei Buttons: „Profil ergänzen" (leitet zum Profil weiter) und „Trotzdem fortfahren" (schließt das Popup und startet die Generierung). Der Prompt enthält eine explizite Anweisung, keine HINWEIS-Blöcke in die generierten Texte einzufügen — fehlende Daten werden mit Platzhaltern wie „[bitte ergänzen]" markiert, nicht mit mehrzeiligen Kommentaren.

### Modul 3: E-Mail-Versand via mailto-Link

Der gesamte serverseitige E-Mail-Versand über Resend wird durch einen clientseitigen mailto-Ansatz ersetzt:

- **Arbeitgeber-E-Mail extrahieren**: Bei der Generierung wird die KI angewiesen, eine eventuell in der Stellenanzeige vorhandene E-Mail-Adresse zu extrahieren und als separates Feld zurückzugeben. Das Parsing wird um ein optionales Feld `employerEmail` erweitert. Alternativ wird clientseitig ein einfacher Regex über den Stellenanzeigen-Text gelaufen.
- **Bestätigungsfeld**: Im Ergebnis-Bereich erscheint ein vorausgefülltes E-Mail-Feld mit der extrahierten Adresse und einem Label „E-Mail-Adresse des Arbeitgebers — bitte prüfen". Der Nutzer kann die Adresse korrigieren.
- **mailto-Link**: Der „Bewerbung senden"-Button erzeugt einen `mailto:`-Link mit vorausgefülltem `to`, `subject` und `body` (URL-encoded). Gleichzeitig werden Anschreiben.pdf und Lebenslauf.pdf automatisch heruntergeladen.
- **Anleitungs-Popup**: Nach dem Klick erscheint ein modales Popup mit einer Schritt-für-Schritt-Anleitung:
  - Schritt 1: „Deine Bewerbungsunterlagen wurden heruntergeladen"
  - Schritt 2: „Dein E-Mail-Programm öffnet sich jetzt"
  - Schritt 3: „Hänge die heruntergeladenen Dateien (Anschreiben.pdf, Lebenslauf.pdf) an die E-Mail an"
  - Schritt 4: „Klicke auf Senden — fertig!"
  - Geräteerkennung via `navigator.userAgent`: Auf Android zusätzlicher Hinweis „Tippe auf das Büroklammer-Symbol", auf iOS „Tippe auf das Anhang-Symbol". Auf Desktop: „Ziehe die Dateien in das E-Mail-Fenster oder klicke auf ‚Anhang hinzufügen'".
- **Bestehende API-Route `/api/send-email`**: Bleibt vorerst bestehen für Abwärtskompatibilität, wird aber nicht mehr vom Frontend aufgerufen. Kann in einer späteren Phase entfernt werden.
- **EmailDraft-Komponente**: Wird umgebaut — statt dem bisherigen Versand-Flow (Vorschau → Senden) zeigt sie: Empfängerfeld (editierbar, vorausgefüllt), Betreff (kopierbar), Body (kopierbar), „Bewerbung senden"-Button (mailto + Download + Anleitung).

### Modul 4: Mobile First — Responsive Redesign

Alle App-Komponenten erhalten responsive Tailwind-Breakpoints. Die bestehende visuelle Linie (Dark Mode, Lila-Akzente, Inter-Font) bleibt unverändert:

- **Header**: Hamburger-Menü (`md:hidden`) mit animiertem Slide-Down-Menü für Navigation auf kleinen Bildschirmen. Desktop-Navigation bleibt ab `md:` sichtbar.
- **Footer**: Vertikale Stapelung der Links auf kleinen Bildschirmen statt Flex-Wrap.
- **OnboardingForm**: Vollbildbreite auf Mobile (`w-full` statt `max-w-md`), größere Touch-Targets (min-h-[44px] für Buttons und Inputs), angepasste Abstände.
- **ProfileForm**: Einspaltiges Layout auf Mobile, zweispaltig ab `md:`. Slider und Tag-Inputs auf volle Breite.
- **GenerateForm**: Stellensuche-Felder und Template-Auswahl stapeln sich auf Mobile vertikal. LayoutPreview-Thumbnails in einem horizontalen Scroll-Container statt Grid. Ergebnis-Textareas auf volle Breite.
- **EmailDraft**: Buttons und Felder auf volle Breite auf Mobile.
- **ApplicationHistoryList / ApplicationHistoryDetail**: Kartenansicht statt Tabelle auf Mobile. Detail-Ansicht: Tabs für Anschreiben/Lebenslauf/E-Mail statt nebeneinander.
- **LoginForm / RegisterForm**: Zentriertes, vollbreites Layout auf Mobile.
- **PdfPreviewModal**: Auf Mobile als Fullscreen-Overlay statt als zentriertes Modal.
- **AccountSettings**: Einspaltiges Layout, volle Breite auf Mobile.
- **Globale Regeln**: Mindestgröße für Touch-Targets: 44x44px. Schriftgrößen: Basis 16px auf Mobile (kein Auto-Zoom auf iOS). Abstände: `p-4` als Mindest-Padding auf Mobile.

### Modul 5: Info-Icons und Willkommens-Slides

**Info-Icons**:

- Neue wiederverwendbare Komponente `InfoTooltip`: Ein kleines (i)-Icon (Kreis mit i) neben dem Feld-Label. Beim Antippen/Klicken erscheint eine Sprechblase mit dem Hilfetext. Beim erneuten Antippen oder Klicken außerhalb schließt sich die Sprechblase.
- Implementierung mit reinem Tailwind (keine externe Tooltip-Bibliothek). State-Management per lokalem `useState`.
- Hilfetexte werden in den i18n-Dateien gepflegt (de/en), z. B. `onboarding.phone.help: "Deine Telefonnummer mit Vorwahl, z. B. +49 170 1234567"`.
- Felder die Info-Icons erhalten: Alle Pflichtfelder im Onboarding und Profil (Name, Adresse, Geburtsdatum, Telefon, Foto, Ausbildung, Berufserfahrung, Qualifikationen, Interessen), sowie im GenerateForm (Stellenanzeige, Initiativbewerbung, CV-Stil, Template-Wahl).

**Willkommens-Slides**:

- Neue Komponente `WelcomeSlides`: Fullscreen-Overlay mit durchblätterbaren Karten (Swipe auf Mobile, Pfeiltasten/Buttons auf Desktop).
- 4–5 Slides: (1) „Willkommen bei JobTRIX — Bewerbungen erstellen in Minuten", (2) „Profil anlegen — Deine Daten sind die Basis für jede Bewerbung", (3) „Stelle suchen oder eingeben — JobTRIX findet passende Stellen für dich", (4) „Bewerbung generieren — Anschreiben, Lebenslauf und E-Mail auf Knopfdruck", (5) „Versenden — Direkt aus deinem E-Mail-Programm".
- Jeder Slide enthält eine kurze Illustration/Icon + 1–2 Sätze Text. Umsetzung mit Framer Motion (bereits als Dependency vorhanden) für Slide-Animationen.
- Anzeige-Logik: Wird nach der Registrierung einmalig angezeigt. Ein Flag `hasSeenWelcome` wird in der Datenbank (User-Modell) oder im localStorage gespeichert. Prüfung bei jedem App-Start: wenn `hasSeenWelcome === false`, Slides anzeigen. Nach dem Durchblättern oder Klick auf „Überspringen" wird das Flag auf `true` gesetzt.
- „Überspringen"-Button sichtbar auf jedem Slide.

### Visual Direction

Die bestehende visuelle Linie bleibt erhalten:
- Dark Mode als Standard mit heller Alternative
- Lila-Akzentfarbe (#7C3AED / purple-600)
- Inter als Hauptschrift
- Abgerundete Karten und Inputs (rounded-lg)
- Neue Elemente (Info-Icons, Popups, Willkommens-Slides, Hamburger-Menü) folgen dem gleichen Stil: dunkler Hintergrund, Lila-Akzente, weiche Schatten

## Testing Decisions

Ein guter Test prüft das beobachtbare Verhalten aus Nutzersicht, nicht interne Implementierungsdetails, und bleibt robust gegenüber Refactorings.

### Validierung

- Unit-Tests für die gemeinsamen Validierungsfunktionen: Geburtsdatum (gültige/ungültige Kombinationen wie 29.02 in Schaltjahren), Telefonnummer (mit/ohne Vorwahl, zu kurz, mit Buchstaben), Ort (reine Zahlen, gültige Namen), Jahreszahl-Bereich (gültige Formate, ungültige wie „gestern", „2019 - abc", „1800").
- Playwright E2E-Test: Onboarding-Formular ausfüllen mit ungültigen Daten → rote Markierung erscheint. Korrigieren → Markierung verschwindet.

### Lebenslauf-Bug und Qualifikations-Popup

- Unit-Test für `parseResponse()`: Prüft, dass bei einer KI-Antwort mit allen vier Sektionen die Lebenslauf-Sektion die Profildaten enthält und die E-Mail-Sektion nur den kurzen Text.
- Unit-Test für `buildPrompt()`: Prüft, dass der Prompt explizite Trennungsanweisungen enthält und keine HINWEIS-Blöcke erlaubt.
- Playwright E2E-Test: Generierung mit spärlichem Profil → Qualifikations-Popup erscheint → „Trotzdem fortfahren" → Generierung startet.

### E-Mail-Versand

- Unit-Test für die mailto-Link-Generierung: Prüft korrekte URL-Encoding von Betreff, Body und Empfänger.
- Unit-Test für die E-Mail-Extraktion aus dem Stellenanzeige-Text: Verschiedene Formate (name@firma.de, Kontakt: email@domain.com, etc.).
- Playwright E2E-Test: Nach Generierung → Empfängerfeld ist vorausgefüllt → „Bewerbung senden" klicken → Anleitung-Popup erscheint.

### Mobile First

- Playwright E2E-Tests mit Mobile-Viewport (375x812): Header zeigt Hamburger-Menü, Navigation ist initial versteckt. Formulare sind vollbreit. Buttons haben Mindest-Touch-Target.
- Visueller Regressions-Test: Screenshots der wichtigsten Seiten in Desktop- und Mobile-Viewport vergleichen.

### Info-Icons und Willkommens-Slides

- Playwright E2E-Test: InfoTooltip antippen → Hilfetext erscheint → erneut antippen → Hilfetext verschwindet.
- Playwright E2E-Test: Neuer Nutzer nach Registrierung → Willkommens-Slides erscheinen → durchblättern → nach letztem Slide verschwinden → bei nächstem Login erscheinen sie nicht mehr.
- Playwright E2E-Test: „Überspringen"-Button → Slides verschwinden sofort.

## Out of Scope

- Redesign der App oder Änderung des visuellen Erscheinungsbilds — nur responsive Anpassung und neue UX-Elemente im bestehenden Stil.
- Neue Features wie mehrstufiger Bewerbungs-Wizard, KI-Chat oder automatisches Profil-Ausfüllen.
- SMTP-Integration oder direkter E-Mail-Versand über das Konto des Nutzers — nur mailto-Link-Ansatz.
- Änderungen an der Marketing-Landingpage (ist bereits responsive).
- Änderungen an den PDF-Layouts selbst — nur Sicherstellung, dass die Daten korrekt darin landen.
- Entfernung der bestehenden `/api/send-email`-Route — bleibt für Abwärtskompatibilität bestehen.

## Further Notes

- Die Willkommens-Slides sollten inhaltlich kurz und visuell ansprechend sein — keine Textwüsten. Maximal 2 Sätze pro Slide plus ein Icon oder eine einfache Illustration.
- Die mailto-Link-Lösung hat eine technische Einschränkung: Auf manchen Android-Geräten öffnet sich bei mailto-Links die Gmail-App nicht automatisch, sondern eine App-Auswahl. Die Anleitung sollte darauf hinweisen.
- Der `hasSeenWelcome`-Flag sollte bevorzugt in der Datenbank gespeichert werden (nicht nur localStorage), damit der Nutzer die Slides nicht erneut sieht wenn er sich auf einem anderen Gerät anmeldet.
- Die Info-Texte müssen in beiden Sprachen (de/en) gepflegt werden, da Jobtrix bereits i18n via next-intl unterstützt.
- Bei der Geräte-Erkennung für die Anleitungs-Schritte reicht eine einfache User-Agent-Prüfung (Android/iOS/Desktop) — keine komplexe Device-Detection-Bibliothek nötig.
- Die Validierungslogik sollte als gemeinsame Utility-Funktionen implementiert werden, die sowohl vom Onboarding als auch vom Profil genutzt werden, um Duplikation zu vermeiden.
