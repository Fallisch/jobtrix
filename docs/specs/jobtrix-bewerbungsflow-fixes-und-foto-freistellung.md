# JobTRIX – Bewerbungsflow-Fixes (Anzeigen-Übernahme, Mobile-Versand, Barrierefreiheit) und Foto-Freistellung

## Problem Statement

Beim realen Einsatz des Bewerbungs-Flows treten mehrere Fehler und Hürden auf, die vor allem auf dem Smartphone und für eingeschränkte Personen die Nutzung verhindern. Konkret:

1. **Externe Stellenanzeigen lassen sich nicht übernehmen**: In der Stellenanzeigen-Suche liefert die Arbeitsagentur-API für Angebote externer Anbieter (`externeUrl`) keinen Anzeigentext, sondern nur einen Link. Beim Klick auf ein solches Ergebnis wird daher nur der externe Link in einem neuen Tab geöffnet — der Anzeigentext wird **nicht** in das Feld „Stellenanzeige" übernommen. Der Nutzer hat dann keine Vorlage für die Generierung und muss den Text mühsam selbst kopieren.

2. **Handy: keine Vorschau von Anschreiben + Lebenslauf**: Auf dem Smartphone öffnet sich beim Klick auf „Vorschau" kein PDF. Ursache: Die Vorschau setzt auf `window.open(blobUrl)`, das auf vielen mobilen Browsern von Popup-Blockern verhindert oder nicht als sichtbares PDF dargestellt wird; der Fallback-Download greift nicht zuverlässig.

3. **Handy: „Prüfen" der beiden Dokumente funktioniert nicht**: Das Sichten/Prüfen von Anschreiben und Lebenslauf vor dem Bestätigen (Häkchen „Gelesen & einverstanden") ist auf dem Handy nicht durchführbar, weil die Vorschau (siehe Punkt 2) nicht funktioniert. Der Nutzer kann die Dokumente nicht ansehen, soll sie aber bestätigen.

4. **Handy: Absenden-Reihenfolge kaputt**: Beim Klick auf „Absenden" wird sofort `window.open(mailto)` ausgeführt. Das mobile Betriebssystem öffnet die Mailprogramm-Auswahl und reißt damit die Web-Seite weg. Die danach im Code folgenden PDF-Downloads laufen nicht mehr (Tab im Hintergrund/verlassen), und der Hinweis „Fast geschafft" (Anleitung zum Anhängen) wird erst gesetzt, **nachdem** der Nutzer manuell zur App zurückgekehrt ist. Ergebnis: Es werden keine PDFs heruntergeladen und der Nutzer steht ohne Anhänge da.

5. **Reihenfolge auch am Laptop für eingeschränkte Personen nicht bewältigbar**: Auf dem Laptop funktionieren Vorschau, Prüfen und der automatische Download zwar, aber der erklärende Hinweis „Fast geschafft" erscheint ebenfalls erst **nach** dem Öffnen des Mailprogramms und dem Download. Für eingeschränkte Personen ist diese Reihenfolge (erst handeln, dann erklärt bekommen, was passiert ist) nicht zu bewältigen. Die Anleitung muss **vor** dem Absprung ins Mailprogramm sichtbar sein.

6. **Bewerbungsfoto ohne Freistellung**: Dass man per Handy direkt ein Foto von sich aufnehmen kann, ist gut und soll erhalten bleiben. Allerdings soll die Foto-Aufnahme klar **optional** sein und das Foto auf Wunsch **freigestellt** werden (Person ausgeschnitten, neutraler/weißer Hintergrund) — wie ein professionelles Bewerbungsfoto. Aktuell wird das Foto nur komprimiert und unverändert mit Originalhintergrund übernommen.

## Solution

Der gesamte Pfad „Anzeige finden → Dokumente prüfen → absenden" wird so umgebaut, dass er auf Handy und Laptop zuverlässig funktioniert und für eingeschränkte Personen in einer logischen, vorhersehbaren Reihenfolge abläuft. Zusätzlich wird das Bewerbungsfoto optional freistellbar. Die Lösung umfasst vier Säulen:

1. **Externe Anzeigen serverseitig übernehmbar machen**: Klickt der Nutzer auf ein externes Suchergebnis, holt der Server den Anzeigentext von der externen Seite, extrahiert den lesbaren Fließtext und übernimmt ihn automatisch in das Feld „Stellenanzeige" — mit derselben „Übernommen"-Bestätigung wie bei internen Angeboten. Gelingt das Abrufen/Extrahieren nicht (z. B. blockierende Seite, JavaScript-Only-Inhalt), öffnet sich wie bisher der externe Link, **zusätzlich** wird ein Einfügefeld angeboten, in das der Nutzer den kopierten Text einsetzt, der dann ins Feld übernommen wird. So bleibt der Flow in jedem Fall durchführbar.

