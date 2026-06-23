# JobTRIX – Security-Härtung und Hosting-Umzug (Cloudflare/Render/Supabase)

## Problem Statement

JobTRIX ist mit Abschluss der letzten Phase funktional vollständig (Nutzerkonten, Bezahlsystem, PDF-Layouts, Dark Mode, rechtliche Seiten, DSGVO-Kontofunktionen), läuft aber bisher ausschließlich lokal bzw. über Tailscale. Es gab noch keine systematische Sicherheitsprüfung der App, und die Infrastruktur (lokale PostgreSQL via Docker-Compose, kein CI/CD, keine Domain) ist nicht produktionsreif. Bevor weitere Personen auf JobTRIX zugreifen und bevor die App unter einer echten Domain öffentlich erreichbar wird, müssen bekannte und noch unbekannte Sicherheitsrisiken geprüft und behoben werden, und die App muss auf den etablierten Standard-Stack für verkaufsfertige Cloud-Produkte (Cloudflare, Render, Supabase) umziehen. Zusätzlich enthält die Datenschutzerklärung noch einen Platzhalter für den Hosting-Anbieter, der durch den Umzug konkret befüllt werden muss.

## Solution

Diese Phase besteht aus drei zusammenhängenden Teilen:

1. **Security-Audit „Erweitert"**: Systematische Prüfung der sicherheitsrelevanten Bereiche der App (Authentifizierung, API-Autorisierung, Secrets-Handling, HTTP-Security-Header, Eingabevalidierung, Abhängigkeiten). Eine erste Vorab-Analyse hat bereits konkrete Findings ergeben (siehe Implementation Decisions); zusätzliche während des Audits entdeckte Findings werden nach demselben Muster behandelt: Finding → Issue → Behebung per TDD → Abschluss-Check mit `/security-review`.
2. **Hosting-Umzug**: JobTRIX wird unter der Domain **jobtrix.de** produktiv betrieben – Cloudflare übernimmt DNS, CDN und WAF, Render hostet die Next.js-App, Supabase stellt die produktive PostgreSQL-Datenbank. Stripe bleibt im Test-Modus, die Produktionsdatenbank startet leer (kein Datenimport aus der lokalen Entwicklungsdatenbank). Ein GitHub-Actions-Workflow führt die bestehende Testsuite bei jedem Push/PR aus.
3. **Datenschutzerklärung-Update**: Der bestehende Hosting-Platzhalter in der Datenschutzerklärung (DE/EN) wird durch konkrete Angaben zu Render, Supabase und Cloudflare ersetzt.

Bewusst **nicht** Teil dieser Phase: ein Major-Upgrade von Next.js (zur Behebung verbleibender High-Severity-Dependency-Findings), der Wechsel von Brevo zu Resend, Sentry-Monitoring, PostHog-Analytics sowie der Wechsel von Stripe in den Live-Modus. Diese Themen sind als eigene Folge-Phasen vorgemerkt (siehe Out of Scope / Further Notes).

## User Stories

### Security-Audit

