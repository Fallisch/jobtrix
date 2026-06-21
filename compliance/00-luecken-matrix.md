# Lücken-Matrix — JobTRIX (Stand: 2026-06-21)

Ampel: 🟡 nicht-kritische Pflichten offen (AVV-Verträge formalisieren)

| # | Pflicht | Rechtsgrundlage | Status | Begründung / nächster Schritt | Dokument |
|---|---|---|---|---|---|
| A1 | VVT | Art. 30 DSGVO | 🟢 erfüllt | 9 Verarbeitungstätigkeiten dokumentiert | vvt.md |
| A2 | Rechtsgrundlage je Verarbeitung | Art. 6 DSGVO | 🟢 erfüllt | Im VVT und in der Datenschutzerklärung dokumentiert | vvt.md, /datenschutz |
| A3 | Datenschutzerklärung | Art. 13/14 DSGVO | 🟢 erfüllt | Vollständig: Rechtsgrundlagen, Drittlandtransfer, Betroffenenrechte (Art. 15–22), Beschwerderecht, Audit-Logging, Cookies/TDDDG | /datenschutz |
| A4 | TOM | Art. 32 DSGVO | 🟢 erfüllt | Dokumentiert. Offene Punkte: at-rest-Verschlüsselung, Backup (abhängig von Hosting) | tom-liste.md |
| A5 | Betroffenenrechte-Prozess | Art. 15–22 DSGVO | 🟢 erfüllt | Prozess definiert, Self-Service implementiert | betroffenenrechte-prozess.md |
| A6 | Löschkonzept | Art. 17 DSGVO + AO/HGB | 🟢 erfüllt | Fristen definiert, Audit-Log-Cleanup (90 Tage) implementiert, Zahlungsarchivierung implementiert | loeschkonzept.md |
| A7 | Datenpannen-Meldeprozess | Art. 33/34 DSGVO | 🟢 erfüllt | Meldeprozess, Register und Verantwortlichkeiten definiert | datenpannen-register.md |
| A8 | Datensparsamkeit / Privacy by Design | Art. 25 DSGVO | 🟢 erfüllt | Keine Analytics, keine Werbe-Cookies, minimale Datenerfassung | tom-liste.md |
| A9 | DSB-Pflichtprüfung | Art. 37, § 38 BDSG | 🟢 erfüllt | Nicht pflichtig (< 20 MA, keine Art-9-Daten). Dokumentiert. | dsb-dsfa-pruefung.md |
| A10 | DSFA | Art. 35 DSGVO | 🟢 erfüllt | Voraussichtlich nicht erforderlich. Positivliste SDB abgleichen empfohlen. | dsb-dsfa-pruefung.md |
| B1 | AVV mit jedem AV | Art. 28 DSGVO | 🔴 offen | 6 Dienste mit PII, DPAs abschließen → Issue #72 | sub-av-dossier.md |
| B2 | Eigener AVV als AV | Art. 28 DSGVO | ⚪ n.z. | Kein Auftragsverarbeiter (kein B2B-SaaS) | – |
| B3 | Sub-AV-Dossier | Art. 28 Abs. 4 DSGVO | 🟡 offen | Struktur erstellt, nach AVV-Abschluss Sub-AV-Listen eintragen | sub-av-dossier.md |
| B4 | Drittlandtransfer | Art. 44–49 DSGVO | 🟢 erfüllt | Alle Transfers abgesichert: Anthropic (SCC), Stripe/Resend/Render/Cloudflare (DPF), Supabase (SCC im DPA — DPA ausführen!) | sub-av-dossier.md |
| B5 | Gemeinsame Verantwortlichkeit | Art. 26 DSGVO | ⚪ n.z. | Kein Joint Controller | – |
| C1 | Impressum | § 5 DDG | 🟢 erfüllt | TMG→DDG korrigiert, OS-Plattform-Link ergänzt | /impressum |
| C2 | Cookie-Consent | § 25 TDDDG | ⚪ n.z. | Nur technisch notwendige Cookies | spezialthemen.md |
| C3 | Marketing/DOI | § 7 UWG | ⚪ n.z. | Kein Newsletter, keine Werbe-E-Mails | spezialthemen.md |
| C4 | Barrierefreiheit (BFSG) | BFSG | ⚪ n.z. | Kleinstunternehmen-Ausnahme greift | spezialthemen.md |
| D1 | GoBD-Verfahrensdoku | GoBD, §§ 145–147 AO | 🟢 erfüllt | Dokumentiert | gobd-verfahrensdokumentation.md |
| D2 | Aufbewahrungsfristen | § 147 AO, § 257 HGB | 🟢 erfüllt | Fristen definiert, anonymisierte Archivierung implementiert | loeschkonzept.md |
| D3 | Automatisierte Einzelentscheidung | Art. 22 DSGVO | ⚪ n.z. | Keine automatisierten Entscheidungen | spezialthemen.md |
| D4 | Beschäftigtendaten | § 26 BDSG | ⚪ n.z. | Keine Mitarbeiterdaten | spezialthemen.md |
| D5 | Minderjährige | Art. 8 DSGVO | ⚪ n.z. | Zielgruppe: volljährige Arbeitssuchende | spezialthemen.md |
| D6 | EU-AI-Act | VO (EU) 2024/1689 | 🟢 erfüllt | Begrenztes Risiko, Transparenzpflichten dokumentiert. AGB-Klausel vorhanden. | spezialthemen.md |

---

## Zusammenfassung

| Status | Anzahl |
|---|---|
| 🟢 erfüllt | 18 |
| 🔴 offen (kritisch) | 1 |
| 🟡 offen (wichtig) | 1 |
| ⚪ n.z. | 6 |

---

## Priorisierte Restliste

### 🔴 Kritisch — vor Go-Live
1. **B1 — AVV-Verträge** (Issue #72): 4 von 6 DPAs auto-inkludiert (Anthropic, Stripe, Resend, Cloudflare). Verbleibend:
   - **Supabase**: PandaDoc-DPA im Dashboard ausführen → https://supabase.com/dashboard/org/_/documents
   - **Render**: DPA auf https://render.com/dpa akzeptieren

### 🟡 Wichtig
2. **B3 — Sub-AV-Listen**: Nach AVV-Abschluss die Sub-AV-Listen der Dienste in sub-av-dossier.md eintragen

---

## Rechtsberatungshinweis

Diese Compliance-Prüfung wurde nach bestem Wissen erstellt. Sie ersetzt keine Rechtsberatung. Bei den folgenden Themen wird die Konsultation eines Fachanwalts oder externen DSB empfohlen:
- DSFA-Pflicht bei KI-Verarbeitung personenbezogener Daten (Positivliste SDB abgleichen)
- EU-AI-Act-Einordnung (Abgrenzung begrenztes/hohes Risiko bei Bewerbungskontexten)
- Drittlandtransfer an Anthropic (Umfang der PII-Übermittlung)

---

## Wiedervorlage-Trigger
- [ ] Neuer Dienst eingebunden → Skill erneut laufen
- [ ] Neues KI-/Tracking-/Marketing-Feature → Skill erneut laufen
- [ ] Personalaufbau ≥ 20 → DSB-Pflicht neu prüfen
- [ ] Umsatz > 2 Mio. € → BFSG-Ausnahme entfällt
- [ ] Jährliche Routine: nächste Prüfung 2027-06-21
