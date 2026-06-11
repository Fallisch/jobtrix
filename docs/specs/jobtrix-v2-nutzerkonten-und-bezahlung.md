# JobTRIX – Nutzerkonten, Datenbank & Bezahlsystem (V2 Phase 1)

## Problem Statement

JobTRIX V1 funktioniert vollständig ohne Konten: Das Nutzerprofil liegt nur lokal im Browser (localStorage), es gibt keine Möglichkeit zur Monetarisierung, keine Synchronisation zwischen Geräten und keinen Verlauf bereits erstellter Bewerbungen. Damit JobTRIX kommerziell betrieben werden kann, fehlt das technische und organisatorische Fundament: Nutzerkonten, eine zentrale, datenschutzkonforme Datenhaltung, ein Bezahlsystem für den Zugang zur Generierung sowie eine Übersicht über bereits erstellte Bewerbungen.

## Solution

V2 Phase 1 baut dieses Fundament. Jeder Jobsuchende registriert sich mit E-Mail-Adresse und Passwort und erhält ein eigenes, isoliertes Nutzerkonto. Das Nutzerprofil – bisher im Browser gespeichert – zieht in eine eigene, in der EU gehostete PostgreSQL-Datenbank um und ist damit geräteübergreifend verfügbar. Jeder neue Nutzer kann eine Bewerbung kostenlos zur Probe generieren; für weitere Generierungen kauft der Nutzer über Stripe einen Zugang – entweder zeitlich begrenzt (günstiger) oder als Lifetime-Zugang (einmalig, unbegrenzt gültig). Jede generierte Bewerbung (Anschreiben, Lebenslauf-Daten und E-Mail-Entwurf) wird automatisch in einer Bewerbungshistorie gespeichert, die der Nutzer jederzeit einsehen und aus der er Unterlagen erneut herunterladen kann.

## User Stories

1. Als Jobsuchender möchte ich mich mit E-Mail-Adresse und Passwort registrieren können, damit ich ein persönliches Nutzerkonto bei JobTRIX erhalte.
2. Als Jobsuchender möchte ich mich mit meinen Zugangsdaten anmelden können, damit ich auf mein Nutzerprofil und meine Bewerbungen zugreifen kann.
3. Als Jobsuchender möchte ich mein Passwort über einen per E-Mail zugesandten Link zurücksetzen können, falls ich es vergessen habe, damit ich mein Konto nicht verliere.
4. Als Jobsuchender möchte ich, dass mein Nutzerprofil (Name, Adresse, Geburtsdatum, Foto, Ausbildungseinträge, Qualifikationen, Interessen) zentral in meinem Konto gespeichert wird, damit ich von jedem Gerät aus darauf zugreifen kann.
5. Als Jobsuchender möchte ich mein Nutzerprofil wie gewohnt bearbeiten können, damit Änderungen sofort und geräteübergreifend in zukünftige Bewerbungen einfließen.
6. Als neu registrierter Nutzer möchte ich eine Bewerbung einmalig kostenlos generieren können, damit ich JobTRIX vor dem Kauf ausprobieren kann.
7. Als Nutzer, der seine kostenlose Generierung bereits verbraucht hat, möchte ich beim Versuch einer weiteren Generierung auf eine Bezahlseite geleitet werden, damit ich weiß, wie ich JobTRIX weiter nutzen kann.
8. Als Nutzer möchte ich auf der Bezahlseite zwischen einem zeitlich begrenzten Zugang und einem Lifetime-Zugang wählen können, damit ich das für mich passende Angebot auswähle.
9. Als Nutzer möchte ich per Stripe sicher mit Kreditkarte oder SEPA-Lastschrift bezahlen können, damit der Kaufvorgang schnell und vertrauenswürdig abläuft.
10. Als Nutzer möchte ich nach erfolgreicher Zahlung ohne erneute Anmeldung sofort weitere Bewerbungen generieren können, damit der Kaufvorgang nahtlos in den Ablauf übergeht.
11. Als Nutzer mit zeitlich begrenztem Zugang möchte ich erkennen können, bis wann mein Zugang gültig ist, damit ich rechtzeitig verlängern kann.
12. Als Nutzer, dessen zeitlich begrenzter Zugang abgelaufen ist, möchte ich beim nächsten Generierungsversuch wieder zur Bezahlseite geleitet werden, damit klar ist, dass eine Verlängerung nötig ist.
13. Als Nutzer möchte ich, dass jede generierte Bewerbung (Anschreiben, Lebenslauf-Daten und E-Mail-Entwurf) automatisch in einer Bewerbungshistorie gespeichert wird, damit ich nichts manuell sichern muss.
14. Als Nutzer möchte ich meine Bewerbungshistorie als Liste mit Erstellungsdatum und Stellenbezug einsehen können, damit ich den Überblick über meine bisherigen Bewerbungen behalte.
15. Als Nutzer möchte ich eine vergangene Bewerbung aus der Historie erneut öffnen und die zugehörigen PDFs erneut herunterladen können, damit ich sie bei Bedarf erneut einreichen kann.
16. Als Nutzer möchte ich, dass mein Nutzerprofil und meine Bewerbungshistorie ausschließlich für mich sichtbar und strikt von anderen Konten getrennt sind, damit meine sensiblen persönlichen Daten geschützt bleiben.
17. Als Nutzer möchte ich, dass mein Passwort ausschließlich in gehashter Form gespeichert wird, damit meine Zugangsdaten auch bei einem Datenleck geschützt bleiben.
18. Als Nutzer möchte ich nach dem Login angemeldet bleiben, damit ich JobTRIX nicht bei jedem Besuch erneut einloggen muss.
19. Als Jobsuchender möchte ich die neuen Seiten (Login, Registrierung, Bezahlseite, Bewerbungshistorie) im gewohnten, vertrauenswürdigen Design von JobTRIX sehen, damit sich die App weiterhin wie aus einem Guss anfühlt.
20. Als Jobsuchender möchte ich die neuen Seiten sowohl auf Deutsch als auch auf Englisch nutzen können, damit die durchgängige Zweisprachigkeit der App erhalten bleibt.

