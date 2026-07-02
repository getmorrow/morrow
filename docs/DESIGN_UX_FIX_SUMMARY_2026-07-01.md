# Morrow Design-/UX-Fix Summary

Stand: 2026-07-01  
Basis: `docs/DESIGN_UX_AUDIT_2026-07-01.md`

## Geändert

- Website: Startseiten-Hero-Collage visuell geschärft, damit Nebenbilder klarer als echte Momentbilder wirken.
- Website: Mobile Auszeit-Anfrage als Bottom-Drawer umgesetzt; Desktop bleibt beim eingebetteten Formular.
- Guest App: Bottom Navigation von Unicode-Symbolen auf MingCute Icons umgestellt.
- Guest App: Tabwechsel führt jetzt zum aktiven Inhaltsbereich; Unterviews nutzen einen kompakteren Hero.
- Admin App: Dashboard-Kennzahlen auf tägliche Steuerung verdichtet.
- Admin App: `hidden`-Konflikt behoben, sodass inaktive Module nicht mehr die Seitenhöhe aufblasen.
- Admin App: Mobile Navigation als kompakte horizontale Arbeitsleiste verbessert und horizontaler Seiten-Overflow entfernt.
- Owner App: Dashboard mit temporärem Owner-QA-Zugang mobil/desktop visuell verifiziert.

## Erledigte P0/P1

- P0-1 Owner-Dashboard: erledigt mit temporärem QA-Owner.
- P1-1 Website Desktop-Hero: erledigt.
- P1-2 Mobile Anfrage-CTA als Bottom-Drawer: erledigt.
- P1-3 Guest-App Navigation mit MingCute Icons: erledigt.
- P1-4 Guest-App aktive View-Führung: erledigt.
- P1-5 Admin-Dashboard verdichten: erledigt für die Übersicht.
- P1-6 Admin-Mobile Navigation: teilweise erledigt ohne neue Menüarchitektur.

## Offen

- P1-7 Website Mobile Navigation bleibt als Plattformausbau/P2-nahes Thema offen.
- Tiefe Admin-Modulflows für CRM, Support, Buchungen, Bestand und Operations brauchen separate visuelle Abnahme.
- Tiefe Owner-Flows für Rückfragen, Abrechnung, Operations und Dokumente brauchen separate visuelle Abnahme.
- P2-Themen wurden dokumentiert, aber gemäß Auftrag nicht priorisiert umgesetzt.

## Ampel Nach Fix

| App | Status | Begründung |
| --- | --- | --- |
| Website | Grün/Gelb | Hero und Anfrage-UX korrigiert; mobile Plattformnavigation bleibt späteres Thema. |
| Guest App | Grün/Gelb | Icon-System und Tabführung korrigiert; weitere Statusflows bleiben QA-relevant. |
| Owner App | Gelb | Dashboard visuell geprüft; tiefe Owner-Flows bleiben weiter zu prüfen. |
| Admin App | Gelb | Übersicht deutlich verdichtet; tiefe Arbeitsmodule bleiben weiter zu prüfen. |

## Evidence

Screenshots:

`docs/qa/design-ux-fixes-2026-07-01/`

Wichtige Dateien:

- `web-home-desktop-1440x900.png`
- `web-family-request-drawer-mobile-390x844.png`
- `guest-booking-active-mobile-390x844.png`
- `guest-booking-active-desktop-1440x900.png`
- `owner-dashboard-mobile-390x844.png`
- `owner-dashboard-desktop-1440x900.png`
- `admin-dashboard-desktop-hiddenfix-1440x900.png`
- `admin-dashboard-mobile-final-390x844.png`

## Prüfung

- `npm run typecheck`: bestanden.
- `npm run web:build`: bestanden.
- `npm run guest:build`: bestanden.
- `npm run admin:build`: bestanden.
- `npm run lint`: bestanden.
- `npm run qa:app-deployment-config`: bestanden.
- `npm run supabase:verify-owner`: Tabellen/RPCs bestanden.
- `OWNER_VERIFY_TEMP_OWNER=1 npm run supabase:verify-owner`: temporärer Owner-Login und Dashboard-RPC bestanden.
