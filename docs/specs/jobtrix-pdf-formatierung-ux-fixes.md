# SPEC: PDF-Formatierung, UX-Fixes und Bewerbungshinweise

## Kontext

Nutzerfeedback aus manueller Prüfung auf verschiedenen Geräten (Mobile Firefox, DuckDuckGo, Desktop). Betrifft PDF-Layout aller Templates, Vorschau-Navigation und fehlende Features im Generierungsflow.

---

## User Stories

### US-1: Vorschau-Modal und Zurück-Navigation
**Als** Nutzer auf dem Handy
**möchte ich** beim Drücken der Zurück-Taste im PDF-Vorschau-Modal zurück zur Generierungsseite kommen,
**damit** meine aktuelle Generierung erhalten bleibt und ich nicht zum Profil navigiert werde.

### US-2: Download-Button im Vorschau-Modal
**Als** Nutzer
**möchte ich** im Vorschau-Modal über den Herunterladen-Button das PDF herunterladen können,
**damit** ich das PDF speichern kann, ohne das Modal zu verlassen.

### US-3: Anschreiben/Lebenslauf-Buttons bei "Jetzt absenden"
**Als** Nutzer auf dem Handy
**möchte ich** dass die Anschreiben- und Lebenslauf-Buttons im "Fast geschafft"-Dialog zuverlässig funktionieren,
**damit** ich meine Bewerbungsunterlagen herunterladen kann.

### US-4: Bewerbungshinweise im Generierungsflow
**Als** Nutzer
**möchte ich** bei der Stellengenerierung zusätzliche Hinweise angeben können (z.B. "bitte Gehaltsvorstellung 50k erwähnen"),
**damit** das generierte Anschreiben meine individuellen Wünsche berücksichtigt.

### US-5: Anschreiben-Formatierung (alle Templates außer Traditionell)
**Als** Nutzer
**möchte ich** dass mein Anschreiben professionell formatiert ist,
**damit** es bei Arbeitgebern einen guten Eindruck hinterlässt.

### US-6: Anschreiben Traditionell — Abstände
**Als** Nutzer
**möchte ich** dass das traditionelle Anschreiben-Layout optisch stimmig ist,
**damit** der Briefkopf und die Datumszeile professionell aussehen.

### US-7: Doppelte Daten in Klassisch-Template
**Als** Nutzer
**möchte ich** dass Name und Adresse im klassischen Layout nicht doppelt erscheinen,
**damit** meine Bewerbung professionell wirkt.

### US-8: Doppelte Daten in Modern-Lebenslauf
**Als** Nutzer
**möchte ich** dass persönliche Daten im modernen Lebenslauf nicht redundant erscheinen (oben unter dem Foto UND nochmals im Inhalt),
**damit** der Lebenslauf übersichtlich bleibt.

### US-9: Doppelte Daten in Traditionell-Template
**Als** Nutzer
**möchte ich** dass persönliche Daten im traditionellen Layout nicht doppelt stehen (Header und Body),
**damit** die Bewerbung sauber aussieht.

### US-10: Seitenumbrüche blockweise
**Als** Nutzer
**möchte ich** dass Sektionen wie Qualifikationen, Ausbildung und Berufserfahrung nicht mitten im Block umbrechen,
**damit** der Lebenslauf gut lesbar bleibt.

---

## Technische Umsetzung

### Issue 1: Zurück-Taste schließt Vorschau-Modal statt Seitennavigation
**Betroffene Datei:** `jobtrix/components/PdfPreviewModal.tsx`

Beim Öffnen des Modals einen History-Eintrag pushen (`history.pushState`). Auf `popstate` lauschen und bei Rücknavigation das Modal schließen statt die Seite zu verlassen.

**Akzeptanzkriterien:**
- [ ] Zurück-Taste auf Mobile schließt das Vorschau-Modal
- [ ] Generierungsergebnis bleibt erhalten
- [ ] Doppeltes Zurück navigiert normal weg von der Seite
- [ ] Desktop-Verhalten (Escape-Taste, X-Button) unverändert

### Issue 2: Download-Button im Vorschau-Modal funktioniert auf Mobile
**Betroffene Dateien:** `jobtrix/components/PdfPreviewModal.tsx`

