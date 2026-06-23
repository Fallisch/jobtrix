# JobTRIX – Schlussphase: Go-Live

## Problem Statement

JobTRIX ist technisch und funktional vollständig, läuft auf Render/Supabase/Cloudflare und hat alle Features implementiert – von der KI-gestützten Bewerbungserstellung über fünf PDF-Layouts und Dark Mode bis hin zu Nutzerkonten, Bezahlsystem und einer Marketing-Landingpage. Drei Dinge stehen jedoch noch aus, bevor die App tatsächlich öffentlich genutzt und damit Geld verdient werden kann: Stripe verarbeitet noch keine echten Zahlungen (Test-Modus), die Domain jobtrix.de ist noch nicht öffentlich konfiguriert, und die nach DSGVO erforderlichen Auftragsverarbeitungsverträge (AVV) mit den externen Dienstleistern fehlen.

## Solution

Diese Schlussphase umfasst die letzten drei Schritte, die JobTRIX vom fertigen Produkt zum öffentlich nutzbaren, rechtskonformen und monetarisierten Dienst machen:

1. **Stripe Live-Modus aktivieren**: Die bestehenden Test-Keys werden durch Live-Keys ersetzt, damit echte Zahlungen entgegengenommen werden. Der Code ist bereits vollständig vorbereitet (Checkout, Webhook, Zugangsvergabe); es handelt sich ausschließlich um Konfiguration und manuelle Schritte im Stripe-Dashboard und auf Render.

2. **Domain jobtrix.de konfigurieren**: Die Domain wird über Cloudflare als DNS/CDN auf die Render-Instanz verwiesen, HTTPS ist aktiv, und die App ist unter jobtrix.de öffentlich erreichbar.

3. **AVV-Verträge abschließen**: Mit jedem externen Dienstleister, der personenbezogene Daten verarbeitet, wird ein Auftragsverarbeitungsvertrag abgeschlossen. Das betrifft: Supabase, Render, Cloudflare, Stripe, Brevo und Anthropic.

## User Stories

1. Als Jobsuchender möchte ich ein Paket mit echtem Geld kaufen können (Kreditkarte, SEPA-Lastschrift oder PayPal), damit ich nach Bezahlung sofort Zugang zur Generierung erhalte.
2. Als Jobsuchender möchte ich JobTRIX unter jobtrix.de aufrufen können, damit ich die App über eine einprägsame, professionelle Domain erreiche.
3. Als Jobsuchender möchte ich sicher sein, dass meine personenbezogenen Daten DSGVO-konform verarbeitet werden, damit ich der App vertrauen kann.
4. Als Betreiber möchte ich echte Zahlungen über Stripe empfangen und auf mein Bankkonto ausgezahlt bekommen, damit JobTRIX Einnahmen generiert.
5. Als Betreiber möchte ich alle rechtlich erforderlichen AVV-Verträge abgeschlossen haben, damit ich die App ohne rechtliches Risiko öffentlich betreiben kann.
6. Als Betreiber möchte ich eine vollständige Checkliste aller manuellen Schritte haben, damit ich den Go-Live selbstständig und fehlerfrei durchführen kann.

## Implementation Decisions

### Stripe Live-Modus

Der Code ist bereits vollständig für den Live-Modus vorbereitet (Checkout-Route mit Kreditkarte, SEPA und PayPal, Webhook-Handler, Zugangsvergabe). Die Umstellung ist rein konfigurativ:

1. Stripe-Konto mit vollständigen Unternehmensdaten und Bankverbindung verifizieren (Identitäts- und KYC-Prüfung durch Stripe).
2. Im Stripe-Dashboard unter „Payment methods" sicherstellen, dass Kreditkarte, SEPA-Lastschrift und PayPal aktiviert sind.
3. Live-API-Keys aus dem Stripe-Dashboard kopieren.
4. Neuen Stripe-Webhook für den Live-Modus anlegen (Endpunkt: `https://jobtrix.de/api/webhooks/stripe`) und das Webhook-Secret notieren.
5. Auf Render die Umgebungsvariablen `STRIPE_SECRET_KEY` und `STRIPE_WEBHOOK_SECRET` auf die Live-Werte umstellen.
6. Ersten Testkauf mit echten Zahlungsdaten durchführen.

