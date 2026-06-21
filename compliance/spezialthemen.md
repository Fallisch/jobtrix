# Spezialthemen — JobTRIX

**Stand**: 2026-06-21

---

## 1. EU-AI-Act — KI-Textgenerierung (Issue #118)

**Rechtsgrundlage**: VO (EU) 2024/1689

### Sachverhalt
JobTRIX nutzt die Anthropic Claude API zur Generierung von Bewerbungsunterlagen (Anschreiben, Lebenslauf, E-Mail-Text) aus Nutzerprofildaten und Stellenanzeige.

### Rollenbestimmung
- **Anthropic**: Anbieter (Provider) des KI-Modells
- **Faltrix GbR**: Betreiber (Deployer) — setzt das KI-System in einem eigenen Produkt ein

### Risikoklassifizierung

| Klasse | Prüfung | Ergebnis |
|---|---|---|
| **Verboten** (Art. 5) | Social Scoring, biometrisches Profiling, Manipulation | Nein |
| **Hochrisiko** (Art. 6, Annex III) | KI in Beschäftigung/Personalwesen: „KI-Systeme, die bestimmungsgemäß für die Einstellung oder Auswahl natürlicher Personen verwendet werden sollen" | **Wahrscheinlich nein** — JobTRIX trifft keine Einstellungsentscheidung. Der Nutzer generiert Bewerbungstexte als Werkzeug und entscheidet selbst über Inhalt und Versand. |
| **Begrenztes Risiko** (Art. 50) | Generative KI → Transparenzpflichten | **Ja** |
| **Minimales Risiko** | Restliche KI-Systeme | Falls begrenztes Risiko nicht greift |

### Transparenzpflichten (Art. 50)

Als Deployer eines Systems mit generativer KI:

1. **Information über KI-Einsatz**: Nutzer müssen wissen, dass Inhalte KI-generiert sind
   - **Aktueller Stand**: AGB enthalten KI-Haftungsausschluss ✅
   - **Offen**: Hinweis direkt bei der Generierung (z. B. Label „KI-generiert" am Ergebnis) — [PRÜFEN ob Art. 50 Abs. 4 dies verlangt]

2. **Kennzeichnung KI-generierter Inhalte**: Synthetische Inhalte müssen als solche erkennbar sein
   - Die generierten PDFs sollten einen dezenten Hinweis enthalten (z. B. „Erstellt mit KI-Unterstützung")
   - [PRÜFEN: Ist eine Kennzeichnung der PDF-Ausgabe erforderlich?]

### Zeitplan AI-Act
- Verbote: seit 02.02.2025 wirksam
- Transparenzpflichten für GPAI: ab 02.08.2025
- Hochrisiko-Pflichten: ab 02.08.2026

### Ergebnis
**Begrenztes Risiko mit Transparenzpflichten.** Die AGB-Klausel ist ein guter Anfang, aber ein direkter Hinweis bei der Generierung sollte geprüft werden.

---

## 2. BFSG — Barrierefreiheit (Issue #119)

**Rechtsgrundlage**: Barrierefreiheitsstärkungsgesetz (BFSG), gilt seit 28.06.2025

### Anwendbarkeit

| Kriterium | Prüfung |
|---|---|
| B2C-Produkt/Dienstleistung | Ja — JobTRIX ist ein B2C-Webdienst |
| Im Anwendungsbereich (§ 1 BFSG) | Ja — Webdienst mit E-Commerce-Funktion (Bezahlung) |
| Kleinstunternehmen-Ausnahme (§ 3 Abs. 3) | **Zu prüfen** |

### Kleinstunternehmen-Ausnahme

Nach § 3 Abs. 3 BFSG sind **Kleinstunternehmen, die Dienstleistungen erbringen**, von den Anforderungen ausgenommen. Kleinstunternehmen = weniger als 10 Beschäftigte UND Jahresumsatz/-bilanzsumme ≤ 2 Mio. €.

- Faltrix GbR: 2 Personen → **unter 10 Beschäftigte** ✅
- Jahresumsatz: voraussichtlich **weit unter 2 Mio. €** ✅
- Erbringt Dienstleistungen (SaaS): ✅

**Voraussichtliches Ergebnis**: Die Ausnahme greift. Dokumentieren und bei Wachstum neu prüfen.

### Empfehlung (unabhängig von Pflicht)

Auch ohne gesetzliche Pflicht verbessert Barrierefreiheit die Nutzbarkeit:
- Semantisches HTML (headings, landmarks)
- Ausreichende Farbkontraste
- Keyboard-Navigation
- Alt-Texte
- Focus-Management bei Modals

### Ergebnis
**Voraussichtlich n.z.** dank Kleinstunternehmen-Ausnahme. Dokumentiert und bei Wachstum erneut prüfen.

---

## 3. Cookies / TTDSG (§ 25 TDDDG)

### Prüfung
JobTRIX verwendet ausschließlich **technisch notwendige Cookies**:
- NextAuth Session-Cookie (Authentifizierung)
- next-intl Locale-Präferenz (Spracheinstellung)
- Theme-Präferenz (Hell/Dunkel)

Es werden **keine** eingesetzt:
- Tracking-Cookies
- Analytics-Pixel
- Werbe-Cookies
- Fingerprinting

### Service Worker (PWA)
Der Service Worker (Workbox) cached statische Assets und Seiten für Offline-Nutzung. Es werden **keine personenbezogenen Daten** im Cache gespeichert (nur statische Assets, Fonts, JS/CSS).

### Ergebnis
**n.z.** — Kein Cookie-Consent-Banner erforderlich, da ausschließlich technisch notwendige Cookies/Storage. In der Datenschutzerklärung ist dies korrekt beschrieben.

---

## 4. Marketing-Einwilligung / Newsletter (§ 7 UWG)

**n.z.** — JobTRIX versendet keinen Newsletter und keine Werbe-E-Mails. E-Mails werden nur auf explizite Nutzeranfrage versendet (Bewerbung, Passwort-Reset).

---

## 5. Profiling / Automatisierte Einzelentscheidung (Art. 22)

**n.z.** — JobTRIX trifft keine automatisierten Entscheidungen mit rechtlicher oder erheblicher Wirkung. Die KI generiert Texte, die der Nutzer selbst prüft und verwendet.

---

## 6. Beschäftigtendaten (§ 26 BDSG)

**n.z.** — JobTRIX verarbeitet keine Mitarbeiterdaten. Es handelt sich nicht um ein HR-Tool für Arbeitgeber.

---

## 7. Daten Minderjähriger (Art. 8)

**n.z.** — Zielgruppe sind volljährige Arbeitssuchende. Es gibt keine Altersprüfung, aber das Produkt richtet sich nicht an Minderjährige und bietet keine für Minderjährige relevante Funktionalität.
