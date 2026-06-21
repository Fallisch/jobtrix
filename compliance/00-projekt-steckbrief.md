# Projekt-Steckbrief — JobTRIX (Stand: 2026-06-21)

## 1. Produkt

**JobTRIX** ist eine SaaS-Bewerbungsplattform / Lebenslauf-Generator. Nutzer legen ein Profil an (Ausbildung, Berufserfahrung, Qualifikationen), suchen Stellenanzeigen und lassen per KI individuelle Bewerbungsunterlagen (Anschreiben, Lebenslauf, E-Mail-Entwurf) generieren. Die Unterlagen können als PDF heruntergeladen oder per E-Mail versendet werden.

**Zielgruppe**: Arbeitssuchende (B2C), volljährig, deutschsprachig (mit EN-Übersetzung).

## 2. Verantwortliche Stelle

| Feld | Wert |
|---|---|
| Firma | Faltrix GbR |
| Anschrift | Am Schulberg 10, 09569 Oederan |
| Bundesland | Sachsen |
| Vertretung | Falk Schieck, Patrick Matthes |
| Kontakt | faltrixgbr@gmail.com, Tel. 01726071910 |
| Rechtsform | GbR (Kleinunternehmer § 19 UStG) |
| Steuernummer | 220/153/00012 |
| USt-IdNr. | keine (Kleinunternehmer) |
| Aufsichtsbehörde | Sächsischer Datenschutz- und Transparenzbeauftragter |

## 3. Rollen je Verarbeitung

| Rolle | Kontext |
|---|---|
| **Verantwortlicher** (Art. 4 Nr. 7) | Eigene Endnutzer-/Kundendaten |
| Auftragsverarbeiter (Art. 28) | Nein — kein B2B-SaaS, keine Datenverarbeitung im Auftrag Dritter |

## 4. Personenbezogene Datenarten

| Kategorie | Datenfelder |
|---|---|
| Stamm-/Kontaktdaten | Name, Adresse, E-Mail, Telefon, Geburtsdatum |
| Zugangsdaten | E-Mail, Passwort-Hash (bcrypt), Session-Token |
| Profildaten | Ausbildung, Berufserfahrung, Qualifikationen, Interessen, Foto |
| Bewerbungshistorie | Jobtitel, Firma, Anschreiben, Lebenslauf, E-Mail-Text, Profil-Snapshot |
| Zahlungsdaten | Stripe-Payment-ID, Pakettyp, Gültigkeitsdatum (keine Kreditkartendaten lokal) |
| Nutzungs-/Logdaten | Audit-Logs (Aktion, User-ID, Detail, IP-Adresse, Zeitstempel) |
| Besondere Kategorien (Art. 9) | **Keine** |
| Beschäftigtendaten | **Keine** (kein Mitarbeitermanagement) |
| Daten Minderjähriger | **Keine** (Zielgruppe: Arbeitssuchende, volljährig) |

## 5. Betroffenengruppen

- Registrierte Nutzer (Arbeitssuchende)
- Websitebesucher (ohne Registrierung: keine PII-Erfassung außer technisch notwendige Cookies)

## 6. Zwecke + Rechtsgrundlage

| Verarbeitung | Zweck | Rechtsgrundlage |
|---|---|---|
| Registrierung/Login | Vertragsdurchführung | Art. 6 Abs. 1 lit. b |
| Profilspeicherung | Bewerbungsgenerierung | Art. 6 Abs. 1 lit. b |
| KI-Generierung (Anthropic) | Bewerbungserstellung | Art. 6 Abs. 1 lit. b |
| Bewerbungshistorie | Nachvollziehbarkeit | Art. 6 Abs. 1 lit. b |
| Jobsuche (Arbeitsagentur) | Stellensuche | Art. 6 Abs. 1 lit. b |
| Zahlungsabwicklung (Stripe) | Vertragsdurchführung | Art. 6 Abs. 1 lit. b |
| E-Mail-Versand (Resend) | Bewerbungsversand | Art. 6 Abs. 1 lit. b |
| Passwort-Reset-E-Mail | Kontoverwaltung | Art. 6 Abs. 1 lit. f |
| Audit-Logging | Sicherheit & Missbrauchserkennung | Art. 6 Abs. 1 lit. f |

