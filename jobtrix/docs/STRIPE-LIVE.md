# Stripe Live-Modus – Betreiber-Checkliste

Diese Checkliste beschreibt alle manuellen Schritte, die nötig sind, um JobTRIX vom Stripe Test-Modus in den Live-Modus zu schalten. Der Code ist vollständig vorbereitet; kein weiterer Code-Eingriff ist nötig.

## Voraussetzungen

- Zugang zum Stripe-Dashboard (https://dashboard.stripe.com)
- Zugang zur Render-Konsole (https://dashboard.render.com)

## Checkliste

1. **Stripe-Konto verifizieren**
   - Im Stripe-Dashboard unter „Einstellungen → Konto" alle geforderten Unternehmensdaten vollständig hinterlegen (Name, Adresse, Bankverbindung, Identitäts- und KYC-Prüfung durch Stripe).
   - Dauer: ca. 1–3 Werktage.

2. **PayPal im Stripe-Dashboard aktivieren**
   - Im Stripe-Dashboard unter „Einstellungen → Zahlungsmethoden" PayPal aktivieren.
   - Stripe führt dabei eine kurze Prüfung durch; nach Aktivierung erscheint PayPal automatisch im Checkout-Formular.

3. **Live-API-Keys kopieren**
   - Im Stripe-Dashboard unter „Entwickler → API-Schlüssel" in den Live-Modus wechseln.
   - Den „Geheimen Schlüssel" (`sk_live_...`) kopieren – das ist der neue Wert für `STRIPE_SECRET_KEY`.

4. **Stripe-Webhook für Live-Modus anlegen** (Issue #170)
   - Im Stripe-Dashboard unter „Entwickler → Webhooks" einen neuen Endpunkt anlegen:
     - **URL:** `https://jobtrix.de/api/webhooks/stripe`
     - **Ereignisse** (der Handler verarbeitet aktuell genau diese 6 Events):
       - `checkout.session.completed`
       - `invoice.payment_succeeded`
       - `invoice.payment_failed`
       - `customer.subscription.updated`
       - `customer.subscription.deleted`
       - `charge.refunded`
   - Das angezeigte **Signing Secret** (`whsec_live_...`) kopieren – das ist der neue Wert für `STRIPE_WEBHOOK_SECRET`.
   - Optional vorab im Testmodus prüfen: `stripe listen --forward-to https://jobtrix.de/api/webhooks/stripe`.

5. **Umgebungsvariablen auf Render aktualisieren**
   - In der Render-Konsole für den JobTRIX-Service unter „Environment" die folgenden Werte auf die Live-Werte umstellen:
     - `STRIPE_SECRET_KEY` → `sk_live_...`
     - `STRIPE_WEBHOOK_SECRET` → `whsec_live_...`
   - Abo-Preise setzen (Issue #174) – müssen mit den im Stripe-Dashboard/Checkout angezeigten Preisen übereinstimmen:
     - `PRICE_MONTHLY_EUR` (Default: 9.99)
     - `PRICE_YEARLY_EUR` (Default: 89.99)
     - (sowie bereits vorhanden: `PRICE_LIMITED_EUR`, `PRICE_LIMITED_DURATION_DAYS`, `PRICE_LIFETIME_EUR`)
   - Render startet den Service nach dem Speichern automatisch neu.

5a. **Zahlungsmethoden im Stripe-Dashboard aktivieren** (Issue #168)
   - Unter „Einstellungen → Zahlungsmethoden":
     - **Apple Pay** aktivieren und die Domain `jobtrix.de` verifizieren (Stripe stellt dafür eine Verifizierungsdatei bereit bzw. verifiziert automatisch über Checkout).
     - **Google Pay** aktivieren (läuft bei Stripe Checkout automatisch über die Karten-Zahlungsmethode).
     - **PayPal** aktivieren (siehe auch Schritt 2).
   - Kein Code-Change nötig – Checkout nutzt bereits `card`, `sepa_debit` und `paypal`. Apple/Google Pay erscheinen automatisch im gehosteten Checkout, sobald sie aktiv sind.
   - Im Stripe-Testmodus einen Durchlauf je Methode durchführen.

6. **Ersten Testkauf mit echten Zahlungsdaten durchführen** (Issue #71)
   - Eine echte Zahlung (Kreditkarte oder SEPA) mit einem kleinen Betrag durchführen, um zu prüfen, dass Webhook-Empfang und Zugangs-Aktivierung im Live-Modus korrekt funktionieren.
   - Anschließend die Zahlung im Stripe-Dashboard unter „Zahlungen" bestätigen.
   - Den Zugang im Nutzer-Profil prüfen (Feld „Zugang gültig bis" sollte gesetzt sein).
   - Hinweis: Issue #71 ist zusätzlich durch #70 (Domain `jobtrix.de` muss live sein, damit die Webhook-URL stimmt) blockiert.

## Admin-Zugang einrichten (Issue #171)

Der Code schützt `/admin` (Middleware-Auth + serverseitige Rollenprüfung in `lib/admin.ts`) und blendet den Admin-Link im Header nur für Admins ein. Es fehlt nur noch, mindestens einen Nutzer zum Admin zu machen:

```sql
UPDATE "User" SET role = 'admin' WHERE email = 'DEINE-ADMIN-MAIL';
```

Alternativ via Prisma Studio (`npx prisma studio`) das Feld `role` des gewünschten Users auf `admin` setzen. Danach neu einloggen, damit die Session die Rolle übernimmt.

## AVV-/DPA-Verträge abschließen (Issue #72)

DSGVO-Pflicht vor öffentlichem Produktivbetrieb. Mit jedem Dienstleister, der im Auftrag personenbezogene Daten verarbeitet, einen Auftragsverarbeitungsvertrag abschließen und das PDF zentral archivieren (z. B. in einem privaten `compliance/avv/`-Ablageort, **nicht** im Git-Repo):

- [ ] **Supabase** (Datenbank-Hosting)
- [ ] **Render** (App-Hosting)
- [ ] **Cloudflare** (CDN/DNS)
- [ ] **Stripe** (Zahlungen – AVV ist i. d. R. Teil der Nutzungsbedingungen / Data Processing Agreement)
- [ ] **Brevo / Resend** (E-Mail-Versand – je nach eingesetztem Anbieter)
- [ ] **Anthropic** (KI-Textgenerierung)

Die Datenschutzerklärung listet diese Dienstleister bereits; sie muss dafür nicht angepasst werden.
