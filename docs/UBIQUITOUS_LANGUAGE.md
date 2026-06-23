# Ubiquitous Language – JobTRIX

## Kerndomäne: Stellensuche

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Stellenanzeige** | Ein konkretes Jobangebot eines Unternehmens mit Beschreibung, Anforderungen und Kontaktdaten. | Stelle, Stellenangebot, Jobangebot, Inserat |
| **Stellensuche** | Der Vorgang, bei dem der Nutzer nach passenden Stellenanzeigen sucht. | Jobsuche, Recherche |
| **Deep Research** *(aktualisiert)* | KI-gestützte automatische Suche nach Stellenanzeigen auf Jobportalen via Tavily API, mit anschließender Relevanzanalyse durch Claude. Noch nicht implementiert – Konzept für eine mögliche spätere Phase. | KI-Suche, automatische Suche, Scraping |
| **Arbeitsagentur-Jobsuche** *(neu)* | Die aktuell umgesetzte automatische Suche nach Stellenanzeigen über die offizielle Jobsuche-API der Bundesagentur für Arbeit, anhand von Berufsfeld und Ort, im Bereich „Stelle suchen" des Generierungs-Formulars. | Arbeitsagentur-API, Jobsuche-API, BA-Suche |
| **Jobportal** | Eine externe Website, auf der Unternehmen Stellenanzeigen veröffentlichen (z. B. Stepstone, Indeed, Monster). | Stellenportal, Jobbörse, Plattform |
| **Trefferliste** *(aktualisiert)* | Die von einer automatischen Jobsuche (z. B. der Arbeitsagentur-Jobsuche) zurückgegebene Liste von Stellenanzeigen-Treffern mit Titel, Firma, Ort und Link zur Originalanzeige. | Suchergebnisse, Ergebnisliste, Treffer |
| **Berufsfeld** | Die vom Nutzer angegebene Berufsgruppe oder Fachrichtung (z. B. „Elektriker", „Pflegefachkraft"). | Jobkategorie, Branche (Branche ist eine separate Eingabe) |

## Kerndomäne: Bewerbung

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Bewerbung** | Der Gesamtprozess der Erstellung und des Exports von Bewerbungsunterlagen für eine bestimmte Stellenanzeige. | Application, Antrag |
| **Bewerbungsunterlagen** | Die Gesamtheit der generierten Dokumente: Anschreiben + Lebenslauf. | Unterlagen, Dokumente, Mappe |
| **Anschreiben** | Das auf die Stellenanzeige zugeschnittene Begleitschreiben. Wird von der KI generiert. | Bewerbungsschreiben, Motivationsschreiben, Cover Letter |
| **Lebenslauf** | Das strukturierte Dokument mit den persönlichen Daten, Ausbildung und Qualifikationen des Nutzers. | CV, Vita, Resume |
| **Generierung** *(aktualisiert)* | Der Vorgang, bei dem Claude aus Stellenanzeige + Nutzerprofil automatisch Anschreiben, Lebenslauf und E-Mail-Entwurf erstellt. | Erstellung, Erzeugung, Errechnung |
| **Kostenlose Generierung** *(neu)* | Die einmalige Generierung, die jedem neuen Nutzerkonto ohne aktiven Zugang kostenlos zur Verfügung steht, um JobTRIX vor dem Kauf eines Pakets auszuprobieren. | Test-Generierung, Trial, Freemium |
| **E-Mail verfassen** *(aktualisiert)* | Der automatische Schritt innerhalb der Generierung, bei dem JobTRIX einen kurzen, eigenständigen E-Mail-Text erstellt (3–5 Sätze: Bezug auf Stelle, Verweis auf Anhänge, Grußformel) – getrennt vom Anschreiben und ohne inhaltliche Wiederholung. | Mail schreiben, E-Mail erstellen, Mail generieren |
| **E-Mail-Entwurf** *(aktualisiert)* | Das Ergebnis des Schritts „E-Mail verfassen": ein kurzer, fertiger E-Mail-Text (Betreff + 3–5 Sätze Body), der per mailto-Versand im E-Mail-Programm des Nutzers vorausgefüllt wird; inhaltlich unabhängig vom Anschreiben. | Mailvorlage, E-Mail-Text, Anschreiben-Kopie (der E-Mail-Entwurf ist kein zweites Anschreiben) |
| **Arbeitgeber-E-Mail** *(neu)* | Die aus der Stellenanzeige automatisch extrahierte E-Mail-Adresse des Arbeitgebers, die dem Nutzer zur Bestätigung und Korrektur angezeigt wird, bevor der mailto-Versand ausgelöst wird. | Empfänger-E-Mail, Firmen-Mail, Kontakt-E-Mail |
| **mailto-Versand** *(neu)* | Der Versandweg für Bewerbungen: ein mailto-Link öffnet das E-Mail-Programm des Nutzers mit vorausgefülltem Betreff, Body und Empfänger (Arbeitgeber-E-Mail); die PDF-Anhänge (Anschreiben + Lebenslauf) werden gleichzeitig heruntergeladen und vom Nutzer manuell angehängt. | E-Mail senden, Mail verschicken, Resend-Versand (veraltet) |
| **Anleitungs-Popup** *(neu)* | Ein modales Popup mit gerätespezifischer Schritt-für-Schritt-Anleitung (Android/iOS/Desktop), das nach dem Klick auf „Bewerbung senden" erscheint und dem Nutzer erklärt, wie er die heruntergeladenen PDFs an die E-Mail anhängt. | Hilfe-Dialog, Sende-Anleitung, Tutorial-Popup |
| **Export** *(aktualisiert)* | Das Herunterladen der Bewerbungsunterlagen als PDF und das Versenden per mailto-Versand über das E-Mail-Programm des Nutzers. | Download, Ausgabe, Speichern |
| **Bewerbungshistorie** *(neu)* | Die chronologische Übersicht aller von einem Nutzerkonto erstellten Bewerbungen, dargestellt als Liste von Bewerbungshistorie-Einträgen. | Verlauf, History, Bewerbungsliste |
| **Bewerbungshistorie-Eintrag** *(aktualisiert)* | Die gespeicherte Aufzeichnung einer abgeschlossenen Bewerbung: enthält das Anschreiben, einen Schnappschuss der zugrunde liegenden Lebenslauf-Daten, den E-Mail-Entwurf (Betreff + Body) und die gewählten Exportoptionen, jeweils zum Zeitpunkt der Generierung. | Eintrag, Verlaufseintrag, Datensatz, Bewerbung (für den gespeicherten Datensatz) |
| **PDF-Layout** *(neu)* | Eine von mehreren wählbaren visuellen Vorlagen für den Export von Anschreiben und Lebenslauf: Klassisch, Modern, Akzent, Traditionell, Kreativ. | Template, Vorlage, Design |
| **Kreativ** *(neu)* | Das fünfte PDF-Layout: farbenfrohes, verspieltes Design mit breiter, farbiger Seitenleiste, rundem Foto und grafischen Icon-Elementen. | - |
| **Reihenfolge Einträge** *(neu)* | Das Label der Stilauswahl im Generierungs-Formular, das die zeitliche Sortierung der Berufserfahrungs- und Ausbildungseinträge im PDF-Export steuert; ersetzt das frühere Label „Lebenslauf-Stil". | Lebenslauf-Stil (veraltet), CV-Stil, Sortierung |
| **Ältestes zuerst** *(neu)* | Der Lebenslauf-Stil, bei dem Berufserfahrungs- und Ausbildungseinträge in der eingegebenen Reihenfolge ausgegeben werden (ältestes oben); entspricht dem internen Wert `"classic"`. | Klassisch (veraltet), chronologisch |
| **Neuestes zuerst** *(neu)* | Der Lebenslauf-Stil, bei dem Berufserfahrungs- und Ausbildungseinträge in umgekehrter Reihenfolge ausgegeben werden (aktuellstes oben); empfohlener Standard; entspricht dem internen Wert `"american"`. | Amerikanisch (veraltet), antichronologisch |

