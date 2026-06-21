# Purple-Team-Endkontrolle — 2026-06-21

## 1. Executive Summary
- **Gesamturteil: freigabefaehig** — keine kritischen Durchbrueche, solide Grundverteidigung.
- **Sicherheits-Reifegrad: 3/5** — Auth und Tenant-Isolation korrekt, Rate-Limits frisch gehaertet, aber Defense-in-Depth (zweite Schicht) fehlt an mehreren Stellen.
- **Durchbrueche:** 0 Critical, 0 High, 4 Medium, 3 Low
- **Gehaltene Verteidigungslinien:** Auth-Gate (konsistent), Tenant-Isolation (session-basiert), Stripe-Webhook-Signatur, HMAC-Reset-Token, Bcrypt-Hashing, Rate-Limits (neu), Input-Validierung (neu)
- **Wichtigste Empfehlung:** Stripe-Webhook-Idempotenz absichern und Audit-Logging einfuehren, um den Reifegrad auf 4/5 zu heben.

## 2. Geltungsbereich & Methode
- **Getestete Komponenten:** Alle 16 API-Routen, Auth-Schicht (NextAuth/JWT), Prisma-Schema, Middleware, Security-Headers, externe Integrationen (Stripe, Resend, Anthropic, Arbeitsagentur-API)
- **Zeitraum:** 2026-06-21
- **Genutzte Bausteine:** API Security Audit (OWASP Top 10) vorab, manuelle gegnerische Code-Analyse
- **Test-Stufen:** A (statisch, alle Vektoren), B (nicht durchgefuehrt, App nicht live gestartet)
- **Nicht getestet:** Stufe C (destruktive Tests gegen DB-Klon) — kein Sandbox-Harness vorhanden; Live-Probes (Stufe B) da App nicht gestartet.

### OWASP API Top 10 Abdeckung

| Kategorie | Thema | Abdeckung | Verweis |
|---|---|---|---|
| API1 | BOLA / IDOR | 🟢 gut | F1 |
| API2 | Broken Authentication | 🟢 gut | F2 |
| API3 | Object Property Level Access | 🟢 gut | F3 |
| API4 | Resource Consumption | 🟢 gut (nach Haertung) | F4 |
| API5 | Function Level Authorization | 🟢 gut | F5 |
| API6 | Sensitive Business Flows | 🟡 teilweise | F6, F7 |
| API7 | SSRF | 🟢 gut | F8 |
| API8 | Security Misconfiguration | 🟡 teilweise | F9, F10 |
| API9 | Improper Inventory Management | 🟢 gut | F11 |
| API10 | Unsafe Consumption of APIs | 🟡 teilweise | F12 |

## 3. Bedrohungsmodell

### Angreifer-Profile

| Profil | Beschreibung | Ziel |
|---|---|---|
| Anonym | Nicht eingeloggter Nutzer | Account-Uebernahme, Brute-Force, Registrierungs-Spam |
| Boesw. Nutzer | Eingeloggter User mit eigenem Account | Fremde Bewerbungsdaten lesen, E-Mail-Relay-Missbrauch, Kosten-Explosion (AI/Email), Gratiszugang erschleichen |
| Kompromittierter Account | Gestohlene Session/Credentials | Datenexfiltration, Konto-Loesch-Angriff |
| Externer Angreifer | Netzwerk-Level | Webhook-Faelschung, Replay-Angriffe auf Stripe |

### Kronjuwelen
1. **Nutzerdaten-Isolation** — Bewerbungsdaten, Profile, persoenliche Dokumente
2. **Zahlungsdaten** — Stripe-Checkout, Package-Freischaltung
3. **Auth-Secrets** — NEXTAUTH_SECRET, JWT-Token
4. **API-Kosten** — Anthropic API Key, Resend-Kontingent

## 4. Befunde je Angriff

