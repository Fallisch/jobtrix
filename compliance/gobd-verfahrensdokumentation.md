# GoBD-Verfahrensdokumentation — JobTRIX

**Rechtsgrundlage**: GoBD (Grundsätze zur ordnungsmäßigen Führung und Aufbewahrung von Büchern, Aufzeichnungen und Unterlagen in elektronischer Form sowie zum Datenzugriff), §§ 145–147 AO, § 257 HGB
**Stand**: 2026-06-21

---

## 1. Anwendbarkeit

Faltrix GbR erzielt Einnahmen über kostenpflichtige Pakete (Limited, Lifetime) via Stripe. Damit entstehen steuerlich relevante Geschäftsvorfälle, die der GoBD unterliegen.

---

## 2. Datenentstehung

### Geschäftsvorfall: Paketkauf

1. Nutzer wählt Paket auf der Pricing-Seite
2. Weiterleitung zu Stripe Checkout (Stripe hosted)
3. Nutzer schließt Zahlung ab
4. Stripe sendet Webhook `checkout.session.completed` an `/api/webhooks/stripe`
5. App verarbeitet Webhook:
   - Prüft Stripe-Signatur (Integrität)
   - Prüft Idempotenz (keine Doppelverarbeitung)
   - Erstellt/aktualisiert `Access`-Record: Package, ValidUntil, StripePaymentId
6. Audit-Log-Eintrag: `checkout_created`

### Beteiligte Systeme

| System | Rolle | Daten |
|---|---|---|
| Stripe | Zahlungsabwicklung | Vollständige Zahlungsdaten (Kreditkarte, Betrag, Währung, Status) |
| JobTRIX (PostgreSQL) | Referenzspeicher | StripePaymentId, Pakettyp, Gültigkeitsdatum |
| Stripe Dashboard | Buchhaltungsexport | Rechnungen, Auszahlungen, Gebühren |

---

## 3. Datenfluss

```
Nutzer → Stripe Checkout → Stripe (Zahlungsdaten)
                         → Webhook → JobTRIX DB (Payment-ID, Paket)
                         → Stripe Dashboard → Buchhaltung/Steuerberater
```

---

## 4. Unveränderbarkeit

| Maßnahme | Umsetzung |
|---|---|
| Stripe-Transaktionen | Unveränderbar in Stripe gespeichert (Stripe-seitig garantiert) |
| Lokale Payment-IDs | Werden nur bei Webhook-Verarbeitung geschrieben, nicht nachträglich geändert |
| Webhook-Idempotenz | Doppelverarbeitung wird verhindert |
| Audit-Logging | Checkout-Erstellung wird protokolliert |

**Risiko**: Bei Konto-Löschung werden lokale Payment-IDs gelöscht (Cascade Delete). → **Anonymisierte Archivierung implementieren** (Issue #122).

---

## 5. Speicherort und -dauer

| Datenart | Speicherort | Aufbewahrungsdauer |
|---|---|---|
| Zahlungsbelege (Rechnungen) | Stripe Dashboard / Export | **10 Jahre** (§ 147 Abs. 1 Nr. 1 AO) |
| Buchungsbelege | Stripe Dashboard / Export | **10 Jahre** (§ 147 Abs. 1 Nr. 4 AO) |
| Geschäftsbriefe (E-Mails) | E-Mail-Postfach | **6 Jahre** (§ 257 Abs. 4 HGB) |
| Lokale Payment-IDs | PostgreSQL (Supabase) | Bis Konto-Löschung → dann anonymisiert 10 Jahre |

---

## 6. Zugriff

| Person | Zugriff auf |
|---|---|
| Falk Schieck | Stripe Dashboard, Supabase DB, Render |
| Patrick Matthes | Stripe Dashboard, Supabase DB, Render |
| Steuerberater | Stripe-Exporte (CSV/PDF) |

---

## 7. Verfahren

### Monatlich / Quartalsweise
1. Stripe-Umsätze exportieren (Dashboard → CSV/PDF)
2. An Steuerberater übermitteln
3. Belege ablegen (10 Jahre)

### Bei Konto-Löschung
1. Zahlungsnachweis anonymisiert archivieren (Issue #122)
2. Konto löschen (Cascade Delete)
3. Stripe-seitige Daten bleiben erhalten (unabhängig von App-Löschung)

---

## 8. Offene Punkte

- [ ] Anonymisierte Zahlungsarchivierung implementieren (Issue #122)
- [ ] Regelmäßigen Export-Prozess für Stripe-Belege etablieren
- [ ] Prüfen ob ab 2025 verkürzte Aufbewahrungsfristen für bestimmte Belege gelten (8 statt 10 Jahre)