1. Als Betreiber möchte ich, dass für alle API-Routen, die personenbezogene Daten lesen oder verändern, verifiziert und dokumentiert ist, dass ausschließlich Daten des eingeloggten Nutzers verarbeitet werden, damit ausgeschlossen ist, dass ein Nutzer auf Daten eines anderen Nutzers zugreifen kann (IDOR-Schutz).
2. Als Betreiber möchte ich, dass Login, Registrierung, „Passwort vergessen" und Passwort-Reset durch ein Rate-Limit gegen automatisierte Massenanfragen geschützt sind, damit Angreifer keine Zugangsdaten erraten oder diese Endpunkte überlasten können.
3. Als Betreiber möchte ich, dass JobTRIX grundlegende HTTP-Security-Header (u. a. Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Strict-Transport-Security) ausliefert, damit gängige browserseitige Angriffe wie Clickjacking oder MIME-Sniffing erschwert werden.
4. Als Betreiber möchte ich, dass zentrale Formulare (Registrierung, Profil, Passwort-Reset) serverseitig mit klaren Längen- und Formatgrenzen validiert werden, damit fehlerhafte oder überlange Eingaben nicht zu unerwartetem Verhalten führen.
5. Als Betreiber möchte ich, dass die „Passwort vergessen"-Funktion unabhängig davon, ob die eingegebene E-Mail-Adresse zu einem Nutzerkonto gehört, ein einheitliches Antwortverhalten zeigt, damit Angreifer nicht über Unterschiede im Antwortverhalten registrierte E-Mail-Adressen ermitteln können.
6. Als Betreiber möchte ich, dass alle über `npm audit fix` ohne Major-Versionssprung behebbaren Sicherheitslücken in den Abhängigkeiten behoben sind, damit das Sicherheitsniveau der verwendeten Bibliotheken aktuell ist, ohne die App instabil zu machen.
7. Als Betreiber möchte ich, dass dokumentiert ist, dass `.env` und `.env.test` im Repository ausschließlich unkritische Lokal- bzw. Test-Werte enthalten dürfen und produktive Secrets ausschließlich über Render-Umgebungsvariablen bzw. `.env.local` gesetzt werden, damit künftig niemand versehentlich produktive Secrets ins Repository committet.
8. Als Betreiber möchte ich am Ende des Audits eine kurze, schriftliche Zusammenfassung der geprüften Bereiche sowie der gefundenen und behobenen Probleme erhalten, damit der aktuelle Sicherheitsstand nachvollziehbar ist und als Grundlage für künftige Prüfungen dient.

### Hosting-Umzug

9. Als Betreiber möchte ich, dass JobTRIX unter `https://jobtrix.de` erreichbar ist, damit die App produktionsreif und ohne VPN/Tailscale nutzbar ist.
10. Als Betreiber möchte ich, dass DNS, CDN und WAF für `jobtrix.de` über Cloudflare verwaltet werden, damit Domain-Verwaltung und Basisschutz dem etablierten Standard-Stack entsprechen.
11. Als Betreiber möchte ich, dass die JobTRIX-App als Web Service auf Render läuft und bei jedem Push auf den `main`-Branch automatisch neu deployed wird, damit Änderungen ohne manuellen Zusatzschritt produktiv gehen.
12. Als Betreiber möchte ich, dass die Produktionsdatenbank in einem Supabase-PostgreSQL-Projekt liegt und mit dem aktuellen Prisma-Schema (alle bestehenden Migrationen) initialisiert, aber leer ist, damit JobTRIX produktiv eine eigene, von der lokalen Entwicklungsdatenbank getrennte Datenbank nutzt.
13. Als Betreiber möchte ich, dass alle für den produktiven Betrieb benötigten Umgebungsvariablen (Datenbankverbindung, NextAuth, Stripe-Test-Keys, Claude-API, Brevo, Arbeitsagentur-API) als Render-Umgebungsvariablen hinterlegt sind, damit die App produktiv lauffähig ist, ohne dass Secrets im Code oder im Repository liegen.
14. Als Betreiber möchte ich, dass ein GitHub-Actions-Workflow bei jedem Push und Pull Request automatisch Linting sowie die bestehende Jest- und Playwright-Testsuite ausführt, damit fehlerhafte Änderungen vor dem produktiven Deploy auffallen.
15. Als Betreiber möchte ich, dass Stripe in dieser Phase weiterhin im Test-Modus läuft (inklusive eines auf die produktive Webhook-URL umgestellten Test-Webhooks), damit unter der echten Domain noch keine echten Zahlungen verarbeitet werden, bis dies bewusst entschieden wird.
16. Als Betreiber möchte ich eine konkrete Checkliste der von mir manuell durchzuführenden Schritte (Accounts anlegen, Domain registrieren, Verbindungen einrichten) erhalten, damit ich genau weiß, welche Aufgaben außerhalb des Codes bei mir liegen.

### Datenschutzerklärung

17. Als Besucher möchte ich in der Datenschutzerklärung konkrete Angaben zu den Hosting-Dienstleistern (Render, Supabase, Cloudflare) statt des bisherigen Platzhaltertexts finden, damit ich nachvollziehen kann, wo und durch wen meine Daten verarbeitet werden.
18. Als Betreiber möchte ich eine Checkliste der mit Render, Supabase und Cloudflare abzuschließenden Auftragsverarbeitungsverträge (AVV) erhalten, damit ich diese rechtlichen Schritte selbst nachverfolgen und abschließen kann.
19. Als Nutzer möchte ich die aktualisierte Datenschutzerklärung sowohl auf Deutsch als auch auf Englisch lesen können, damit die durchgängige Zweisprachigkeit von JobTRIX erhalten bleibt.