2. **Vorschau & Prüfen mobil-tauglich**: Die PDF-Vorschau für Anschreiben und Lebenslauf wird so umgebaut, dass sie auch auf mobilen Browsern zuverlässig öffnet (kein blockierter Popup-Pfad, sondern ein robustes Anzeige-/Download-Verhalten mit klarer Rückmeldung). Damit ist das Prüfen der beiden Dokumente vor dem Bestätigen auf jedem Gerät möglich.

3. **Absende-Flow umdrehen — erklären und herunterladen, dann Mailprogramm**: Die Reihenfolge im Absende-Schritt wird vertauscht. Beim Bestätigen werden **zuerst** die beiden PDFs heruntergeladen und **die Anleitung „Fast geschafft" sofort angezeigt** (vor jedem Absprung). Erst über einen klaren, separaten Button („Jetzt E-Mail-Programm öffnen") springt der Nutzer bewusst ins Mailprogramm. So sieht jeder Nutzer — auf Handy wie Laptop — die Anleitung und hat die PDFs sicher im Download, bevor die Seite verlassen wird. Die Anleitung bleibt gerätespezifisch (Android/iOS/Desktop).

4. **Foto optional + freistellbar (lokal im Browser)**: Die Foto-Aufnahme wird im Onboarding und Profil klar als optional/überspringbar gekennzeichnet. Nach der Aufnahme/Auswahl kann der Nutzer die **Hintergrund-Entfernung** aktivieren; die Freistellung läuft vollständig **im Gerät** des Nutzers (On-Device-Modell), sodass das Foto das Gerät nicht verlässt — datenschutzfreundlich und ohne zusätzlichen Auftragsverarbeiter. Das Originalfoto bleibt wählbar (Freistellung ist ein Angebot, kein Zwang).

## User Stories

1. As a Bewerber, I want, dass ein externes Suchergebnis seinen Anzeigentext automatisch in das Feld „Stellenanzeige" übernimmt, so that ich direkt generieren kann, ohne den Text selbst zu kopieren.
2. As a Bewerber, I want eine klare „Übernommen"-Bestätigung auch bei externen Anzeigen, so that ich sicher bin, dass die richtige Anzeige als Vorlage dient.
3. As a Bewerber, I want bei externen Anzeigen, deren Text nicht automatisch geholt werden kann, ein Einfügefeld, so that ich den kopierten Text trotzdem in einem Schritt übernehmen kann.
4. As a Bewerber am Smartphone, I want die PDF-Vorschau von Anschreiben und Lebenslauf öffnen können, so that ich die Dokumente vor dem Absenden prüfen kann.
5. As a Bewerber am Smartphone, I want die beiden Dokumente prüfen und bestätigen können, so that ich das Häkchen „Gelesen & einverstanden" guten Gewissens setzen kann.
6. As a Bewerber, I want beim Absenden zuerst die PDFs heruntergeladen bekommen und die Anleitung sehen, bevor das Mailprogramm öffnet, so that ich verstehe, was passiert, und die Anhänge sicher habe.
7. As a Bewerber, I want das Mailprogramm erst über einen bewussten, separaten Button öffnen, so that der Wechsel nicht ungewollt die Seite wegreißt und meine Downloads abbricht.
8. As an eingeschränkte Person, I want eine vorhersehbare Schritt-für-Schritt-Reihenfolge mit Erklärung **vor** dem Handeln, so that ich den Versand ohne fremde Hilfe abschließen kann.
9. As a Bewerber am Smartphone, I want nach dem Absenden eine gerätespezifische Anleitung (Android/iOS), so that ich weiß, wie ich die heruntergeladenen PDFs an die Mail anhänge.
10. As a Bewerber, I want, dass keine PDFs „verloren gehen", wenn ich vom Mailprogramm zurückkomme, so that ich den Vorgang nicht mehrfach starten muss.
11. As a Bewerber, I want ein Bewerbungsfoto direkt mit dem Handy aufnehmen können, so that ich kein separates Foto-Tool brauche.
12. As a Bewerber, I want die Foto-Aufnahme überspringen können, so that ich auch ohne Foto eine Bewerbung erstellen kann.
13. As a Bewerber, I want den Hintergrund meines Fotos automatisch entfernen lassen können, so that mein Foto wie ein professionelles Bewerbungsfoto wirkt.
14. As a Bewerber, I want, dass die Hintergrund-Entfernung auf meinem Gerät läuft und mein Foto nicht an Dritte gesendet wird, so that meine Daten geschützt bleiben.
15. As a Bewerber, I want nach der Freistellung weiterhin das Originalfoto wählen können, so that ich die Kontrolle über das Ergebnis behalte.
16. As a Bewerber, I want bei fehlgeschlagener automatischer Übernahme einer externen Anzeige eine verständliche Meldung statt einer leeren Reaktion, so that ich weiß, was zu tun ist.