## Implementation Decisions

### Architektur

- **Erweiterung des bestehenden Projekts:** Kein neues Projekt – die bestehende Next.js-App-Router-Struktur, next-intl-Übersetzungen (DE/EN) und die bestehenden Module (Generierungs-Engine, Editor, Export) bleiben erhalten und werden um Authentifizierung, Datenbankanbindung, Bezahlung und Historie ergänzt.
- **Authentifizierung:** NextAuth.js mit Credentials Provider (E-Mail + Passwort). Passwörter werden mit bcrypt gehasht gespeichert, niemals im Klartext.
- **Datenbank:** Eigene PostgreSQL-Datenbank, gehostet in der EU/Deutschland.
- **ORM:** Prisma, inklusive des offiziellen NextAuth-Prisma-Adapters für Nutzer- und Sitzungsverwaltung. Prisma übersetzt typsichere TypeScript-Aufrufe in SQL und verwaltet Schema-Migrationen.
- **Sessions:** JWT-Sessions mit serverseitigem Live-Check pro Anfrage. *(Korrektur gegenüber der ursprünglichen Planung einer rein datenbankgestützten Session: NextAuth v4 erlaubt den Credentials Provider technisch nur in Kombination mit der Session-Strategie `"jwt"` – eine Kombination mit `"database"` führt zu einem `CALLBACK_CREDENTIALS_JWT_ERROR`. Das eigentliche Ziel – der aktuelle Zugang-Status wird bei jeder Anfrage serverseitig zuverlässig geprüft – bleibt erhalten: Der `session`-Callback liest den User bei jeder Anfrage live aus der Datenbank und reichert die Session mit dem aktuellen Stand (inkl. Zugang-Status, siehe Datenmodell) an.)*
- **E-Mail-Versand:** Brevo (transaktionale E-Mails) für den Versand der Passwort-Reset-E-Mail. Reset-Links enthalten ein zeitlich begrenztes, signiertes Token.
- **Zahlungsabwicklung:** Stripe Checkout (gehostete Bezahlseite) für Einmalzahlungen mit Karte und SEPA-Lastschrift. Vertragspartner ist Stripe Payments Europe (DSGVO-konformer AVV). Ein Webhook (`checkout.session.completed`) aktiviert nach erfolgreicher Zahlung serverseitig den gekauften Zugang.