## Implementation Decisions

### Security-Audit – Umfang und Vorgehen

- Der Audit deckt folgende Bereiche systematisch ab: NextAuth-Konfiguration (Session, Passwort-Hashing, Brute-Force-Schutz), Autorisierung der API-Routen (IDOR), Stripe-Webhook- und Secrets-Handling, HTTP-Security-Header/CSP, Eingabevalidierung, Abhängigkeiten (`npm audit`), Umgang mit `.env`-Dateien.
- Für jeden Bereich gilt: bekannte Findings (siehe unten) werden direkt als Issues aufgenommen; zusätzliche, während der Umsetzung entdeckte Findings werden nach demselben Muster behandelt (Finding → Issue → TDD-Fix → `/security-review`-Checkpoint auf den Fix).
- Eine Vorab-Analyse hat ergeben, dass die Autorisierung aller bestehenden API-Routen bereits korrekt auf `session.user.id` filtert (kein kritisches IDOR-Finding) und der Stripe-Webhook die Signatur bereits korrekt verifiziert. Diese Bereiche werden im Rahmen des Audits verifiziert und im Abschluss-Dokument (User Story 8) festgehalten, ohne dass hierfür Code-Änderungen erwartet werden – sofern der Audit nichts Abweichendes findet.

### Bereits identifizierte Findings und Fix-Ansatz

1. **Fehlendes Rate-Limiting auf Auth-Endpunkten** (`/api/auth/register`, Login, `/api/auth/forgot-password`, `/api/auth/reset-password`): Es wird eine einfache, code-seitige Begrenzung eingeführt (z. B. maximal N Versuche pro Zeitfenster, identifiziert über IP und/oder E-Mail-Adresse), die in der bestehenden PostgreSQL-Datenbank persistiert wird – kein zusätzlicher Dienst (z. B. Redis) nötig. Begründung: einfache, testbare und hosting-unabhängige Lösung, passend zur aktuellen Größe der App. Cloudflare-Rate-Limiting/WAF-Regeln werden zusätzlich als manueller Hardening-Schritt in der Account-Setup-Checkliste dokumentiert, sind aber nicht Teil des Codes.
2. **Fehlende HTTP-Security-Header**: Ergänzung einer zentralen `headers()`-Konfiguration in `next.config.mjs` mit Content-Security-Policy (abgestimmt auf next-intl, next-pwa/Service-Worker und Stripe-Checkout-Redirects), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` und `Strict-Transport-Security` (wirkt nur unter HTTPS, also primär produktiv relevant).
3. **Minimale Eingabevalidierung**: Einführung von `zod` als zentrale Validierungsbibliothek für die Formulare/Routen mit Nutzereingaben (Registrierung, Profil-Update, Passwort-Reset). Validierungsschemas definieren sinnvolle Längen- und Formatgrenzen (z. B. E-Mail-Format, minimale/maximale Feldlängen); ungültige Eingaben führen zu einer einheitlichen 400-Antwort mit Fehlermeldung.
4. **Timing-Verhalten bei „Passwort vergessen"**: Der Code-Pfad wird so angepasst, dass die Antwort (Status, Body und ungefähre Antwortzeit) unabhängig davon ist, ob die angefragte E-Mail-Adresse zu einem Nutzerkonto gehört – z. B. durch identisches Verhalten in beiden Fällen (E-Mail-Versand wird in beiden Fällen „simuliert" angestoßen, aber nur bei existierendem Konto tatsächlich zugestellt).
5. **`npm audit` Findings**: `npm audit fix` (ohne `--force`) wird ausgeführt, um alle ohne Major-Versionssprung behebbaren Lücken zu schließen (betrifft voraussichtlich u. a. transitive Abhängigkeiten wie `uuid` und `postcss`). Für `serialize-javascript` (transitive Abhängigkeit von `@ducanh2912/next-pwa` über `workbox-build`) wird geprüft, ob ein Update von `@ducanh2912/next-pwa` innerhalb des bestehenden Major-Bereichs die Lücke schließt. Verbleibende, ausschließlich an Next.js 14 selbst gebundene High-Severity-Findings werden dokumentiert und der Folge-Phase „Next.js Major-Upgrade" zugeordnet (siehe Out of Scope).
6. **`.env`/`.env.test` im Repository**: Beide Dateien enthalten aktuell ausschließlich unkritische Werte (lokale Docker-Compose-Zugangsdaten bzw. ein offensichtlicher Test-Wert für `NEXTAUTH_SECRET`). Es wird ein Kommentar/Hinweis in beiden Dateien ergänzt, der klarstellt, dass hier ausschließlich Lokal-/Test-Werte stehen dürfen und produktive Secrets ausschließlich über Render-Umgebungsvariablen bzw. `.env.local` gesetzt werden.

### Hosting – Zielarchitektur

- **App-Hosting (Render)**: JobTRIX läuft als Render Web Service mit Node-Runtime (Build-Command `npm run build`, Start-Command `npm run start`; Next.js liest die von Render gesetzte `PORT`-Variable automatisch). Kein Dockerfile bzw. `output: "standalone"` nötig – reduziert Komplexität gegenüber der next-pwa-Generierung im `public`-Verzeichnis. Region: Frankfurt (EU), passend zur bisherigen Linie „Daten in der EU/Deutschland".
- **Datenbank (Supabase)**: Ein neues, leeres Supabase-PostgreSQL-Projekt in einer EU-Region (Frankfurt, falls verfügbar). `DATABASE_URL` zeigt auf die Supabase-Connection (gepoolte Verbindung gemäß Supabase-Empfehlung für Prisma). `prisma migrate deploy` führt alle neun bestehenden Migrationen gegen die neue Datenbank aus; es findet kein Datenimport aus der lokalen Entwicklungsdatenbank statt.
- **DNS/CDN/WAF (Cloudflare)**: `jobtrix.de` wird vom Betreiber registriert; Cloudflare wird als DNS-Provider eingetragen (Nameserver-Umstellung). Ein DNS-Eintrag (Proxy aktiviert) verweist auf den Render-Service gemäß Render-Dokumentation für Custom Domains. Cloudflare übernimmt CDN und einen WAF-Basisschutz.
- **Stripe**: bleibt im Test-Modus. Der Webhook-Endpunkt wird im Stripe-Test-Dashboard auf `https://jobtrix.de/api/webhooks/stripe` umgestellt; das resultierende neue `STRIPE_WEBHOOK_SECRET` wird als Render-Umgebungsvariable hinterlegt.