## Implementation Decisions

### Modul 1: Übernahme externer Anzeigen (Server-Fetch + Fallback)
- **Server holt den Anzeigentext** (vom Nutzer in den Optionen bestätigt): Es wird eine serverseitige Route ergänzt, die zu einer externen Anzeigen-URL den HTML-Inhalt lädt und den lesbaren Fließtext extrahiert (Tags entfernen, Boilerplate reduzieren). Die Route ist authentifiziert und nutzt dieselbe Rate-Limit-Logik wie die bestehende Jobsuche.
- **Schnittstelle**: Erweiterung des Übernahme-Verhaltens im Bewerbungs-/Generierungs-Client. Beim Klick auf ein externes Ergebnis ruft der Client zuerst die Server-Übernahme auf; bei Erfolg wird das Feld „Stellenanzeige" befüllt und die bestehende „Übernommen"-Bestätigung gezeigt.
- **Fallback**: Schlägt der Abruf/die Extraktion fehl oder liefert zu wenig Text, wird wie bisher der externe Link geöffnet **und** ein Einfügefeld eingeblendet; eingefügter Text wird direkt ins Feld „Stellenanzeige" übernommen.
- **Sicherheit**: Server-seitiger Abruf nur für http/https-URLs, mit Timeout (analog bestehender 15s-Logik), keine Weitergabe interner Header; Schutz gegen SSRF (keine internen/Link-Local-Ziele). Reaktion bei Fehlern ist immer eine verständliche Nutzer-Meldung, kein 500.
- **Begrifflichkeit**: Das Zielfeld heißt im UI weiterhin „Stellenanzeige".

### Modul 2: Mobile-taugliche PDF-Vorschau
- Die Vorschau-Funktion für Anschreiben und Lebenslauf wird so umgebaut, dass sie nicht primär von `window.open` eines Blob-URLs abhängt (auf Mobile unzuverlässig/blockiert). Stattdessen robustes Verhalten: PDF erzeugen und so anzeigen/bereitstellen, dass es auf Mobile sichtbar wird, mit klarer Rückmeldung statt stillem Fehlschlag.
- Gilt einheitlich für die Vorschau im Dokument-Bereich und im Absende-Vorschau-Block (Anhänge), damit „Prüfen" überall geht.
- Kein Bruch des Desktop-Verhaltens (dort funktioniert die Anzeige bereits).

### Modul 3: Umgedrehter Absende-Flow (Download + Anleitung vor Mailprogramm)
- Beim Bestätigen des Versands wird die Reihenfolge geändert: (1) PDFs (Anschreiben + Lebenslauf) herunterladen, (2) Anleitung „Fast geschafft" sofort einblenden, (3) **separater** Button „Jetzt E-Mail-Programm öffnen", der erst dann das mailto öffnet.
- Das mailto wird nicht mehr in einem `_blank`-Fenster geöffnet (mobil problematisch), sondern als bewusste Navigation aus der Anleitung heraus.
- Die Anleitung bleibt gerätespezifisch (Android/iOS/Desktop) und ist barrierearm (klare Schrittfolge, fokussierbarer Hauptbutton, ausreichende Trefferflächen ≥ 44px).
- Die Anleitung erscheint unabhängig davon, ob der Nutzer anschließend wirklich ins Mailprogramm wechselt — sie ist nicht mehr an den Rücksprung gekoppelt.

### Modul 4: Foto optional + lokale Freistellung
- **Optional/überspringbar**: Im Onboarding und Profil wird die Foto-Aufnahme klar als optional gekennzeichnet (überspringbar, kein Pflichtschritt). Die bestehende Direkt-Aufnahme per Handy (`accept="image/*"`) bleibt erhalten.
- **Hintergrund entfernen, lokal im Browser** (vom Nutzer bestätigt): Nach Aufnahme/Auswahl kann der Nutzer „Hintergrund entfernen" aktivieren. Die Freistellung läuft vollständig im Gerät (On-Device-Modell), das Foto wird **nicht** an Dritte gesendet → kein zusätzlicher Auftragsverarbeiter, DSGVO-freundlich.
- **Original behalten**: Der Nutzer kann zwischen freigestelltem und Originalfoto wählen; Freistellung ist ein Angebot, kein Zwang.
- **Speicherformat**: Freigestelltes Foto wird wie bisher als komprimiertes Bild im Profil gespeichert; transparenter/neutraler Hintergrund wird so umgesetzt, dass die bestehenden PDF-Templates (rundes/Banner-Foto) korrekt aussehen.
- **Performance**: Das On-Device-Modell wird nur bei Bedarf geladen (lazy), damit der initiale App-Start nicht belastet wird; während der Verarbeitung gibt es eine sichtbare Rückmeldung.

