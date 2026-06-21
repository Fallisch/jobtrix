# Betroffenenrechte-Prozess — JobTRIX

**Rechtsgrundlage**: Art. 15–22 DSGVO
**Stand**: 2026-06-21

---

## Eingangskanal

Betroffene können ihre Rechte geltend machen über:
- **E-Mail**: faltrixgbr@gmail.com
- **Post**: Faltrix GbR, Am Schulberg 10, 09569 Oederan
- **Self-Service** (für Auskunft/Export und Löschung): Profilseite → „Konto & Datenschutz"

---

## Identitätsprüfung

Vor der Bearbeitung einer Anfrage muss die Identität des Betroffenen verifiziert werden:

1. **Bei Self-Service**: Authentifizierung über Login (Session-Token) — keine weitere Prüfung nötig
2. **Bei E-Mail-Anfrage**: Anfrage muss von der bei uns registrierten E-Mail-Adresse stammen. Bei Zweifeln: Rückfrage mit Verifizierungscode an die registrierte E-Mail.
3. **Bei Post-Anfrage**: Abgleich der Angaben mit gespeicherten Daten (Name, E-Mail, Adresse). Im Zweifel: Rückfrage per E-Mail an die registrierte Adresse.

---

## Fristen

- **Antwortfrist**: 1 Monat ab Eingang (Art. 12 Abs. 3)
- **Verlängerung**: Auf 3 Monate bei besonderer Komplexität oder Vielzahl von Anfragen — Betroffener wird innerhalb des ersten Monats über Verlängerung informiert
- **Dokumentation**: Eingangsdatum, Art der Anfrage, Bearbeitungsdatum, Ergebnis

---

## Verfahren je Recht

### Art. 15 — Auskunftsrecht

**Self-Service**: Nutzer kann über „Meine Daten herunterladen" (Profil → Konto & Datenschutz) einen vollständigen JSON-Export aller gespeicherten Daten abrufen.

**Bei externer Anfrage**:
1. Identität prüfen
2. JSON-Export erstellen (gleiche Daten wie Self-Service: Profil, Bewerbungshistorie, Kontoinformationen)
3. Per E-Mail an den Betroffenen senden
4. Zusätzlich informieren über: Verarbeitungszwecke, Empfänger, Speicherdauer, Rechte

### Art. 16 — Berichtigungsrecht

1. Identität prüfen
2. Betroffener teilt mit, welche Daten unrichtig sind
3. Berichtigung in der Datenbank durchführen (oder Nutzer auf Self-Service im Profil hinweisen)
4. Bestätigung an Betroffenen

### Art. 17 — Recht auf Löschung

**Self-Service**: Nutzer kann über „Konto löschen" (Profil → Konto & Datenschutz) sein Konto und alle Daten sofort löschen.

**Bei externer Anfrage**:
1. Identität prüfen
2. Konto und alle zugehörigen Daten löschen (Cascade Delete)
3. Ausnahme: anonymisierte Zahlungsnachweise (steuerliche Aufbewahrungspflicht, § 147 AO)
4. Bestätigung an Betroffenen

**Ablehnungsgründe**: Gesetzliche Aufbewahrungspflichten (§ 147 AO für Zahlungsdaten, 10 Jahre)

### Art. 18 — Recht auf Einschränkung der Verarbeitung

1. Identität prüfen
2. Prüfen ob Voraussetzungen vorliegen (Richtigkeit bestritten, Verarbeitung unrechtmäßig, Daten nicht mehr benötigt, Widerspruch eingelegt)
3. Technische Umsetzung: Account sperren (Login deaktivieren), Daten beibehalten aber nicht verarbeiten
4. [DEFINIEREN: Technische Umsetzung eines „gesperrten" Account-Status]
5. Betroffenen über Einschränkung informieren; vor Aufhebung Betroffenen informieren

### Art. 20 — Recht auf Datenübertragbarkeit

**Self-Service**: JSON-Export über „Meine Daten herunterladen" deckt dieses Recht ab.

**Bei externer Anfrage**:
1. Identität prüfen
2. JSON-Export erstellen und übermitteln
3. Format: maschinenlesbares JSON (strukturiert, gängiges Format)

### Art. 21 — Widerspruchsrecht

Betrifft Verarbeitungen auf Basis von Art. 6 Abs. 1 lit. f (berechtigtes Interesse):
- **Audit-Logging**: Bei Widerspruch → prüfen ob zwingende schutzwürdige Gründe überwiegen (IT-Sicherheit). In der Regel: IP-Adresse aus zukünftigen Logs entfernen, aber Logging-Funktion beibehalten.
- **Passwort-Reset-E-Mail**: Nicht auf berechtigtem Interesse basierend (nur auf Nutzeranfrage).

---

## Dokumentation

Jede Anfrage wird dokumentiert:

| Feld | Inhalt |
|---|---|
| Eingangsdatum | Datum der Anfrage |
| Kanal | E-Mail / Post / Self-Service |
| Art des Rechts | Auskunft / Berichtigung / Löschung / Einschränkung / Übertragbarkeit / Widerspruch |
| Identitätsprüfung | Bestanden / Methode |
| Bearbeitungsdatum | Datum der Umsetzung |
| Ergebnis | Durchgeführt / Abgelehnt (mit Begründung) |

---

## Verantwortlich

- **Bearbeitung**: Falk Schieck, Patrick Matthes
- **Frist-Überwachung**: [DEFINIEREN: Kalender-Erinnerung oder Ticket-System]