## Kerndomäne: Nutzerkonto & Zugang *(neu)*

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Nutzerkonto** | Das durch E-Mail-Adresse und Passwort geschützte Konto, mit dem sich ein Jobsuchender bei JobTRIX anmeldet. Enthält genau ein Nutzerprofil, einen Zugang-Status und eine Bewerbungshistorie. | Account (englisch), Login, Profil |
| **Zugang** | Der Berechtigungsstatus eines Nutzerkontos, der bestimmt, ob eine Generierung durchgeführt werden darf: kein Zugang, zeitlich begrenzter Zugang oder Lifetime-Zugang. | Abo, Abonnement, Lizenz, Berechtigung |
| **Paket** | Das auf der Bezahlseite kaufbare Angebot, das bei erfolgreichem Kauf einen Zugang freischaltet. Es gibt zwei Pakete: „Zeitlich begrenzter Zugang" und „Lifetime-Zugang". | Tarif, Plan, Abo |
| **Darstellungsmodus** *(neu)* | Die im Nutzerkonto gespeicherte Einstellung für das Farbschema der App-Oberfläche: „Hell" (Light Mode), „Dunkel" (Dark Mode) oder „System" (automatische Übernahme der Geräte-Einstellung). | Theme, Farbschema-Einstellung |

## Kerndomäne: Nutzerführung & Bedienbarkeit *(neu)*

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Inline-Validierung** *(neu)* | Echtzeit-Prüfung von Formularfeldern bei der Eingabe mit sofortiger visueller Rückmeldung (roter Rahmen + Fehlermeldung unter dem Feld); wird im Onboarding und Profil für Geburtsdatum, Telefonnummer, Orte und Jahreszahl-Bereiche eingesetzt. | Formularvalidierung (zu generisch), Servervalidierung (ist clientseitig), Feldprüfung |
| **Jahreszahl-Bereich** *(neu)* | Das validierte Eingabeformat für Zeiträume in Ausbildungseinträgen, Berufserfahrung und Qualifikationen: eine einzelne Jahreszahl („2019") oder ein Bereich mit Bindestrich („2019 - 2022"); keine Wörter, keine Fantasie-Zahlen. | Zeitraum (zu vage), Datumsbereich (impliziert Tag/Monat), Periode |
| **Qualifikations-Hinweis** *(neu)* | Ein freundliches, wegklickbares Popup vor der Generierung, das erscheint wenn das Nutzerprofil unzureichend befüllt ist (z. B. keine Qualifikationen, kein Ausbildungseintrag); bietet „Profil ergänzen" oder „Trotzdem fortfahren" an und blockiert die Generierung nicht. | Warnung (zu negativ), Fehlermeldung (ist kein Fehler), Hinweis-Block im Dokument (das ist genau das, was dieser Begriff ersetzt) |
| **Info-Icon** *(neu)* | Ein kleines (i)-Symbol neben Formularfeld-Labels, das beim Antippen/Klicken einen Hilfetext in einer Sprechblase anzeigt und beim erneuten Antippen oder Klicken außerhalb wieder verschwindet. | Tooltip (technisch korrekt, aber für Nutzer unverständlich), Hilfe-Button, Fragezeichen-Icon |
| **Willkommens-Slides** *(neu)* | Durchblätterbare Fullscreen-Karten, die nach der Registrierung einmalig erscheinen und den Nutzer in 4–5 Schritten durch die Kernfunktionen von JobTRIX führen; überspringbar und durch ein Flag im Nutzerkonto gesteuert. | Tutorial (zu generisch), Onboarding (Verwechslungsgefahr mit dem Onboarding-Formular), Intro-Screens |
| **Hamburger-Menü** *(neu)* | Das auf Mobilgeräten (unter `md:`-Breakpoint) sichtbare Menü-Icon im Header, das die Navigation als Slide-Down-Menü ein- und ausblendet; auf Desktop ist stattdessen die vollständige Navigation sichtbar. | Mobile-Menü, Sidebar, Drawer |

