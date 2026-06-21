# Sub-Auftragsverarbeiter-Dossier — JobTRIX

**Rechtsgrundlage**: Art. 28 Abs. 4 DSGVO (Sub-AVs), Art. 44–49 DSGVO (Drittlandtransfer)
**Stand**: 2026-06-21

---

## Übersicht Dienste

| # | Dienst | Anbieter | Sitz | Hosting | PII | AVV/DPA | DPF | Transfer |
|---|---|---|---|---|---|---|---|---|
| 1 | Anthropic Claude API | Anthropic PBC | USA | USA | Ja | Auto-inkludiert | Nein | SCC |
| 2 | Stripe | Stripe Inc. | USA | Global | Ja | Auto-inkludiert | Ja | DPF |
| 3 | Resend | Resend Inc. (Plus Five Five) | USA | USA | Ja | Auto-inkludiert | Ja | DPF |
| 4 | Render | Render Inc. | USA | EU (Frankfurt) | Ja | Verfügbar | Ja | DPF |
| 5 | Supabase | Supabase Inc. | USA | EU | Ja | **PandaDoc ausführen** | Nein | SCC |
| 6 | Cloudflare | Cloudflare Inc. | USA | Global Edge | Ja (Transit) | Auto-inkludiert | Ja | DPF |
| 7 | Arbeitsagentur API | BA für Arbeit | DE | DE | Nein | n.z. | n.z. | – |

---

## Detailprüfung je Dienst

### 1. Anthropic Claude API

| Feld | Status |
|---|---|
| **Anbieter** | Anthropic PBC, San Francisco, CA, USA |
| **Funktion** | KI-Textgenerierung (Anschreiben, Lebenslauf, E-Mail-Entwurf) |
| **Verarbeitete PII** | Profildaten (Name, Adresse, Telefon, Geburtsdatum, Ausbildung, Berufserfahrung, Qualifikationen), Stellenanzeige-Text |
| **Hosting-Region** | USA |
| **DPF-Zertifizierung** | **Nein** — Anthropic ist nicht DPF-zertifiziert |
| **Transfermechanismus** | **Standard Contractual Clauses (SCC)** — Module 2 (Controller to Processor) oder Module 3 (Processor to Processor), irisches Recht |
| **AVV/DPA** | Data Processing Addendum — auto-inkludiert in Commercial Terms of Service |
| **DPA-Link** | https://www.anthropic.com/legal/data-processing-addendum |
| **Abschlussdatum** | [EINTRAGEN: wird wirksam durch Nutzung der API unter Commercial Terms] |
| **Datenspeicherung** | Anthropic trainiert **nicht** auf API-Kundendaten. Daten werden logisch getrennt. |
| **Sub-Auftragsverarbeiter** | https://www.anthropic.com/subprocessors |
| **Änderungsfrist** | 15 Tage Widerspruchsfrist bei neuen Sub-AVs |
| **Geltendes Recht** | Republik Irland |

**Status**: ✅ DPA verfügbar und auto-inkludiert. Transfer über SCC abgesichert. **Aktion**: Commercial Terms akzeptieren / Nutzung dokumentieren.

---

### 2. Stripe

| Feld | Status |
|---|---|
| **Anbieter** | Stripe Inc., San Francisco, CA, USA |
| **Funktion** | Zahlungsabwicklung (Checkout, Webhooks) |
| **Verarbeitete PII** | Zahlungsdaten (direkt bei Stripe), Payment-ID lokal |
| **Hosting-Region** | Global (PCI-DSS-zertifiziert) |
| **DPF-Zertifizierung** | **Ja** |
| **Transfermechanismus** | DPF + SCC als Fallback |
| **AVV/DPA** | Auto-inkludiert in Stripe Services Agreement (SSA) |
| **DPA-Link** | https://stripe.com/legal/dpa (PDF-Download verfügbar) |
| **Abschlussdatum** | [EINTRAGEN: wirksam durch Stripe-Account-Erstellung] |
| **Sub-Auftragsverarbeiter** | https://stripe.com/legal/service-providers |
| **Änderungsfrist** | 30 Tage Benachrichtigung bei neuen Sub-AVs |

**Status**: ✅ DPA auto-inkludiert, DPF-zertifiziert. **Aktion**: Nutzung dokumentieren.

---

### 3. Resend

| Feld | Status |
|---|---|
| **Anbieter** | Plus Five Five, Inc. (Resend), USA |
| **Funktion** | E-Mail-Versand (Bewerbungs-E-Mails, Passwort-Reset) |
| **Verarbeitete PII** | E-Mail-Adressen, E-Mail-Inhalte |
| **Hosting-Region** | USA |
| **DPF-Zertifizierung** | **Ja** — EU-U.S. DPF + UK Extension zertifiziert |
| **Transfermechanismus** | DPF + SCC als Fallback |
| **AVV/DPA** | Data Processing Addendum — wirksam durch Nutzung, auch via Dashboard zugänglich |
| **DPA-Link** | https://resend.com/legal/dpa |
| **Abschlussdatum** | [EINTRAGEN: wirksam durch Resend-Account-Erstellung] |
| **Sub-Auftragsverarbeiter** | https://resend.com/legal/subprocessors |
| **Änderungsfrist** | 14 Tage Benachrichtigung bei neuen Sub-AVs |
| **Kontakt** | privacy@resend.com |

**Status**: ✅ DPA verfügbar, DPF-zertifiziert. **Aktion**: Nutzung dokumentieren.

