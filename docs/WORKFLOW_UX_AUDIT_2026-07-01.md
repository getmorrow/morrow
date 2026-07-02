# Morrow Workflow UX Audit - aktualisiert 2026-07-02

Grundlage: `docs/STRATEGIC_FOUNDATION_MORROW.md`, `docs/PLATFORM_ARCHITECTURE.md`, `docs/PRODUCTION_LAUNCH_CHECKLIST.md`.

Ziel: Abnahme nicht nur anhand von Startseiten, sondern anhand echter Hauptworkflows. Admin bleibt Quelle der Wahrheit; Website, Gäste-App und Eigentümer-App zeigen gezielte Ausschnitte.

## Frische Evidence

Pfad: `docs/qa/workflow-ux-final-2026-07-02/`

- Website: `web-01-home-desktop.png`
- Routing/App-Einstieg: `guest-00-entry-mobile-from-platform-desktop.png`, `guest-00-live-landing-mobile.png`, `owner-00-entry-desktop.png`, `owner-00-live-landing-desktop.png`, `admin-00-live-landing-desktop.png`
- Guest mobile: `guest-01-first-view-mobile.png`, `guest-02-booking-mobile.png`, `guest-03-local-mobile.png`, `guest-04-local-food-mobile.png`, `guest-05-place-drawer-mobile.png`, `guest-06-help-mobile.png`
- Guest Supabase-Stay: `guest-07-live-stay-mobile.png`, `guest-08-www-stay-mobile.png`, `guest-09-www-full-qa-stay-mobile.png`
- Admin desktop: `admin-01-login-desktop.png`, `admin-02-cockpit-desktop.png`, `admin-03-crm-list-desktop.png`, `admin-04-crm-search-desktop.png`, `admin-05-detail-drawer-desktop.png`, `admin-06-tasks-desktop.png`, `admin-07-support-desktop.png`, `admin-08-www-dashboard-desktop.png`, `admin-09-www-crm-search-desktop.png`, `admin-10-www-lead-drawer-status-desktop.png`, `admin-11-www-tasks-desktop.png`, `admin-12-www-support-desktop.png`, `admin-13-www-full-qa-dashboard-desktop.png`
- Owner mobile/desktop: `owner-01-login-mobile.png`, `owner-02-dashboard-mobile.png`, `owner-03-object-drawer-mobile.png`, `owner-04-bookings-mobile.png`, `owner-05-billing-mobile.png`, `owner-06-contact-mobile.png`, `owner-07-www-dashboard-desktop.png`, `owner-08-www-full-qa-dashboard-desktop.png`

## URL- und Routing-Abnahme

Ampel lokal: grün.

Ampel Production `https://www.getmorrow.de`: grün, Stand 2026-07-02 nach Vercel-Deployment der aktuellen Web-App.

Geprüft live:

- `https://www.getmorrow.de/` liefert 200.
- `https://www.getmorrow.de/app/gast` liefert 200.
- `https://www.getmorrow.de/app/eigentuemer` liefert 200.
- `https://www.getmorrow.de/admin` liefert 200.
- `/app/guest` leitet mit 307 auf `/app/gast`.
- `/app/owner` leitet mit 307 auf `/app/eigentuemer`.
- `/deine-auszeit/...` leitet mit 307 auf `/app/gast/deine-auszeit/...`.
- `/admin/health`, `/app/gast/health`, `/app/eigentuemer/health` liefern jeweils `status=ok` mit korrekter App-ID.
- `robots.txt` disallowt `/admin`, `/app/gast` und `/app/eigentuemer`.

Geprüft lokal über Web-Multi-Zone-Rewrites:

- `/` rendert die öffentliche Website.
- `/app/gast` rendert die Gäste-App.
- `/app/gast/deine-auszeit/dev-active?code=MORROWDEV` rendert den lokalen Dev-Aufenthalt.
- `/app/eigentuemer` rendert die Eigentümer-App.
- `/admin` rendert die Admin-App.
- `/admin/health`, `/app/gast/health`, `/app/eigentuemer/health` liefern jeweils `status=ok` mit korrekter App-ID.
- `/app/guest` leitet auf `/app/gast`.
- `/app/owner` leitet auf `/app/eigentuemer`.
- `/owner` leitet auf `/app/eigentuemer`.
- `/deine-auszeit/...` leitet auf `/app/gast/deine-auszeit/...`.

