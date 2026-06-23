# JobTRIX – Marketing-Landingpage und Stripe Live-Vorbereitung

## Problem Statement

JobTRIX ist technisch vollständig und läuft auf Render unter einer noch nicht öffentlich bekannten Domain. Die aktuelle Startseite beschränkt sich auf eine Überschrift, einen Satz und einen CTA-Button – sie hat keinen Marketing-Charakter und überzeugt Besucher nicht, sich anzumelden oder ein Paket zu kaufen. Zusätzlich ist Stripe noch im Test-Modus konfiguriert und unterstützt keine PayPal-Zahlung, obwohl PayPal für viele deutsche Nutzer eine wichtige und vertraute Zahlungsmethode ist.

## Solution

Diese Phase besteht aus zwei zusammenhängenden Teilen:

1. **Marketing-Landingpage**: Die Startseite wird zu einer vollständigen, einprägsamen Landing Page umgebaut. Die Kernbotschaft – „In Minuten kinderleicht eine Bewerbung erstellen" – wird durch visuelle Hierarchie, einen klaren Ablauf und mutige Gestaltung transportiert. Framer Motion (bereits installiert) liefert Scroll-Animationen, die beim Herunterscrollen einzelne Abschnitte einblenden und die Seite lebendig und modern wirken lassen.

2. **Stripe Live-Vorbereitung + PayPal**: Im Code wird PayPal als Zahlungsmethode neben Kreditkarte und SEPA ergänzt. Der Code ist damit für den Wechsel in den Stripe Live-Modus vollständig vorbereitet; die eigentliche Aktivierung (Stripe-Konto verifizieren, Live-Keys in Render hinterlegen) liegt als manuelle Aufgabe beim Betreiber und ist bewusst nicht Teil des Launches in dieser Phase.

## User Stories

### Marketing-Landingpage

1. Als Besucher möchte ich auf der Startseite sofort verstehen, was JobTRIX ist und was ich damit in wenigen Minuten erreichen kann, damit ich mich entscheide, mich zu registrieren.
2. Als Besucher möchte ich einen klar hervorgehobenen CTA-Button sehen, mit dem ich direkt starten kann, damit ich ohne Suchen in die App einsteige.
3. Als Besucher möchte ich einen kurzen, illustrierten Schritt-für-Schritt-Ablauf sehen (Profil anlegen → Stelle suchen → Bewerbung generieren), damit ich verstehe, wie einfach der Prozess ist.
4. Als Besucher möchte ich eine Übersicht der wichtigsten Funktionen sehen (fünf PDF-Layouts, KI-generiertes Anschreiben, Lebenslauf, E-Mail-Entwurf, Stellensuche über die Bundesagentur für Arbeit), damit ich beurteile, ob JobTRIX zu meinen Bedürfnissen passt.
5. Als Besucher möchte ich beim Herunterscrollen erleben, dass Abschnitte und Elemente flüssig einblenden, damit die Seite modern und lebendig wirkt.
6. Als Besucher möchte ich am Ende der Seite eine klare Aufforderung sehen, mich zu registrieren oder die Preise einzusehen, damit ich nicht suchen muss, wie ich fortfahre.
7. Als bereits eingeloggter Nutzer möchte ich die Landingpage ebenfalls aufrufen können, ohne sofort weitergeleitet zu werden, damit ich die Startseite bewusst besuchen kann.
8. Als Nutzer möchte ich die Landingpage sowohl auf Deutsch als auch auf Englisch lesen können, damit die durchgängige Zweisprachigkeit von JobTRIX erhalten bleibt.

### Stripe Live-Vorbereitung + PayPal

9. Als Jobsuchender möchte ich beim Kauf eines Pakets PayPal als Zahlungsoption auswählen können, damit ich nicht zwingend eine Kreditkarte oder ein SEPA-Konto benötige.
10. Als Betreiber möchte ich eine klare Checkliste der manuellen Schritte erhalten, die nötig sind, um Stripe vom Test- in den Live-Modus zu schalten, damit ich diesen Schritt selbst zum richtigen Zeitpunkt durchführen kann.