## Kerndomäne: Nutzerprofil

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Nutzerprofil** *(aktualisiert)* | Die gespeicherten persönlichen Daten des Jobsuchenden (Name, Adresse, Geburtsdatum, Foto, Ausbildungseinträge, Qualifikationen, Interessen), die als Basis für alle Bewerbungen dienen. Gehört zu genau einem Nutzerkonto. | Profil, Account, Nutzerkonto (das ist die Login-Entität, nicht die Profildaten), Benutzerdaten |
| **Qualifikation** | Eine konkrete Fähigkeit, Zertifizierung oder Berufserfahrung im Nutzerprofil. | Kompetenz, Skill, Fähigkeit |
| **Ausbildungseintrag** | Ein einzelner Ausbildungs- oder Studienabschluss im Nutzerprofil (Schule, Berufsausbildung, Hochschule). | Abschluss, Bildungseintrag |
| **Jobsuchender** | Die Person, die JobTRIX nutzt, um eine Stelle zu finden und sich zu bewerben. | Nutzer, User, Bewerber (Bewerber erst nach Absenden der Bewerbung) |

## Kerndomäne: Rechtliche Seiten & Konto-Datenschutz *(neu)*

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Info-Seite** | Sammelbegriff für die vier öffentlichen, statischen Seiten Impressum, Datenschutzerklärung, AGB/Nutzungsbedingungen und Hilfe/FAQ, die für jeden Besucher ohne Anmeldung über den Footer erreichbar sind. | Rechtsseite, Footer-Seite, statische Seite |
| **Impressum** | Die Info-Seite mit den gesetzlich vorgeschriebenen Anbieterangaben (Name, Anschrift, Kontakt), zunächst mit Platzhaltern befüllt. | Anbieterkennzeichnung, Legal Notice |
| **Datenschutzerklärung** *(aktualisiert)* | Die Info-Seite, die beschreibt, welche Daten zu welchem Zweck über welche Dienste (NextAuth, Stripe, Brevo, Anthropic Claude API, Arbeitsagentur-Jobsuche-API, Render, Supabase, Cloudflare) verarbeitet werden, sowie auf die Nutzerrechte verweist. | „Datenschutz" alleinstehend (Verwechslungsgefahr mit „Konto & Datenschutz"), Privacy Policy |
| **AGB/Nutzungsbedingungen** | Die Info-Seite mit den Vertragsbedingungen zu Paketen, Zahlungsabwicklung, Widerrufsrecht und dem Haftungsausschluss für KI-generierte Bewerbungsunterlagen. | Terms of Service, „Geschäftsbedingungen" alleinstehend |
| **Hilfe/FAQ** | Die Info-Seite mit sechs aufklappbaren Frage-Antwort-Themen zu den wichtigsten Abläufen von JobTRIX (Bewerbung erstellen, Pakete, Jobsuche, Layouts/Darstellungsmodus, Konto & Datenschutz, Support). | Hilfeseite, Support-Seite, FAQ |
| **Konto & Datenschutz** | Der Bereich auf der Profilseite, in dem ein eingeloggter Nutzer seine DSGVO-Rechte über sein Nutzerkonto wahrnimmt: Datenexport und Konto löschen. | Datenschutz-Einstellungen, Account Settings, Privacy Settings |
| **Datenexport** | Die über „Meine Daten herunterladen" im Bereich Konto & Datenschutz erzeugte JSON-Datei mit allen zu einem Nutzerkonto gespeicherten Daten (Nutzerprofil, Bewerbungshistorie, Kontoinformationen). | Datenauskunft, Datendownload, Export (allgemein) |
| **Konto löschen** | Die im Bereich Konto & Datenschutz ausgelöste, sofortige und unwiderrufliche Löschung eines Nutzerkontos inkl. Nutzerprofil, Zugang und Bewerbungshistorie, nach Bestätigung mit dem aktuellen Passwort. | Account löschen, Deaktivieren, Konto schließen |

## Kerndomäne: Zahlungsabwicklung *(neu)*

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Stripe Test-Modus** *(neu)* | Der aktuelle Betriebsmodus von Stripe, in dem die Zahlungsinfrastruktur vollständig konfiguriert ist, aber keine echten Zahlungen verarbeitet werden; dient der Entwicklung und dem Testen. | Testumgebung (zu vage), Staging (falscher Begriff), Demo-Modus |
| **Stripe Live-Modus** *(neu)* | Der produktive Betriebsmodus von Stripe, in dem echte Zahlungen von Nutzern entgegengenommen und an den Betreiber ausgezahlt werden; erfordert eine vollständige Stripe-Kontoverifizierung durch den Betreiber. | Produktivmodus, Live-Stripe, Echtgeld-Modus |
| **PayPal** *(neu)* | Eine Zahlungsmethode, die über Stripe als zusätzliche Option neben Kreditkarte und SEPA-Lastschrift für den Kauf von Paketen angeboten wird; muss im Stripe-Dashboard des Betreibers aktiviert werden. | PayPal-Integration, PayPal-Direktanbindung (PayPal läuft immer über Stripe, nie direkt) |
| **Zahlungsmethode** *(neu)* | Eine vom Nutzer beim Kauf eines Pakets wählbare Bezahloption; aktuell unterstützt: Kreditkarte, SEPA-Lastschrift, PayPal (über Stripe). | Zahlungsart, Bezahlweg, Payment Method (englisch) |