Automatischer Check:

```bash
MORROW_ADMIN_APP_URL=http://127.0.0.1:5103 \
MORROW_GUEST_APP_URL=http://127.0.0.1:5101 \
MORROW_OWNER_APP_URL=http://127.0.0.1:5102 \
QA_BASE_URL=http://127.0.0.1:5100 \
npm run qa:production
```

Ergebnis: grün, inklusive 12 Seiten, 4 Formularchecks, 3 App-Routen und 4 Legacy-Redirects.

Production-Rehearsal gegen echte Domain:

```bash
QA_BASE_URL=https://www.getmorrow.de \
MORROW_ADMIN_APP_URL=https://morrow-admin.vercel.app \
MORROW_GUEST_APP_URL=https://morrow-guest.vercel.app \
MORROW_OWNER_APP_URL=https://morrow-owner.vercel.app \
npm run qa:production
```

Ergebnis: grün, inklusive 12 Seiten, 4 Formularchecks, 3 App-Routen und 4 Legacy-Redirects. Consent und Lead-Submission waren bewusst nicht aktiv: keine GA/Meta-IDs gesetzt, `MORROW_QA_SUBMIT_LEAD` nicht gesetzt.

Zusätzlicher App-Check:

```bash
ADMIN_BASE_URL=http://127.0.0.1:5100/admin \
GUEST_BASE_URL=http://127.0.0.1:5100/app/gast \
OWNER_BASE_URL=http://127.0.0.1:5100/app/eigentuemer \
ADMIN_EMAIL=auszeiten@getmorrow.de \
ADMIN_PASSWORD=<admin-password> \
GUEST_BOOKING_ID=dev-active \
GUEST_ACCESS_CODE=MORROWDEV \
MORROW_QA_ALLOW_PARTIAL_APPS=1 \
npm run qa:apps
```

Ergebnis: grün für Health, Landing, Admin-Login/Dashboard und Guest-Stay. Owner-Login wurde ohne gesetzte Owner-Credentials im Script übersprungen; Owner-Portal-Screenshots liegen separat als frische Evidence vor.

Live-App-Check nach BasePath-Asset-Fix:

```bash
npm run qa:apps
```

Ergebnis: grün für alle drei direkten App-Projekte. Der Check normalisiert `https://morrow-admin.vercel.app`, `https://morrow-guest.vercel.app` und `https://morrow-owner.vercel.app` automatisch auf `/admin`, `/app/gast` und `/app/eigentuemer`; Health und Landing sind grün. Frische Landing-Screenshots wurden erzeugt und in `docs/qa/workflow-ux-final-2026-07-02/` abgelegt:

- `admin-00-live-landing-desktop.png`
- `guest-00-live-landing-mobile.png`
- `owner-00-live-landing-desktop.png`

Login-/persoenliche Stay-Tiefpruefungen wurden in diesem Live-Lauf uebersprungen, weil keine aktuellen Zugangsdaten in `.env.local` gesetzt waren. Die fruehere lokale Deep-Evidence bleibt gueltig fuer UX-Abnahme; fuer Production-Go sollte ein stabiler Admin-/Owner-/Guest-Testzugang gepflegt werden.

Zusaetzlicher Guest-Stay-Check mit Supabase-Testbuchung gegen den aktuellen Guest-Build, danach erneut live nach Vercel-Deployment:

```bash
GUEST_BASE_URL=http://127.0.0.1:5102 \
GUEST_BOOKING_ID=11111111-1111-4111-8111-111111111111 \
GUEST_ACCESS_CODE=MORROW1 \
MORROW_QA_ALLOW_PARTIAL_APPS=1 \
npm run qa:apps
```

