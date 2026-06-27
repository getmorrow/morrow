# Morrow Production Launch Checklist

Stand: 2026-06-26

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

## 3. Vercel Project Und Environment

Wichtig ab Next-Migration:

- Die öffentliche Website muss als eigenes Vercel-Projekt aus `apps/web` deployen.
- Root Directory in Vercel: `apps/web`.
- Framework Preset: Next.js.
- Die Root-`vercel.json` gehört zum alten Vite-Prototyp und darf nicht die Produktions-Website unter `getmorrow.de` steuern.
- `apps/web/vercel.json` setzt Install- und Build-Command so, dass die Monorepo-Workspace-Pakete aus dem Repo-Root installiert und gebaut werden.
- `apps/admin`, `apps/guest` und `apps/owner` haben ebenfalls eigene `vercel.json` Dateien und sollen als getrennte Vercel-Projekte deployen, nicht ueber das Root-Prototyp-Projekt.
- Empfohlene Projekt-Roots:
  - Website: `apps/web`
  - Admin-App: `apps/admin`
  - Gaeste-App: `apps/guest`
  - Eigentuemer-App: `apps/owner`

Soft-404-Pruefung:

- Wenn `https://www.getmorrow.de/agb`, `https://www.getmorrow.de/sitemap.xml` oder andere Next-Web-Routen den Text `Diese Seite gibt es noch nicht` mit HTTP 200 zeigen, ist die Domain sehr wahrscheinlich noch auf das alte Root/Vite-Deployment oder ein altes Deployment geroutet.
- Dann in Vercel das Projekt/Root Directory pruefen und erneut deployen.

In Vercel setzen:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://haifftleyussrokyafqq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_GA_MEASUREMENT_ID=...
NEXT_PUBLIC_META_PIXEL_ID=...
```

`NEXT_PUBLIC_GA_MEASUREMENT_ID` und `NEXT_PUBLIC_META_PIXEL_ID` nur setzen, wenn Tracking/Consent final gewollt ist. Ohne diese Werte rendert kein Tracking-Banner und keine Tracking-Skripte.

In `apps/web` zusaetzlich setzen, sobald die App-Projekte live sind:

```bash
MORROW_ADMIN_APP_URL=https://<admin-app-domain>
MORROW_GUEST_APP_URL=https://<guest-app-domain>
MORROW_OWNER_APP_URL=https://<owner-app-domain>
```

Damit leitet die oeffentliche Website diese Einstiegspunkte weiter:
- `/admin` -> Admin-App
- `/deine-auszeit/...` -> Gaeste-App
- `/owner` -> Eigentuemer-App
- `/app/eigentuemer` -> Eigentuemer-App

Die oeffentliche Eigentuemer-Landingpage bleibt bewusst unter `/eigentuemer`.

Nicht in Vercel-Frontend setzen:
- `RESEND_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Diese bleiben ausschließlich in Supabase Edge Function Secrets.

Owner-App zusaetzlich pruefen:
- Freigeschalteter Owner-Testzugang kann sich einloggen.
- `get_owner_dashboard()` liefert nur verknuepfte Objekte/Auszeiten/Termine/Buchungen.
- Owner-Supportnachricht landet in `support_messages` und ist im Admin sichtbar.
- Automatischer Check lokal:

```bash
SUPABASE_URL=https://haifftleyussrokyafqq.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
SUPABASE_ANON_KEY=<anon-key> \
OWNER_EMAIL=<owner-email> \
OWNER_PASSWORD=<owner-password> \
OWNER_VERIFY_SUPPORT_INSERT=1 \
npm run supabase:verify-owner
```

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

Automatisierter Basischeck:

```bash
QA_BASE_URL=https://www.getmorrow.de npm run qa:production
```

Dieser Check prüft:
- öffentliche Kernseiten inklusive Rechteseiten
- `robots.txt` und `sitemap.xml`
- Leadformulare für Gäste, Eigentümer und Erlebnispartner
- dass keine Mailto-Links mehr im Anfragefluss hängen
- Consent-Verhalten, wenn GA/Meta-IDs gesetzt sind
- Soft-404-Seiten, bei denen Vercel/SPA-Fallback eine Morrow-404 mit HTTP 200 ausliefert

Optionaler echter Testlead:

```bash
MORROW_QA_SUBMIT_LEAD=1 QA_BASE_URL=https://www.getmorrow.de npm run qa:production
```

Mit Supabase-Verifikation:

```bash
MORROW_QA_SUBMIT_LEAD=1 \
QA_BASE_URL=https://www.getmorrow.de \
SUPABASE_URL=https://haifftleyussrokyafqq.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
npm run qa:production
```

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

## 8a. App Production Rehearsal

Nach dem Deployment der drei App-Welten:

```bash
ADMIN_BASE_URL=https://<admin-app-domain> \
OWNER_BASE_URL=https://<owner-app-domain> \
GUEST_BASE_URL=https://<guest-app-domain> \
npm run qa:apps
```

Mit echten Testzugängen:

```bash
ADMIN_BASE_URL=https://<admin-app-domain> \
ADMIN_EMAIL=<admin-email> \
ADMIN_PASSWORD=<admin-password> \
OWNER_BASE_URL=https://<owner-app-domain> \
OWNER_EMAIL=<owner-email> \
OWNER_PASSWORD=<owner-password> \
GUEST_BASE_URL=https://<guest-app-domain> \
GUEST_BOOKING_ID=<booking-id> \
GUEST_ACCESS_CODE=<guest-code> \
npm run qa:apps
```

Dieser Check prueft:
- `/health` pro App liefert `status=ok` und die richtige App-ID (`admin`, `guest`, `owner`).
- Admin-, Gaeste- und Eigentuemer-App liefern keine Soft-404-Seite.
- Loginseiten zeigen die erwarteten Morrow-Inhalte.
- Admin-Login fuehrt bei gesetzten Zugangsdaten zum Dashboard.
- Eigentuemer-Login fuehrt bei freigeschaltetem Owner zum Dashboard.
- Gaeste-App oeffnet bei gesetzter Buchung und Code den persoenlichen Aufenthaltsbereich.
- Screenshots werden unter `tmp/qa/apps-production/` abgelegt.

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
