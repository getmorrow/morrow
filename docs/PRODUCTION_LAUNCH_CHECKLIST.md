# Morrow Production Launch Checklist

Stand: 2026-07-02

Ziel: Morrow sicher von lokalem MVP zu einer öffentlich erreichbaren Phase-1-Version bringen.

Operativer MVP-Abschlussrahmen: `docs/MORROW_MVP_COMPLETION_PLAN.md`

Admin-/Plattform-Abnahme vor echten Kunden: `docs/ADMIN_PARITY_QA_RUNBOOK.md`

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

In `apps/web` zusaetzlich setzen, sobald die App-Projekte live sind. Diese Werte sind interne Vercel-App-Origins fuer Multi-Zone-Rewrites; nach außen bleiben die deutschen Plattformpfade unter `www.getmorrow.de` sichtbar:

```bash
MORROW_ADMIN_APP_URL=https://<admin-app-domain>
MORROW_GUEST_APP_URL=https://<guest-app-domain>
MORROW_OWNER_APP_URL=https://<owner-app-domain>
```

Damit proxyt die oeffentliche Website diese Einstiegspunkte:
- `/admin` -> Admin-App
- `/app/gast` -> Gaeste-App
- `/app/gast/deine-auszeit/...` -> konkrete Gaeste-Buchung
- `/app/eigentuemer` -> Eigentuemer-App

Legacy-Pfade leiten auf die neuen deutschen Plattformpfade:
- `/deine-auszeit/...` -> `/app/gast/deine-auszeit/...`
- `/owner` -> `/app/eigentuemer`
- `/app/guest` -> `/app/gast`
- `/app/owner` -> `/app/eigentuemer`

Die oeffentliche Eigentuemer-Landingpage bleibt bewusst unter `/eigentuemer`.

App-Domains duerfen erst als gesetzt gelten, wenn diese Health-Checks auf der Plattform gruen sind:

```bash
curl -fsS https://www.getmorrow.de/admin/health
curl -fsS https://www.getmorrow.de/app/gast/health
curl -fsS https://www.getmorrow.de/app/eigentuemer/health
```

Erwartete App-IDs:

| URL | Erwartung |
| --- | --- |
| `https://<admin-app-domain>/health` | `app=admin` |
| `https://<guest-app-domain>/health` | `app=guest` |
| `https://<owner-app-domain>/health` | `app=owner` |