## Implementation Decisions

### Landingpage – Struktur und Abschnitte

Die Startseite (`app/[locale]/page.tsx`) wird vollständig ersetzt. Die bisherige clientseitige Weiterleitung (`useEffect` mit `loadProfile()`) entfällt auf der Startseite; sie ist künftig für alle Besucher sichtbar, unabhängig davon, ob ein Profil im lokalen Speicher vorliegt oder der Nutzer eingeloggt ist. Die Startseite wird eine Server Component (kein `"use client"` auf Seitenebene mehr), animierte Teilbereiche werden als separate Client Components ausgelagert.

Die Landing Page gliedert sich in fünf Abschnitte von oben nach unten:

1. **Hero-Abschnitt**: Große, mutige Hauptüberschrift, die die Kernbotschaft transportiert. Darunter ein kurzer erklärender Satz und ein prominenter CTA-Button zur Registrierung. Der Hero blendet beim ersten Render mit einer kurzen Einblend-Animation ein (Framer Motion).

2. **Wie es funktioniert**: Drei nummerierte Schritte (Profil anlegen → Stelle suchen → Bewerbung generieren), horizontal auf Desktop und vertikal gestapelt auf Mobile. Jeder Schritt blendet beim Herunterscrollen zeitversetzt ein (Stagger-Animation via Framer Motion `whileInView`).

3. **Features**: Visuelle Kacheln mit den wichtigsten Vorteilen (fünf PDF-Layouts, KI-Anschreiben, E-Mail-Entwurf, Stellensuche via Bundesagentur für Arbeit). Kacheln blenden ebenfalls gestaffelt beim Herunterscrollen ein.

4. **Preise-Teaser**: Kurzer Abschnitt mit Hinweis auf die zwei Pakete (zeitlich begrenzter Zugang, Lifetime-Zugang) und einem Link zur Preisseite.

5. **Abschluss-CTA**: Großer, hervorstehender Abschnitt am Seitenende mit erneutem Registrierungs-CTA.

### Landingpage – Visuelle Richtung

- **Stil**: Modern und mutig – kräftige Akzentfarben (bestehende `accent`-CSS-Variable), großflächige Typografie, klare Kontraste. Die Seite soll unvergesslich wirken und herausstechen.
- **Animationen**: Framer Motion (`^12.40.0`, bereits installiert). Eintrittsanimationen beim ersten Laden (Hero via `animate`), Scroll-getriggerte Einblend-Animationen (`whileInView`) für alle weiteren Abschnitte. Keine dauerhaften Schleifen-Animationen. Framer Motion respektiert automatisch `prefers-reduced-motion` – Nutzer mit aktivierter „Bewegung reduzieren"-Einstellung sehen keine Animationen, ohne dass separater Code nötig ist.
- **Responsivität**: Mobile-first, alle Abschnitte funktionieren auf kleinen und großen Bildschirmen.
- **Dark Mode**: Die Landingpage unterstützt den Dark Mode vollständig über die bestehenden Tailwind-Dark-Mode-Klassen.
- **i18n**: Alle Texte über den `home`-Namespace in `messages/de.json` und `messages/en.json`. Der bestehende `home`-Namespace wird um alle neuen Abschnitte erweitert.

### Stripe – PayPal und Live-Vorbereitung

- In der Checkout-Route wird `payment_method_types` um `"paypal"` erweitert (neben den bestehenden Einträgen `"card"` und `"sepa_debit"`). PayPal muss zusätzlich im Stripe-Dashboard des Betreibers aktiviert werden (manueller Schritt, s. u.).
- Der restliche Code – Webhook-Handler, Pricing-Logik, Zugangs-Aktivierung nach erfolgreicher Zahlung – ist bereits generisch und funktioniert unverändert im Live-Modus, sobald die Live-Keys als Umgebungsvariablen auf Render hinterlegt sind.

