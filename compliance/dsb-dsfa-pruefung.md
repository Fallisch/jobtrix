# DSB- und DSFA-Pflichtprüfung — JobTRIX

**Stand**: 2026-06-21

---

## 1. Datenschutzbeauftragter (DSB) — Art. 37 DSGVO, § 38 BDSG

### Pflichtprüfung

| Kriterium | Ergebnis |
|---|---|
| ≥ 20 Personen ständig mit automatisierter Verarbeitung befasst (§ 38 Abs. 1 BDSG) | **Nein** — Faltrix GbR besteht aus 2 Personen |
| Kerntätigkeit = umfangreiche Verarbeitung besonderer Kategorien (Art. 9) | **Nein** — keine Art-9-Daten (keine Gesundheitsdaten, keine biometrischen Daten, keine Daten zur politischen Überzeugung etc.) |
| Kerntätigkeit = umfangreiche, regelmäßige und systematische Überwachung von Betroffenen | **Nein** — kein Tracking, kein Profiling, keine Überwachung |
| DSFA-pflichtige Verarbeitung (→ siehe unten) | **Nein** (voraussichtlich) |

### Ergebnis

**Kein DSB erforderlich.** Die Faltrix GbR beschäftigt weniger als 20 Personen in der automatisierten Verarbeitung, verarbeitet keine besonderen Datenkategorien und führt keine systematische Überwachung durch.

*Hinweis: Die Prüfung ist bei wesentlichen Änderungen (Personalaufbau, neue Datenarten, neue Verarbeitungszwecke) zu wiederholen.*

---

## 2. Datenschutz-Folgenabschätzung (DSFA) — Art. 35 DSGVO

### Pflichtprüfung

Eine DSFA ist erforderlich, wenn eine Verarbeitung voraussichtlich ein **hohes Risiko** für die Rechte und Freiheiten natürlicher Personen zur Folge hat. Insbesondere bei:

| Kriterium (Art. 35 Abs. 3 + WP248) | Prüfung für JobTRIX |
|---|---|
| Systematische und umfassende Bewertung persönlicher Aspekte (Profiling) mit rechtlicher/erheblicher Wirkung | **Nein** — Nutzer füllt Profil selbst aus, KI erstellt Texte, aber keine automatisierte Bewertung/Entscheidung mit rechtlicher Wirkung. Nutzer entscheidet über Verwendung der generierten Texte. |
| Umfangreiche Verarbeitung besonderer Datenkategorien (Art. 9) | **Nein** — keine Art-9-Daten |
| Systematische umfangreiche Überwachung öffentlich zugänglicher Bereiche | **Nein** |
| Neue Technologien (KI/ML) | **Teilweise** — Anthropic Claude API wird für Textgenerierung eingesetzt. Jedoch: keine automatisierte Einzelentscheidung (Art. 22), keine Bewertung/Einstufung von Personen, keine rechtliche Wirkung. |

### Abgleich mit Positivliste der Aufsichtsbehörde

[PRÜFEN: Positivliste (Muss-Liste) des Sächsischen Datenschutzbeauftragten — dort sind Verarbeitungen aufgeführt, für die zwingend eine DSFA durchzuführen ist. Die Verarbeitung von Bewerberdaten/Profildaten mit KI sollte gegen diese Liste abgeglichen werden.]

Relevante Einträge auf der DSK-Muss-Liste (bundesweit):
- Nr. 13: „Einsatz von KI zur Verarbeitung von personenbezogenen Daten" → **Prüfen ob die KI-Textgenerierung unter diesen Punkt fällt**

### Risikobewertung

| Faktor | Bewertung |
|---|---|
| Sensibilität der Daten | Mittel — Kontaktdaten, Berufserfahrung (keine Art-9-Daten) |
| Umfang | Gering — einzelne Nutzer, keine Massenverarbeitung |
| Automatisierte Entscheidung | Nein — Nutzer hat volle Kontrolle |
| Schutzbedürftige Betroffene | Nein — volljährige Arbeitssuchende |
| Innovativer Technologieeinsatz | Ja — KI-Textgenerierung |
| Drittlandtransfer | Ja — Profildaten an Anthropic (USA) |

### Ergebnis

**DSFA voraussichtlich nicht erforderlich**, da keine automatisierte Entscheidung mit rechtlicher/erheblicher Wirkung vorliegt und die Nutzung der KI-API als Textgenerierungswerkzeug (nicht als Bewertungs-/Entscheidungswerkzeug) eingestuft wird.

**Empfehlung**: Abgleich mit der aktuellen Positivliste des SDB durchführen. Falls der Punkt „KI-Verarbeitung personenbezogener Daten" dort pauschal gelistet ist, muss eine DSFA durchgeführt werden.

**Empfehlung bei hohem Risiko**: Fachanwalt oder externen DSB konsultieren, bevor die Verarbeitung aufgenommen wird.

---

## 3. Rechtsberatungshinweis

Diese Prüfung wurde nach bestem Wissen erstellt, ersetzt aber keine Rechtsberatung. Bei Unsicherheiten — insbesondere zur KI-bezogenen DSFA-Pflicht — wird die Konsultation eines Fachanwalts für Datenschutzrecht oder eines externen Datenschutzbeauftragten empfohlen.