Nicht in Vercel-Frontend setzen:
- `RESEND_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Diese bleiben ausschließlich in Supabase Edge Function Secrets.

Owner-App zusaetzlich pruefen:
- Freigeschalteter Owner-Testzugang kann sich einloggen.
- `get_owner_dashboard()`, `get_owner_operations()`, `get_owner_communication_events()` und `get_owner_support_status_events()` liefern nur verknuepfte Objekte/Auszeiten/Termine/Buchungen/Dokumente/Abrechnungen/Operationsmeldungen/Rueckfragenverlauf.
- Owner-Supportnachricht landet in `support_messages` und ist im Admin sichtbar.
- Automatischer Check lokal:

```bash
SUPABASE_URL=https://haifftleyussrokyafqq.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
SUPABASE_ANON_KEY=<anon-key> \
OWNER_EMAIL=<owner-email> \
OWNER_PASSWORD=<owner-password> \
OWNER_VERIFY_SUPPORT_INSERT=1 \
OWNER_VERIFY_DOCUMENT_ACCESS=1 \
OWNER_VERIFY_STATEMENT_ACCESS=1 \
OWNER_VERIFY_OPERATION_ACCESS=1 \
npm run supabase:verify-owner
```

Ohne gepflegte Owner-Credentials kann alternativ ein temporaerer Eigentuemer-Testzugang erzeugt und wieder geloescht werden:

```bash
OWNER_VERIFY_TEMP_OWNER=1 \
OWNER_VERIFY_SUPPORT_INSERT=1 \
OWNER_VERIFY_DOCUMENT_ACCESS=1 \
OWNER_VERIFY_STATEMENT_ACCESS=1 \
OWNER_VERIFY_OPERATION_ACCESS=1 \
npm run supabase:verify-owner
```

Guest-App zusaetzlich pruefen:
- `get_guest_stay()` liefert fuer Buchungs-ID plus Access-Code genau eine sichtbare Buchung.
- Der Gaestebereich rendert mobil Start, Auszeit, Buchung, Vor Ort und Hilfe.
- Automatischer Check lokal oder gegen Production:

```bash
GUEST_VERIFY_SEED=1 npm run supabase:verify-guest
GUEST_BASE_URL=https://<guest-app-domain> npm run supabase:verify-guest
```

## 3a. MVP Completion Vor Erstem Zahlenden Gast

Vor dem ersten zahlenden Gast muessen die MVP-kritischen Punkte aus `docs/MORROW_MVP_COMPLETION_PLAN.md` geprueft werden:

- Admin-Paritaetsabnahme nach `docs/ADMIN_PARITY_QA_RUNBOOK.md` ist mit Testdaten durchlaufen und bewertet.
- Paket-Builder fuer neue Auszeiten.
- Unterkunftsverwaltung mit Medien, Regeln, Check-in, Ausstattung und Bildrechten.
- Erlebnisbausteine mit Anbieter, Preis, Kapazitaet und Verfuegbarkeit.
- Gaestebereich zeigt Anreise, Schluessel und Unterkunftsregeln aus Admin-Daten.
- Support-/Problem-Ticket-Flow landet im Admin.
- Sichtbare Support-Antwort aus Admin erscheint im Gästebereich-Hilfeverlauf.
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
- Impressum technisch vorhanden: `/impressum`.
- Datenschutz technisch vorhanden: `/datenschutz`.
- AGB, Buchungsbedingungen, Stornobedingungen und Zahlungsbedingungen technisch vorhanden.
- Anbieterkennzeichnung im Impressum fachlich/juristisch vervollstaendigen.
- Rechtstexte pruefen und freigeben lassen.
- WhatsApp-Opt-in-Text im Formular rechtlich prüfen.
- Cookie-/Tracking-Hinweise, sobald Analytics oder Meta/Google Pixel aktiv werden.
- Klare Speicherdauer und Zweck der Anfrage-/Kommunikationsdaten.

## 6. Tracking

Vor Aktivierung entscheiden:
- `MORROW_TRACKING_MODE=disabled`: keine GA4-/Meta-Messung, keine Paid-Ads-Freigabe.
- `MORROW_TRACKING_MODE=enabled`: GA4 und Meta Pixel aktivieren, Consent-Gate testen und IDs setzen.
- Google Ads Conversion kann spaeter ergaenzt werden.
- Consent Mode / Cookie Banner final pruefen.

Operative Attribution fuer Anfragen:
- Oeffentliche Formulare speichern Quelle, Medium, Kampagne, Content, Suchbegriff, Referrer, Landing Path, aktuelle URL sowie `gclid` und `fbclid`, sofern vorhanden.
- Auch ohne Tracking-Consent wird fuer die Bearbeitung der Anfrage ein technischer Formular-/Anfragekontext gespeichert: Formularart, Auszeit, aktuelle Seite und letzter CTA-Ausloeser.
- Supabase normalisiert diese Werte vor Insert/Update zusätzlich aus dem Lead-Payload, damit die CRM-Spalten auch bei einem stale Client gefuellt bleiben.
- Im Admin-Drawer sind Quelle, Kampagne, Kampagnenkontext, Klick-ID, Einstieg, Formular und Ausloeser sichtbar.
- `npm run qa:production` prueft bei optionalem Testlead Quelle, Kampagne, Medium, Landing Path und Formular-Kontext.

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

Vor Production-Rehearsal mit echten Leads gilt:

- `docs/ADMIN_PARITY_QA_RUNBOOK.md` muss mindestens gelb bewertet sein, damit die oeffentliche Website echte Anfragen einsammeln darf.
- Fuer zahlende Gaeste muss das Runbook gruen bewertet sein.
- Ein erfolgreiches technisches Build ersetzt diese fachliche Abnahme nicht.

Launch-Gates vor echtem Traffic:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://haifftleyussrokyafqq.supabase.co \
NEXT_PUBLIC_SUPABASE_ANON_KEY=<public-anon-key> \
MORROW_ADMIN_APP_URL=https://<admin-app-domain> \
MORROW_GUEST_APP_URL=https://<guest-app-domain> \
MORROW_OWNER_APP_URL=https://<owner-app-domain> \
MORROW_LEGAL_APPROVED_AT=2026-..-.. \
MORROW_SECRETS_ROTATED_AT=2026-..-.. \
MORROW_OFFER_DATA_APPROVED_AT=2026-..-.. \
MORROW_TRACKING_MODE=disabled \
MORROW_TRACKING_APPROVED_AT=2026-..-.. \
npm run qa:launch-gates
```

Dieser Check ist bewusst streng. Er stoppt den Launch, wenn:
- Rechtseiten noch Arbeitsfassungs-/Platzhaltertexte enthalten.
- Supabase- oder App-URL-Variablen fuer die Next-App-Welten fehlen.
- Secret-Rotation, finale Angebotsdaten oder Rechtsfreigabe nicht bestaetigt sind.
- WhatsApp-Opt-in nicht optional ist.
- Tracking nicht entschieden ist oder bei aktivem Tracking nicht consent-gated ist.

Fuer einen reinen lokalen Statusbericht trotz bekannter Blocker:

```bash
MORROW_QA_ALLOW_LAUNCH_BLOCKERS=1 npm run qa:launch-gates
```

Kompakter Startstufen-Status:

```bash
npm run qa:readiness
```

Dieser Check fasst zusammen, ob Morrow nur fuer interne Tests, fuer kontrollierte echte Leads, fuer zahlende Gaeste oder fuer Paid Ads bereit ist. Er liest den neuesten Admin-Paritaetslauf aus `docs/qa/admin-parity/`, prueft die wichtigsten Launch-Freigaben und bleibt rot, solange Recht, Secret-Rotation, Angebotsfreigabe oder Tracking-Entscheidung offen sind.

Ein neues Admin-Paritaetsprotokoll fuer die praktische Abnahme wird so angelegt:

```bash
npm run qa:admin-parity:new
```

Die Protokolle liegen unter `docs/qa/admin-parity/` und werden von `npm run qa:readiness` ausgewertet.
Die praktische Reihenfolge steht in `docs/ADMIN_PARITY_EXECUTION_PLAN.md`.

Vor Freigabe wird das neueste Protokoll direkt validiert:

```bash
npm run qa:admin-parity:validate
```

Zusätzlich muss die Migration selbst grün sein:

```bash
npm run qa:migration-consolidation
```

Automatisierter Basischeck:

```bash
QA_BASE_URL=https://www.getmorrow.de npm run qa:production
```

Mit App-Redirect-Pruefung nach Deployment der App-Projekte:

```bash
QA_BASE_URL=https://www.getmorrow.de \
MORROW_ADMIN_APP_URL=https://<admin-app-domain> \
MORROW_GUEST_APP_URL=https://<guest-app-domain> \
MORROW_OWNER_APP_URL=https://<owner-app-domain> \
npm run qa:production
```

Dieser Check prüft:
- öffentliche Kernseiten inklusive Rechteseiten
- `robots.txt` und `sitemap.xml`
- optionale App-Redirects von `/admin`, `/deine-auszeit/...`, `/owner` und `/app/eigentuemer`
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
- Admin-Paritaetsabnahme nach `docs/ADMIN_PARITY_QA_RUNBOOK.md` mit Testlead/Testbuchung dokumentieren.
- echte Anfrage über `getmorrow.de`.
- Gastbestätigung kommt an.
- interne Lead-Mail kommt an.
- Lead erscheint im Admin.
- Kommunikationshistorie zeigt E-Mail-Events.
- Status auf `Reserviert` und `Bezahlt` setzen.
- Buchung/Gästebereich prüfen.
- Supportnachricht aus Gästebereich senden.
- Supportfall im Admin prüfen.
- Antwort aus Supportfall senden und im Gästebereich-Hilfeverlauf prüfen.
- Supabase-Backup mit `npm run supabase:backup` ausführen und `manifest.json` prüfen.
- Runbook `docs/SUPABASE_BACKUP_RECOVERY_RUNBOOK.md` lesen und sicheren Ablageort für Exporte festlegen.

Aktuelle technische Evidenz:
- 2026-07-02: Live `qa:production` gegen `https://www.getmorrow.de` gruen, inklusive `/admin`, `/app/gast`, `/app/eigentuemer`, Legacy-Redirects und echtem QA-Testlead mit Supabase-Attribution.
- 2026-07-02: `npm run supabase:backup` gruen, 22 Tabellen, 153 Zeilen, 0 Fehler; Manifest geprueft.

## 8a. App Production Rehearsal

Vor dem Browser-Rehearsal Admin-Zugang und Rollen-/RLS-Zugriff pruefen:

```bash
ADMIN_EMAIL=<admin-email> \
ADMIN_PASSWORD=<admin-password> \
npm run supabase:verify-admin
```

Nach dem Deployment der drei App-Welten:

```bash
ADMIN_BASE_URL=https://<admin-app-domain> \
OWNER_BASE_URL=https://<owner-app-domain> \
GUEST_BASE_URL=https://<guest-app-domain> \
npm run qa:apps
```

`npm run qa:apps` akzeptiert alternativ dieselben URLs ueber `MORROW_ADMIN_APP_URL`, `MORROW_GUEST_APP_URL` und `MORROW_OWNER_APP_URL`, damit App-QA und Website-Redirect-Konfiguration dieselben Deployment-Werte verwenden koennen.

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
- Eigentuemer-Dashboard enthaelt die erwarteten Bereiche Objekte, Buchungen, Luecken, Abrechnung und Dokumente.
- Gaeste-App oeffnet bei gesetzter Buchung und Code den persoenlichen Aufenthaltsbereich.
- Screenshots werden unter `tmp/qa/apps-production/` abgelegt.

## Aktueller Status

Aktueller maschineller Status-Snapshot: `docs/LAUNCH_STATUS_SNAPSHOT_2026-07-01.md`

Technisch deutlich näher an production-ready:
- Supabase verbunden.
- Admin Auth + Rollen aktiv.
- E-Mail-Automation aktiv.
- Kommunikationshistorie V1 aktiv.
- Öffentliche Website unter `getmorrow.de` ist erreichbar.
- Deutsche Plattformpfade sind live erreichbar: `/admin`, `/app/gast`, `/app/eigentuemer`.
- Live-Lead mit Supabase-Attribution wurde erfolgreich getestet und archiviert.
- Supabase-Backup-Probe wurde erfolgreich durchgeführt.
- App-Deployment-Konfiguration ist grün: `npm run qa:app-deployment-config`.

Noch nicht live-ready ohne:
- finale Rechtstexte mit echten Unternehmensdaten.
- Secret-Rotation.
- finale echte Angebotsdaten.
- Tracking-/Consent-Entscheidung.
- Admin-Paritaetslauf mit Evidenz mindestens gelb fuer kontrollierte echte Leads und gruen fuer zahlende Gaeste.
