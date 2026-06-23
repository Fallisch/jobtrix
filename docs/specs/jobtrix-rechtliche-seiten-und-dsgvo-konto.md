# JobTRIX – Footer, rechtliche Seiten und DSGVO-Kontofunktionen

## Problem Statement

JobTRIX hat aktuell keine rechtlich erforderlichen Seiten (Impressum, Datenschutzerklärung, AGB/Nutzungsbedingungen) und keinen Footer, über den solche Seiten erreichbar wären. Die Registrierung verweist zwar textlich auf "AGB und Datenschutzbestimmungen" (`auth.register.termsLabel`), verlinkt diese aber nicht. Zudem haben Nutzer aktuell keine Möglichkeit, ihre bei JobTRIX gespeicherten personenbezogenen Daten einzusehen bzw. zu exportieren oder ihr Konto vollständig löschen zu lassen – beides ist nach DSGVO erforderlich (Art. 15/20: Auskunft & Datenportabilität; Art. 17: Recht auf Löschung). Außerdem fehlt eine zentrale Hilfe/FAQ-Seite, über die Nutzer die wichtigsten Abläufe (Bewerbung erstellen, Pakete, Jobsuche, Layouts, Datenexport/-löschung, Support) nachschlagen können.

## Solution

Diese Phase ergänzt JobTRIX um:

- Einen neuen **Footer**, der auf allen Seiten (öffentlich und nach Login, Light/Dark Mode) sichtbar ist und auf vier neue Seiten verlinkt: Impressum, Datenschutzerklärung, AGB/Nutzungsbedingungen, Hilfe/FAQ.
- Vier neue **öffentliche Content-Seiten** mit vollständigem, zweisprachigem (DE/EN) Text: Impressum mit Platzhalter-Anbieterangaben, Datenschutzerklärung mit Beschreibung aller eingesetzten Dienste, AGB mit Regelungen zu Paketen/Zahlung/Widerruf/KI-Haftungsausschluss sowie eine Hilfe/FAQ-Seite mit sechs zentralen Themen.
- Eine **Verlinkung der Registrierungs-Checkbox** ("AGB und die Datenschutzbestimmungen") auf die neuen Seiten `/agb` und `/datenschutz`.
- Einen neuen Bereich **"Konto & Datenschutz"** auf der Profilseite für eingeloggte Nutzer mit zwei Funktionen: "Meine Daten herunterladen" (vollständiger JSON-Export) und "Konto löschen" (sofortige, unwiderrufliche Löschung nach Passwort-Bestätigung).

## User Stories

### Footer

1. Als Besucher möchte ich auf jeder Seite von JobTRIX (öffentlich und nach Login) einen Footer mit Links zu Impressum, Datenschutzerklärung, AGB/Nutzungsbedingungen und Hilfe/FAQ sehen, damit ich diese Informationen jederzeit schnell finde.
2. Als Nutzer möchte ich, dass der Footer im Hell- und im Dunkelmodus korrekt und gut lesbar dargestellt wird, damit die App durchgängig nutzbar bleibt.
3. Als Nutzer möchte ich den Footer sowohl auf Deutsch als auch auf Englisch sehen, damit die durchgängige Zweisprachigkeit erhalten bleibt.

### Impressum

4. Als Besucher möchte ich über den Footer eine Impressum-Seite mit den gesetzlich vorgeschriebenen Anbieterangaben erreichen, damit ich erkenne, wer für JobTRIX verantwortlich ist.
5. Als Betreiber möchte ich, dass die Impressum-Seite zunächst klar erkennbare Platzhalter-Angaben (Name, Anschrift, Kontakt) enthält, damit die Struktur bereits steht und ich die finalen Daten später selbst eintragen kann.

### Datenschutzerklärung