### Hosting – Umgebungsvariablen auf Render

Folgende Variablen werden produktiv in Render hinterlegt (Werte gemäß `.env.example`, jeweils mit produktivem Inhalt):

- `DATABASE_URL` – Supabase-Connection-String
- `NEXTAUTH_URL` – `https://jobtrix.de`
- `NEXTAUTH_SECRET` – neu generiert für die Produktionsumgebung (nicht der Test-Wert aus `.env.test`)
- `STRIPE_SECRET_KEY` – Stripe Test-Mode Secret Key
- `STRIPE_WEBHOOK_SECRET` – neu erzeugt für den produktiven Webhook-Endpunkt (Test-Modus)
- `ANTHROPIC_API_KEY`
- `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`
- `ARBEITSAGENTUR_API_KEY` (optional, hat einen funktionierenden öffentlichen Default)
- Preis-/Laufzeit-Variablen für die Pakete, sofern vom Default abweichend (`PRICE_LIMITED_EUR`, `PRICE_LIMITED_DURATION_DAYS`, `PRICE_LIFETIME_EUR`)

### Hosting – CI (GitHub Actions)

- Neuer Workflow unter `.github/workflows/`, der bei Push und Pull Request auf `main` `npm run lint`, `npm test` (Jest) und `npm run test:e2e` (Playwright) ausführt. Eine Postgres-Test-Datenbank wird im Workflow als Service-Container bereitgestellt (analog zur lokalen `docker-compose.yml`-Konfiguration).
- Das Deployment selbst läuft über Render's natives Auto-Deploy bei Push auf `main` (kein zusätzlicher Deploy-Workflow in GitHub Actions nötig).

### Account-Setup-Checkliste (manuell durch den Betreiber)