Der Download-Button im Modal nutzt `<a href="blob:..." download="...">`, was in manchen mobilen Browsern nicht funktioniert. Stattdessen `navigator.share()` mit File-Objekt verwenden (wie bereits im EmailDraft-Guide implementiert).

**Akzeptanzkriterien:**
- [ ] Download-Button im Vorschau-Modal löst `navigator.share()` auf Mobile aus
- [ ] Desktop-Verhalten (direkter Download) bleibt unverändert
- [ ] Dateiname wird korrekt übergeben

### Issue 3: "Jetzt absenden" — Share-Buttons für Anschreiben/Lebenslauf
**Betroffene Datei:** `jobtrix/components/EmailDraft.tsx`

Die Buttons "Anschreiben.pdf" und "Lebenslauf.pdf" im "Fast geschafft"-Dialog reagieren nicht. Die `navigator.share()`-Aufrufe schlagen still fehl (`.catch(() => {})`). Debugging: Prüfen ob `navigator.canShare` die Files akzeptiert, ggf. Fallback auf Blob-Download implementieren.

**Akzeptanzkriterien:**
- [ ] Anschreiben-Button im Guide-Dialog öffnet das native Teilen-Menü (Mobile)
- [ ] Lebenslauf-Button im Guide-Dialog öffnet das native Teilen-Menü (Mobile)
- [ ] Wenn `navigator.share()` nicht verfügbar: sinnvoller Fallback (z.B. Blob-Download)
- [ ] Kein stiller Fehlschlag — wenn nichts passiert, Fehlermeldung zeigen

### Issue 4: Hinweisfeld für Bewerbungsanweisungen
**Betroffene Dateien:**
- `jobtrix/components/GenerateForm.tsx` — neues Textfeld unter Stellenanzeige
- `jobtrix/app/api/generate/route.ts` — Hinweise an Claude-Prompt übergeben
- `jobtrix/lib/validation-schemas.ts` — Schema erweitern
- `jobtrix/messages/de.json`, `jobtrix/messages/en.json` — Übersetzungen

Neues optionales Textarea-Feld "Hinweise für die Bewerbung" unter dem Stellenanzeige-Feld. Inhalt wird als zusätzlicher Kontext an den Claude-API-Call übergeben.

**Akzeptanzkriterien:**
- [ ] Optionales Textfeld "Hinweise" unter der Stellenanzeige sichtbar
- [ ] Platzhalter-Text erklärt den Zweck (z.B. "z.B. Gehaltsvorstellung 50.000€ erwähnen, frühester Eintrittstermin: 01.03.")
- [ ] Hinweise werden an die Claude-API übergeben und beeinflussen das Anschreiben
- [ ] Generierung funktioniert auch ohne Hinweise (Feld ist optional)
- [ ] Übersetzungen für DE und EN vorhanden

### Issue 5: Anschreiben-Formatierung — Abstände anpassen
**Betroffene Datei:** `jobtrix/lib/pdf-documents.tsx`

Betrifft Templates: Classic, Modern, Accent, Creative (NICHT Traditionell).

Aktuell: Alle Absätze haben gleichen Abstand. Gewünscht: Bestimmte Stellen brauchen doppelten Zeilenabstand.

**Änderungen:**
- Zwischen letztem Absatz und "Mit freundlichen Grüßen" → doppelter Abstand
- Zwischen Firmenadresse-Block und Ort/Datum → doppelter Abstand
- Zwischen Ort/Datum und "Bewerbung als..." → doppelter Abstand

Da `renderTextBlocks` den Claude-generierten Text rendert und die Struktur (Firmenadresse, Ort, Betreff, Fließtext, Grußformel) nicht semantisch trennt, muss die Heuristik verbessert werden: Absätze die mit "Mit freundlichen Grüßen" / "Sehr geehrte" / Datumsformat / "Bewerbung als" beginnen, erhalten `marginTop` doppelt.

**Akzeptanzkriterien:**
- [ ] Doppelter Abstand vor "Mit freundlichen Grüßen" (und Varianten)
- [ ] Doppelter Abstand zwischen Empfängeradresse und Ort/Datum
- [ ] Doppelter Abstand zwischen Ort/Datum und Betreffzeile
- [ ] Reguläre Absätze behalten einfachen Abstand
- [ ] Alle Templates außer Traditionell betroffen