6. Als Besucher möchte ich über den Footer eine Datenschutzerklärung erreichen, die verständlich beschreibt, welche meiner Daten verarbeitet werden und durch welche Dienste, damit ich informiert entscheiden kann, ob ich JobTRIX nutze.
7. Als Nutzer möchte ich in der Datenschutzerklärung konkrete Angaben zu den eingesetzten Diensten (Zahlungsabwicklung über Stripe, E-Mail-Versand über Brevo, KI-Generierung über die Anthropic Claude API, Jobsuche über die Arbeitsagentur-Jobsuche-API, Login/Session über NextAuth) finden, damit ich nachvollziehen kann, wohin meine Daten fließen.
8. Als Nutzer möchte ich in der Datenschutzerklärung einen Hinweis auf meine Rechte (Auskunft, Datenübertragbarkeit, Löschung) inklusive Verweis auf den Bereich "Konto & Datenschutz" im Profil finden, damit ich weiß, wie ich diese Rechte ausüben kann.
9. Als Betreiber möchte ich, dass der Abschnitt zum Hosting-Anbieter zunächst als klar erkennbarer Platzhalter ausgewiesen ist, damit ich ihn in der späteren Hosting-Phase ergänzen kann, ohne die Struktur der Seite zu ändern.

### AGB/Nutzungsbedingungen

10. Als Nutzer möchte ich über den Footer Nutzungsbedingungen (AGB) erreichen, die die angebotenen Pakete (kostenlose Probegenerierung, zeitlich begrenzter Zugang, Lifetime-Zugang) und die Zahlungsabwicklung über Stripe beschreiben, damit ich weiß, was ich erhalte und wie bezahlt wird.
11. Als Nutzer möchte ich in den AGB Informationen zu meinem Widerrufsrecht bei digitalen Inhalten finden, damit ich meine Rechte als Verbraucher kenne.
12. Als Nutzer möchte ich in den AGB einen Haftungsausschluss für KI-generierte Bewerbungsunterlagen finden, der klarstellt, dass ich für die inhaltliche Prüfung und Verwendung der generierten Texte selbst verantwortlich bin, damit Erwartungen und Verantwortlichkeiten klar sind.
13. Als Nutzer möchte ich, dass die Registrierungs-Checkbox "Ich akzeptiere die AGB und die Datenschutzbestimmungen" auf die neuen Seiten `/agb` und `/datenschutz` verlinkt, damit ich die Bedingungen vor der Registrierung tatsächlich lesen kann.

### Hilfe/FAQ

14. Als Nutzer möchte ich über den Footer eine Hilfe/FAQ-Seite erreichen, die die wichtigsten Abläufe von JobTRIX in Frage-Antwort-Form erklärt, damit ich Antworten auf häufige Fragen finde, ohne Support kontaktieren zu müssen.
15. Als Nutzer möchte ich auf der Hilfe-Seite erklärt bekommen, wie ich eine Bewerbung erstelle (Profil anlegen → Stelle suchen oder Stellenanzeige einfügen → generieren → PDF herunterladen oder per E-Mail versenden), damit ich den Gesamtablauf verstehe.
16. Als Nutzer möchte ich auf der Hilfe-Seite erklärt bekommen, welche Pakete es gibt, was die kostenlose Probegenerierung beinhaltet und wo ich aktuelle Preise finde, damit ich eine informierte Kaufentscheidung treffen kann.
17. Als Nutzer möchte ich auf der Hilfe-Seite erklärt bekommen, wie die integrierte Jobsuche inklusive Umkreissuche funktioniert, damit ich diese Funktion optimal nutzen kann.
18. Als Nutzer möchte ich auf der Hilfe-Seite erklärt bekommen, wie ich zwischen den PDF-Layouts, Lebenslauf-Stilen und zwischen Hell- und Dunkelmodus wechseln kann, damit ich die Darstellung an meine Vorlieben anpassen kann.
19. Als Nutzer möchte ich auf der Hilfe-Seite erklärt bekommen, wie ich meine Daten exportiere und mein Konto lösche, damit ich meine DSGVO-Rechte selbstständig wahrnehmen kann.
20. Als Nutzer möchte ich auf der Hilfe-Seite eine Möglichkeit zur Kontaktaufnahme mit dem Support finden, damit ich bei weiteren Fragen Hilfe bekomme.
21. Als Nutzer möchte ich die Hilfe/FAQ-Seite sowohl auf Deutsch als auch auf Englisch nutzen können, damit die durchgängige Zweisprachigkeit erhalten bleibt.

### Konto & Datenschutz (Profilseite)