| ID | Vektor | Stufe | Verdikt | Schwere |
|----|--------|-------|---------|---------|
| F1 | BOLA auf /application-history/[id] | A | ✅ gehalten | — |
| F2 | Auth-Bypass / JWT-Manipulation | A | ✅ gehalten | — |
| F3 | Data-Leakage in API-Responses | A | ✅ gehalten | — |
| F4 | Resource Consumption (Rate-Limits) | A | ✅ gehalten (nach Haertung) | — |
| F5 | Function-Level Auth (Admin-Eskalation) | A | ✅ gehalten | — |
| F6 | Stripe-Webhook-Replay/Doppelbuchung | A | ⚠️ teilweise | Medium |
| F7 | Parallele Checkout-Sessions (Race) | A | ⚠️ teilweise | Medium |
| F8 | SSRF ueber nutzerkontrollierte URLs | A | ✅ gehalten | — |
| F9 | console.error mit Error-Objekt in Prod | A | ⚠️ teilweise | Low |
| F10 | Stripe/Anthropic SDK ohne expliziten Timeout | A | ⚠️ teilweise | Medium |
| F11 | Vergessene Endpunkte / Inventory | A | ✅ gehalten | — |
| F12 | Ext. API-Response ohne Validierung | A | ⚠️ teilweise | Medium |
| F13 | Single-Layer-Defense: kein Audit-Logging | A | ⚠️ teilweise | Low |
| F14 | Account-Export gibt alle Daten ohne Re-Auth | A | ⚠️ teilweise | Low |

---

### F1 — BOLA auf /application-history/[id]
- **Hypothese:** Boesw. Nutzer errät fremde Entry-IDs und liest/loescht fremde Bewerbungen.
- **Test:** Stufe A — Code-Analyse `app/api/application-history/[id]/route.ts:7-14`
- **Beobachtung:** Sowohl GET als auch DELETE pruefen `entry.userId !== session.user.id` und geben einheitlich 404 zurueck (kein Existenz-Leak). IDs sind CUIDs (nicht erratbar).
- **Verdikt:** ✅ gehalten
- **Defense-in-Depth:** Einzige Schicht ist die App-Ebene-Pruefung. Prisma hat kein RLS. Eine versehentliche Query ohne userId-Check waere ein Durchbruch. → Empfehlung: userId-Filter in alle Queries als Standard-Pattern erzwingen (Prisma-Middleware oder Query-Helper).

### F2 — Auth-Bypass / JWT-Manipulation
- **Hypothese:** Angreifer faelscht JWT oder nutzt abgelaufenen Token.
- **Test:** Stufe A — `lib/auth.ts`, `middleware.ts`
- **Beobachtung:** NextAuth JWT mit `strategy: "jwt"`, signiert mit NEXTAUTH_SECRET. Algorithmus wird von NextAuth intern gehandhabt (kein `none`-Bug). Session-Callback laedt User live aus DB (kein stale Token). Middleware schuetzt Frontend-Routen, API-Routen pruefen Session individuell. Login rate-limited via `checkRateLimit`.
- **Verdikt:** ✅ gehalten
- **Anmerkung:** JWT-Token werden nach Logout nicht serverseitig invalidiert (NextAuth JWT-Modus hat keine Token-Revocation). Bei 30-Tage-MaxAge koennte ein gestohlener Token laenger gueltig bleiben. → Akzeptables Restrisiko fuer diese App-Groesse; bei wachsender Nutzerbasis Token-Blacklist erwaegen.

### F3 — Data-Leakage in API-Responses
- **Hypothese:** API gibt passwordHash, interne IDs oder zu viele Felder zurueck.
- **Test:** Stufe A — Alle Response-Pfade analysiert.
- **Beobachtung:** `/api/account/export` gibt `user.email`, `createdAt`, Package-Info zurueck — kein passwordHash. `/api/auth/register` gibt `user.id` zurueck (CUID, nicht erratbar). Keine Stack-Traces in Client-Responses (500-Handler geben generische Meldungen).
- **Verdikt:** ✅ gehalten

### F4 — Resource Consumption (Rate-Limits)
- **Hypothese:** Nutzer spammt /generate, /send-email, /jobsuche ohne Begrenzung.
- **Test:** Stufe A — `lib/rate-limit.ts`, alle API-Routen
- **Beobachtung:** Rate-Limits wurden im vorherigen Security-Audit eingefuehrt: generate 10/15min, send-email 5/15min, jobsuche 30/15min, auth-Routen 5/15min.
- **Verdikt:** ✅ gehalten (nach Haertung)

### F5 — Function-Level Authorization
- **Hypothese:** Versteckte Admin-Endpunkte oder Privilege-Eskalation.
- **Test:** Stufe A — Vollstaendige Route-Inventur
- **Beobachtung:** Keine Admin-Routen, keine Rollentrennung. Alle Nutzer haben identische Berechtigungen. Kein `/admin`, `/internal`, `/debug` Endpunkt vorhanden.
- **Verdikt:** ✅ gehalten

