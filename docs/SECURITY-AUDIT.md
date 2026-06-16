# Security-Audit – JobTRIX

**Datum der Prüfung:** 2026-06-16
**Prüfer:** Fallisch / Claude Sonnet 4.6
**Scope:** API-Routen, Auth-Endpunkte, Abhängigkeiten, HTTP-Header, Eingabevalidierung
**Grundlage:** SPEC `docs/specs/jobtrix-security-haertung-und-hosting-umzug.md`, Issues #51–#56

---

## 1. IDOR-Verifikation (session.user.id-Filterung)

Alle authentifizierten API-Routen wurden auf korrekte Nutzerisolation geprüft.
Kriterium: Jede DB-Operation filtert ausschließlich auf `session.user.id` des eingeloggten Nutzers.

| Route | Methode | Prüfung | Ergebnis |
|---|---|---|---|
| `/api/access` | GET | `where: { userId: session.user.id }` | ✅ OK |
| `/api/account/delete` | DELETE | `where: { id: session.user.id }` | ✅ OK |
| `/api/account/export` | GET | alle Queries mit `session.user.id` | ✅ OK |
| `/api/application-history` | GET | `where: { userId: session.user.id }` | ✅ OK |
| `/api/application-history/[id]` | GET | Eintrag geladen, dann `entry.userId !== session.user.id` geprüft | ✅ OK |
| `/api/application-history/[id]` | DELETE | Eintrag geladen, dann `entry.userId !== session.user.id` geprüft | ✅ OK |
| `/api/checkout` | POST | `client_reference_id: session.user.id` — kein fremder Datenzugriff | ✅ OK |
| `/api/generate` | POST | `where: { userId: session.user.id }` für Access-Check | ✅ OK |
| `/api/profile` | GET | `where: { userId: session.user.id }` | ✅ OK |
| `/api/profile` | POST | `where: { userId: session.user.id }` (upsert) | ✅ OK |
| `/api/theme` | GET | `where: { userId: session.user.id }` | ✅ OK |
| `/api/theme` | POST | `where: { userId: session.user.id }` (upsert) | ✅ OK |
| `/api/auth/register` | POST | kein Auth erforderlich, kein Fremdkontext | ✅ OK |
| `/api/auth/forgot-password` | POST | kein Auth erforderlich, kein Fremdkontext | ✅ OK |
| `/api/auth/reset-password` | POST | Token gebunden an userId, kein Fremdkontext | ✅ OK |
| `/api/webhooks/stripe` | POST | signierte Webhook-Payload, userId aus Stripe-Metadaten | ✅ OK |

**IDOR-Findings:** Keine.

---

## 2. Umgesetzte Security-Fixes (Issues #51–#55)

### #51 – Abhängigkeiten (npm audit fix)
- `npm audit fix` ohne `--force` ausgeführt
- Verbleibende Findings: Next.js-gebundene CVEs (siehe Abschnitt 3)
- `.env` und `.env.test` mit Hinweis-Kommentar zu Secret-Handling versehen

### #52 – Rate-Limiting für Auth-Endpunkte
- PostgreSQL-basiertes Rate-Limiting in `lib/rate-limit.ts` implementiert
- Geschützte Endpunkte: `/api/auth/register`, NextAuth-Login, `/api/auth/forgot-password`, `/api/auth/reset-password`
- Schwellwert: 5 Versuche / 15 Minuten (zentral konfigurierbar via `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS`)
- Rücksetzung nach Ablauf des Zeitfensters verifiziert

### #53 – HTTP-Security-Header
- In `next.config.mjs` via `headers()`-Funktion gesetzt
- Gesetzt für alle Responses (`source: "/(.*)"`)

| Header | Wert |
|---|---|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; frame-src https://checkout.stripe.com; worker-src 'self' blob:; frame-ancestors 'none'; form-action 'self'; base-uri 'self'` |

### #54 – Zod-Eingabevalidierung
- Zod-Schemas in `lib/validation-schemas.ts` definiert
- Integriert in: `/api/auth/register`, `/api/auth/forgot-password`, `/api/auth/reset-password`, `/api/profile`
- Forgot-Password: ungültige E-Mail-Formate → 400 (kein Timing-Leak durch immer gleiches Response-Verhalten für gültige Adressen)

### #55 – GitHub Actions CI
- `.github/workflows/ci.yml` erstellt
- Trigger: Push + PR auf `main`
- Steps: `npm run lint`, `npm test` (mit PostgreSQL-Service-Container), `npm run test:e2e`

---

## 3. Verbleibende Findings (dokumentiert, nicht behoben)

Diese Findings können ausschließlich durch ein Next.js Major-Upgrade (14.x → 15.x/16.x) behoben werden. Sie sind der Folge-Phase **„Next.js Major-Upgrade"** zugeordnet.

| Paket | Severity | Advisory | Fix |
|---|---|---|---|
| `next` 14.x | high | 14 CVEs (DoS, XSS, Cache-Poisoning, SSRF, i18n-Bypass) | Next.js Major-Upgrade |
| `postcss` (Next.js intern) | moderate | GHSA-qx2v-qp2m-jg93 XSS via `</style>` | Next.js Major-Upgrade |
| `eslint-config-next` | high | GHSA-5j98-mcp5-4vw2 Command Injection via glob | Next.js Major-Upgrade |
| `ts-jest` (transient via @jest/transform) | moderate | GHSA-h67p-54hq-rp68 js-yaml DoS | ts-jest oder Jest-Upgrade |
| `next-auth` 4.x (transient via uuid) | moderate | GHSA-w5hq-g745-h8pq buffer bounds | next-auth v5 Major-Upgrade |
| `@ducanh2912/next-pwa` ≥10.2.7 (transient via workbox) | high | GHSA-5c6j-r48x-rmvq + GHSA-qj8w-gfj5-8c6v (serialize-javascript RCE/DoS) | Kein Fix im Major-Bereich 10 möglich |

**Risikobewertung für aktuellen Betrieb:**
- DoS-Vektoren für Next.js gelten nur bei öffentlich erreichbaren Instanzen ohne vorgelagerten Reverse-Proxy/WAF (Cloudflare WAF ist geplant)
- serialize-javascript-Lücke in @ducanh2912/next-pwa betrifft den Build-Prozess, nicht die Laufzeit

---

## 4. Testabdeckung

- **Jest (Unit/Integration):** 457 Tests, alle grün
- **Playwright (E2E):** vollständige Suite
- **Neue Tests für Security-Features:** `api-rate-limit.test.ts`, `security-headers.test.ts`, `api-validation.test.ts`, `ci-workflow.test.ts`, `security-audit.test.ts`

---

## 5. Grundlage für Folge-Prüfung

Nächste Prüfung sollte umfassen:
1. Next.js Major-Upgrade durchgeführt → alle npm-audit-Findings neu prüfen
2. CSP `'unsafe-inline'` / `'unsafe-eval'` durch Nonces oder Hash-basierte CSP ersetzen
3. next-auth v5 Migration → uuid-Vulnerability prüfen
4. AVV mit Render, Supabase, Cloudflare abgeschlossen → dokumentieren