## Kerndomäne: Marketing & Außendarstellung *(neu)*

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Marketing-Landingpage** *(neu)* | Die vollständig ausgebaute Startseite von JobTRIX, die Besucher mit klarer Kernbotschaft, strukturiertem Ablauf, Feature-Übersicht und Preise-Teaser zur Registrierung oder zum Paketkauf überzeugt. | Startseite (nur wenn sie noch leer/minimal ist), Homepage (zu generisch), Landing Page (englisch) |
| **Scroll-Animation** *(neu)* | Eine via Framer Motion umgesetzte Animation, die Abschnitte oder Elemente der Marketing-Landingpage einblendet, wenn der Nutzer beim Herunterscrollen in ihren Sichtbereich gelangt (`whileInView`). | Einblend-Effekt, Fade-In (englisch), CSS-Animation (technisch anderer Ansatz) |

## Kerndomäne: Infrastruktur, Betrieb & Compliance *(neu)*

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Standard-Stack** *(neu)* | Die von Faltrix festgelegte, verbindliche Kombination aus Diensten und Werkzeugen (Cloudflare, Render, Supabase, GitHub Actions, Stripe, Claude API, DSGVO-Prozesse u. a.), die für alle Verkaufsfertigen Cloud-Produkte eingesetzt wird. | Tech-Stack (zu generisch), Setup, Infrastruktur (zu vage) |
| **Verkaufsfertiges Cloud-Produkt** *(neu)* | Ein SaaS-Produkt von Faltrix, das auf dem Standard-Stack läuft, über eine eigene Domain öffentlich erreichbar ist und Endkunden gegen Entgelt Zugang bietet; JobTRIX ist ein Beispiel. | SaaS-Produkt (zu generisch), Live-Produkt, Produkt (alleinstehend zu vage) |
| **Produktionsumgebung** *(neu)* | Die live laufende Instanz eines Verkaufsfertigen Cloud-Produkts unter einer eigenen Domain (z. B. `jobtrix.de`), im Unterschied zur lokalen Entwicklungsumgebung. | Prod, Live-Umgebung, Server, Live-System |
| **AVV (Auftragsverarbeitungsvertrag)** *(neu)* | Der nach DSGVO vorgeschriebene Vertrag zwischen dem Betreiber (Verantwortlicher) und einem externen Dienstleister, der im Auftrag personenbezogene Daten verarbeitet (z. B. Supabase, Render, Cloudflare, Stripe, Brevo, Anthropic); muss mit jedem solchen Dienstleister vor Produktivbetrieb abgeschlossen sein. | DPA (englisch), Datenschutzvertrag (falsche Terminologie), Dienstleistervertrag |
| **Security-Audit** *(neu)* | Der systematische Prüfprozess der sicherheitsrelevanten Bereiche einer App (Authentifizierung, API-Autorisierung, Secrets, Abhängigkeiten, Security-Header, Eingabevalidierung) mit dem Ziel, Schwachstellen zu identifizieren und als Findings zu erfassen. | Sicherheitscheck (zu unspezifisch), Pentest (ein Pentest ist ein spezifischer Untertyp mit aktiven Angriffsversuchen, nicht synonym) |
| **Finding** *(neu)* | Eine im Rahmen eines Security-Audits identifizierte Schwachstelle oder Sicherheitslücke; wird nach Prüfung als Issue zur Behebung per TDD aufgenommen. | Bug (zu generisch), Sicherheitslücke (alleinstehend zu unspezifisch), Issue (ein Finding wird erst nach Prüfung zu einem Issue) |

## Relationships

