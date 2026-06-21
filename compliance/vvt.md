# Verzeichnis von Verarbeitungstätigkeiten — JobTRIX

**Verantwortlicher**: Faltrix GbR, Am Schulberg 10, 09569 Oederan
**Stand**: 2026-06-21

---

## VT-01: Nutzerregistrierung und Login

| Feld | Inhalt |
|---|---|
| **Zweck** | Erstellung und Verwaltung von Nutzerkonten, Authentifizierung |
| **Rechtsgrundlage** | Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) |
| **Betroffene** | Registrierte Nutzer |
| **Datenarten** | E-Mail-Adresse, Passwort-Hash (bcrypt), Session-Token, Zeitstempel |
| **Empfänger** | Keine Weitergabe an Dritte |
| **Drittlandtransfer** | Nein (Daten verbleiben in EU-Datenbank) |
| **Löschfrist** | Bei Konto-Löschung durch Nutzer (Cascade Delete) |
| **TOM-Verweis** | Passwort-Hashing, Rate Limiting, HSTS, CSP |

---

## VT-02: Profilspeicherung

| Feld | Inhalt |
|---|---|
| **Zweck** | Speicherung persönlicher Daten zur Erstellung von Bewerbungsunterlagen |
| **Rechtsgrundlage** | Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) |
| **Betroffene** | Registrierte Nutzer |
| **Datenarten** | Name, Adresse, E-Mail, Telefon, Geburtsdatum, Foto, Ausbildung, Berufserfahrung, Qualifikationen, Interessen |
| **Empfänger** | Anthropic (bei Generierung, siehe VT-03) |
| **Drittlandtransfer** | Ja, bei Generierung → USA (Anthropic), siehe VT-03 |
| **Löschfrist** | Bei Konto-Löschung durch Nutzer (Cascade Delete) |
| **TOM-Verweis** | Zugriffskontrolle (Auth), Transportverschlüsselung, Input-Validierung |

---

## VT-03: KI-gestützte Bewerbungsgenerierung

| Feld | Inhalt |
|---|---|
| **Zweck** | Erstellung individueller Bewerbungsunterlagen (Anschreiben, Lebenslauf, E-Mail-Entwurf) mittels Anthropic Claude API |
| **Rechtsgrundlage** | Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) |
| **Betroffene** | Registrierte Nutzer |
| **Datenarten** | Profildaten (Name, Adresse, Ausbildung, Erfahrung, Qualifikationen), Stellenanzeige-Text |
| **Empfänger** | Anthropic PBC (San Francisco, USA) — als Auftragsverarbeiter |
| **Drittlandtransfer** | Ja → USA. Transfermechanismus: [PRÜFEN: DPF-Zertifizierung Anthropic] |
| **Löschfrist** | Daten werden nur zur Verarbeitung übermittelt; Anthropic API speichert keine Eingaben dauerhaft (API-Nutzungsbedingungen prüfen) |
| **TOM-Verweis** | Transportverschlüsselung (HTTPS), Rate Limiting, Timeout (15s) |

---

## VT-04: Bewerbungshistorie

| Feld | Inhalt |
|---|---|
| **Zweck** | Speicherung generierter Bewerbungsunterlagen zur Nachvollziehbarkeit und Wiederverwendung |
| **Rechtsgrundlage** | Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) |
| **Betroffene** | Registrierte Nutzer |
| **Datenarten** | Jobtitel, Firmenname, E-Mail-Betreff, Anschreiben, Lebenslauf, E-Mail-Text, Profil-Snapshot, Template, Akzentfarbe, CV-Stil |
| **Empfänger** | Keine Weitergabe an Dritte |
| **Drittlandtransfer** | Nein |
| **Löschfrist** | Bei Konto-Löschung durch Nutzer (Cascade Delete) |
| **TOM-Verweis** | Zugriffskontrolle (Auth), Transportverschlüsselung |

---

## VT-05: Jobsuche

| Feld | Inhalt |
|---|---|
| **Zweck** | Suche nach Stellenanzeigen über die API der Bundesagentur für Arbeit |
| **Rechtsgrundlage** | Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) |
| **Betroffene** | Registrierte Nutzer |
| **Datenarten** | Suchbegriffe, Standortangaben (vom Nutzer eingegeben) |
| **Empfänger** | Bundesagentur für Arbeit (öffentliche API) |
| **Drittlandtransfer** | Nein (Server in Deutschland) |
| **Löschfrist** | Keine Speicherung — Daten werden nur durchgeleitet |
| **TOM-Verweis** | Transportverschlüsselung (HTTPS), Timeout |

