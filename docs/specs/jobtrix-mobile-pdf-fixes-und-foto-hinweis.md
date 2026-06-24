# JobTRIX – Mobile-PDF-Fixes, Download-Benennung und Foto-Hinweis

## Problem Statement

Beim realen Einsatz auf dem Smartphone treten drei zusammenhängende Probleme auf, die das Nutzererlebnis auf Mobilgeräten erheblich einschränken. Zusätzlich funktioniert die Hintergrund-Entfernung bei Bewerbungsfotos nicht zuverlässig und sollte durch eine bessere Lösung ersetzt werden.

1. **PDF-Vorschau auf Mobilgeräten blockiert (CSP-Fehler)**: Beim Klick auf „Vorschau" auf dem Smartphone erscheint die Fehlermeldung „Webseite nicht verfügbar" mit `net::ERR_BLOCKED_BY_CSP`. Ursache: Die Content-Security-Policy erlaubt in der `frame-src`-Direktive nur `https://checkout.stripe.com`, nicht aber `blob:`. Der `<iframe src="blob:...">` in der `PdfPreviewHost`-Komponente wird daher auf Mobilgeräten vom Browser blockiert. Auf dem Desktop funktioniert es, weil dort ein neuer Tab (`window.open`) genutzt wird, der die `frame-src`-Restriktion umgeht.

2. **Download-Dateien haben keine sprechenden Namen**: Beim Download auf dem Smartphone erhalten die Dateien UUID-Dateinamen (z.B. `ed38b1e6-d56a-4...0f07f8213bd2.pdf`). Im Code steht zwar `buildFilename("Anschreiben", profile.name)` — das `download`-Attribut auf `<a>`-Elementen wird aber von einigen mobilen Browsern nicht zuverlässig übernommen, wenn der Blob-URL selbst eine UUID enthält. Außerdem nutzt die Vorschau-Komponente (`PdfPreviewModal.tsx`, Zeile 131) den generischen Namen `Vorschau.pdf` statt des echten Namens.

3. **Sporadisch leere PDFs**: Beim ersten Generieren entsteht gelegentlich ein leeres PDF (die Daten kommen aber korrekt per E-Mail an). Beim erneuten Generieren funktioniert es dann. Dies deutet auf ein Timing-/Race-Condition-Problem bei der Client-seitigen PDF-Erzeugung hin — der Blob wird möglicherweise abgerufen, bevor `@react-pdf/renderer` die Rendering-Pipeline vollständig abgeschlossen hat.

4. **Hintergrund-Entfernung funktioniert nicht zuverlässig**: Die aktuelle Implementierung (`remove-background.ts`) ist eine reine Canvas-Heuristik (Flood-Fill von den Bildecken), kein ML-Modell. Sie funktioniert nur bei einfarbigem Hintergrund und liefert bei realen Fotos (gemusterte Tapete, Möbel, Pflanzen im Hintergrund) ein unbrauchbares Ergebnis. Eine echte clientseitige ML-Lösung (`@imgly/background-removal`) wäre ~5 MB WASM und würde den App-Start belasten. Der Mehrwert steht nicht im Verhältnis.

## Solution

Drei gezielte Fixes für die Mobile-PDF-Probleme und ein Ersatz der Hintergrund-Entfernung durch einen hilfreichen Foto-Hinweis.

1. **CSP um `blob:` in `frame-src` erweitern**: Die `frame-src`-Direktive wird um `blob:` ergänzt, damit der `<iframe>` in der `PdfPreviewHost`-Komponente auf allen Geräten funktioniert. Änderung an **zwei Stellen** (müssen synchron bleiben): `jobtrix/lib/security-headers.ts` und `jobtrix/next.config.mjs`.

2. **Download-Dateinamen mit Bewerbername + Dokumenttyp**: Alle Download-Punkte verwenden konsistent das Schema `Nachname_Vorname_Anschreiben.pdf` bzw. `Nachname_Vorname_Lebenslauf.pdf`. Außerdem wird der Blob als `File`-Objekt mit explizitem Namen erzeugt, damit auch mobile Browser den Dateinamen übernehmen. Betroffen: `download-pdf.ts` und `PdfPreviewModal.tsx`.