## 7. Dienste/Tools

| Dienst | Anbieter | Funktion | PII | Hosting-Region | Sitz |
|---|---|---|---|---|---|
| PostgreSQL (Supabase) | Supabase Inc. | Datenbank | Ja | EU | USA |
| Render | Render Inc. | App-Hosting | Ja | EU (Frankfurt) | USA |
| Cloudflare | Cloudflare Inc. | CDN, DNS, WAF | Ja (Transit) | Global Edge | USA |
| Stripe | Stripe Inc. | Zahlungsabwicklung | Ja | Global | USA |
| Anthropic Claude API | Anthropic PBC | KI-Textgenerierung | Ja | USA | USA |
| Resend | Resend Inc. | E-Mail-Versand | Ja | [prüfen] | USA |
| Arbeitsagentur API | Bundesagentur für Arbeit | Jobsuche | Nein (nur Suchbegriffe) | DE | DE |
| NextAuth | OSS-Bibliothek | Auth/Session | lokal | – | – |

## 8. Datenflüsse & Drittland

| Dienst | Daten an Drittland? | Transfermechanismus |
|---|---|---|
| Anthropic | Ja (USA) — Profildaten + Stellenanzeige | [PRÜFEN: DPF-Status] |
| Stripe | Ja (USA) — Payment-IDs | DPF-zertifiziert |
| Resend | Ja (USA) — E-Mail-Adressen + Inhalte | [PRÜFEN: DPF-Status] |
| Render | Nein (EU-Server), aber US-Firma | DPF + EU-Region |
| Supabase | Nein (EU-Server), aber US-Firma | DPF + EU-Region |
| Cloudflare | Transit über Edge-Server | DPF-zertifiziert |

## 9. Feature-Trigger

| Trigger | Status | Konsequenz |
|---|---|---|
| Cookies/LocalStorage | Nur technisch notwendig (Session) | Kein Consent-Banner nötig |
| KI/LLM-Features | Ja (Anthropic Claude) | AI-Act-Einordnung erforderlich |
| Buchungs-/Finanzdaten | Ja (Stripe Payments) | GoBD-Verfahrensdoku |
| Öffentliche Weboberfläche | Ja | Impressum ✅, BFSG prüfen |
| Newsletter/Marketing | Nein | n.z. |
| Profiling/Art. 22 | Nein (Nutzer entscheidet über Verwendung) | n.z. |
| Beschäftigtendaten | Nein | n.z. |
| Angebot an Minderjährige | Nein | n.z. |

## 10. Aufbewahrung/Löschung

| Daten | Aktuelle Regelung |
|---|---|
| Nutzerkonto + Profil | Bis Konto-Löschung (Self-Service vorhanden, Cascade Delete) |
| Bewerbungshistorie | Bis Konto-Löschung (Cascade Delete) |
| Audit-Logs (mit IP) | **Keine Löschfrist definiert** → offen |
| Stripe-Payment-IDs | Cascade Delete bei Konto-Löschung → **Konflikt mit § 147 AO** |

## 11. Vorhandene Sicherheit (TOM)

- [x] Passwort-Hashing: bcrypt
- [x] HSTS: max-age=63072000, includeSubDomains, preload
- [x] CSP: restriktiv konfiguriert
- [x] Security Headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- [x] Rate Limiting auf API-Endpunkten
- [x] Input-Validierung: Zod-Schemas
- [x] Audit-Logging: Login-Fehler, Account-Aktionen, Webhooks
- [x] Re-Auth vor Account-Löschung
- [x] Fetch-Timeouts (15s) für externe APIs
- [ ] Verschlüsselung at rest: abhängig von Supabase-Konfiguration
- [ ] Backup-Strategie: abhängig von Hosting
- [ ] Zugriffskontrolle Produktionssysteme: [definieren]