### F6 — Stripe-Webhook-Replay (Doppelbuchung)
- **Hypothese:** Angreifer replayed einen gueltigen Stripe-Webhook-Payload → Package wird erneut/anders gebucht.
- **Test:** Stufe A — `app/api/webhooks/stripe/route.ts`
- **Beobachtung:** Stripe-Signatur wird kryptografisch geprueft (gut). **Aber:** Kein Idempotenz-Check. Der Webhook nutzt `prisma.access.upsert` mit `where: { userId }`. Bei Replay wuerde `validUntil` *neu berechnet* (`new Date()` + durationDays) und das Ablaufdatum nach vorne verschoben. Bei lifetime-Package harmlos (upsert = gleicher Zustand). **Bei limited-Package: Replay verlaengert effektiv den Zugang**, weil `validUntil` vom aktuellen Zeitpunkt neu gerechnet wird.
- **Verdikt:** ⚠️ teilweise — Stripe verhindert Replays normalerweise (Timestamp-Fenster), aber eine doppelte Zustellung desselben Events (Stripe retries) koennte `validUntil` verschieben.
- **Schweregrad:** Medium — finanzieller Impact begrenzt (Verlaengerung, nicht Geld-Diebstahl)
- **Remediation:** Idempotenz-Check: `event.id` oder `stripePaymentId` pruefen, ob bereits verarbeitet. `validUntil` nur setzen wenn noch nicht vorhanden oder aelter als aktueller Wert.

### F7 — Parallele Checkout-Sessions (Race)
- **Hypothese:** Nutzer oeffnet mehrere Checkout-Sessions parallel → mehrere Webhooks → unklarer Zustand.
- **Test:** Stufe A — `app/api/checkout/route.ts`, Stripe-Webhook
- **Beobachtung:** Checkout erstellt Stripe-Sessions ohne zu pruefen, ob bereits eine offene Session existiert. Stripe laesst das zu. Wenn beide bezahlt werden, kommen zwei Webhooks. `upsert` ueberschreibt jeweils → letzter gewinnt. Kein finanzieller Schaden (User bezahlt doppelt bei Stripe, aber App gibt nur ein Package), aber keine Warnung an den Nutzer.
- **Verdikt:** ⚠️ teilweise — kein Sicherheitsrisiko, aber unklarer UX-Zustand
- **Schweregrad:** Medium — doppelte Zahlung moeglich ohne Feedback
- **Remediation:** Vor Checkout-Erstellung pruefen, ob User bereits ein aktives Package hat. Oder clientseitig Button sperren nach erstem Klick.

### F8 — SSRF
- **Hypothese:** Angreifer bringt Server dazu, interne URLs zu fetchen.
- **Test:** Stufe A — Alle `fetch`-Stellen inventarisiert
- **Beobachtung:** Nur 3 Server-Fetch-Stellen: (1) Resend API — hardcoded URL. (2) Arbeitsagentur API — hardcoded Base-URL, User-Input nur als Query-Parameter (`was`, `wo`). (3) Anthropic SDK — SDK-intern. Keine nutzerkontrollierten URLs in fetch-Aufrufen.
- **Verdikt:** ✅ gehalten

### F9 — console.error mit vollstaendigem Error-Objekt
- **Hypothese:** Error-Logs in Prod leaken sensitive Informationen (DB-Credentials, Stack-Traces).
- **Test:** Stufe A — `app/api/generate/route.ts:77`, `app/api/send-email/route.ts:74`
- **Beobachtung:** `console.error("[/api/generate] Fehler:", err)` loggt das vollstaendige Error-Objekt. In Prod-Logging-Services (Render, Vercel) koennte dies DB-Connection-Strings oder API-Keys enthalten, falls der Fehler diese enthaelt. **Client bekommt nur generische Meldung** — kein externer Leak.
- **Verdikt:** ⚠️ teilweise — internes Risiko, kein externer Leak
- **Schweregrad:** Low
- **Remediation:** Error-Logging auf `err.message` beschraenken, oder strukturiertes Logging mit Filterung sensitiver Felder.

### F10 — SDK-Calls ohne expliziten Timeout
- **Hypothese:** Anthropic/Stripe SDK-Calls haengen endlos, blockieren Server-Ressourcen.
- **Test:** Stufe A — `app/api/generate/route.ts:38`, `app/api/checkout/route.ts:28`
- **Beobachtung:** Anthropic SDK und Stripe SDK haben interne Default-Timeouts (Anthropic: 10min, Stripe: 80s). Resend/Arbeitsagentur fetch-Calls haben keinen expliziten Timeout.
- **Verdikt:** ⚠️ teilweise
- **Schweregrad:** Medium — ein haengender Arbeitsagentur-Fetch blockiert einen Server-Worker
- **Remediation:** `AbortController` mit 15s-Timeout auf alle externen fetch-Calls in `lib/email.ts` und `app/api/jobsuche/route.ts`.