### Stripe – Checkliste für den Betreiber (manuell, außerhalb des Codes)

1. Stripe-Konto mit vollständigen Unternehmensdaten und Bankverbindung verifizieren (Identitäts- und KYC-Prüfung durch Stripe, Dauer ca. 1–3 Werktage).
2. Im Stripe-Dashboard unter „Payment methods" PayPal aktivieren.
3. Live-API-Keys aus dem Stripe-Dashboard kopieren (`STRIPE_SECRET_KEY`, Live-Wert).
4. Neuen Stripe-Webhook für den Live-Modus anlegen (Endpunkt: `https://jobtrix.de/api/webhooks/stripe`) und das resultierende `STRIPE_WEBHOOK_SECRET` (Live) notieren.
5. Auf Render beide Werte (`STRIPE_SECRET_KEY` und `STRIPE_WEBHOOK_SECRET`) auf die Live-Werte umstellen.
6. Ersten Testkauf mit echten Zahlungsdaten durchführen, um sicherzustellen, dass Webhook und Zugangsvergabe im Live-Modus korrekt funktionieren.

## Testing Decisions

Ein guter Test prüft das beobachtbare Verhalten aus Nutzersicht, nicht interne Implementierungsdetails, und bleibt robust gegenüber Refactorings.

- **Landingpage – Inhalt**: Playwright E2E-Test, der die Startseite ohne eingeloggten Nutzer aufruft und prüft, dass die fünf Abschnitte (Hero, Wie es funktioniert, Features, Preise-Teaser, Abschluss-CTA) vorhanden und die wichtigsten Textelemente sichtbar sind. Kein Test auf Animationen (Playwright-Ausführung ohne GPU; Framer Motion deaktiviert Animationen bei `prefers-reduced-motion`, was in der Testumgebung standardmäßig aktiv ist).
- **Landingpage – kein Redirect mehr**: Playwright-Test, der sicherstellt, dass ein Besucher ohne Profil und ohne eingeloggten Zustand die Startseite sieht und nicht auf `/profile` weitergeleitet wird.
- **Checkout – PayPal**: Unit-Test für die Checkout-Route, der prüft, dass `payment_method_types` den Eintrag `"paypal"` enthält, analog zu den bestehenden Tests in `__tests__/api-checkout.test.ts`.

## Out of Scope

- Jobtrix.de öffentlicher Launch (Domain wird in dieser Phase noch nicht öffentlich beworben).
- Demo-Video auf der Landingpage (muss extern aufgenommen werden; der Platz auf der Seite kann bei Bedarf in einer späteren Phase ergänzt werden).
- Stripe Live-Modus Aktivierung (manuelle Schritte beim Betreiber; der Code ist vorbereitet, der eigentliche Switch findet in dieser Phase nicht statt).
- Änderungen an der Preisseite (`/pricing`) selbst – der Preise-Teaser auf der Startseite verlinkt nur dorthin.
- Neue PDF-Layouts oder Änderungen am Bewerbungsgenerator.
- Analytics oder Nutzer-Tracking.

## Further Notes

- Sobald jobtrix.de öffentlich erreichbar ist und die Stripe Live-Keys auf Render eingetragen sind, ist kein weiterer Code-Eingriff nötig – der Wechsel in den Live-Modus ist vollständig konfigurativ.
- Die bisherige clientseitige Redirect-Logik (`loadProfile() → router.replace(/profile)`) gehört künftig auf die Seite `/generate`, nicht auf die Startseite. Es sollte geprüft werden, ob dieser Redirect dort bereits vorhanden ist oder noch ergänzt werden muss.
- Für zukünftige Phasen vorgemerkt (kein Teil dieser Phase): Next.js Major-Upgrade, Sentry-Monitoring, PostHog-Analytics, Wechsel von Brevo zu Resend.