22. Als eingeloggter Nutzer möchte ich auf meiner Profilseite einen Bereich "Konto & Datenschutz" sehen, damit ich meine datenschutzrelevanten Rechte zentral an einem Ort finde.
23. Als eingeloggter Nutzer möchte ich über "Meine Daten herunterladen" eine JSON-Datei mit allen über mich gespeicherten Daten (Profil inkl. Ausbildung, Berufserfahrung, Qualifikationen, Interessen; Bewerbungshistorie; Kontoinformationen wie E-Mail und Zugangsstatus) erhalten, damit ich mein Recht auf Auskunft und Datenportabilität wahrnehmen kann.
24. Als eingeloggter Nutzer möchte ich über "Konto löschen" mein Konto und alle zugehörigen Daten sofort und unwiderruflich löschen lassen können, damit ich mein Recht auf Löschung wahrnehmen kann.
25. Als eingeloggter Nutzer möchte ich vor der endgültigen Löschung mein aktuelles Passwort eingeben und die Löschung explizit bestätigen müssen, damit ich nicht versehentlich mein Konto lösche.
26. Als Nutzer möchte ich nach erfolgreicher Konto-Löschung automatisch abgemeldet und auf die Startseite weitergeleitet werden, damit ich ein klares Feedback erhalte, dass die Löschung erfolgreich war.
27. Als Nutzer möchte ich bei einer falschen Passworteingabe eine verständliche Fehlermeldung erhalten, ohne dass mein Konto gelöscht wird, damit ich die Eingabe korrigieren kann.
28. Als Nutzer möchte ich den Bereich "Konto & Datenschutz" sowohl auf Deutsch als auch auf Englisch nutzen können, damit die durchgängige Zweisprachigkeit erhalten bleibt.

## Implementation Decisions

### Footer

- Neue Komponente analog im Aufbau zu `Header.tsx`: gleiche Farbpalette (`bg-primary`/`text-white` bzw. die entsprechenden Dark-Mode-Klassen), gleiche Container-Breite (`max-w-5xl mx-auto px-4`), aber als schlanke Leiste am Seitenende.
- Wird im Root-Layout (`app/[locale]/layout.tsx`) unterhalb von `<main>` eingebunden, sodass sie auf allen Seiten erscheint – öffentlich und nach Login, unabhängig von `protectedPaths`.
- Enthält vier Links auf `/${locale}/impressum`, `/${locale}/datenschutz`, `/${locale}/agb`, `/${locale}/hilfe`.
- Neuer i18n-Namespace `footer` für die vier Link-Texte (DE/EN).

### Neue öffentliche Seiten (Impressum, Datenschutz, AGB, Hilfe)

- Vier neue Routen unter `app/[locale]/`: `impressum`, `datenschutz`, `agb`, `hilfe` – jeweils Server Components analog zur Startseite, **nicht** in `protectedPaths` der Middleware, also öffentlich erreichbar.
- Inhalte werden vollständig über next-intl bereitgestellt (neue Namespaces `impressum`, `datenschutz`, `agb`, `hilfe`), sodass beide Sprachfassungen vollständig und konsistent gepflegt werden – analog zum bisherigen Vorgehen bei allen Texten der App.
- Visuelle Gestaltung: bestehender Seiten-Container-Stil (zentrierter Container, vertikale Abstände), Überschriften- und Textklassen wie auf Profil-/Startseite, vollständig Light/Dark-Mode-kompatibel über bestehende `dark:`-Klassen.

### Impressum