### F11 — Vergessene Endpunkte / Inventory
- **Hypothese:** Undokumentierte oder Debug-Routen sind exponiert.
- **Test:** Stufe A — Vollstaendige Verzeichnis-Inventur aller `/app/api/`-Routen
- **Beobachtung:** 16 Routen, alle dokumentiert und aktiv genutzt. Keine `/debug`, `/admin`, `/metrics`, `/health`, `/swagger`, `/v1`-Routen. Keine Worker-Trigger-Endpunkte. NextAuth-Catchall hat eigenes Auth-Handling.
- **Verdikt:** ✅ gehalten

### F12 — Externe API-Response ohne Validierung
- **Hypothese:** Arbeitsagentur-API gibt unerwartete Daten zurueck, die ungeprueft an den Client weitergeleitet werden.
- **Test:** Stufe A — `app/api/jobsuche/route.ts:80-99`
- **Beobachtung:** `data?.stellenangebote` wird mit optional chaining gelesen und in ein typisiertes Interface gemappt. Felder mit `??  ""` defaulted. `isHttpUrl()` validiert externe URLs korrekt (nur http/https). **Aber:** `stellenangebotsBeschreibung` (HTML?) wird ungeprueft zurueckgegeben. Falls die Arbeitsagentur-API HTML zurueckgibt, koennte dies XSS im Frontend verursachen — abhaengig davon, wie das Frontend den Description-Text rendert.
- **Verdikt:** ⚠️ teilweise
- **Schweregrad:** Medium — abhaengig von Frontend-Rendering (React escaped standardmaessig)
- **Remediation:** Description-Feld sanitieren (HTML-Tags strippen) oder sicherstellen, dass Frontend nie `dangerouslySetInnerHTML` nutzt. Geprueft: kein `dangerouslySetInnerHTML` im Code → React escaped automatisch. Risiko somit gering, aber Sanitierung waere Defense-in-Depth.

### F13 — Kein Audit-Logging
- **Hypothese:** Sicherheitsrelevante Aktionen (Login, Account-Loeschung, Zahlungen, E-Mail-Versand) sind nicht nachvollziehbar.
- **Test:** Stufe A — Gesamte Codebasis
- **Beobachtung:** Kein Audit-Log fuer: fehlgeschlagene Logins, Account-Loeschungen, Checkout-Erstellungen, Webhook-Verarbeitungen, E-Mail-Versand. Nur `console.error` bei Fehlern.
- **Verdikt:** ⚠️ teilweise — Single-Layer-Defense ohne Forensik-Spur
- **Schweregrad:** Low — kein direkter Angriffsvektor, aber fehlende Erkennungsfaehigkeit
- **Remediation:** Strukturiertes Audit-Logging fuer kritische Aktionen einfuehren (Login-Versuche, Account-Aenderungen, Zahlungen, E-Mail-Versand).

### F14 — Account-Export ohne Re-Authentifizierung
- **Hypothese:** Ein Angreifer mit kompromittierter Session exportiert alle persoenlichen Daten ueber `/api/account/export`.
- **Test:** Stufe A — `app/api/account/export/route.ts`
- **Beobachtung:** Export erfordert nur gueltige Session, keine Passwort-Bestaetigung. Im Vergleich: Account-Loeschung erfordert Passwort (gut). Export gibt alle Profildaten, Bewerbungshistorie und Account-Infos zurueck.
- **Verdikt:** ⚠️ teilweise
- **Schweregrad:** Low — erfordert kompromittierte Session; Daten sind dem Nutzer sowieso zugaenglich
- **Remediation:** Passwort-Bestaetigung vor Datenexport einfuehren, analog zu `/api/account/delete`.

## 5. Angriffsketten

### Kette 1: Session-Diebstahl → Datenexfiltration → kein Audit
Session-Cookie gestohlen (XSS waere noetig, aber CSP hat noch `unsafe-inline`) → Angreifer ruft `/api/account/export` auf → bekommt alle Daten → kein Audit-Log zeichnet den Zugriff auf → Opfer merkt nichts.
- **Schwaeches Glied:** Fehlende Re-Auth beim Export (F14) + fehlendes Audit-Logging (F13)
- **Mitigiert durch:** CSP (kein eval), httpOnly Cookies, SameSite