### Datenmodell (neu/erweitert)

- **User:** E-Mail-Adresse (eindeutig), gehashtes Passwort, Erstellungsdatum.
- **Nutzerprofil:** 1:1-Beziehung zu User; übernimmt inhaltlich die bestehende ProfileData-Struktur (Name, Adresse, E-Mail, Telefon, Geburtsdatum, Foto, Ausbildungseinträge, Qualifikationen, Interessen). Das Foto bleibt – analog zur bisherigen localStorage-Lösung – als Base64-codiertes Bild in der Datenbank gespeichert; eine Auslagerung in einen separaten Objektspeicher ist eine mögliche spätere Optimierung, aber nicht Teil dieser Phase.
- **Zugang:** Pro User wird der Zugriffsstatus auf die Generierung gespeichert: ob die kostenlose Test-Generierung bereits verbraucht wurde, welches Paket aktiv ist (kein Zugang / zeitlich begrenzt / Lifetime), bis wann ein zeitlich begrenzter Zugang gültig ist, sowie ein Verweis auf die zugehörige Stripe-Zahlung.
- **Bewerbungshistorie-Eintrag:** Pro generierter Bewerbung wird gespeichert: Erstellungsdatum, Bezug zur Stellenanzeige (z. B. Stellentitel/Firma, soweit erkennbar oder vom Nutzer angegeben), das generierte Anschreiben, die zum Generierungszeitpunkt verwendeten Lebenslauf-Daten (als Schnappschuss, damit der Lebenslauf später unverändert erneut exportiert werden kann) sowie der E-Mail-Entwurf (Betreff + Text).

### Module

- **Auth-Modul:** Seiten für Login, Registrierung und Passwort-Reset (Anfordern + neues Passwort setzen) sowie die zugehörige NextAuth-Konfiguration. Eine Middleware schützt die bestehenden Seiten (Profil, Generieren, Bewerbungshistorie) – nicht angemeldete Nutzer werden zur Login-Seite weitergeleitet.
- **Profilmodul (migriert):** Das bestehende ProfileForm wird von localStorage-Persistenz auf serverseitige Persistenz pro Nutzerkonto umgestellt. Die ProfileData-Struktur und das Formular selbst bleiben inhaltlich unverändert.
- **Zugriffssteuerung:** Prüft vor jeder Generierung den Zugang-Status des angemeldeten Nutzers (kostenlose Generierung verfügbar? aktives Paket? Gültigkeitsdatum nicht überschritten?). Bei fehlendem Zugang wird der Nutzer zur Bezahlseite geleitet, statt die Generierung auszuführen.
- **Zahlungs-Modul:** Bezahlseite mit den zwei Paketen ("Zeitlich begrenzter Zugang" und "Lifetime-Zugang"), Weiterleitung zu Stripe Checkout sowie ein Webhook-Endpunkt, der nach erfolgreicher Zahlung den entsprechenden Zugang im Nutzerkonto aktiviert.
- **Bewerbungshistorie-Modul:** Legt nach jeder erfolgreichen Generierung automatisch einen Bewerbungshistorie-Eintrag an. Die Historie-Seite listet alle Einträge des Nutzers auf, erlaubt das schreibgeschützte Anzeigen eines Eintrags sowie den erneuten PDF-Export von Anschreiben und Lebenslauf.
- **E-Mail-Modul:** Kapselt den Versand der Passwort-Reset-E-Mail über Brevo, inklusive Erzeugung und Prüfung des zeitlich begrenzten Reset-Tokens.

### Technische Entscheidungen

- Die bestehende KI-Generierung (Claude API), die clientseitige PDF-Generierung (react-pdf) und next-intl bleiben in ihrer Funktionsweise unverändert. Sie beziehen Profildaten künftig aus der Datenbank statt aus localStorage und lösen zusätzlich das Anlegen eines Bewerbungshistorie-Eintrags aus.
- Stripe Checkout Sessions werden serverseitig erzeugt; die Bezahlseite leitet den Nutzer dorthin weiter und empfängt ihn nach Abschluss mit einer Erfolgs- bzw. Abbruch-Meldung zurück.
- Die zwei Pakete (Preis, Laufzeit des zeitlich begrenzten Zugangs) werden konfigurierbar gehalten (z. B. über Umgebungsvariablen oder eine kleine Konfigurationsdatei), sodass Preise/Laufzeiten ohne Code-Änderung angepasst werden können.