### Architektur-/Vertragsentscheidungen
- Keine neuen Drittanbieter-Datenflüsse für Foto (lokal) und nur ein server-seitiger Abruf öffentlicher Anzeigen-Seiten für die externe Übernahme.
- Bestehende Auth-/Rate-Limit-Bausteine werden wiederverwendet, keine neue Auth-Topologie.
- Der mailto-Versandweg (Nutzer verschickt aus dem eigenen Mailprogramm) bleibt die gewählte Strategie; nur die Reihenfolge/Trigger ändern sich.

## Testing Decisions

Gute Tests prüfen beobachtbares Verhalten (was der Nutzer erlebt), nicht Implementierungsdetails. Vorhandene Tests im Repo (Jest-Unit/Component-Tests unter `__tests__`, Playwright-E2E unter `e2e`) dienen als Vorlage.

- **Externe Übernahme**: Test, dass ein externes Suchergebnis nach Klick den (gemockten) Server-Text in das Feld „Stellenanzeige" übernimmt und die „Übernommen"-Bestätigung zeigt. Test des Fallbacks: bei fehlgeschlagenem Abruf erscheint das Einfügefeld; eingefügter Text landet im Feld. Server-Route: Test, dass nur http/https akzeptiert wird, Timeout/Fehler eine leere/again-Antwort statt 500 liefert und keine internen Ziele abgerufen werden.
- **Mobile Vorschau**: Test, dass die Vorschau-Aktion ein PDF erzeugt/bereitstellt und bei verhindertem Popup einen funktionierenden Fallback nutzt (kein stiller Fehlschlag). E2E (mobiles Viewport) für „Vorschau öffnen" bei Anschreiben und Lebenslauf.
- **Absende-Reihenfolge**: Test, dass beim Bestätigen die PDF-Downloads ausgelöst und die Anleitung **vor** dem mailto-Sprung angezeigt wird; das Mailprogramm öffnet erst beim separaten Button. Regressionstest: Anleitung ist nicht mehr an den Rücksprung gekoppelt.
- **Barrierefreiheit**: Test/Check, dass der Hauptbutton fokussierbar ist, Trefferflächen ≥ 44px und die Schrittfolge in vorhersehbarer Reihenfolge sichtbar ist.
- **Foto**: Test, dass die Foto-Aufnahme überspringbar ist (Onboarding ohne Foto abschließbar). Test, dass „Hintergrund entfernen" ein verändertes Foto erzeugt und das Original wählbar bleibt; die Verarbeitung verlässt das Gerät nicht (kein Netzwerk-Call beim Freistellen). Snapshot/Visual-Check, dass freigestelltes Foto in den PDF-Templates korrekt dargestellt wird.

## Out of Scope

- Serverseitiges Versenden der Bewerbungsmail inkl. Anhängen (mailto/Selbstversand-Strategie bleibt bestehen).
- Vollständiges Scraping beliebiger externer Job-Portale mit JavaScript-Rendering/Headless-Browser; bei nicht extrahierbaren Seiten greift bewusst der Einfüge-Fallback.
- KI-gestützte Foto-Retusche/Beautify über die reine Hintergrund-Entfernung hinaus.
- Neue Bezahl-/Account-Features; berührt ausschließlich Such-, Dokument- und Foto-Flow.
- Redesign der visuellen Gesamtoptik (es bleibt beim bestehenden Look; nur Ablauf/Reihenfolge/Hinweise ändern sich).

## Further Notes

- **Reihenfolge der Umsetzung**: Modul 3 (Absende-Reihenfolge) hat den größten Wirkungsgrad für eingeschränkte Personen und ist relativ isoliert — guter Startpunkt. Modul 2 (mobile Vorschau) ist Voraussetzung dafür, dass „Prüfen" am Handy überhaupt geht. Modul 1 (externe Übernahme) und Modul 4 (Foto) sind unabhängig ergänzbar.
- **DSGVO-Bezug**: Foto-Freistellung läuft lokal → kein neuer Auftragsverarbeiter, keine Ergänzung im VVT/AVV nötig. Der server-seitige Abruf externer Anzeigen-Seiten verarbeitet keine personenbezogenen Bewerberdaten, nur öffentliche Stellentexte. (Vgl. offenes Compliance-Issue #72 bleibt davon unberührt.)
- **Bezug Bestand**: Die mailto-Strategie und die gerätespezifische Anleitung stammen aus der Phase „UX-Optimierung und Nutzerführung" (`docs/specs/jobtrix-ux-optimierung-und-nutzerfuehrung.md`); diese SPEC korrigiert deren Reihenfolge-/Mobile-Schwächen, ohne die Strategie zu verwerfen.