- Ein **Jobsuchender** hat genau ein **Nutzerkonto** *(aktualisiert)*.
- Ein **Nutzerkonto** enthält genau ein **Nutzerprofil**, genau einen **Zugang**-Status und eine **Bewerbungshistorie** *(neu)*.
- Ein **Nutzerprofil** enthält beliebig viele **Qualifikationen** und **Ausbildungseinträge**.
- Ein neues **Nutzerkonto** erhält eine **Kostenlose Generierung**; danach ist ein gekauftes **Paket** nötig, um wieder **Zugang** zu erhalten *(neu)*.
- Die **Bewerbungshistorie** eines Nutzerkontos besteht aus beliebig vielen **Bewerbungshistorie-Einträgen** *(neu)*.
- Eine **Bewerbung** bezieht sich auf genau eine **Stellenanzeige** und genau ein **Nutzerprofil**.
- Eine **Bewerbung** erzeugt genau ein **Anschreiben**, genau einen **Lebenslauf** als **Bewerbungsunterlagen** und genau einen **E-Mail-Entwurf** (eigenständiger kurzer Text, kein Duplikat des Anschreibens); bei Abschluss wird daraus ein **Bewerbungshistorie-Eintrag** *(aktualisiert)*.
- **Deep Research** sucht auf mehreren **Jobportalen** gleichzeitig und liefert eine **Trefferliste** von **Stellenanzeigen**.
- Eine **Stellenanzeige** kann manuell eingefügt oder aus der **Trefferliste** ausgewählt werden.
- Die **Arbeitsagentur-Jobsuche** liefert eine **Trefferliste**, aus der eine **Stellenanzeige** für die **Generierung** ausgewählt werden kann *(neu)*.
- Bei der **Generierung** wird ein **PDF-Layout** gewählt, das für **Anschreiben** und **Lebenslauf** beim **Export** verwendet wird *(neu)*.
- Die **Reihenfolge Einträge** bestimmt, ob Berufserfahrungs- und Ausbildungseinträge im **Lebenslauf** als **Ältestes zuerst** oder **Neuestes zuerst** ausgegeben werden *(neu)*.
- Ein **Nutzerkonto** hat zusätzlich einen **Darstellungsmodus** (Hell/Dunkel/System), der unabhängig vom **Zugang**-Status ist *(neu)*.
- Jede **Info-Seite** ist öffentlich erreichbar, unabhängig vom **Nutzerkonto** *(neu)*.
- Der Bereich **Konto & Datenschutz** gehört zu genau einem **Nutzerkonto** und bietet **Datenexport** und **Konto löschen** an *(neu)*.
- Der **Datenexport** umfasst Daten aus **Nutzerprofil**, **Bewerbungshistorie** und dem **Zugang**-Status eines **Nutzerkontos** *(neu)*.
- **Konto löschen** entfernt das **Nutzerkonto** inkl. **Nutzerprofil**, **Zugang** und **Bewerbungshistorie** unwiderruflich *(neu)*.
- Ein **Paket** wird über eine **Zahlungsmethode** (Kreditkarte, SEPA-Lastschrift oder **PayPal**) über **Stripe** gekauft *(neu)*.
- Im **Stripe Test-Modus** ist kein echter Geldfluss möglich; erst im **Stripe Live-Modus** werden Zahlungen tatsächlich abgewickelt *(neu)*.
- Die **Marketing-Landingpage** ist die öffentliche Startseite von JobTRIX und enthält **Scroll-Animationen** für eine moderne Nutzeransprache *(neu)*.
- **JobTRIX** ist ein **Verkaufsfertiges Cloud-Produkt** und folgt dem **Standard-Stack** von Faltrix *(neu)*.
- Die **Produktionsumgebung** von JobTRIX läuft auf dem **Standard-Stack** (Cloudflare als DNS/CDN/WAF, Render als App-Hosting, Supabase als Datenbank) und ist unter `jobtrix.de` erreichbar *(neu)*.
- Ein **Security-Audit** erzeugt **Findings**; jedes **Finding** wird als Issue umgesetzt, per TDD behoben und mit `/security-review` geprüft *(neu)*.
- Für jeden externen Dienstleister, der personenbezogene Daten verarbeitet, ist ein **AVV** erforderlich; die betroffenen Dienstleister sind in der **Datenschutzerklärung** aufgeführt *(neu)*.
- Der **mailto-Versand** ersetzt den bisherigen serverseitigen E-Mail-Versand über Resend; er nutzt den **E-Mail-Entwurf** als Body und die **Arbeitgeber-E-Mail** als Empfänger *(neu)*.
- Die **Arbeitgeber-E-Mail** wird aus der **Stellenanzeige** extrahiert und dem **Jobsuchenden** zur Bestätigung angezeigt *(neu)*.
- Das **Anleitungs-Popup** erscheint nach dem Klick auf „Bewerbung senden" und führt den **Jobsuchenden** gerätespezifisch durch das Anhängen der **Bewerbungsunterlagen** *(neu)*.
- Der **Qualifikations-Hinweis** prüft das **Nutzerprofil** auf Vollständigkeit vor der **Generierung**; er blockiert nicht, sondern informiert *(neu)*.
- **Info-Icons** sind an Formularfeldern im **Onboarding**, **Profil** und **Generierungs-Formular** angebracht *(neu)*.
- Die **Willkommens-Slides** erscheinen einmalig nach Erstellung eines **Nutzerkontos**; das Flag wird im Nutzerkonto gespeichert *(neu)*.
- Das **Hamburger-Menü** ersetzt auf Mobilgeräten die vollständige Navigation im Header *(neu)*.
- Die **Inline-Validierung** prüft Felder im **Onboarding** und **Profil** auf gültige Formate, darunter **Jahreszahl-Bereiche** für Zeitangaben *(neu)*.

## Beispiel-Dialog

> **Dev:** „Soll ich die Stelle direkt als Parameter übergeben oder den Anzeigentext parsen?"
> **Domain Expert:** „Den vollständigen Text der **Stellenanzeige** übergeben – die **Generierungs-Engine** braucht den Rohtext, keine vorstrukturierten Felder."

> **Dev:** „Speichere ich das Ergebnis als Bewerbung oder als Dokument?"
> **Domain Expert:** „Als **Bewerbung** – die enthält Anschreiben und Lebenslauf. Das einzelne PDF ist der **Export**, nicht die Bewerbung selbst."

> **Dev:** „Was passiert wenn Deep Research nichts findet?"
> **Domain Expert:** „Die **Trefferliste** ist leer – dann bieten wir den manuellen Pfad an: **Stellenanzeige** direkt einfügen."

> **Dev:** „Nenne ich das Account oder Profil?" *(aktualisiert)*
> **Domain Expert:** „Jetzt gibt es beides, aber als getrennte Konzepte: Das **Nutzerkonto** ist die Login-Entität (E-Mail + Passwort). Das **Nutzerprofil** sind die persönlichen Daten darin. Im Deutschen immer **Nutzerkonto** sagen, nie 'Account'."

> **Dev:** „Ist der Jobsuchende schon ein Bewerber?"
> **Domain Expert:** „Erst wenn er die Bewerbung tatsächlich abschickt. Bis dahin: **Jobsuchender**."