### Visual Direction

Die bestehende V1-Linie wird konsistent fortgeführt: Hellmodus, Primärfarbe Dunkelblau (`#1E3A5F`, Header/Überschriften), Akzentfarbe Mittelblau (`#2F80ED`, Buttons/Links), Hintergrund Hellgrau (`#F7F8FA`) mit weißen Karten (Schatten, `border-radius: 12px`), Schriftart Inter, Framer-Motion-Übergänge unter 300ms. Alle neuen Seiten sind mobile-first (ab 375px) umgesetzt.

- **Login & Registrierung:** Zentrierte, schmale Karte (`max-w-md`) auf hellgrauem Hintergrund. Überschrift in `text-2xl font-bold text-primary`, Eingabefelder im bestehenden Stil (`border-gray-300`, `focus:ring-accent`), primärer Button als breiter, abgerundeter Akzent-Button. Wechsel-Link zur jeweils anderen Seite (Login ↔ Registrierung) unten in der Karte. Die Registrierung enthält zusätzlich eine Checkbox zur Bestätigung von AGB/Datenschutz, im Stil der bestehenden Bestätigungs-Checkboxen vor dem PDF-Download.
- **Bezahlseite:** Zwei Paket-Karten im bestehenden Karten-Stil – auf Mobilgeräten untereinander, ab Tablet-Breite nebeneinander. Die Lifetime-Karte ist als empfohlene Option mit Akzent-Rahmen und Badge hervorgehoben. Jede Karte zeigt Preis, Geltungsdauer, eine kurze Leistungsliste und einen Kauf-Button; darunter ein Hinweis auf die sichere Zahlungsabwicklung über Stripe.
- **Bewerbungshistorie:** Liste vertikal gestapelter Karten im bestehenden Stil, neuester Eintrag zuerst. Jede Karte zeigt Stellenbezug, Erstellungsdatum, einen kurzen Auszug aus dem Anschreiben sowie Buttons zum Anzeigen und zum erneuten PDF-Download. Ein Leerzustand (noch keine Bewerbungen) zeigt einen Hinweistext mit direktem Link zur Generierungs-Seite.
- **Navigation:** Der bestehende Header erhält einen zusätzlichen Navigationspunkt "Bewerbungshistorie" neben "Profil" sowie – im angemeldeten Zustand – eine Logout-Möglichkeit.

## Testing Decisions

Wie in V1 gilt: Ein guter Test prüft das beobachtbare Verhalten aus Nutzersicht, nicht interne Implementierungsdetails, und bleibt robust gegenüber Refactorings.

### Zu testende Module

- **Auth-Modul:** Unit-/Komponententests (Jest + React Testing Library) für Login-, Registrierungs- und Passwort-Reset-Formulare – Validierung von Eingaben, Anzeige von Fehlermeldungen (analog zu den bestehenden Tests für ProfileForm). API-Routen-Tests (analog zu `generate-route.test.ts`) für Registrierung, Login und Passwort-Reset, mit gemocktem NextAuth und gemocktem Brevo-Versand.
- **Profilmodul (migriert):** Tests für das Lesen/Schreiben des Nutzerprofils über die Datenbank-Schicht (Prisma-Client gemockt oder gegen Test-Datenbank), inklusive Validierung der Pflichtfelder wie bisher.
- **Zugriffssteuerung:** Tests der Entscheidungslogik (kostenlose Generierung verfügbar, aktives Paket, abgelaufener Zugang) für alle relevanten Kombinationen aus Zugang-Status.
- **Zahlungs-Modul:** Tests für die Erzeugung der Stripe-Checkout-Session sowie für den Webhook-Handler (Stripe-Signaturprüfung gemockt), der nach erfolgreicher Zahlung den korrekten Zugang im Nutzerkonto aktiviert.
- **Bewerbungshistorie-Modul:** Tests, dass nach einer Generierung ein Eintrag mit den korrekten Daten (Anschreiben, Lebenslauf-Schnappschuss, E-Mail-Entwurf) angelegt wird, sowie Tests für das Auflisten und erneute Exportieren eines Eintrags.
- **End-to-End (Playwright):** Vollständiger Flow Registrierung → Profil ausfüllen → kostenlose Generierung nutzen → Versuch einer zweiten Generierung führt zur Bezahlseite → Kauf im Stripe-Test-Modus → Zugang aktiv → weitere Generierung möglich → neuer Eintrag in der Bewerbungshistorie sichtbar und PDF erneut herunterladbar. Zusätzlich ein eigener E2E-Test für den Passwort-Reset-Flow (E-Mail-Versand gemockt).

