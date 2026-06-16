# Deployment-Guide – JobTRIX

Schritt-für-Schritt-Checkliste für das erste produktive Deployment auf Render / Supabase / Cloudflare.

---

## Voraussetzungen

- [ ] GitHub-Repository unter `github.com/Fallisch/jobtrix` vorhanden
- [ ] Domain `jobtrix.de` registriert (z. B. über IONOS oder Namecheap)
- [ ] Stripe-Account vorhanden (Test-Modus aktiviert)
- [ ] Resend-Account vorhanden (für Transaktions-E-Mails)

---

## Schritt 1 – Supabase-Datenbank einrichten

1. Account anlegen: https://supabase.com → **New Project**
2. Region: **EU (Frankfurt)**
3. Projektname: `jobtrix`
4. Datenbank-Passwort notieren → wird für `DATABASE_URL` benötigt
5. **Project Settings → Database → Connection string → URI** kopieren  
   Format: `postgresql://postgres.[ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`
6. In der Supabase-Oberfläche: **SQL Editor** → Schema wird automatisch durch Prisma befüllt

> **AVV (Auftragsverarbeitungsvertrag):** Supabase bietet einen DPA unter https://supabase.com/privacy — vor Produktivbetrieb mit personenbezogenen Daten abschließen.

---

## Schritt 2 – Prisma-Migrationen anwenden

Lokal gegen die Supabase-Datenbank ausführen (einmalig beim ersten Deployment):

```bash
cd jobtrix
DATABASE_URL="<supabase-connection-string>" npx prisma migrate deploy
```

Alle 9 Migrationen werden in dieser Reihenfolge angewendet:
1. `20260611115923_init`
2. `20260611134135_add_user_profile`
3. `20260611151330_add_access`
4. `20260611202535_add_application_history`
5. `20260612110428_add_application_history_template`
6. `20260613041752_add_user_profile_experience`
7. `20260613054059_add_application_history_accent_color_cv_style`
8. `20260613192335_add_theme_preference`
9. `20260616040428_add_rate_limit_entry`

---

## Schritt 3 – Render Web Service einrichten

1. Account anlegen: https://render.com → **New → Web Service**
2. GitHub-Repository verbinden: `Fallisch/jobtrix`
3. Einstellungen:
   - **Root Directory:** `jobtrix`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Region:** Frankfurt (EU)
4. **Auto-Deploy:** aktiviert (bei Push auf `main` automatisch)

> **AVV (Auftragsverarbeitungsvertrag):** Render bietet einen DPA unter https://render.com/privacy — vor Produktivbetrieb abschließen (Enterprise-Plan erforderlich für DPA-Unterzeichnung).

---

## Schritt 4 – Umgebungsvariablen auf Render setzen

Im Render-Dashboard unter **Environment → Environment Variables** folgende Variablen eintragen:

| Variable | Wert | Hinweis |
|---|---|---|
| `DATABASE_URL` | Supabase Connection String (Schritt 1) | Niemals in `.env` oder Git committen |
| `NEXTAUTH_URL` | `https://jobtrix.de` | Exakte Produktions-URL |
| `NEXTAUTH_SECRET` | Zufälliger 64-Zeichen-String | `openssl rand -base64 48` |
| `STRIPE_SECRET_KEY` | `sk_test_...` (Stripe Test-Modus) | Aus Stripe Dashboard → API Keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Nach Schritt 5 eintragen |
| `STRIPE_PRICE_ID_LIMITED` | Stripe Price-ID für Limited-Paket | Aus Stripe Dashboard → Products |
| `STRIPE_PRICE_ID_LIFETIME` | Stripe Price-ID für Lifetime-Paket | Aus Stripe Dashboard → Products |
| `RESEND_API_KEY` | `re_...` | Aus Resend Dashboard → API Keys |
| `RESEND_FROM_EMAIL` | `noreply@jobtrix.de` | Verifizierte Absender-Domain |

---

## Schritt 5 – Stripe-Test-Webhook einrichten

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. **Endpoint URL:** `https://jobtrix.de/api/webhooks/stripe`
3. **Events:** `checkout.session.completed`
4. **Webhook signing secret** (`whsec_...`) kopieren
5. In Render-Umgebungsvariablen als `STRIPE_WEBHOOK_SECRET` eintragen (Schritt 4 aktualisieren)
6. Test-Event senden und Empfang im Render-Log verifizieren

---

## Schritt 6 – Cloudflare DNS/CDN/WAF einrichten

1. Account anlegen: https://cloudflare.com → **Add a Site** → `jobtrix.de`
2. Plan: Free (ausreichend für DNS, CDN, WAF-Grundschutz)
3. **Nameserver** bei Domain-Registrar auf Cloudflare-Nameserver umstellen
4. DNS-Record hinzufügen:
   - Typ: `CNAME`
   - Name: `@` (oder `jobtrix.de`)
   - Target: Render-Domain (z. B. `jobtrix-de.onrender.com`)
   - **Proxy:** ☁️ Orange (aktiviert — CDN + WAF)
5. SSL/TLS-Mode: **Full (strict)**
6. Warte auf DNS-Propagation (max. 24h, meist <1h)

> **AVV (Auftragsverarbeitungsvertrag):** Cloudflare bietet einen DPA unter https://www.cloudflare.com/privacypolicy/ — kostenlos verfügbar, im Cloudflare Dashboard unter Account → Contracts akzeptieren.

---

## Schritt 7 – Deployment verifizieren

- [ ] `https://jobtrix.de` lädt per HTTPS
- [ ] Cloudflare-Proxy ist aktiv (orange Cloud-Icon im DNS-Dashboard)
- [ ] Registrierung funktioniert (neuer Account anlegen)
- [ ] Login und Logout funktionieren
- [ ] Passwort-Reset-E-Mail wird empfangen
- [ ] Stripe-Checkout öffnet sich im Test-Modus
- [ ] Stripe-Test-Webhook empfängt `checkout.session.completed`-Events
- [ ] GitHub Actions CI läuft grün (https://github.com/Fallisch/jobtrix/actions)

---

## Schritt 8 – AVV-Checkliste

Vor dem ersten produktiven Betrieb mit echten Nutzerdaten:

| Dienstleister | DPA-Link | Status |
|---|---|---|
| **Supabase** | https://supabase.com/privacy | ☐ abzuschließen |
| **Render** | https://render.com/privacy | ☐ abzuschließen |
| **Cloudflare** | https://www.cloudflare.com/privacypolicy/ | ☐ abzuschließen |
| **Stripe** | https://stripe.com/de/privacy | ☐ abzuschließen |
| **Resend** | https://resend.com/privacy | ☐ abzuschließen |

---

## Folge-Deployments

Render deployiert automatisch bei jedem Push auf `main`. Manuelle Schritte sind nur bei Schema-Änderungen erforderlich:

```bash
# Neue Migration gegen Supabase ausführen
DATABASE_URL="<supabase-connection-string>" npx prisma migrate deploy
```
