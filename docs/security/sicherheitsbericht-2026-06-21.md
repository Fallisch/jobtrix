# Sicherheitsbericht — JobTRIX

**Datum:** 21. Juni 2026
**Erstellt von:** Security-Audit (automatisiert + manuelle gegnerische Analyse)
**Projekt:** JobTRIX — KI-gestuetzte Bewerbungsplattform
**Stack:** Next.js 14 (App Router) · Prisma · PostgreSQL (Supabase) · NextAuth (JWT) · Stripe · Resend · Anthropic Claude API
**Hosting:** Render (App) · Supabase (DB) · Cloudflare (DNS/CDN)
**Status:** **Live** unter jobtrix.de

---

## 1. Management-Zusammenfassung

Am 21.06.2026 wurde eine umfassende Sicherheitspruefung der JobTRIX-Plattform
durchgefuehrt, bestehend aus:

1. **Statischem API Security Audit** (OWASP API Top 10)
2. **Purple-Team-Endkontrolle** (gegnerische Angriffssimulation)
3. **Umfassender Haertung** (alle Findings sofort behoben)

### Ergebnis

| Kennzahl | Wert |
|---|---|
| Geprueft | 16 API-Endpunkte, Auth-Schicht, DB-Schema, Security-Headers, externe Integrationen |
| Findings gesamt | 14 (0 Critical, 0 High, 11 Medium, 3 Low) |
| Davon behoben | **14 von 14 (100 %)** |
| Offene Findings | **0** |
| Deployment-Blocker | **Keine** |
| Freigabe | **Freigabefaehig** |

---

## 2. Methodik

### 2.1 Statischer API Security Audit

Jeder API-Endpunkt wurde gegen die **OWASP API Security Top 10 (2023)** geprueft:

| Kategorie | Thema | Ergebnis |
|---|---|---|
| API1 | BOLA / IDOR — Zugriff auf fremde Objekte | 🟢 Sicher |
| API2 | Broken Authentication | 🟢 Sicher |
| API3 | Object Property Level Access | 🟢 Sicher |
| API4 | Resource Consumption | 🟢 Sicher (nach Haertung) |
| API5 | Function Level Authorization | 🟢 Sicher |
| API6 | Sensitive Business Flows | 🟢 Sicher (nach Haertung) |
| API7 | SSRF | 🟢 Sicher |
| API8 | Security Misconfiguration | 🟢 Sicher (nach Haertung) |
| API9 | Improper Inventory Management | 🟢 Sicher |
| API10 | Unsafe Consumption of APIs | 🟢 Sicher (nach Haertung) |

### 2.2 Purple-Team-Endkontrolle

Gegnerische Sicherheits-Endkontrolle mit dem Ansatz: **erst verteidigen, dann
angreifen, dann beweisen.** Angreifer-Profile: anonymer Nutzer, boesw. eingeloggter
Nutzer, kompromittierter Account, externer Angreifer (Webhook-Faelschung).

---

## 3. Findings und Behebung

### 3.1 Rate-Limiting (4 Findings — alle behoben)

**Vor der Haertung:** Nur Auth-Endpunkte (Login, Register, Forgot-Password) waren
rate-limited. Alle anderen Endpunkte konnten unbegrenzt aufgerufen werden.

**Nach der Haertung:** Jeder Endpunkt hat ein Rate-Limit:

| Endpunkt | Limit | Zweck |
|---|---|---|
| POST /api/auth/register | 5 / 15 min (IP) | Registrierungs-Spam |
| POST /api/auth/forgot-password | 5 / 15 min (IP) | Brute-Force |
| POST /api/auth/reset-password | 5 / 15 min (IP) | Token-Brute-Force |
| POST /api/generate | 10 / 15 min (User) | KI-API-Kosten |
| POST /api/send-email | 5 / 15 min (User) | E-Mail-Relay-Missbrauch |
| GET /api/jobsuche | 30 / 15 min (User) | Externe API-Erschoepfung |
| POST /api/checkout | 5 / 15 min (User) | Checkout-Spam |
| POST /api/profile | 20 / 15 min (User) | Speicher-Spam |
| POST /api/account/delete | 3 / 15 min (User) | Passwort-Brute-Force |
| POST /api/account/export | 3 / 15 min (User) | Datenexport-Missbrauch |

**Issues:** #101, #102, #103

### 3.2 Input-Validierung (3 Findings — alle behoben)

**Vor der Haertung:** /api/generate und /api/send-email akzeptierten beliebig
grosse Payloads ohne Validierung. Profile-Schema erlaubte unbegrenzte Arrays
und unbegrenzt grosse Foto-Strings.

**Nach der Haertung:**

