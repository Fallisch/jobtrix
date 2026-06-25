# Cloudflare WAF Rate-Limiting — Konfigurationsanleitung

Zweite Rate-Limit-Schicht, die unabhaengig von der Datenbank greift.
Schließt die Fail-Open-Luecke des DB-basierten Rate-Limiters (F4).

## Voraussetzungen
- Cloudflare-Dashboard-Zugang fuer die jobtrix.de-Zone
- Plan: Free (bis 1 Rule) oder Pro (bis 5 Rules)

## Rules einrichten

### Pfad: Security > WAF > Rate limiting rules > Create rule

---

### Rule 1 — Auth-Endpunkte (Login/Register/Reset)
- **Name:** `auth-rate-limit`
- **If incoming requests match:**
  - Field: `URI Path` · Operator: `starts with` · Value: `/api/auth/`
- **Rate:** 10 requests per 1 minute
- **Counting expression:** Same as rule expression
- **Group by:** `IP`
- **Mitigation:** Block for 5 minutes
- **Response type:** Default Cloudflare rate limiting response

### Rule 2 — AI-Generierung (teuerster Endpunkt)
- **Name:** `generate-rate-limit`
- **If incoming requests match:**
  - Field: `URI Path` · Operator: `equals` · Value: `/api/generate`
- **Rate:** 5 requests per 1 minute
- **Group by:** `IP`
- **Mitigation:** Block for 10 minutes

### Rule 3 — E-Mail-Versand
- **Name:** `send-email-rate-limit`
- **If incoming requests match:**
  - Field: `URI Path` · Operator: `equals` · Value: `/api/send-email`
- **Rate:** 3 requests per 1 minute
- **Group by:** `IP`
- **Mitigation:** Block for 10 minutes

### Rule 4 — Cron-Endpunkt (nur Render-IPs)
- **Name:** `cron-ip-restrict`
- **Type:** Custom rule (WAF > Custom rules)
- **If incoming requests match:**
  - Field: `URI Path` · Operator: `starts with` · Value: `/api/cron/`
  - AND Field: `IP Source Address` · Operator: `is not in` · Value: Render IP ranges
- **Action:** Block

Render IP-Ranges: siehe https://render.com/docs/static-outbound-ip-addresses

---

## Verifizierung

Nach Einrichtung testen:
```bash
# Auth-Rate-Limit testen (> 10 Requests in 1 Minute sollte 429 geben)
for i in $(seq 1 15); do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST https://jobtrix.de/api/auth/register
done

# Generate-Rate-Limit testen
for i in $(seq 1 8); do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST https://jobtrix.de/api/generate
done
```

Erwartetes Ergebnis: nach Erreichen des Limits kommt HTTP 429 von Cloudflare.
