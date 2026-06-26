# Morrow Production Launch Checklist

Stand: 2026-06-04

Ziel: Morrow sicher von lokalem MVP zu einer öffentlich erreichbaren Phase-1-Version bringen.

Operativer MVP-Abschlussrahmen: `docs/MORROW_MVP_COMPLETION_PLAN.md`

## 1. Secrets rotieren

Vor Livegang rotieren, weil Werte im Arbeitschat geteilt wurden:
- Supabase Personal Access Token
- Supabase Service Role Key
- Resend API Key
- Admin-Passwort fuer `auszeiten@getmorrow.de`, weil es im Arbeitschat geteilt wurde

Danach neu setzen:
- Supabase Edge Function Secret `RESEND_API_KEY`
- Supabase Edge Function Secret `MORROW_EMAIL_FROM=Morrow <auszeiten@getmorrow.de>`
- Supabase Edge Function Secret `MORROW_INTERNAL_LEAD_EMAIL=auszeiten@getmorrow.de`
- Supabase Edge Function nutzt `SUPABASE_SERVICE_ROLE_KEY` automatisch in Supabase.

## 2. Supabase Auth absichern

Erledigt:
- Admin-Login mit E-Mail + Passwort.
- `admin_users` als Rollenliste.
- RLS über `is_morrow_admin()`.
- Start-Admin: `auszeiten@getmorrow.de`.

Noch prüfen:
- Öffentliche Registrierung in Supabase Auth deaktivieren.
- Redirect URLs setzen:
  - lokal: `http://127.0.0.1:5173/admin`
  - Produktion: `https://getmorrow.de/admin`
  - ggf. Vercel Preview URLs nur bewusst freigeben.
- Passwort-Recovery-Link testen.
- Nicht freigegebener Auth-User muss im Admin blockiert werden.

## 3. Vercel Environment

Erledigt im Code:
- `vercel.json` ergänzt, damit direkte SPA-Routen wie `/admin`, `/ratgeber/...` und `/deine-auszeit/...` auf `index.html` zeigen.
- Asset-Caching für `assets/` und `brand/` definiert.

In Vercel setzen:

```bash
VITE_SUPABASE_URL=https://haifftleyussrokyafqq.supabase.co
VITE_SUPABASE_ANON_KEY=...
VITE_ENABLE_EMAIL_AUTOMATION=true
```

Nicht in Vercel-Frontend setzen:
- `RESEND_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Diese bleiben ausschließlich in Supabase Edge Function Secrets.

## 3a. MVP Completion Vor Erstem Zahlenden Gast

Vor dem ersten zahlenden Gast muessen die MVP-kritischen Punkte aus `docs/MORROW_MVP_COMPLETION_PLAN.md` geprueft werden:

- Paket-Builder fuer neue Auszeiten.
- Unterkunftsverwaltung mit Medien, Regeln, Check-in, Ausstattung und Bildrechten.
- Erlebnisbausteine mit Anbieter, Preis, Kapazitaet und Verfuegbarkeit.
- Gaestebereich zeigt Anreise, Schluessel und Unterkunftsregeln aus Admin-Daten.
- Support-/Problem-Ticket-Flow landet im Admin.
- Statusbasierte E-Mails mindestens fuer Anfrage, Reservierung/Bestaetigung und Vor-Anreise. Stand 2026-06-23: live als `booking-status-email`, dedupliziert und getestet.
- Feedback-Mail nach abgeschlossenem Aufenthalt laeuft ueber serverseitigen Supabase-Cron.
- AGB, Buchungsbedingungen, Stornobedingungen und Zahlungsbedingungen final verlinkt.
- WhatsApp-/Marketing-Einwilligung rechtlich geprueft.
- Conversion-Tracking fuer Anfragefluss getestet.

## 4. Domain

Domain:
- `getmorrow.de`

Prüfen:
- DNS auf Vercel:
  - `getmorrow.de`
  - optional `www.getmorrow.de` mit Redirect auf Hauptdomain.
- HTTPS aktiv.
- Supabase Auth Redirects:
  - `https://getmorrow.de/admin`
  - `https://getmorrow.de/admin?type=recovery`
  - lokal weiter `http://127.0.0.1:5173/admin`
- Resend Domain bleibt verifiziert.
- Absender `auszeiten@getmorrow.de` funktioniert.

## 5. Rechtliches

Vor Ads/echtem Traffic erforderlich:
- Impressum als technische Arbeitsfassung vorhanden: `/impressum`.
- Datenschutz als technische Arbeitsfassung vorhanden: `/datenschutz`.
- echte Unternehmensdaten ergänzen.
- Rechtstexte prüfen lassen.
- WhatsApp-Opt-in-Text im Formular rechtlich prüfen.
- Cookie-/Tracking-Hinweise, sobald Analytics oder Meta/Google Pixel aktiv werden.
- Klare Speicherdauer und Zweck der Anfrage-/Kommunikationsdaten.

## 6. Tracking

Vor Aktivierung klären:
- GA4 oder Plausible?
- Meta Pixel?
- Google Ads Conversion?
- Consent Mode / Cookie Banner nötig?

Für Phase 1 messen:
- Formular-Abschluss Gast.
- Eigentümer-Anfrage.
- Erlebnisanbieter-Anfrage.
- Ratgeber -> Auszeit CTA.
- Admin: echte Buchung manuell tracken.

## 7. Angebotsdaten

Vor öffentlichem Traffic:
- echte Unterkunftsbilder und Nutzungsrechte.
- freie Termine final.
- Preis final.
- enthaltenes Erlebnis final.
- Restaurant-/Vor-Ort-Empfehlungen kuratiert.
- Verantwortlichkeit bei Objektproblemen je Auszeit dokumentiert.

## 8. Production Rehearsal

Einmal vollständig testen:
- echte Anfrage über `getmorrow.de`.
- Gastbestätigung kommt an.
- interne Lead-Mail kommt an.
- Lead erscheint im Admin.
- Kommunikationshistorie zeigt E-Mail-Events.
- Status auf `Reserviert` und `Bezahlt` setzen.
- Buchung/Gästebereich prüfen.
- Supportnachricht aus Gästebereich senden.
- Supportfall im Admin prüfen.
- Supabase-Backup mit `npm run supabase:backup` ausführen und `manifest.json` prüfen.
- Runbook `docs/SUPABASE_BACKUP_RECOVERY_RUNBOOK.md` lesen und sicheren Ablageort für Exporte festlegen.

## Aktueller Status

Technisch deutlich näher an production-ready:
- Supabase verbunden.
- Admin Auth + Rollen aktiv.
- E-Mail-Automation aktiv.
- Kommunikationshistorie V1 aktiv.

Noch nicht live-ready ohne:
- finale Rechtstexte mit echten Unternehmensdaten.
- Vercel/Domain-Setup.
- Secret-Rotation.
- finale echte Angebotsdaten.
- Tracking-/Consent-Entscheidung.