---

### 4. Render

| Feld | Status |
|---|---|
| **Anbieter** | Render Inc., San Francisco, CA, USA |
| **Funktion** | App-Hosting (Next.js-Anwendung) |
| **Verarbeitete PII** | Alle Anwendungsdaten (Transit + Processing) |
| **Hosting-Region** | EU (Frankfurt) |
| **DPF-Zertifizierung** | **Ja** — EU-U.S. DPF + UK Extension + Swiss-U.S. DPF (seit Januar 2025) |
| **Transfermechanismus** | DPF + EU-Server |
| **AVV/DPA** | Verfügbar unter render.com/dpa |
| **DPA-Link** | https://render.com/dpa |
| **Abschlussdatum** | [EINTRAGEN] |
| **Sub-Auftragsverarbeiter** | [EINTRAGEN — im DPA enthalten] |

**Status**: ✅ DPF-zertifiziert, DPA verfügbar. **Aktion**: DPA akzeptieren und Nutzung dokumentieren.

---

### 5. Supabase

| Feld | Status |
|---|---|
| **Anbieter** | Supabase Inc., San Francisco, CA, USA |
| **Funktion** | Managed PostgreSQL Datenbank |
| **Verarbeitete PII** | Alle in der DB gespeicherten Daten |
| **Hosting-Region** | EU |
| **DPF-Zertifizierung** | **Nein** — Supabase ist nicht DPF-zertifiziert |
| **Transfermechanismus** | EU-Server + SCC (im DPA enthalten) |
| **AVV/DPA** | PDF verfügbar + PandaDoc via Dashboard für rechtlich bindende Version |
| **DPA-Link** | https://supabase.com/legal/dpa |
| **PandaDoc** | https://supabase.com/dashboard/org/_/documents |
| **Abschlussdatum** | [EINTRAGEN — PandaDoc im Dashboard ausführen] |
| **Zertifizierungen** | SOC2 Type 2, HIPAA, ISO 27001 |
| **Sub-Auftragsverarbeiter** | [EINTRAGEN — im DPA enthalten] |
| **Hinweis** | US-Firma ohne DPF, aber EU-Server + SCC im DPA. Transfer über SCC abgesichert, solange DPA ausgeführt wird. |

**Status**: 🟡 Transfer über SCC abgesichert, aber **PandaDoc-DPA im Dashboard muss ausgeführt werden**. Ohne DPA kein gültiger Transfermechanismus!

---

### 6. Cloudflare

| Feld | Status |
|---|---|
| **Anbieter** | Cloudflare Inc., San Francisco, CA, USA |
| **Funktion** | CDN, DNS-Verwaltung, WAF/DDoS-Schutz |
| **Verarbeitete PII** | Transit-Daten (HTTP-Requests), IP-Adressen (kurzfristig) |
| **Hosting-Region** | Globales Edge-Netzwerk |
| **DPF-Zertifizierung** | **Ja** — EU-U.S. DPF + Swiss-U.S. DPF + UK Extension |
| **Transfermechanismus** | DPF + SCC als Fallback |
| **AVV/DPA** | Auto-inkludiert in Self-Service- und Enterprise-Agreements |
| **DPA-Link** | https://www.cloudflare.com/cloudflare-customer-dpa/ |
| **Abschlussdatum** | [EINTRAGEN: wirksam durch Cloudflare-Account-Erstellung] |
| **Sub-Auftragsverarbeiter** | https://www.cloudflare.com/gdpr/subprocessors/ |

**Status**: ✅ DPA auto-inkludiert, DPF-zertifiziert. **Aktion**: Nutzung dokumentieren.

---

### 7. Arbeitsagentur Jobsuche-API — n.z.

Öffentliche API der Bundesagentur für Arbeit. Nur Suchbegriffe und Standortangaben werden übermittelt (keine PII). Kein AVV erforderlich, kein Drittlandtransfer.

---

## Zusammenfassung Drittlandtransfer

| Dienst | Transfer nach | Mechanismus | DPF | Status |
|---|---|---|---|---|
| Anthropic | USA (Daten) | SCC (Module 2/3) | Nein | ✅ über SCC abgesichert |
| Stripe | USA | DPF + SCC | Ja | ✅ |
| Resend | USA | DPF + SCC | Ja | ✅ |
| Render | EU-Server, US-Firma | DPF | Ja | ✅ |
| Supabase | EU-Server, US-Firma | SCC (im DPA) | Nein | ⚠️ DPA muss ausgeführt werden |
| Cloudflare | Global Edge, US-Firma | DPF + SCC | Ja | ✅ |

---

## Aktionsliste

### Vor Go-Live
- [x] Anthropic: DPA auto-inkludiert durch API-Nutzung unter Commercial Terms ✅
- [x] Stripe: DPA auto-inkludiert durch SSA ✅
- [x] Resend: DPA auto-inkludiert durch Account-Nutzung ✅
- [x] Cloudflare: DPA auto-inkludiert durch Account-Nutzung ✅
- [x] Render: DPF-zertifiziert (seit Jan 2025), DPA verfügbar ✅
- [ ] **Supabase: PandaDoc-DPA im Dashboard ausführen** → https://supabase.com/dashboard/org/_/documents
- [ ] Render: DPA auf render.com/dpa akzeptieren und Abschlussdatum dokumentieren

### Nach Abschluss
- [ ] Abschlussdaten in dieses Dokument eintragen
- [ ] Sub-AV-Listen von Render und Supabase eintragen
