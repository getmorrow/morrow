# Morrow Workflow UX Audit - aktualisiert 2026-07-02

Grundlage: `docs/STRATEGIC_FOUNDATION_MORROW.md`, `docs/PLATFORM_ARCHITECTURE.md`, `docs/PRODUCTION_LAUNCH_CHECKLIST.md`.

Ziel: Abnahme nicht nur anhand von Startseiten, sondern anhand echter Hauptworkflows. Admin bleibt Quelle der Wahrheit; Website, Gäste-App und Eigentümer-App zeigen gezielte Ausschnitte.

## Frische Evidence

Pfad: `docs/qa/workflow-ux-final-2026-07-02/`

- Website: `web-01-home-desktop.png`
- Routing/App-Einstieg: `guest-00-entry-mobile-from-platform-desktop.png`, `owner-00-entry-desktop.png`
- Guest mobile: `guest-01-first-view-mobile.png`, `guest-02-booking-mobile.png`, `guest-03-local-mobile.png`, `guest-04-local-food-mobile.png`, `guest-05-place-drawer-mobile.png`, `guest-06-help-mobile.png`
- Admin desktop: `admin-01-login-desktop.png`, `admin-02-cockpit-desktop.png`, `admin-03-crm-list-desktop.png`, `admin-04-crm-search-desktop.png`, `admin-05-detail-drawer-desktop.png`, `admin-06-tasks-desktop.png`, `admin-07-support-desktop.png`
- Owner mobile: `owner-01-login-mobile.png`, `owner-02-dashboard-mobile.png`, `owner-03-object-drawer-mobile.png`, `owner-04-bookings-mobile.png`, `owner-05-billing-mobile.png`, `owner-06-contact-mobile.png`

## URL- und Routing-Abnahme

Ampel: grün.

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

## Guest App

Ampel: grün mit P2-Hinweis.

Geprüfte Wege:

- Aufenthalt unter `/app/gast/deine-auszeit/dev-active?code=MORROWDEV` öffnen.
- Erster View wirkt wie App-Bereich: Logo, große persönliche Aufenthaltskarte, Bottom-Navigation.
- `Buchung` öffnen und Anreise, Zahlung, Gäste, Hund, Schlüssel und Unterkunft prüfen.
- `Vor Ort` öffnen.
- Kategorie `Essen` aktivieren.
- Restaurant-Drawer öffnen und Inhalt prüfen.
- `Hilfe` öffnen.

Gefundene und behobene Punkte:

- P1: Der lokale Restaurant-Drawer zeigte als Fallback das Couple-Hero-Bild. Behoben durch kategoriebezogene Local-Place-Bilder und Fallbacks für Essen, Strand, Erlebnis, Veranstaltungen, Praktisches, Hilfe, Wetter und Gezeiten.
- P1: Der alte Smoke-Test nutzte einen lokal nicht verfügbaren Testzugang. Aktualisiert auf `/app/gast/deine-auszeit/dev-active?code=MORROWDEV`.

P2-Rest:

- Der lokale Dev-Aufenthalt ist bewusst ein Musterdatensatz. Für die finale Production-Abnahme braucht es zusätzlich einen echten Supabase-Testgast mit aktueller Buchung und Access-Code.

## Admin App

Ampel: grün.

Geprüfte Wege:

- Login unter `/admin`.
- Redirect landet korrekt auf `/admin/dashboard`.
- Cockpit zeigt Kennzahlen, Tagessteuerung, Support und Datenlücken.
- CRM-Liste öffnen.
- CRM-Suche nutzen.
- Detaildrawer öffnen und Kontakt, Auszeit, Termin, Quelle, Kampagnenkontext und Bearbeitungsfelder prüfen.
- Aufgabenbereich öffnen.
- Supportbereich öffnen.

Gefundene und behobene Punkte:

- P1: Der erste Screenshot wurde zu früh während `Zugang wird geprüft` geschrieben. Retest mit explizitem Warten auf `/admin/dashboard` ist grün.
- P1: CRM-Liste zeigte Roh-Slug `couple-reset`. Behoben durch Slug-zu-Label-Formatierung, sichtbar als `Couple Reset`.

Bewertung:

- Admin wirkt jetzt wie CRM/Operations-Cockpit und nicht wie eine öffentliche Website.
- Suche, Liste, Drawer, Status-/Bearbeitungsfelder, Aufgaben und Support sind als Hauptworkflow sichtbar.

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

P2-Rest:

- Für Production-QA sollte zusätzlich ein aktueller, echter Eigentümer-Testzugang mit stabilen Supabase-Daten gepflegt werden, damit Owner-Workflows ohne temporäre Testdaten reproduzierbar bleiben.

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
- Tracking-/Attribution-Entscheidung und Implementierung für Gast-, Eigentümer- und Partneranfragen.
- Echte Angebotsdaten inklusive Bildrechte, Termine, Preise, Erlebnisse und Zuständigkeiten.