- **generateRequestSchema** — Zod-Schema mit `jobPosting.max(50_000)`, Enums
  fuer Template/Style, Profile-Sub-Schema
- **sendEmailSchema** — Zod-Schema mit `subject.max(1000)`, `body.max(10_000)`,
  `coverLetter.max(50_000)`, `cv.max(50_000)`
- **profileSchema** — Sub-Schemas fuer Education/Experience/Skills mit
  `maxItems(50)`, `photo.max(500_000)`, keine `z.any()` mehr

**Issues:** #104, #105, #106

### 3.3 Content Security Policy (1 Finding — behoben)

**Vor der Haertung:** CSP enthielt `'unsafe-eval'` in `script-src`.

**Nach der Haertung:** `'unsafe-eval'` entfernt. `'unsafe-inline'` bleibt
vorerst (fuer Next.js Hydration erforderlich; Nonce-basierte CSP als
Folgemassnahme empfohlen).

**Issue:** #107

### 3.4 Stripe-Webhook-Idempotenz (1 Finding — behoben)

**Problem:** Stripe-Webhooks konnten doppelt verarbeitet werden (Retry-Verhalten).
Bei `limited`-Paketen wurde `validUntil` vom aktuellen Zeitpunkt neu berechnet,
was den Zugang effektiv verlaengerte.

**Loesung:** Neue DB-Tabelle `ProcessedWebhookEvent` mit Unique-Constraint auf
`eventId`. Jeder Event wird vor Verarbeitung gegen die Tabelle geprueft.
Duplikate werden still ignoriert.

### 3.5 Checkout-Duplikat-Schutz (1 Finding — behoben)

**Problem:** Nutzer konnten beliebig viele Checkout-Sessions parallel oeffnen
und potenziell doppelt bezahlen.

**Loesung:** Vor Checkout-Erstellung wird geprueft, ob der Nutzer bereits ein
aktives Package hat. Falls ja: HTTP 409 (Conflict).

### 3.6 Fetch-Timeouts (1 Finding — behoben)

**Problem:** Externe API-Calls (Resend, Arbeitsagentur) hatten keinen Timeout.
Ein haengender externer Service konnte Server-Worker blockieren.

**Loesung:** `AbortController` mit 15-Sekunden-Timeout auf alle externen
`fetch()`-Calls in `lib/email.ts` und `app/api/jobsuche/route.ts`.

### 3.7 HTML-Sanitierung (1 Finding — behoben)

**Problem:** Stellenbeschreibungen der Arbeitsagentur-API wurden ungeprueft an
den Client weitergeleitet. Falls HTML enthalten: potenzielles XSS-Risiko.

**Loesung:** `raw.replace(/<[^>]*>/g, "")` vor der Weitergabe. Zusaetzlich:
kein `dangerouslySetInnerHTML` im gesamten Frontend (React escaped automatisch).

### 3.8 Account-Export Re-Authentifizierung (1 Finding — behoben)

**Problem:** `/api/account/export` gab alle persoenlichen Daten mit nur einer
gueltigen Session zurueck. Bei kompromittierter Session: vollstaendige
Datenexfiltration ohne zusaetzliche Pruefung.

**Loesung:** Export von GET auf POST umgestellt. Erfordert jetzt
Passwort-Bestaetigung (analog zu Account-Loeschung). Frontend zeigt
Passwort-Dialog vor dem Download.

### 3.9 Error-Logging Sanitierung (1 Finding — behoben)

**Problem:** `console.error("[/api/generate] Fehler:", err)` loggte das
vollstaendige Error-Objekt, das potenziell DB-Credentials oder API-Keys
enthalten konnte.

**Loesung:** Nur noch `err.message` wird geloggt:
`console.error("[/api/generate] Fehler:", err instanceof Error ? err.message : "unknown")`

### 3.10 Zusaetzliche Haertungsmassnahmen

| Massnahme | Detail |
|---|---|
| **JWT maxAge reduziert** | Von 30 Tage auf 7 Tage — kleineres Zeitfenster bei gestohlenen Sessions |
| **Permissions-Policy Header** | `camera=(), microphone=(), geolocation=(), interest-cohort=()` — Browser-Features deaktiviert, FLoC blockiert |
| **X-DNS-Prefetch-Control** | `off` — verhindert DNS-Prefetch-Leaks |
| **Fail-fast bei fehlenden API-Keys** | Stripe, Anthropic, Stripe-Webhook: HTTP 503 statt leerer Key an SDK weitergeben |
| **Audit-Logging** | Neue `AuditLog`-Tabelle fuer: Login-Versuche (inkl. fehlgeschlagene), Account-Loeschung, Datenexport, Checkout-Erstellung, Webhook-Verarbeitung, E-Mail-Versand |
| **Build-Pipeline** | `prisma migrate deploy` automatisch vor `next build` — Migrationen werden nie vergessen |

