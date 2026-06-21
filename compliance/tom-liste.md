# Technisch-organisatorische Maßnahmen (TOM) — JobTRIX

**Rechtsgrundlage**: Art. 32 DSGVO
**Stand**: 2026-06-21

---

## 1. Vertraulichkeit

### 1.1 Zugriffskontrolle (Authentifizierung)
- Nutzer-Authentifizierung über NextAuth mit E-Mail/Passwort
- Passwort-Hashing mit bcrypt (Salt-Rounds gemäß Library-Default)
- Session-basierte Authentifizierung mit JWT-Token
- Re-Authentifizierung (Passwort-Bestätigung) vor sicherheitskritischen Aktionen (Account-Löschung)
- Rate Limiting auf Login- und API-Endpunkten

### 1.2 Zugangskontrolle (Autorisierung)
- Middleware-basierter Routenschutz: geschützte Pfade (/profile, /generate, /application-history) erfordern gültige Session
- API-Endpunkte prüfen Session via `getServerSession()`
- Nutzer können nur eigene Daten einsehen und bearbeiten (User-ID aus Session)
- Keine Admin-Oberfläche mit direktem DB-Zugriff in der App

### 1.3 Zugriff auf Produktionssysteme
- [DEFINIEREN: SSH-Zugang zu Render, Supabase-Dashboard, Stripe-Dashboard]
- [DEFINIEREN: Wer hat Zugang? MFA aktiviert?]

### 1.4 Transportverschlüsselung
- HSTS: `max-age=63072000; includeSubDomains; preload`
- Alle API-Aufrufe an externe Dienste über HTTPS
- Cloudflare SSL/TLS für die Domain

### 1.5 Verschlüsselung at rest
- Supabase: [PRÜFEN: Verschlüsselung der PostgreSQL-Daten at rest]
- Render: [PRÜFEN: Verschlüsselung des Dateisystems]
- Lokal (Entwicklung): Docker-Volume ohne Verschlüsselung (Entwicklungsumgebung)

---

## 2. Integrität

### 2.1 Input-Validierung
- Zod-Schemas für alle API-Eingaben (Registrierung, Profil, Generierung, Checkout)
- Server-seitige Validierung vor jeder Verarbeitung
- HTML-Sanitierung in sicherheitsrelevanten Feldern

### 2.2 Security Headers
| Header | Wert |
|---|---|
| Content-Security-Policy | Restriktiv: self + fonts.googleapis.com + checkout.stripe.com |
| X-Frame-Options | DENY |
| X-Content-Type-Options | nosniff |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | camera=(), microphone=(), geolocation=(), interest-cohort=() |
| X-DNS-Prefetch-Control | off |

### 2.3 Webhook-Sicherheit
- Stripe-Webhook-Signaturprüfung
- Idempotenz-Prüfung bei Webhook-Verarbeitung

### 2.4 Audit-Logging
- Protokollierte Aktionen: login_failed, account_deleted, account_exported, checkout_created, webhook_processed, email_sent, password_reset_requested, password_reset_completed
- Gespeicherte Daten: Aktion, User-ID, Detail, IP-Adresse, Zeitstempel
- Audit-Logging ist fehlerresistent (darf nie den Request abbrechen)

---

## 3. Verfügbarkeit und Belastbarkeit

### 3.1 Hosting
- App: Render (Managed Hosting, EU Frankfurt)
- DB: Supabase (Managed PostgreSQL, EU)
- CDN/WAF: Cloudflare (DDoS-Schutz, globales Edge-Netzwerk)

### 3.2 Backup
- [DEFINIEREN: Supabase automatische Backups — Frequenz und Aufbewahrung]
- [DEFINIEREN: Render — Backup-Strategie für App-Daten]

### 3.3 Timeouts und Resilience
- Fetch-Timeouts: 15 Sekunden für alle externen API-Aufrufe (Anthropic, Resend, Arbeitsagentur)
- AbortController-basierte Timeout-Implementierung

---

## 4. Regelmäßige Überprüfung

### 4.1 Sicherheitsprüfungen
- Security-Härtung durchgeführt: Rate-Limits, Input-Validierung, CSP (Stand: Juni 2026)
- Purple-Team-Endkontrolle durchgeführt (Stand: Juni 2026)
- [DEFINIEREN: Turnus für regelmäßige Überprüfung (z. B. halbjährlich)]

### 4.2 Dependency-Updates
- [DEFINIEREN: Turnus für npm-Dependency-Updates und Sicherheitspatches]

---

## 5. Datensparsamkeit (Art. 25)

- Keine Speicherung von Kreditkartendaten (Stripe übernimmt PCI-DSS-konforme Verarbeitung)
- Keine Analytics oder Tracking (keine Drittanbieter-Cookies)
- Passwörter werden nur als bcrypt-Hash gespeichert
- Profil-Foto wird als Base64 in der DB gespeichert (kein externer Bilddienst)
- Audit-Logs enthalten minimale Daten (Aktion + ID + IP)
- [OFFEN: Audit-Log-Löschfrist implementieren, um Datensparsamkeit sicherzustellen]