> **Dev:** „Ist 'Zugang' dasselbe wie das Paket, das der Nutzer kauft?" *(neu)*
> **Domain Expert:** „Nein. Ein **Paket** ist das Angebot auf der Bezahlseite (z. B. 'Lifetime-Zugang'). **Zugang** ist der resultierende Berechtigungsstatus im Nutzerkonto, der durch den Kauf eines Pakets oder durch die Kostenlose Generierung entsteht."

> **Dev:** „Speichere ich nach jeder Generierung eine 'Bewerbung' in der Datenbank?" *(neu)*
> **Domain Expert:** „Nein, du speicherst einen **Bewerbungshistorie-Eintrag** – das ist die Aufzeichnung einer abgeschlossenen Bewerbung, nicht die Bewerbung als Prozess selbst."

> **Dev:** „Was passiert, wenn ein Nutzer seine Kostenlose Generierung schon verbraucht hat und keinen Zugang besitzt?" *(neu)*
> **Domain Expert:** „Dann wird er zur Bezahlseite geleitet, um ein **Paket** zu kaufen – die **Generierung** startet erst, wenn ein gültiger **Zugang** besteht."

> **Dev:** „Ist die Arbeitsagentur-Jobsuche dasselbe wie Deep Research?" *(neu)*
> **Domain Expert:** „Nein. **Deep Research** (Tavily-Suche plus KI-Relevanzanalyse) ist weiterhin ein nicht umgesetztes Konzept für eine mögliche spätere Phase. Die **Arbeitsagentur-Jobsuche** ist die aktuell implementierte automatische Suche und liefert ebenfalls eine **Trefferliste**, aber ohne KI-Relevanzprüfung."

> **Dev:** „Worin unterscheidet sich der Darstellungsmodus vom Zugang?" *(neu)*
> **Domain Expert:** „Der **Zugang** steuert, ob eine **Generierung** erlaubt ist – das ist der Bezahl-Status. Der **Darstellungsmodus** ist rein optisch (Hell/Dunkel/System) und hat keinen Einfluss auf Berechtigungen."

> **Dev:** „Ist 'Kreativ' ein eigenständiges Dokument?" *(neu)*
> **Domain Expert:** „Nein, **Kreativ** ist eines von fünf **PDF-Layouts** – eine visuelle Vorlage für Anschreiben und Lebenslauf, kein eigenes Dokument."

> **Dev:** „Ist 'Datenschutz' im Profil dasselbe wie die Datenschutzerklärung im Footer?" *(neu)*
> **Domain Expert:** „Nein. Die **Datenschutzerklärung** ist eine öffentliche **Info-Seite** mit rechtlichen Informationen. **Konto & Datenschutz** ist ein funktionaler Bereich auf der Profilseite, in dem der Nutzer seine Daten exportiert oder sein Konto löscht. Im Code und in Texten immer den vollen Namen verwenden."

> **Dev:** „Wird beim Konto löschen nur das Nutzerprofil entfernt?" *(neu)*
> **Domain Expert:** „Nein, **Konto löschen** entfernt das gesamte **Nutzerkonto** – also Nutzerprofil, Zugang-Status und Bewerbungshistorie – sofort und unwiderruflich, nicht nur die Profildaten."

> **Dev:** „Ist der Datenexport dasselbe wie die Bewerbungshistorie-Liste?" *(neu)*
> **Domain Expert:** „Nein, der **Datenexport** ist eine vollständige JSON-Datei mit allen Daten des Nutzerkontos – inklusive Nutzerprofil und Kontoinformationen, nicht nur der Bewerbungshistorie."

> **Dev:** „Muss ich für Supabase eine Nutzer-Einwilligung einholen?" *(neu)*
> **Domain Expert:** „Nein – Supabase ist ein Auftragsverarbeiter, kein Dritter. Du schließt einen **AVV** mit Supabase ab. Die Nutzer werden darüber in der **Datenschutzerklärung** informiert."

> **Dev:** „Machen wir jetzt einen Pentest?" *(neu)*
> **Domain Expert:** „Nein, wir machen einen **Security-Audit** der Stufe ‚Erweitert' – das bedeutet systematische Code-Prüfung, Dependency-Scan und Eingabevalidierung. Ein Pentest (aktive Angriffsversuche) ist ein eigener Untertyp und explizit nicht Teil dieser Phase."

> **Dev:** „Soll ich den Login-Bug direkt fixen?" *(neu)*
> **Domain Expert:** „Erst als **Finding** dokumentieren und prüfen, ob es eine Schwachstelle ist. Dann wird es zum Issue und per TDD behoben – nicht direkt anfassen."

> **Dev:** „Gilt der Standard-Stack nur für JobTRIX?" *(neu)*
> **Domain Expert:** „Nein, der **Standard-Stack** gilt für alle **Verkaufsfertigen Cloud-Produkte** von Faltrix. JobTRIX ist das erste, das darauf umzieht – aber der Stack ist projektübergreifend verbindlich."

> **Dev:** „Ist PayPal eine eigene Integration neben Stripe?" *(neu)*
> **Domain Expert:** „Nein. **PayPal** läuft als **Zahlungsmethode** über Stripe – kein eigenes PayPal-Konto, keine separate API. Es ist ein Schalter im Stripe-Dashboard, der **PayPal** als zusätzliche Option neben Kreditkarte und SEPA-Lastschrift freischaltet."

> **Dev:** „Ist der Stripe Test-Modus eine eigene Umgebung?" *(neu)*
> **Domain Expert:** „Nein, der **Stripe Test-Modus** und der **Stripe Live-Modus** laufen in derselben Codebasis – der Unterschied liegt ausschließlich in den verwendeten API-Keys. Im Test-Modus fließt kein echtes Geld; erst im Live-Modus werden echte Zahlungen abgewickelt."