Diese Schritte liegen außerhalb des Codes und werden vom Betreiber durchgeführt; die SPEC ist so formuliert, dass sie unabhängig davon funktioniert, ob bereits zentrale „Faltrix"-Accounts existieren oder alles neu angelegt wird:

1. Accounts bei Render, Supabase und Cloudflare anlegen bzw. prüfen, ob bestehende Accounts genutzt werden können.
2. Domain `jobtrix.de` bei einem Registrar registrieren und Nameserver auf Cloudflare umstellen.
3. Supabase-Projekt (EU-Region) anlegen und Connection-String bereitstellen.
4. Render Web Service mit dem GitHub-Repository verbinden, Build-/Start-Commands gemäß „Hosting – Zielarchitektur" hinterlegen, alle Umgebungsvariablen gemäß obiger Liste eintragen.
5. Cloudflare-DNS-Eintrag für `jobtrix.de` auf den Render-Service einrichten (Custom Domain gemäß Render-Dokumentation), Proxy aktivieren.
6. Stripe-Test-Webhook auf `https://jobtrix.de/api/webhooks/stripe` umstellen und neuen Webhook-Secret in Render hinterlegen.
7. AVV (Auftragsverarbeitungsvertrag) mit Render, Supabase und Cloudflare abschließen, sofern angeboten.

### Datenschutzerklärung – Update

- Der bestehende Hosting-Abschnitt (`hostingHeading`/`hostingBody` im i18n-Namespace `datenschutz`, `messages/de.json` und `messages/en.json`) wird durch konkreten Text ersetzt, der Render (App-Hosting, EU-Region Frankfurt), Supabase (Datenbank, EU-Region) und Cloudflare (DNS/CDN/WAF, globales Edge-Netzwerk ohne dauerhafte Speicherung von Inhaltsdaten) benennt.
- Struktur und Stil der Seite (`<DatenschutzContent />`, Iteration über Sections) bleiben unverändert – es wird ausschließlich der Inhalt des bestehenden Hosting-Abschnitts ersetzt, keine neuen Abschnitte oder Komponenten.
- Die AVV-Checkliste (siehe Account-Setup-Checkliste, Punkt 7) ist eine organisatorische Aufgabe des Betreibers und erscheint nicht als separater Nutzertext in der Datenschutzerklärung – Nutzer erhalten lediglich die Information, welche Dienstleister beteiligt sind.

### Visual Direction

- Diese Phase enthält keine neuen UI-Elemente, Screens oder visuellen Änderungen. Die Datenschutzerklärung übernimmt 1:1 den bestehenden Seitenstil; alle übrigen Änderungen sind Backend-, Konfigurations- oder Infrastrukturänderungen ohne sichtbare UI-Auswirkung.

## Testing Decisions

Wie in den Vorphasen gilt: Ein guter Test prüft das beobachtbare Verhalten aus Nutzersicht bzw. aus Sicht der API, nicht interne Implementierungsdetails, und bleibt robust gegenüber Refactorings.