```bash
GUEST_BOOKING_ID=11111111-1111-4111-8111-111111111111 \
GUEST_ACCESS_CODE=MORROW1 \
npm run qa:apps
```

Ergebnis: gruen fuer Guest-Stay lokal und live unter `https://morrow-guest.vercel.app/app/gast`. Der Test nutzt echte Supabase-Daten und hat einen vorherigen Asset-Fehler sichtbar gemacht: alte Datenpfade wie `/brand/...` wurden im direkten Guest-App-Origin als Root-Pfade geladen. Der aktuelle Build normalisiert diese Pfade auf den Guest-BasePath `/app/gast/...`; der frische Screenshot `guest-07-live-stay-mobile.png` belegt den ersten View mit echtem Supabase-Aufenthalt aus dem Live-App-Lauf.

Zusaetzlicher Plattform-URL-Check:

```bash
GUEST_BASE_URL=https://www.getmorrow.de/app/gast \
GUEST_BOOKING_ID=11111111-1111-4111-8111-111111111111 \
GUEST_ACCESS_CODE=MORROW1 \
MORROW_QA_ALLOW_PARTIAL_APPS=1 \
npm run qa:apps
```

Ergebnis: gruen fuer Guest-Stay ueber die oeffentliche Plattformstruktur `https://www.getmorrow.de/app/gast`. Der Screenshot `guest-08-www-stay-mobile.png` belegt den ersten View ueber die finale deutsche URL-Struktur.

Kombinierter Full-App-Check ueber die finale Plattformstruktur:

```bash
ADMIN_BASE_URL=https://www.getmorrow.de/admin \
ADMIN_EMAIL=auszeiten@getmorrow.de \
ADMIN_PASSWORD=<admin-password> \
OWNER_BASE_URL=https://www.getmorrow.de/app/eigentuemer \
OWNER_EMAIL=<owner-qa-full-email> \
OWNER_PASSWORD=<owner-qa-full-password> \
GUEST_BASE_URL=https://www.getmorrow.de/app/gast \
GUEST_BOOKING_ID=11111111-1111-4111-8111-111111111111 \
GUEST_ACCESS_CODE=MORROW1 \
npm run qa:apps
```

Ergebnis: gruen fuer alle drei Apps in einem Lauf: Admin-Health, Admin-Landing, Admin-Login/Dashboard; Owner-Health, Owner-Landing, Owner-Login/Dashboard; Guest-Health, Guest-Landing und persoenlicher Guest-Stay. Die Screenshots `admin-13-www-full-qa-dashboard-desktop.png`, `owner-08-www-full-qa-dashboard-desktop.png` und `guest-09-www-full-qa-stay-mobile.png` belegen diesen gemeinsamen Plattformlauf.

Technische Abschlusschecks nach diesem Lauf:

```bash
npm run qa:production
npm run typecheck
npm run lint
git diff --check
```

Ergebnis: gruen. `npm run qa:readiness` und `npm run qa:launch-gates` bleiben bewusst rot, weil Rechtsfreigabe, Secret-Rotation, Angebotsfreigabe und Tracking-Entscheidung noch nicht final gesetzt sind.

## Guest App

Ampel: grün mit P2-Hinweis.

Geprüfte Wege:

- Aufenthalt unter `/app/gast/deine-auszeit/dev-active?code=MORROWDEV` öffnen.
- Supabase-Testaufenthalt `11111111-1111-4111-8111-111111111111` mit Code `MORROW1` gegen den aktuellen Guest-Build öffnen.
- Erster View wirkt wie App-Bereich: Logo, große persönliche Aufenthaltskarte, Bottom-Navigation.
- `Buchung` öffnen und Anreise, Zahlung, Gäste, Hund, Schlüssel und Unterkunft prüfen.
- `Vor Ort` öffnen.
- Kategorie `Essen` aktivieren.
- Restaurant-Drawer öffnen und Inhalt prüfen.
- `Hilfe` öffnen.

Gefundene und behobene Punkte:

- P1: Der lokale Restaurant-Drawer zeigte als Fallback das Couple-Hero-Bild. Behoben durch kategoriebezogene Local-Place-Bilder und Fallbacks für Essen, Strand, Erlebnis, Veranstaltungen, Praktisches, Hilfe, Wetter und Gezeiten.
- P1: Der alte Smoke-Test nutzte einen lokal nicht verfügbaren Testzugang. Aktualisiert auf `/app/gast/deine-auszeit/dev-active?code=MORROWDEV`.
- P1: Supabase-Daten enthielten noch alte Bildpfade wie `/brand/...`, die in der direkten Guest-App zu 404-Assets fuehrten. Behoben durch Normalisierung von Supabase-Bildpfaden auf `/app/gast/...`.

P2-Rest:

- Fuer eine vollstaendige Production-Workflow-Abnahme bleiben stabile Admin-/Owner-Testzugänge sinnvoll; der persoenliche Guest-Stay ist live mit Supabase-Testbuchung belegt.

## Admin App

Ampel: grün.

Geprüfte Wege:

- Login unter `/admin`.
- Login unter `https://www.getmorrow.de/admin`.
- Redirect landet korrekt auf `/admin/dashboard`.
- Cockpit zeigt Kennzahlen, Tagessteuerung, Support und Datenlücken.
- CRM-Liste öffnen.
- CRM-Suche nutzen.
- Detaildrawer öffnen und Kontakt, Auszeit, Termin, Quelle, Kampagnenkontext und Bearbeitungsfelder prüfen.
- Statusänderung an einer QA-Anfrage speichern.
- Aufgabenbereich öffnen.
- Buchungskontext im CRM prüfen.
- Supportbereich öffnen.

Gefundene und behobene Punkte:

- P1: Der erste Screenshot wurde zu früh während `Zugang wird geprüft` geschrieben. Retest mit explizitem Warten auf `/admin/dashboard` ist grün.
- P1: CRM-Liste zeigte Roh-Slug `couple-reset`. Behoben durch Slug-zu-Label-Formatierung, sichtbar als `Couple Reset`.

Bewertung:

- Admin wirkt jetzt wie CRM/Operations-Cockpit und nicht wie eine öffentliche Website.
- Suche, Liste, Drawer, Status-/Bearbeitungsfelder, Aufgaben und Support sind als Hauptworkflow sichtbar.
- Live-Workflow wurde am 2026-07-02 über die öffentliche Plattformstruktur geprüft:

```bash
ADMIN_BASE_URL=https://www.getmorrow.de/admin \
ADMIN_EMAIL=auszeiten@getmorrow.de \
ADMIN_PASSWORD=<admin-password> \
npm run qa:apps
```

Zusätzlich wurde eine klar markierte QA-Anfrage in Supabase angelegt, im CRM gesucht, im Detaildrawer geöffnet, auf `In Prüfung` gesetzt, gespeichert und danach archiviert. Der Lauf prüfte außerdem Aufgaben, Buchungskontext und Support. Ergebnis: grün, keine Browser-Console-Fehler, keine sichtbaren Rohwerte wie `key_safe`. Die Screenshots `admin-08-www-dashboard-desktop.png` bis `admin-12-www-support-desktop.png` belegen den aktuellen www-Workflow.

## Owner App

Ampel: grün mit P2-Hinweis.

Geprüfte Wege:

- Portal-Login/Einstieg.
- Dashboard mit Objekten, Auszeiten, Terminen, Buchungen.
- Objekt-Detaildrawer.
- Buchungen.
- Abrechnung.
- Kontakt/Rückfrage.

Bewertung:

- Owner wirkt als Portal und nicht als Marketingseite.
- Objekt, Buchung, Abrechnung, Kontakt, Drawer und Filter sind im aktuellen Evidence-Set vorhanden.
- Rohwerte wie `key_safe`, `owner`, `morrow` und `active` werden im Portal als verständliche Labels angezeigt.
- Backend-/RLS-Workflow wurde am 2026-07-02 mit temporärem Owner-Zugang geprüft:

```bash
OWNER_VERIFY_TEMP_OWNER=1 \
OWNER_VERIFY_SUPPORT_INSERT=1 \
OWNER_VERIFY_DOCUMENT_ACCESS=1 \
OWNER_VERIFY_STATEMENT_ACCESS=1 \
OWNER_VERIFY_OPERATION_ACCESS=1 \
npm run supabase:verify-owner
```

Ergebnis: grün. Der Test hat temporären Owner-Login, `get_owner_dashboard()`, Supportnachricht, Verfügbarkeitsanfrage mit Admin-Aufgabe, Rückkanal-Historie, Dokumentzugriff, Abrechnungszugriff und Operationsmeldung erfolgreich geprüft und temporäre Testdaten aufgeräumt.
- Browser-Workflow wurde am 2026-07-02 zusätzlich über die öffentliche Plattformstruktur geprüft:

```bash
OWNER_BASE_URL=https://www.getmorrow.de/app/eigentuemer \
OWNER_EMAIL=<owner-qa-browser-email> \
OWNER_PASSWORD=<owner-qa-browser-password> \
GUEST_BASE_URL=https://www.getmorrow.de/app/gast \
GUEST_BOOKING_ID=11111111-1111-4111-8111-111111111111 \
GUEST_ACCESS_CODE=MORROW1 \
MORROW_QA_ALLOW_PARTIAL_APPS=1 \
npm run qa:apps
```

Ergebnis: grün. `qa:apps` prüfte Owner-Health, Owner-Landing, Login und Dashboard mit den Pflichtbereichen Objekte, Buchungen, Lücken, Abrechnung und Dokumente. Der Screenshot `owner-07-www-dashboard-desktop.png` belegt den Portal-View über `https://www.getmorrow.de/app/eigentuemer`.

P2-Rest:

- Für den laufenden Betrieb sollte ein dauerhaft gepflegter Eigentümer-Testzugang im Passwortmanager/Vercel-Secret-Kontext liegen, damit `npm run qa:apps` ohne neu erzeugten QA-Owner wiederholbar gegen Production laufen kann.

## Rohwerte und doppelte Inhalte

Ampel: grün für die geprüften Hauptflows.

Geprüft:

- Guest-Screens zeigen keine sichtbaren Rohwerte wie `active`, `key_safe`, `owner`, `morrow`.
- Owner-Drawer zeigt verständliche Labels: `Aktiv`, `Eigentümerzugang`, `Schlüsselabholung`.
- Admin-CRM zeigt `Couple Reset` statt `couple-reset`.

Hinweis:

- Technische Strings bleiben im Code und in Seed-/QA-Skripten erlaubt. Diese Prüfung bezieht sich auf Nutzeroberflächen.

## SEO/Noindex

Ampel: grün.

- Öffentliche Website bleibt indexierbar.
- `robots.txt` disallowt `/admin`, `/app/gast` und `/app/eigentuemer`.
- Admin-, Guest- und Owner-App setzen noindex über Metadata.

## Offene Launch-Themen außerhalb dieses UX-Audits

Diese Punkte blockieren nicht die lokale Workflow-UX-Abnahme, bleiben aber vor echtem Traffic/Start relevant:

- Rechtsfreigabe für Rechtstexte, WhatsApp-Opt-in und Buchungsbedingungen.
- Secret-Rotation für geteilte Supabase-/Resend-/Admin-Werte.
- Tracking-/Consent-Entscheidung für Gast-, Eigentümer- und Partneranfragen. Die technische Lead-Attribution ist auf Website-Leads normalisiert vorbereitet, aber der strenge Live-Retest gegen `www.getmorrow.de` zeigt noch ein ausstehendes Web-Deployment: normalisierte Felder wie `medium` kommen live noch leer an. Finale Consent-/Ads-Freigabe bleibt zusätzlich offen.
- Echte Angebotsdaten inklusive Bildrechte, Termine, Preise, Erlebnisse und Zuständigkeiten.