Es sind keine Code-Änderungen erforderlich.

### Domain jobtrix.de

Die Domain wird über Cloudflare verwaltet (bereits als DNS/CDN im Standard-Stack vorgesehen):

1. Domain jobtrix.de bei Cloudflare als Zone einrichten (Nameserver umstellen).
2. DNS-Eintrag (CNAME oder A-Record) auf die Render-Instanz setzen.
3. In Render die Custom Domain jobtrix.de hinzufügen und HTTPS-Zertifikat provisionieren lassen.
4. Cloudflare-SSL auf „Full (Strict)" setzen.
5. Redirect von www.jobtrix.de auf jobtrix.de einrichten.
6. `NEXTAUTH_URL` auf Render auf `https://jobtrix.de` aktualisieren.
7. Stripe-Webhook-Endpunkt auf die neue Domain aktualisieren (s. o.).

### AVV-Verträge

Für jeden Dienstleister, der personenbezogene Daten im Auftrag verarbeitet, muss ein AVV vorliegen. Die betroffenen Dienstleister und ihre typischen AVV-Wege:

- **Supabase**: Data Processing Agreement (DPA) über das Supabase-Dashboard oder per E-Mail anforderbar.
- **Render**: DPA über die Render-Website verfügbar oder per Support anforderbar.
- **Cloudflare**: DPA automatisch Teil der Enterprise- oder Pro-Nutzungsbedingungen; ggf. separat über das Dashboard akzeptierbar.
- **Stripe**: DPA ist Teil der Stripe-Nutzungsbedingungen und wird bei Kontoeröffnung akzeptiert.
- **Brevo**: DPA über das Brevo-Dashboard unter DSGVO-Einstellungen aktivierbar.
- **Anthropic**: DPA über die Anthropic-Website oder per E-Mail anforderbar.

Jeder abgeschlossene AVV sollte als PDF archiviert werden. Die Datenschutzerklärung von JobTRIX listet diese Dienstleister bereits auf und muss nicht angepasst werden.

## Testing Decisions

Diese Phase enthält keine Code-Änderungen und damit keine automatisierten Tests. Die Verifizierung erfolgt manuell:

- **Stripe Live**: Erster echter Kauf (kleinstes Paket) mit Kreditkarte, SEPA und PayPal durchführen. Prüfen, dass der Zugang aktiviert wird und die Zahlung im Stripe-Dashboard als Live-Transaktion erscheint.
- **Domain**: jobtrix.de im Browser aufrufen und prüfen, dass HTTPS aktiv ist, die App korrekt lädt, Login/Registrierung funktioniert und die Webhook-URL erreichbar ist.
- **AVV**: Checkliste der sechs Dienstleister abhaken, sobald der jeweilige AVV/DPA unterzeichnet oder akzeptiert und archiviert ist.

## Out of Scope

- Code-Änderungen jeglicher Art – diese Phase ist rein konfigurativ und administrativ.
- Analytics, Monitoring oder Tracking (z. B. PostHog, Sentry) – kann in einer späteren Phase ergänzt werden.
- Marketing-Maßnahmen, SEO-Optimierung oder öffentliche Bewerbung der Domain.
- Änderungen an der Datenschutzerklärung (die betroffenen Dienstleister sind bereits aufgeführt).
- Preisänderungen oder neue Pakete.

## Further Notes

- Die Reihenfolge ist wichtig: Zuerst die Domain einrichten (Cloudflare + Render), dann Stripe Live-Modus aktivieren (damit der Webhook-Endpunkt auf der richtigen Domain liegt), zuletzt AVV-Verträge abschließen (können parallel laufen, aber müssen vor dem öffentlichen Launch abgeschlossen sein).
- Nach Abschluss dieser Phase ist JobTRIX ein öffentlich nutzbares, rechtskonformes und monetarisiertes Produkt.
- Für zukünftige Verbesserungen vorgemerkt (kein Teil dieser Phase): Sentry-Monitoring, PostHog-Analytics, SEO, Marketing-Kampagnen.
