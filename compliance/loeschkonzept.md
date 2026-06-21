# Lösch- und Aufbewahrungskonzept — JobTRIX

**Rechtsgrundlage**: Art. 17 DSGVO, §§ 147 AO, § 257 HGB
**Stand**: 2026-06-21

---

## Grundsatz

Personenbezogene Daten werden gelöscht, sobald der Zweck der Verarbeitung entfällt und keine gesetzliche Aufbewahrungspflicht entgegensteht. Bei Konflikt zwischen DSGVO-Löschpflicht und gesetzlicher Aufbewahrung wird der Personenbezug durch Anonymisierung aufgelöst.

---

## Löschfristen je Datenkategorie

| Datenkategorie | Löschfrist | Auslöser | Umsetzung | Rechtsgrundlage |
|---|---|---|---|---|
| Nutzerkonto (User) | Sofort | Konto-Löschung durch Nutzer | Cascade Delete (Prisma onDelete) | Art. 17 DSGVO |
| Profildaten (UserProfile) | Sofort | Konto-Löschung | Cascade Delete | Art. 17 DSGVO |
| Bewerbungshistorie | Sofort | Konto-Löschung | Cascade Delete | Art. 17 DSGVO |
| Sessions/Accounts (NextAuth) | Sofort | Konto-Löschung | Cascade Delete | Art. 17 DSGVO |
| Access/Paketdaten | Sofort | Konto-Löschung | Cascade Delete | Art. 17 DSGVO |
| **Audit-Logs** | **90 Tage** | Automatische Bereinigung | [IMPLEMENTIEREN: Cron-Job] | Art. 6 Abs. 1 lit. f + Art. 5 Abs. 1 lit. c/e |
| **Zahlungsnachweise** | **10 Jahre** (anonymisiert) | Steuerliche Aufbewahrungspflicht | [IMPLEMENTIEREN: Anonymisierte Archivierung vor Konto-Löschung] | § 147 AO |
| Stripe-seitige Daten | Gemäß Stripe DPA | Stripe-intern | Nicht in unserem Einflussbereich | Stripe DPA |

---

## Konto-Löschung — Ablauf

1. Nutzer wählt „Konto löschen" auf der Profilseite
2. Re-Authentifizierung: Passwort-Bestätigung erforderlich
3. **Vor Löschung** (noch zu implementieren):
   - Zahlungsdaten (Stripe-Payment-ID, Pakettyp, Betrag) in anonymisierte Archiv-Tabelle kopieren (ohne User-ID)
4. Cascade Delete: User → UserProfile, Access, Sessions, Accounts, ApplicationHistoryEntries
5. Audit-Log-Eintrag: `account_deleted` (mit User-ID für 90 Tage)
6. Nutzer wird abgemeldet und auf Startseite weitergeleitet

---

## Automatische Bereinigung

### Audit-Logs (90 Tage)
```sql
DELETE FROM "AuditLog" WHERE "createdAt" < NOW() - INTERVAL '90 days';
```
- **Turnus**: Täglich (oder bei jedem Deployment)
- **Umsetzung**: [IMPLEMENTIEREN: Render Cron Job oder Supabase Scheduled Function]
- **Begründung 90 Tage**: Ausreichend für Sicherheitsanalyse bei Vorfällen, verhältnismäßig für Datensparsamkeit. IP-Adressen sind personenbezogene Daten und dürfen nicht unbegrenzt gespeichert werden.

### Sessions
- NextAuth bereinigt abgelaufene Sessions automatisch
- Keine manuelle Intervention erforderlich

---

## Konfliktauflösung: DSGVO vs. Aufbewahrungspflicht

| Situation | Lösung |
|---|---|
| Nutzer löscht Konto, aber Zahlungsdaten müssen 10 Jahre aufbewahrt werden | Anonymisierung: Zahlungsnachweis ohne Personenbezug archivieren |
| Audit-Log enthält User-ID eines gelöschten Nutzers | User-ID verweist auf keinen existierenden Nutzer mehr → faktisch anonymisiert. Nach 90 Tagen wird der Log-Eintrag gelöscht. |

---

## Offene Punkte

- [ ] Cron-Job für Audit-Log-Bereinigung implementieren (Issue #121)
- [ ] Anonymisierte Zahlungsarchivierung implementieren (Issue #122)
- [ ] Supabase-Backup-Aufbewahrung prüfen (enthalten Backups gelöschte Daten?)