### Teststrategie

- Unit- und Komponententests mit **Jest + React Testing Library**, konsistent zu den bestehenden Tests in `__tests__/`.
- E2E-Tests mit **Playwright** für die oben genannten Flows.
- Stripe und Brevo werden in automatisierten Tests durchgängig **gemockt**; echte Aufrufe erfolgen nur manuell im jeweiligen Test-/Sandbox-Modus (Stripe Test-Mode, Brevo-Sandbox bzw. Test-Postfach).
- Datenbankzugriffe über Prisma werden entweder gegen eine dedizierte Test-Datenbank oder gegen einen gemockten Prisma-Client getestet.

## Out of Scope

- Drittes PDF-Layout (eigene Folgephase, Beispiel-Layout liegt bereits in `jobtrix/Beispiel Layout/`).
- Arbeitsagentur-Jobsuche-Integration (eigene Folgephase).
- Abonnements oder wiederkehrende Zahlungen (nur Einmalzahlung).
- Migration bestehender V1-Profildaten aus dem Browser (es gibt noch keine echten Nutzer).
- Organisations-/B2B-Mandanten mit mehreren Endnutzern pro Konto.
- Social-Login oder Magic-Link-Anmeldung.
- E-Mail-Verifizierung (Double-Opt-In) bei der Registrierung.
- Konto-Löschung und Datenexport durch den Nutzer selbst (DSGVO-Auskunfts-/Löschrecht).
- Eigene Rechnungsstellung – die von Stripe automatisch bereitgestellten Zahlungsbelege gelten als ausreichend für diese Phase.
- Schutz vor missbräuchlicher Mehrfachregistrierung zur wiederholten Nutzung der kostenlosen Generierung (z. B. Wegwerf-E-Mail-Erkennung, Fraud-Detection).

## Further Notes

- Die Profildaten-Struktur (`ProfileData` aus `jobtrix/lib/profile-storage.ts`) bleibt inhaltlich die Referenz für das neue Datenbank-Schema – sie wird 1:1 in die Datenbank überführt, nicht neu konzipiert.
- Aus DSGVO-Sicht sind E-Mail-Verifizierung und Konto-Löschung/Datenexport für einen kommerziellen Betrieb relevant, wurden aber bewusst aus dieser Fundament-Phase herausgehalten, um den Umfang beherrschbar zu halten. Es wird empfohlen, beides zeitnah als kleine Folge-Aufgabe nach Abschluss dieser Phase anzugehen.
- Preise und Laufzeit des zeitlich begrenzten Zugangs sind zum Zeitpunkt dieser SPEC noch nicht final entschieden und werden konfigurierbar gehalten, um sie ohne Code-Änderung anzupassen.
- Zeitrahmen: ursprünglich wurde der 30.06. als Richtwert genannt, eine realistische Schätzung für dieses Fundament liegt eher bei Mitte/Ende Juli 2026.
- Nach Abschluss dieser Phase sollte das Glossar (`docs/UBIQUITOUS_LANGUAGE.md`) um die neuen Begriffe **Nutzerkonto**, **Zugang** und **Bewerbungshistorie-Eintrag** ergänzt werden – insbesondere da die bisher dort festgehaltene Aussage "es gibt keinen Account, keine Anmeldung" durch diese Phase überholt wird.