> **Dev:** „Ist die Startseite jetzt die Marketing-Landingpage?" *(neu)*
> **Domain Expert:** „Erst sobald sie vollständig ausgebaut ist – mit Kernbotschaft, Wie-es-funktioniert-Ablauf, Feature-Übersicht und Preise-Teaser. Die bisherige Minimal-Seite (nur Headline + CTA) ist noch keine **Marketing-Landingpage**."

> **Dev:** „Ist der E-Mail-Entwurf dasselbe wie das Anschreiben?" *(neu)*
> **Domain Expert:** „Nein. Der **E-Mail-Entwurf** ist ein kurzer, eigenständiger Text (3–5 Sätze), der auf die Stelle Bezug nimmt und auf die Anhänge verweist. Das **Anschreiben** ist das ausführliche Begleitschreiben, das als PDF-Anhang beigefügt wird. Beide werden bei der **Generierung** erzeugt, aber als getrennte Texte."

> **Dev:** „Kann der Nutzer den E-Mail-Entwurf bearbeiten?" *(neu)*
> **Domain Expert:** „Nein, der **E-Mail-Entwurf** ist ein kurzer, fertiger Text zum Kopieren – nicht zum Bearbeiten. Er ist so knapp, dass Anpassungen direkt im E-Mail-Programm des Nutzers schneller gehen."

> **Dev:** „Verschickt JobTRIX die E-Mail noch selbst über den Server?" *(neu)*
> **Domain Expert:** „Nein, seit der UX-Phase nutzen wir den **mailto-Versand**: Ein mailto-Link öffnet das E-Mail-Programm des Nutzers mit vorausgefülltem Betreff und Text. Die PDFs werden gleichzeitig heruntergeladen. Der alte Resend-Versand über bewerbung@jobtrix.app ist abgelöst."

> **Dev:** „Woher kommt die Empfänger-Adresse für den mailto-Link?" *(neu)*
> **Domain Expert:** „Das ist die **Arbeitgeber-E-Mail** – sie wird automatisch aus der **Stellenanzeige** extrahiert und dem Nutzer zur Bestätigung angezeigt. Der Nutzer kann sie korrigieren, bevor er auf ‚Bewerbung senden' klickt."

> **Dev:** „Soll ich den Hinweis ‚Qualifikation nicht verwertbar' ins Anschreiben schreiben?" *(neu)*
> **Domain Expert:** „Auf keinen Fall. Solche Hinweise gehören nie in die generierten Dokumente. Dafür gibt es den **Qualifikations-Hinweis** – ein Popup vor der Generierung, das der Nutzer wegklicken kann. Die KI darf keine HINWEIS-Blöcke in Anschreiben, Lebenslauf oder E-Mail einfügen."

> **Dev:** „Ist das Onboarding-Tutorial dasselbe wie die Willkommens-Slides?" *(neu)*
> **Domain Expert:** „Nein, verwechsle nicht: Das **Onboarding** ist das Formular, in dem der Nutzer sein **Nutzerprofil** anlegt. Die **Willkommens-Slides** sind ein kurzes, durchblätterbares Tutorial, das einmalig nach der Registrierung erscheint und die Kernfunktionen erklärt – danach nie wieder."

> **Dev:** „Kann der Nutzer ‚gestern' als Zeitraum bei der Berufserfahrung eingeben?" *(neu)*
> **Domain Expert:** „Nein. Die **Inline-Validierung** erlaubt nur einen **Jahreszahl-Bereich** – also ‚2019' oder ‚2019 - 2022'. Alles andere wird sofort rot markiert."

## Markierte Unklarheiten

