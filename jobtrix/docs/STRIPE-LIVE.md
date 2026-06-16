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

4. **Stripe-Webhook für Live-Modus anlegen**
   - Im Stripe-Dashboard unter „Entwickler → Webhooks" einen neuen Endpunkt anlegen:
     - **URL:** `https://jobtrix.de/api/webhooks/stripe`
     - **Ereignisse:** `checkout.session.completed`
   - Das angezeigte **Signing Secret** (`whsec_live_...`) kopieren – das ist der neue Wert für `STRIPE_WEBHOOK_SECRET`.

5. **Umgebungsvariablen auf Render aktualisieren**
   - In der Render-Konsole für den JobTRIX-Service unter „Environment" die folgenden Werte auf die Live-Werte umstellen:
     - `STRIPE_SECRET_KEY` → `sk_live_...`
     - `STRIPE_WEBHOOK_SECRET` → `whsec_live_...`
   - Render startet den Service nach dem Speichern automatisch neu.

6. **Ersten Testkauf mit echten Zahlungsdaten durchführen**
   - Eine echte Zahlung (Kreditkarte oder SEPA) mit einem kleinen Betrag durchführen, um zu prüfen, dass Webhook-Empfang und Zugangs-Aktivierung im Live-Modus korrekt funktionieren.
   - Anschließend die Zahlung im Stripe-Dashboard unter „Zahlungen" bestätigen.
   - Den Zugang im Nutzer-Profil prüfen (Feld „Zugang gültig bis" sollte gesetzt sein).