- **Rate-Limiting**: Tests für die betroffenen Auth-Routen, die nach Überschreiten des Schwellwerts eine Block-Antwort (z. B. 429) erwarten und nach Ablauf des Zeitfensters wieder normales Verhalten zeigen (Zeit wird in Tests gemockt), analog zu bestehenden API-Routen-Tests unter `__tests__/`.
- **HTTP-Security-Header**: Test, der eine Beispiel-Response auf das Vorhandensein der definierten Header (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Strict-Transport-Security) prüft.
- **Eingabevalidierung (zod)**: Pro betroffener Route (Registrierung, Profil-Update, Passwort-Reset) Tests, die ungültige Eingaben (zu lang, falsches Format, fehlendes Pflichtfeld) mit einer 400-Antwort und passender Fehlermeldung beantworten – analog zu bestehenden Tests für `/api/auth/register`.
- **„Passwort vergessen"-Timing**: Test, der sicherstellt, dass Statuscode und Response-Body für eine existierende und eine nicht-existierende E-Mail-Adresse identisch sind.
- **`npm audit fix`**: kein eigener neuer Test; Verifikation durch erneuten `npm audit`-Lauf (Rückgang der Findings) und durch die bestehende Jest-/Playwright-Suite, die nach dem Update weiterhin grün laufen muss (Regressionsschutz).
- **`.env`/`.env.test`**: kein automatisierter Test; Verifikation durch Code-Review der ergänzten Kommentare.
- **Security-Header & Rate-Limiting im Gesamtkontext**: bestehende Jest-/Playwright-Suite muss nach allen Security-Änderungen weiterhin grün laufen (kein unbeabsichtigter Funktionsverlust).
- **Datenschutzerklärung**: Erweiterung des bestehenden Render-Tests der Datenschutz-Seite – Prüfung, dass der Hosting-Abschnitt für DE und EN nicht mehr den Platzhaltertext, sondern den neuen Inhalt enthält.
- **Hosting-Infrastruktur (Supabase/Render/Cloudflare/CI)**: kein neuer Anwendungs-Testcode. Verifikation erfolgt manuell nach dem Deploy anhand einer kurzen Checkliste (Migration läuft durch, App ist unter `https://jobtrix.de` erreichbar, Login/Registrierung/Generierung im Stripe-Test-Modus funktionieren, GitHub-Actions-Workflow läuft grün durch).
- **Teststrategie**: Jest + React Testing Library für Unit-/Komponententests, Playwright für E2E – konsistent zu den bestehenden Tests in `__tests__/`.

## Out of Scope

- **Next.js Major-Upgrade** (14 → 15/16) zur Behebung der verbleibenden High-Severity-`npm audit`-Findings, die ausschließlich an Next.js 14 selbst gebunden sind – eigene Folge-Phase mit ausreichend Zeit für Regressionstests.
- Wechsel des E-Mail-Dienstleisters von Brevo zu Resend – eigene Folge-Phase.
- Sentry-Monitoring und PostHog-Analytics – eigene Folge-Phase(n).
- Stripe Live-Modus / echte Zahlungen – Stripe bleibt im Test-Modus.
- Pentest-Stil-Sicherheitstests (aktive Angriffsversuche, z. B. Versuch, sich als anderer Nutzer auszugeben, oder gezielte Manipulation von Zahlungsabläufen).
- Migration bestehender lokaler Test-/Entwicklungsdaten in die Produktionsdatenbank – die Produktionsdatenbank startet leer.
- Verteiltes Rate-Limiting (z. B. über Redis) für horizontale Skalierung über mehrere Render-Instanzen – das aktuelle Single-Instance-Setup ist für diese Phase ausreichend.
- Cloudflare-WAF-/Rate-Limiting-Regeln als verwaltete Konfiguration im Repository – wird als manueller Hardening-Schritt dokumentiert, nicht automatisiert verwaltet.
- Finaler Abschluss der AVV mit den Dienstleistern – wird vom Betreiber selbst durchgeführt (Checkliste als Hilfestellung).
- Neue E-Mail-Inhalte oder -Vorlagen.

## Further Notes

- **Empfohlene Reihenfolge**: (1) Security-Audit inkl. `npm audit fix` zuerst, da unabhängig vom Hosting und Grundlage für den produktiven Betrieb; (2) Hosting-Umzug (Supabase/Render/Cloudflare-Setup durch den Betreiber, Umgebungsvariablen, CI); (3) Datenschutzerklärung-Update, sobald die konkreten Hosting-Fakten (Region, Dienstleister) feststehen.
- **Empfohlene Folge-Phase**: Next.js Major-Upgrade (14 → 15/16) zur Behebung der verbleibenden High-Severity-Dependency-Findings.
- **Weitere bereits besprochene Folge-Themen** (nicht Teil dieser Phase): Wechsel Brevo → Resend, Sentry-Monitoring, PostHog-Analytics.
- Der Domain-Name `jobtrix.de` wurde vorläufig festgelegt und kann bei Bedarf noch angepasst werden.
- Es ist zum Zeitpunkt dieser SPEC unklar, ob für Render/Supabase/Cloudflare bereits zentrale „Faltrix"-Accounts existieren; die Account-Setup-Checkliste ist so formuliert, dass sie in beiden Fällen funktioniert.
- Zeitrahmen: kein festes Datum; ein Test-Zugriff durch einen Kollegen ist für die nächste Woche angedacht, aber kein hartes Kriterium für diese Phase.