- **„Branche" vs. „Berufsfeld":** Beide Begriffe tauchen in der Planung auf. Entscheidung: Berufsfeld = Beruf/Funktion (z. B. Elektriker), Branche = Wirtschaftssektor (z. B. Industrie, Pflege). Beide sind separate Suchparameter.
- **„Bewerbung" (Prozess vs. Dokument vs. Datensatz):** Im Alltag bezeichnet „Bewerbung" oft nur das Anschreiben. In JobTRIX bezeichnet es den gesamten Prozess inkl. aller Unterlagen. Entwickler sollten bei Dokumenten immer **Bewerbungsunterlagen**, **Anschreiben** oder **Lebenslauf** verwenden, und beim gespeicherten Datensatz immer **Bewerbungshistorie-Eintrag** – nie nur „Bewerbung" für ein einzelnes Dokument oder einen Datensatz.
- **„Es gibt keinen Account" (überholt):** Diese frühere Aussage galt für V1 (rein lokale Datenhaltung ohne Anmeldung). Mit V2 Phase 1 (Nutzerkonten, Datenbank, Bezahlsystem) ist sie überholt und wurde durch die Konzepte **Nutzerkonto** und **Nutzerprofil** ersetzt.
- **„Zugang" als Statusbegriff vs. als Teil von Paketnamen:** Die beiden Pakete heißen „Zeitlich begrenzter Zugang" und „Lifetime-Zugang", obwohl „Zugang" auch der übergeordnete Statusbegriff ist. Empfehlung: In der Nutzeroberfläche dürfen die Paketnamen so bleiben (verständlich für Endnutzer); in technischen Diskussionen klar zwischen **Paket** (Kaufangebot) und **Zugang** (Berechtigungsstatus) unterscheiden.
- **„Deep Research" vs. „Arbeitsagentur-Jobsuche"** *(neu)*: Beide liefern eine **Trefferliste**, sind aber unterschiedliche Konzepte. **Deep Research** (Tavily-basierte Web-Suche + KI-Relevanzanalyse) bleibt ein nicht umgesetztes Konzept für eine mögliche spätere Phase. Die **Arbeitsagentur-Jobsuche** (offizielle API der Bundesagentur für Arbeit) ist die aktuell umgesetzte automatische Suche. Empfehlung: „Trefferliste" als allgemeinen Begriff für das Ergebnis einer automatischen Jobsuche verwenden, unabhängig von der konkreten Quelle.
- **„Datenschutzerklärung" vs. „Konto & Datenschutz"** *(neu)*: Beide enthalten das Wort „Datenschutz", bezeichnen aber unterschiedliche Konzepte. Die **Datenschutzerklärung** ist eine öffentliche, rein informative **Info-Seite**. **Konto & Datenschutz** ist ein funktionaler Bereich auf der Profilseite mit den Aktionen **Datenexport** und **Konto löschen**. Empfehlung: in Code, Tests und Texten immer den vollständigen Namen verwenden, nie nur „Datenschutz" allein.
- **„Stripe Test-Modus" vs. „lokale Entwicklungsumgebung"** *(neu)*: Beide sind keine echten Zahlungsumgebungen, aber der **Stripe Test-Modus** läuft auf Render (Produktionsserver) mit Test-Keys – er ist also die „fast echte" Umgebung. Die lokale Entwicklungsumgebung ist davon getrennt. Empfehlung: nie „Testumgebung" sagen, wenn der **Stripe Test-Modus** gemeint ist – das verwechselt zwei unterschiedliche Konzepte.
- **„Amerikanisch" / „Klassisch" (veraltet)** *(neu)*: Die früheren Bezeichnungen der Lebenslauf-Stile werden durch **„Neuestes zuerst"** und **„Ältestes zuerst"** ersetzt, da „Amerikanisch" für viele Nutzer ohne Bewerbungshintergrund nicht selbsterklärend ist. Die internen Werte `"american"` und `"classic"` bleiben unverändert – die Umbenennung betrifft ausschließlich die sichtbaren Labels.
- **„Marketing-Landingpage" vs. „Startseite"** *(neu)*: Die **Startseite** (`/`) war bisher eine minimale Seite. Sobald sie vollständig als **Marketing-Landingpage** ausgebaut ist, gelten beide Begriffe – aber in technischen Diskussionen immer **Marketing-Landingpage** verwenden, wenn der ausgebaute Marketingcharakter gemeint ist.
- **„Security-Audit" vs. „Pentest"** *(neu)*: Ein **Pentest** (Penetrationstest) ist ein spezifischer Untertyp des **Security-Audits**, bei dem aktive Angriffsversuche durchgeführt werden. Der in dieser Phase durchgeführte Security-Audit ist der Stufe „Erweitert" (systematische Code-Prüfung, Dependency-Scan, Eingabevalidierung) – explizit kein Pentest. Die Unterscheidung ist relevant für zukünftige Audit-Planung: Pentest-Stufe wäre ein eigenständiger, größerer Auftrag.
- **„Finding" vs. „Issue"** *(neu)*: Ein **Finding** ist das Ergebnis des Security-Audits – eine identifizierte Schwachstelle, die noch nicht bewertet oder priorisiert ist. Erst nach Prüfung und Aufnahme ins Backlog wird daraus ein **Issue** (GitHub Issue), das per TDD umgesetzt wird. Empfehlung: im Audit-Prozess immer „Finding" verwenden, bis die Entscheidung zur Behebung getroffen ist.
- **„E-Mail-Entwurf" vs. „Anschreiben"** *(neu)*: Bis zu dieser Phase war der E-Mail-Body identisch mit dem Anschreiben-Text. Ab jetzt sind es zwei getrennte Texte: Das **Anschreiben** ist das ausführliche Begleitschreiben (PDF-Anhang), der **E-Mail-Entwurf** ist ein kurzer E-Mail-Text (3–5 Sätze). Empfehlung: in Code und Tests immer `emailBody` für den kurzen E-Mail-Text und `coverLetter` für das Anschreiben verwenden – nie verwechseln oder gleichsetzen.
- **„Onboarding" vs. „Willkommens-Slides"** *(neu)*: Beide betreffen den Einstieg neuer Nutzer, bezeichnen aber unterschiedliche Konzepte. Das **Onboarding** ist das mehrstufige Formular zum Anlegen des Nutzerprofils. Die **Willkommens-Slides** sind ein einmaliges, durchblätterbares Tutorial, das die App-Funktionen erklärt. Empfehlung: nie „Onboarding" für die Slides verwenden – „Onboarding" ist immer das Profil-Formular.
- **„mailto-Versand" vs. „E-Mail senden" (veraltet)** *(neu)*: Der bisherige serverseitige Versand über Resend (bewerbung@jobtrix.app als Absender) wird durch den **mailto-Versand** ersetzt. Im Code und in der UI nie mehr „E-Mail senden" im Sinne von „JobTRIX sendet die Mail" verwenden – der Nutzer sendet selbst über sein Programm. Die API-Route `/api/send-email` bleibt vorübergehend bestehen, wird aber nicht mehr aufgerufen.
- **„Qualifikations-Hinweis" vs. „HINWEIS-Block im Dokument"** *(neu)*: In früheren Versionen hat die KI HINWEIS-Blöcke direkt in Anschreiben und E-Mail eingefügt (z. B. „Die angegebene Qualifikation ‚Bubu' ist nicht verwertbar"). Der **Qualifikations-Hinweis** ist das neue Popup vor der Generierung. HINWEIS-Blöcke in generierten Dokumenten sind ab sofort verboten – der Prompt untersagt sie explizit.