- Platzhalter-Struktur mit den üblichen Pflichtangaben nach § 5 TMG: Anbietername, Anschrift, Kontakt (E-Mail), vertretungsberechtigte Person, ggf. Umsatzsteuer-ID. Alle Werte werden als deutlich erkennbare Platzhalter (z. B. „[Platzhalter: Firmenname]") hinterlegt, die der Betreiber vor dem Live-Gang durch echte Daten ersetzt.

### Datenschutzerklärung

Beschreibt in eigenen Abschnitten:

- **Verantwortlicher**: Platzhalter, identisch zum Impressum.
- **Registrierung/Login & Session** (NextAuth): E-Mail, Passwort-Hash, Session-Cookie – rein technisch notwendig, kein Tracking.
- **Profildaten**: Name, Adresse, Kontaktdaten, Ausbildung, Berufserfahrung, Qualifikationen, Foto – gespeichert in der Datenbank, Zweck: Generierung der Bewerbungsunterlagen.
- **KI-Generierung** (Anthropic Claude API): Profildaten und eingefügte Stellenanzeige werden zur Erstellung von Anschreiben/Lebenslauf an den Dienst übermittelt.
- **Jobsuche** (Arbeitsagentur-Jobsuche-API): nur Suchparameter wie Berufsfeld, Ort und Umkreis werden übermittelt, keine personenbezogenen Daten.
- **Zahlungsabwicklung** (Stripe): E-Mail und Zahlungsdaten zur Abwicklung der Pakete.
- **E-Mail-Versand** (Brevo): E-Mail-Adresse und Bewerbungsinhalte beim Versand per E-Mail.
- **Hosting**: eigener Abschnitt mit klar erkennbarem Platzhalter-Hinweis, dass der Hosting-Anbieter in einer späteren Phase ergänzt wird.
- **Speicherdauer & Rechte der Nutzer**: Verweis auf Auskunft/Datenportabilität und Löschung über den Bereich "Konto & Datenschutz" im Profil.
- **Cookies**: Hinweis, dass ausschließlich technisch notwendige Cookies (Session-Cookie) gesetzt werden, kein Tracking, kein Cookie-Consent-Banner notwendig.

### AGB/Nutzungsbedingungen

Beschreibt in eigenen Abschnitten:

- **Vertragsgegenstand**: Erstellung individueller Bewerbungsunterlagen mittels KI-Unterstützung.
- **Pakete**: kostenlose Probegenerierung, zeitlich begrenzter Zugang, Lifetime-Zugang – Beschreibung der Paketarten in Worten (analog zu den bestehenden Texten im i18n-Namespace `pricing`); für aktuelle Preise und Laufzeiten wird auf die Bezahlseite (`/pricing`) verwiesen, um Preisangaben nicht doppelt pflegen zu müssen.
- **Zahlungsabwicklung** über Stripe (Kreditkarte/SEPA-Lastschrift, analog zum bestehenden Hinweistext `pricing.secureNote`).
- **Widerrufsrecht bei digitalen Inhalten**: Standardklausel inkl. Hinweis auf das vorzeitige Erlöschen des Widerrufsrechts bei ausdrücklicher Zustimmung zur sofortigen Ausführung (typisch für sofort nutzbare digitale Leistungen).
- **Haftungsausschluss für KI-generierte Inhalte**: Der Nutzer ist für die inhaltliche Prüfung, Richtigkeit und rechtliche Eignung der generierten Anschreiben/Lebensläufe selbst verantwortlich; JobTRIX übernimmt keine Garantie für Bewerbungserfolg oder inhaltliche Korrektheit.
- **Nutzungsrechte an generierten Inhalten**: Der Nutzer darf generierte Texte uneingeschränkt für eigene Bewerbungen verwenden.
- **Laufzeit/Kündigung der Pakete, Änderungen der AGB, anwendbares Recht/Gerichtsstand**: Platzhalter, analog zum Impressum.

### Verlinkung in der Registrierung

- Das bestehende Label `auth.register.termsLabel` wird so umgebaut, dass "AGB" auf `/agb` und "Datenschutzbestimmungen" auf `/datenschutz` verlinkt sind (Links öffnen in einem neuen Tab, damit der Registrierungs-Fortschritt nicht verloren geht). Der Text bleibt inhaltlich unverändert.

### Hilfe/FAQ-Seite

- Sechs Themenblöcke als Frage-Antwort-Paare, jeweils als aufklappbares Element (natives `<details>`/`<summary>` im bestehenden Karten-Stil, keine neue UI-Bibliothek nötig):
  1. Wie erstelle ich eine Bewerbung? (Profil → Stelle suchen/Stellenanzeige einfügen → generieren → PDF/E-Mail)
  2. Welche Pakete gibt es und was kosten sie? (inkl. kostenloser Probegenerierung, Verweis auf `/pricing` für aktuelle Preise)
  3. Wie funktioniert die Jobsuche inkl. Umkreissuche?
  4. Wie wechsle ich PDF-Layout, Lebenslauf-Stil und Dark Mode?
  5. Wie exportiere ich meine Daten oder lösche ich mein Konto? (Verweis auf "Konto & Datenschutz" im Profil)
  6. Wie erreiche ich den Support? (Kontakt-E-Mail, Platzhalter)
- Neuer i18n-Namespace `help` mit Frage-/Antwort-Strings je Thema.

### Bereich "Konto & Datenschutz" (Profilseite)

- Neue Komponente, unterhalb des bestehenden Profilformulars auf der Profilseite eingebunden – eigenständiges Modul, getrennt von den Profildaten-Feldern. Die Profilseite ist bereits über `protectedPaths` geschützt.
- **"Meine Daten herunterladen"**: Button löst einen Request an eine neue, geschützte API-Route aus, die ein vollständiges JSON mit Profil (inkl. Ausbildung, Berufserfahrung, Qualifikationen, Interessen), Bewerbungshistorie und Kontoinformationen (E-Mail, Erstellungsdatum, Zugangsstatus/Paket) zusammenstellt; die Antwort wird im Browser als Datei-Download angeboten.
- **"Konto löschen"**: Button öffnet einen Bestätigungsbereich mit Eingabefeld für das aktuelle Passwort und einem zusätzlichen expliziten Bestätigungsschritt (zweiter Button "Konto endgültig löschen", erst nach Passworteingabe aktiv). Erst nach korrekter Passworteingabe und expliziter Bestätigung wird die Löschung ausgeführt.
- Neue geschützte API-Route für die Löschung: verifiziert das übergebene Passwort gegen `User.passwordHash` (bcrypt, analog zur Verifizierung in `lib/auth.ts`); bei falschem Passwort wird die Löschung abgebrochen und ein Fehler zurückgegeben, ohne Daten zu verändern. Bei korrektem Passwort wird der User-Datensatz gelöscht; bestehende Cascade-Relationen (`UserProfile`, `Access`, `ApplicationHistoryEntry`, `Account`, `Session`) sorgen dafür, dass alle zugehörigen Daten mitgelöscht werden.
- Nach erfolgreicher Löschung wird der Nutzer client-seitig abgemeldet (`signOut`, analog zum bestehenden Logout im Header) und auf die Startseite des aktuellen Locale weitergeleitet.
- Neuer i18n-Namespace (oder Erweiterung von `profile`) mit Strings für Überschrift, Buttons, Bestätigungstexte und Fehlermeldungen (z. B. "falsches Passwort").

### Routing/Middleware

- `protectedPaths` in `middleware.ts` bleibt unverändert (`/profile`, `/generate`, `/application-history`); die vier neuen Content-Seiten sind explizit öffentlich.
- Die beiden neuen API-Routen für Datenexport und Konto-Löschung folgen dem bestehenden Auth-Muster (`getServerSession`, 401 bei fehlender Session) wie `/api/profile` und `/api/access`.

### Visual Direction

- Footer und alle vier neuen Seiten übernehmen 1:1 den bestehenden visuellen Stil (Farbpalette, Typografie, `dark:`-Klassen, Container-Breiten) – keine neue Designsprache, keine neuen Komponenten-Bibliotheken.
- Hilfe/FAQ nutzt native `<details>`/`<summary>`-Elemente im bestehenden Karten-Stil (Rahmen, Eckenradius, Hintergrundfarben wie bei bestehenden Karten in der Jobsuche).
- Der Bereich "Konto & Datenschutz" folgt dem bestehenden Formular-/Abschnitts-Stil von `ProfileForm.tsx` (Sektionsüberschriften, Abstände, Button-Stile); die "Konto löschen"-Bestätigung verwendet einen optisch hervorgehobenen, aber stilistisch konsistenten Warnbereich (z. B. roter Akzent für den finalen Löschen-Button, analog zu bestehenden `deleteButton`-Stilen in der Bewerbungshistorie).

## Testing Decisions

Wie in den Vorphasen gilt: Ein guter Test prüft das beobachtbare Verhalten aus Nutzersicht, nicht interne Implementierungsdetails, und bleibt robust gegenüber Refactorings.

### Footer

- Komponententest: Der Footer rendert vier Links mit korrekten `href`-Werten (`/${locale}/impressum`, `/datenschutz`, `/agb`, `/hilfe`) für beide Locales.
- Test, dass der Footer im Root-Layout gerendert wird und somit auf allen Seiten erscheint.

### Neue Seiten

- Je ein Render-Test pro Seite (Impressum, Datenschutz, AGB, Hilfe): Überschrift und mindestens ein Kernabschnitt sind sichtbar, analog zu bestehenden Tests für die Startseite bzw. `pricing/page.tsx`.
- Hilfe/FAQ: Test, dass alle sechs Themenblöcke vorhanden sind und sich aufklappen lassen.

### Registrierung

- Erweiterung von `RegisterForm.test.tsx`: "AGB" und "Datenschutzbestimmungen" im Label sind als Links mit korrekten `href`-Werten vorhanden.

### Konto & Datenschutz (Komponente)

- Komponententest: Bereich "Konto & Datenschutz" wird auf der Profilseite gerendert und enthält beide Buttons.
- "Konto löschen": Klick öffnet den Passwort-/Bestätigungsbereich; Absenden ohne oder mit falschem Passwort zeigt eine Fehlermeldung und löst keinen Logout aus; Absenden mit korrektem Passwort und expliziter Bestätigung ruft die Löschen-API auf und löst `signOut` aus (API und `signOut` werden gemockt).
- "Meine Daten herunterladen": Klick löst einen Request an die Export-API aus und startet einen Datei-Download (API wird gemockt; geprüft wird der Download-Trigger, nicht der konkrete Dateiinhalt).

### API-Routen

- `/api/account/export`: 401 ohne Session; bei vorhandener Session liefert die Route ein JSON mit den erwarteten Top-Level-Schlüsseln für Profil, Bewerbungshistorie und Kontoinformationen (Prisma gemockt, analog zu bestehenden Tests für `/api/profile`).
- `/api/account/delete`: 401 ohne Session; 400/401 bei falschem Passwort (gemocktes `bcrypt.compare` → `false`), ohne dass `prisma.user.delete` aufgerufen wird; bei korrektem Passwort wird `prisma.user.delete` mit der korrekten User-ID aufgerufen und die Route antwortet mit Erfolg (Prisma und bcrypt gemockt, analog zu bestehenden Tests für `/api/profile`/`/api/access`).

### Teststrategie

- Unit-/Komponententests mit Jest + React Testing Library, konsistent zu den bestehenden Tests in `__tests__/`.
- E2E mit Playwright: neuer Flow, der `registerAndLogin()` nutzt, zur Profilseite navigiert, den Bereich "Konto & Datenschutz" öffnet, den Datenexport anstößt und anschließend die Konto-Löschung mit korrektem Passwort durchführt – geprüft wird, dass der Nutzer danach abgemeldet ist und sich mit den alten Zugangsdaten nicht mehr einloggen kann. Zusätzlich ein E2E-Flow, der den Footer und die vier neuen Seiten in beiden Sprachen aufruft.

## Out of Scope

- Cookie-Consent-Banner – JobTRIX setzt aktuell kein Tracking ein, daher nicht erforderlich.
- Eine "Über uns"-Seite.
- Soft-Delete bzw. Wartezeit/Karenzzeit vor der endgültigen Konto-Löschung – die Löschung erfolgt sofort und unwiderruflich.
- Finale Inhalte für das Impressum (Anbieterangaben) – bleiben Platzhalter, werden vom Betreiber selbst ergänzt.
- Finaler Hosting-Anbieter in der Datenschutzerklärung – wird in der separaten Hosting-Phase ergänzt.
- Sicherheitsprüfung der App – eigene, separate Folgephase.
- Hosting/Produktionsreife (Render, Supabase, Cloudflare) – eigene, separate Folgephase.
- Abonnements/wiederkehrende Zahlungen, Mandantenfähigkeit/B2B.
- Stornierung/Rückerstattung bestehender Stripe-Zahlungen im Rahmen einer Konto-Löschung – `stripePaymentId` bleibt unberührt; ein etwaiger Refund-Prozess ist nicht Teil dieser Phase.
- E-Mail-Verifizierung bei Registrierung.

## Further Notes

- Zeitrahmen: kein festes Datum, zügige Umsetzung im bisherigen Tempo.
- Empfohlene Reihenfolge: (1) Footer + vier neue Content-Seiten + Verlinkung in der Registrierung (rein additiv, keine Abhängigkeiten zu bestehenden Funktionen), (2) Bereich "Konto & Datenschutz" mit Datenexport und Konto-Löschung (hängt von keinem der vorherigen Punkte ab, kann parallel oder danach erfolgen).
- Direkt im Anschluss an diese Phase sind laut Planung zwei weitere Phasen vorgesehen: Sicherheitsprüfung der App und produktionsreifes Hosting (Render, Supabase, Cloudflare) – jeweils mit eigenem `grill-me`.
- Nach Abschluss dieser Phase sollte das Glossar (`docs/UBIQUITOUS_LANGUAGE.md`) um die Begriffe "Konto & Datenschutz", "Datenexport" und "Konto löschen" ergänzt werden.