### Issue 6: Traditionelles Anschreiben — Abstand nach Trennlinie
**Betroffene Datei:** `jobtrix/lib/pdf-documents.tsx`

Im Traditional-Template ist zu viel Abstand zwischen der durchgezogenen Trennlinie und dem Datum. Optisch anpassen: Abstand reduzieren.

**Akzeptanzkriterien:**
- [ ] Abstand zwischen Trennlinie und Datum im Traditionell-Template verringert
- [ ] Optisch ausgewogen und professionell
- [ ] Keine Auswirkung auf andere Templates

### Issue 7: Klassisch — Name/Adresse doppelt in Anschreiben + Lebenslauf
**Betroffene Datei:** `jobtrix/lib/pdf-documents.tsx`

Im Classic-Template erscheinen Name und Adresse sowohl im Header-Bereich als auch nochmals im Body-Text. Eines davon entfernen — der Header reicht.

**Akzeptanzkriterien:**
- [ ] Name und Adresse erscheinen im Classic-Anschreiben genau einmal
- [ ] Name und Adresse erscheinen im Classic-Lebenslauf genau einmal
- [ ] Header-Bereich bleibt als primärer Ort für persönliche Daten

### Issue 8: Modern-Lebenslauf — Persönliche Daten aus Body entfernen
**Betroffene Datei:** `jobtrix/lib/pdf-documents.tsx`

Im Modern-Template stehen persönliche Daten in der Sidebar (unter dem Foto) UND nochmals im Hauptinhalt. Die Daten im Body entfernen, da die Sidebar sie bereits zeigt.

**Akzeptanzkriterien:**
- [ ] Persönliche Daten erscheinen nur in der Modern-Sidebar, nicht im Body
- [ ] Lebenslauf-Inhalt beginnt direkt mit den Sektionen (Ausbildung, Erfahrung etc.)

### Issue 9: Traditionell — Persönliche Daten doppelt
**Betroffene Datei:** `jobtrix/lib/pdf-documents.tsx`

Im Traditional-Template erscheinen persönliche Daten im Header UND im Body. Duplikate entfernen.

**Akzeptanzkriterien:**
- [ ] Persönliche Daten im Traditionell-Anschreiben nicht doppelt
- [ ] Persönliche Daten im Traditionell-Lebenslauf nicht doppelt

### Issue 10: Seitenumbrüche blockweise (alle Templates)
**Betroffene Datei:** `jobtrix/lib/pdf-documents.tsx`

Sektionen wie Qualifikationen, Ausbildung und Berufserfahrung werden aktuell mitten im Block umbrochen. `@react-pdf/renderer` unterstützt `break-inside: "avoid"` nicht direkt, aber `minPresenceAhead` und `wrap={false}` auf `<View>`-Ebene verhindern Umbrüche innerhalb von Blöcken.

**Strategie:**
- Jede Sektion (Überschrift + Inhalt) in eine `<View>` mit `minPresenceAhead={40}` wrappen
- Einzelne Einträge (z.B. ein Ausbildungseintrag) mit `wrap={false}` markieren, wenn sie kurz genug sind
- Betrifft: Classic, Traditional, Accent, Creative Lebenslauf-Templates

**Akzeptanzkriterien:**
- [ ] Qualifikationen brechen nicht mitten im Block um
- [ ] Ausbildungseinträge brechen nicht mitten im Eintrag um
- [ ] Berufserfahrungseinträge bleiben zusammen
- [ ] Bei zu langen Sektionen ist ein Umbruch weiterhin möglich (kein Endlos-Overflow)
- [ ] Alle Lebenslauf-Templates betroffen

---

## Nicht im Scope

- DuckDuckGo-Dateinamen (Browser-Limitation, nicht lösbar clientseitig)
- Session-Verhalten bei Browser-Close (bleibt als Industriestandard)
- Design-Overhaul (eigene Phase via `/grill-me`)

## Abhängigkeiten

Keine — alle Issues können unabhängig umgesetzt werden.