---

## 4. Sicherheitsarchitektur (Ist-Zustand)

### 4.1 Authentifizierung

| Aspekt | Implementierung |
|---|---|
| Auth-Framework | NextAuth v4 mit JWT-Strategie |
| Passwort-Hashing | bcrypt (Rounds=10) |
| Session-Dauer | 7 Tage (JWT) |
| Login-Schutz | Rate-Limit (5/15min pro E-Mail) |
| Passwort-Reset | HMAC-signierter Token, `timingSafeEqual`, Password-Fingerprint, 1h Ablauf |
| Token-Reuse nach Reset | Verhindert (Password-Fingerprint aendert sich) |

### 4.2 Autorisierung

| Aspekt | Implementierung |
|---|---|
| Auth-Gate | `getServerSession(authOptions)` auf allen 14 geschuetzten Endpunkten |
| Tenant-Isolation | `session.user.id` als einzige Quelle fuer userId — nie aus Body/Query |
| BOLA-Schutz | Ownership-Check auf `/application-history/[id]` (404 fuer beide Faelle) |
| Rollen | Keine Admin-Rolle, keine Privilege-Escalation moeglich |

### 4.3 Eingabe-Validierung

| Aspekt | Implementierung |
|---|---|
| Framework | Zod-Schemas mit maxLength, maxItems, Enum-Constraints |
| Abdeckung | Alle POST-Endpunkte mit Eingabe-Body |
| SQL-Injection | Prisma (parametrisierte Queries, kein String-Concat) |
| XSS | React auto-escaping, kein `dangerouslySetInnerHTML`, CSP aktiv |

### 4.4 Security-Headers

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; ...
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
X-DNS-Prefetch-Control: off
```

### 4.5 Externe Integrationen

| Dienst | Sicherung |
|---|---|
| **Stripe** | Webhook-Signatur (`constructEvent`), Idempotenz-Check, Fail-fast bei fehlendem Key |
| **Resend** | API-Key nur in Env, 15s Timeout, Header-Injection-Sanitierung auf From/Reply-To |
| **Anthropic** | API-Key nur in Env, Fail-fast bei fehlendem Key, Rate-Limit pro User |
| **Arbeitsagentur** | Hardcoded Base-URL (kein SSRF), 15s Timeout, HTML-Sanitierung der Responses |

### 4.6 Secrets-Management

| Aspekt | Status |
|---|---|
| Secrets im Code | Keine — nur `process.env.*` |
| `.env.local` | In `.gitignore` |
| Committed `.env` | Nur unkritische Entwicklungswerte (lokale DB-URL) |
| Produktions-Secrets | Ausschliesslich ueber Render-Umgebungsvariablen |

---

## 5. Empfehlungen fuer die Zukunft

| Prioritaet | Massnahme | Aufwand |
|---|---|---|
| Mittel | Nonce-basierte CSP (eliminiert `'unsafe-inline'` fuer Scripts) | 4–8h |
| Mittel | Token-Blacklist fuer JWT-Logout (serverseitige Invalidierung) | 2–4h |
| Niedrig | Stale-Backup-Alert (Alarm bei verpasstem Supabase-Backup) | 1h |
| Niedrig | WAF-Regeln auf Cloudflare (Geo-Blocking, Bot-Detection) | 1–2h |
| Niedrig | Alerting bei wiederholten 403/429 (Anomalie-Erkennung) | 2–3h |

---

## 6. Commits dieser Sicherheitspruefung

| Commit | Inhalt |
|---|---|
| `e8190af` | Rate-Limits, Input-Validierung, CSP (7 Findings) |
| `bb0e016` | Webhook-Idempotenz, Checkout-Schutz, Timeouts, Sanitierung (4 Findings) |
| `83874f4` | Build-Pipeline: automatische Migrationen |
| `dc40767` | Audit-Logging, Re-Auth, JWT-Haertung, Headers (8 Massnahmen) |

---

## 7. Fazit

Die JobTRIX-Plattform weist nach dieser Sicherheitspruefung **keine offenen
Findings** auf. Die Authentifizierung ist konsistent, die Tenant-Isolation
korrekt, alle Eingaben werden validiert, alle Endpunkte sind rate-limited, und
kritische Aktionen werden geloggt. Die Plattform ist **freigabefaehig fuer den
Produktivbetrieb**.

---

*Dieser Bericht dient der internen Dokumentation und ersetzt keine externe
Penetrationspruefung durch unabhaengige Sicherheitsexperten. Bei Verarbeitung
besonderer Datenkategorien (Art. 9 DSGVO) oder wachsender Nutzerbasis wird
ein externer Pentest empfohlen.*
