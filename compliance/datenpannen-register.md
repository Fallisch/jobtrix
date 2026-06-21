# Datenpannen-Meldeprozess und Register — JobTRIX

**Rechtsgrundlage**: Art. 33/34 DSGVO
**Stand**: 2026-06-21

---

## 1. Meldeprozess

### 1.1 Erkennung

Eine Datenpanne kann erkannt werden durch:
- **Audit-Logs**: Ungewöhnliche Muster (viele fehlgeschlagene Logins, unerwartete Account-Löschungen)
- **Nutzerhinweis**: Meldung per E-Mail an faltrixgbr@gmail.com
- **Dienstleister-Benachrichtigung**: Render, Supabase, Stripe, Cloudflare melden Vorfälle gemäß AVV
- **Eigene Beobachtung**: Unerwartetes Verhalten der Anwendung, Zugriff auf Systeme

### 1.2 Bewertungsschema

| Risikostufe | Beschreibung | Maßnahmen |
|---|---|---|
| **Kein Risiko** | Keine personenbezogenen Daten betroffen (z. B. reiner Ausfall ohne Datenverlust) | Interne Dokumentation im Register |
| **Normales Risiko** | Personenbezogene Daten betroffen, aber kein hohes Risiko für Betroffene | Meldung an Aufsichtsbehörde (72h) + Dokumentation |
| **Hohes Risiko** | Wahrscheinlich hohes Risiko für Rechte/Freiheiten (z. B. Passwort-Leak, Profildaten öffentlich) | Meldung an Aufsichtsbehörde (72h) + Benachrichtigung der Betroffenen + Dokumentation |

### 1.3 Frist

- **72 Stunden** ab Bekanntwerden der Panne (Art. 33 Abs. 1)
- Bei Überschreitung: Begründung der Verzögerung in der Meldung angeben

### 1.4 Meldeweg

**Zuständige Aufsichtsbehörde**:
Sächsischer Datenschutz- und Transparenzbeauftragter
Devrientstraße 1, 01067 Dresden
Telefon: 0351 85471 101
E-Mail: post@datenschutz.sachsen.de
Online-Meldung: https://www.datenschutz.sachsen.de

**Inhalt der Meldung** (Art. 33 Abs. 3):
- Art der Panne
- Kategorien und ungefähre Zahl der betroffenen Personen und Datensätze
- Name und Kontaktdaten des Verantwortlichen
- Wahrscheinliche Folgen
- Ergriffene/vorgeschlagene Maßnahmen

### 1.5 Verantwortliche Personen

| Rolle | Person | Kontakt |
|---|---|---|
| Ersterkennung & Bewertung | Falk Schieck | faltrixgbr@gmail.com |
| Meldung an Aufsichtsbehörde | Falk Schieck | faltrixgbr@gmail.com |
| Benachrichtigung Betroffener | Patrick Matthes | faltrixgbr@gmail.com |
| Technische Sofortmaßnahmen | Falk Schieck | faltrixgbr@gmail.com |

### 1.6 Sofortmaßnahmen (nach Erkennung)

1. Schwachstelle identifizieren und schließen (z. B. kompromittierte API-Keys rotieren)
2. Ausmaß feststellen (welche Daten, welche Nutzer?)
3. Risikobewertung durchführen
4. Meldung an Aufsichtsbehörde vorbereiten (innerhalb 72h)
5. Bei hohem Risiko: Betroffene benachrichtigen
6. Vorfall im Register dokumentieren

---

## 2. Datenpannen-Register

### Vorfälle

| # | Datum | Art der Panne | Betroffene Daten | Betroffene Personen (Anzahl) | Risikostufe | Maßnahmen | Meldung an Behörde | Betroffene benachrichtigt |
|---|---|---|---|---|---|---|---|---|
| – | – | Kein Vorfall bisher | – | – | – | – | – | – |

*Dieses Register wird bei jedem Vorfall aktualisiert, auch wenn die Bewertung ergibt, dass keine Meldepflicht besteht.*

---

## 3. Benachrichtigung der Betroffenen (Art. 34)

Bei hohem Risiko müssen Betroffene in klarer, einfacher Sprache informiert werden über:
- Art der Panne
- Wahrscheinliche Folgen
- Ergriffene Maßnahmen
- Empfehlungen (z. B. Passwort ändern)

**Kanal**: E-Mail an registrierte Adresse (oder, falls nicht möglich, öffentliche Bekanntmachung auf der Website)