3. **Race-Condition bei PDF-Erzeugung absichern**: Die PDF-Blob-Erzeugung wird mit einer Validierung versehen — ein leerer oder zu kleiner Blob (<1KB) wird nicht als fertiges PDF akzeptiert, sondern löst einen Retry aus (max. 1 Wiederholung). Zusätzlich wird der Fehlerfall dem Nutzer klar kommuniziert statt still ein leeres PDF auszuliefern.

4. **Hintergrund-Entfernung entfernen, Foto-Hinweis einbauen**: Die Flood-Fill-Heuristik und der zugehörige Toggle werden entfernt. Stattdessen erhält der Nutzer beim Foto-Upload einen kurzen Hinweis: „Für ein professionelles Bewerbungsfoto: Fotografiere dich vor einem hellen, einfarbigen Hintergrund." Optional bleibt die Schnittstelle `removeBackground()` als Platzhalter erhalten, falls später eine ML-Lösung nachgerüstet werden soll.

## User Stories

1. As a Bewerber am Smartphone, I want die PDF-Vorschau von Anschreiben und Lebenslauf im In-App-Modal öffnen können, so that ich die Dokumente vor dem Absenden prüfen kann, ohne eine CSP-Fehlermeldung zu bekommen.
2. As a Bewerber am Smartphone, I want, dass heruntergeladene PDFs sprechende Dateinamen haben (z.B. `Schieck_Falk_Anschreiben.pdf`), so that ich sie im Download-Ordner wiederfinde und zuordnen kann.
3. As a Bewerber, I want, dass die PDF-Generierung nicht gelegentlich ein leeres Dokument erzeugt, so that ich meine Bewerbung ohne erneutes Generieren versenden kann.
4. As a Bewerber, I want beim Foto-Upload einen Hinweis bekommen, wie ich ein gutes Bewerbungsfoto aufnehme, so that mein Foto auch ohne automatische Freistellung professionell aussieht.
5. As a Bewerber, I want, dass die Vorschau-Downloads ebenfalls meinen Namen im Dateinamen haben, so that ich nicht `Vorschau.pdf` umbenennen muss.

## Implementation Decisions

### Modul 1: CSP-Fix für Blob-Iframes

**Betroffene Dateien:**
- `jobtrix/lib/security-headers.ts` (Zeile 10)
- `jobtrix/next.config.mjs` (Zeile 14)

**Änderung:**
```
frame-src: "https://checkout.stripe.com"
→
frame-src: "https://checkout.stripe.com blob:"
```

**Sicherheitsbewertung:** `blob:`-URLs in `frame-src` sind sicher, weil sie nur auf lokal erzeugte Blobs verweisen können — ein Angreifer kann keine beliebigen Inhalte über fremde `blob:`-URLs laden. Die gleiche Erlaubnis besteht bereits für `img-src` und `worker-src`.

**Tests:** Bestehender Test `security-headers.test.ts` muss um Prüfung auf `blob:` in `frame-src` erweitert werden.

### Modul 2: Sprechende Download-Dateinamen

**Betroffene Dateien:**
- `jobtrix/lib/download-pdf.ts` — `buildFilename()` anpassen: Nachname_Vorname-Schema
- `jobtrix/components/PdfPreviewModal.tsx` — Download-Link und „In neuem Tab öffnen" sollen den echten Dateinamen verwenden; `openPdfPreview()` muss den Dateinamen als Parameter erhalten
- `jobtrix/components/GenerateForm.tsx` — Aufrufe von `openPdfPreview()` um Dateinamen ergänzen
- `jobtrix/lib/email.ts` — `buildFilename()` synchron anpassen (Nachname_Vorname-Schema)

**Namensschema:**
```
buildFilename("Anschreiben", profile.name)
→ z.B. "Anschreiben_Schieck_Falk.pdf"

Sonderzeichen werden sanitized, fehlender Name ergibt "Anschreiben.pdf".
```

**Logik:** `profile.name` enthält den vollen Namen (z.B. "Falk Schieck"). `buildFilename` splittet am Leerzeichen, nimmt den letzten Teil als Nachname und den Rest als Vorname, sodass `Anschreiben_Schieck_Falk.pdf` entsteht. Bei einem einteiligen Namen wird nur dieser verwendet.