### Kette 2: Stripe-Webhook-Retry → Zugangsverlaengerung
Stripe liefert denselben Event doppelt (normales Retry-Verhalten) → `validUntil` wird neu berechnet → User erhaelt effektiv laengeren Zugang als bezahlt.
- **Schwaeches Glied:** Fehlende Idempotenz im Webhook (F6)
- **Einzeln schwach, aber bei vielen Retries kumulativ relevant.**

## 6. Automatische Schutzmechanismen

### Prioritaet 1 — Webhook-Idempotenz (F6)
- **Ausloeser:** Doppelter Stripe-Event
- **Reaktion:** `event.id` in DB speichern, bei Duplikat silent-skip
- **Umsetzung:** Neue Tabelle `ProcessedWebhookEvent` mit unique `eventId`, vor upsert pruefen
- **Aufwand:** Klein (1-2h)

### Prioritaet 2 — Fetch-Timeouts (F10)
- **Ausloeser:** Externe API haengt
- **Reaktion:** AbortController nach 15s → Request abbrechen, 504 an Client
- **Umsetzung:** In `lib/email.ts` und `app/api/jobsuche/route.ts`
- **Aufwand:** Klein (30min)

### Prioritaet 3 — Audit-Logging (F13)
- **Ausloeser:** Sicherheitsrelevante Aktion
- **Reaktion:** Strukturierter Log-Eintrag (userId, action, timestamp, IP)
- **Umsetzung:** Neues `AuditLog`-Modell in Prisma, Helper-Funktion `logAuditEvent()`
- **Aufwand:** Mittel (3-4h)

### Prioritaet 4 — Description-Sanitierung (F12)
- **Ausloeser:** Externe API gibt unerwarteten Content zurueck
- **Reaktion:** HTML-Tags strippen vor Weitergabe
- **Umsetzung:** `description.replace(/<[^>]*>/g, "")` in jobsuche/route.ts
- **Aufwand:** Klein (15min)

## 7. Was gut verteidigt war

| Verteidigungslinie | Beweis |
|---|---|
| **Auth-Konsistenz** | Alle 14 geschuetzten Endpunkte pruefen `getServerSession()` identisch. Kein einziger Bypass-Pfad. |
| **Tenant-Isolation** | `session.user.id` als einzige Quelle fuer userId in allen Queries. Kein Body-Override moeglich. BOLA-Check auf /application-history/[id] korrekt (404 statt 403). |
| **Stripe-Webhook-Signatur** | `constructEvent()` mit kryptographischer Pruefung. Kein erratbares Secret. |
| **Reset-Token-Design** | HMAC + timingSafeEqual + Password-Fingerprint + 1h-Ablauf. Kein Token-Reuse nach Passwort-Aenderung. |
| **Bcrypt-Hashing** | Rounds=10, kein Klartext, kein MD5/SHA1. |
| **Input-Validierung** | Zod-Schemas mit maxLength/maxItems auf allen Eingaben (nach Haertung). |
| **CSP + Security-Headers** | HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, CSP (unsafe-eval entfernt). |
| **Secrets-Hygiene** | Keine Secrets im Repo. .env.local in .gitignore. Committed .env enthaelt nur Entwicklungswerte. |
| **SSRF-Freiheit** | Keine nutzerkontrollierten URLs in server-seitigen fetch-Aufrufen. |
| **XSS-Schutz** | Kein `dangerouslySetInnerHTML` oder `innerHTML` in der gesamten Codebasis. React escaped automatisch. |

## 8. Risikoakzeptanz & Freigabe

### Offene Findings

| ID | Schwere | Empfehlung | Owner | Termin |
|----|---------|------------|-------|--------|
| F6 | Medium | Webhook-Idempotenz | Dev | Vor Go-Live |
| F7 | Medium | Checkout-Duplikat-Schutz | Dev | Vor Go-Live |
| F10 | Medium | Fetch-Timeouts | Dev | Vor Go-Live |
| F12 | Medium | Description-Sanitierung | Dev | Vor Go-Live |
| F9 | Low | Error-Logging einschraenken | Dev | Nach Go-Live |
| F13 | Low | Audit-Logging einfuehren | Dev | Nach Go-Live |
| F14 | Low | Re-Auth fuer Export | Dev | Nach Go-Live |

### Deployment-Blocker
**Keine.** Es gibt keine Critical- oder High-Findings. Die Medium-Findings sind wichtig, aber keines ermoeglicht einen direkten Datendiebstahl oder Auth-Bypass.

### Freigabe-Status
**Freigabefaehig** mit Empfehlung, die 4 Medium-Findings (F6, F7, F10, F12) vor oder kurz nach Go-Live zu schliessen.