---

## VT-06: Zahlungsabwicklung

| Feld | Inhalt |
|---|---|
| **Zweck** | Abwicklung kostenpflichtiger Pakete (Limited, Lifetime) |
| **Rechtsgrundlage** | Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) |
| **Betroffene** | Zahlende Nutzer |
| **Datenarten** | Stripe-Payment-ID, Pakettyp, Gültigkeitsdatum. Kreditkarten-/Bankdaten werden ausschließlich von Stripe verarbeitet. |
| **Empfänger** | Stripe Inc. (USA) — als Auftragsverarbeiter |
| **Drittlandtransfer** | Ja → USA. Transfermechanismus: DPF-zertifiziert |
| **Löschfrist** | Bei Konto-Löschung (Cascade Delete). **Achtung**: Steuerliche Aufbewahrungspflicht (§ 147 AO, 10 Jahre) → anonymisierte Archivierung erforderlich |
| **TOM-Verweis** | Stripe PCI-DSS-Zertifizierung, Webhook-Signaturprüfung, Idempotenz |

---

## VT-07: E-Mail-Versand

| Feld | Inhalt |
|---|---|
| **Zweck** | Versand von Bewerbungs-E-Mails und kontobezogenen E-Mails (Passwort-Reset) |
| **Rechtsgrundlage** | Art. 6 Abs. 1 lit. b (Bewerbungsversand), Art. 6 Abs. 1 lit. f (Passwort-Reset: berechtigtes Interesse) |
| **Betroffene** | Registrierte Nutzer |
| **Datenarten** | E-Mail-Adresse, E-Mail-Inhalte (Bewerbungstexte bzw. Reset-Link) |
| **Empfänger** | Resend Inc. (USA) — als Auftragsverarbeiter |
| **Drittlandtransfer** | Ja → USA. Transfermechanismus: [PRÜFEN: DPF-Zertifizierung Resend] |
| **Löschfrist** | Keine lokale Speicherung der E-Mail-Inhalte (nur Bewerbungshistorie, siehe VT-04) |
| **TOM-Verweis** | Transportverschlüsselung (HTTPS), API-Key-Authentifizierung, Timeout |

---

## VT-08: Audit-Logging

| Feld | Inhalt |
|---|---|
| **Zweck** | Sicherheitsüberwachung, Missbrauchserkennung, Nachvollziehbarkeit sicherheitsrelevanter Aktionen |
| **Rechtsgrundlage** | Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse: IT-Sicherheit) |
| **Betroffene** | Registrierte Nutzer, fehlgeschlagene Login-Versuche |
| **Datenarten** | Aktion (login_failed, account_deleted, etc.), User-ID, Detail-Text, IP-Adresse, Zeitstempel |
| **Empfänger** | Keine Weitergabe an Dritte |
| **Drittlandtransfer** | Nein |
| **Löschfrist** | [DEFINIEREN: 90 Tage vorgeschlagen] |
| **TOM-Verweis** | Zugriffsbeschränkung auf DB-Ebene |

---

## VT-09: Hosting und Infrastruktur

| Feld | Inhalt |
|---|---|
| **Zweck** | Betrieb der Webanwendung und Datenbank |
| **Rechtsgrundlage** | Art. 6 Abs. 1 lit. b/f DSGVO |
| **Betroffene** | Alle Nutzer und Besucher |
| **Datenarten** | Alle in der Anwendung verarbeiteten Daten |
| **Empfänger** | Render Inc. (Hosting), Supabase Inc. (Datenbank), Cloudflare Inc. (CDN/DNS/WAF) |
| **Drittlandtransfer** | Render: EU-Server, US-Firma (DPF). Supabase: EU-Server, US-Firma (DPF). Cloudflare: globales Edge (DPF). |
| **Löschfrist** | Gemäß den einzelnen Verarbeitungstätigkeiten |
| **TOM-Verweis** | Managed Hosting, DDoS-Schutz (Cloudflare WAF), Verschlüsselung |