**Mobile-Robustheit:** Zusätzlich zum `download`-Attribut wird `new File([blob], filename, { type: "application/pdf" })` statt `new Blob(...)` verwendet, damit der Dateiname auch bei mobilen Browsern übernommen wird, die das `download`-Attribut ignorieren.

### Modul 3: Race-Condition bei PDF-Erzeugung

**Betroffene Dateien:**
- `jobtrix/lib/download-pdf.ts` — `triggerDownload()` mit Blob-Validierung
- `jobtrix/components/PdfPreviewModal.tsx` — `PdfPreviewHost` Blob-Validierung im `useEffect`

**Strategie:**
- Nach `pdf(element).toBlob()` prüfen, ob `blob.size > 1024` (ein leeres PDF ist typischerweise ~200-800 Bytes)
- Wenn zu klein: einmalig retry mit 500ms Verzögerung
- Wenn nach Retry immer noch zu klein: Fehlerstatus setzen und dem Nutzer eine Fehlermeldung zeigen ("PDF konnte nicht erzeugt werden. Bitte erneut versuchen.")
- Im Email-Versand (serverseitig) die gleiche Prüfung einbauen, bevor Anhänge gesendet werden

### Modul 4: Hintergrund-Entfernung → Foto-Hinweis

**Entfernen:**
- `jobtrix/lib/remove-background.ts` — Datei löschen
- `jobtrix/components/OnboardingForm.tsx` (Zeile ~92) — `removeBackground()`-Import und -Aufruf entfernen
- `jobtrix/components/ProfileForm.tsx` (Zeile ~198) — `removeBackground()`-Import und -Aufruf entfernen
- UI-Toggle „Hintergrund entfernen" aus beiden Formularen entfernen
- Zugehörige Tests anpassen/entfernen

**Hinzufügen:**
- In `OnboardingForm.tsx` und `ProfileForm.tsx`: Beim Foto-Upload-Bereich einen Hinweistext anzeigen:
  > „Tipp: Fotografiere dich vor einem hellen, einfarbigen Hintergrund für ein professionelles Bewerbungsfoto."
- Übersetzungen für DE und EN in die i18n-Dateien aufnehmen

**Schnittstelle beibehalten (optional):**
Die `RemoveBackgroundOptions`-Schnittstelle und ein Stub `removeBackground()` können als dokumentierter Platzhalter erhalten bleiben, damit bei Bedarf ein ML-Modell (`@imgly/background-removal` o.Ä.) ohne Refactoring der Formulare eingehängt werden kann. Entscheidung: **Nein — YAGNI.** Komplett entfernen. Wenn ein ML-Modell kommt, ist das Interface in 5 Minuten neu geschrieben.

## Out of Scope

- ML-basierte Hintergrund-Entfernung (zu hoher Aufwand/Bundle-Size für den Nutzen)
- Nonce-basierte CSP (bereits als separates Follow-up in SECURITY-AUDIT.md notiert)
- Zusammenführung der duplizierten CSP-Konfiguration (next.config.mjs + security-headers.ts)

## Test Plan

1. **CSP-Fix:** Auf Android Chrome und iOS Safari die PDF-Vorschau öffnen — kein CSP-Fehler, PDF wird im Modal angezeigt
2. **Download-Namen:** PDF herunterladen auf Android/iOS — Dateiname enthält Bewerbernamen
3. **Vorschau-Download:** Aus dem Vorschau-Modal herunterladen — Dateiname enthält Bewerbernamen, nicht „Vorschau.pdf"
4. **Leere PDFs:** Generierung mehrfach hintereinander testen — kein leeres PDF mehr
5. **Foto-Hinweis:** Foto-Upload öffnen — Hinweistext sichtbar, kein „Hintergrund entfernen"-Toggle mehr
6. **Regression:** E-Mail-Versand testen — Anhänge haben sprechende Namen
7. **Regression:** Stripe-Checkout öffnen — `frame-src` blockiert Stripe nicht
8. **Desktop-Regression:** PDF-Vorschau am Desktop — öffnet weiterhin im neuen Tab
