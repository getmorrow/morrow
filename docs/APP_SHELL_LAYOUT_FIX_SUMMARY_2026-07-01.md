# Morrow App Shell Layout Fix

Stand: 2026-07-01

## Ziel

Website bleibt öffentliche SEO-/Conversion-Website. Guest App, Owner App und Admin App dürfen nicht wie lange Marketingseiten wirken, sondern müssen als eigene App-Welten erkennbar sein.

Grundlage:

- `docs/PLATFORM_ARCHITECTURE.md`
- `docs/STRATEGIC_FOUNDATION_MORROW.md`
- alter Vite-Prototyp als CRM-Funktionsreferenz

## Analyse

### Guest App

Vorher zu webartig:

- große Hero-Card mit Bild und Headline
- darunter lange Section-Stacks
- erster Eindruck eher Landingpage als persönlicher Aufenthaltsbereich

Korrektur:

- Einstieg auf `Mein Aufenthalt` gedreht
- kompakte Aufenthalt-Overview mit Bild, Status, Datum, Auszeit und Unterkunft
- Bottom Navigation bleibt führend
- Inhalte bleiben nutzungsorientiert: Aufenthalt, Auszeit, Buchung, Vor Ort, Hilfe

### Owner App

Vorher zu webartig:

- Header + horizontale Pill-Navigation + große Hero-Section
- Inhalte lagen zwar in Cards, aber noch als lange Seite statt Portal
- Portal-Kontext war nicht klar genug getrennt von öffentlicher Eigentümer-Landingpage

Korrektur:

- eigene Portal-Shell mit Sidebar und Arbeitsfläche
- kompakter Workspace-Kopf statt Story-Hero
- Kennzahlen, Objekte, Buchungen, Lücken, Operations, Abrechnung und Rückfragen bleiben als Portalmodule erhalten
- Desktop wirkt dashboard-orientiert, Mobile nutzt kompakte Scroll-Navigation

### Admin App

Vorher zu webartig:

- Top-Navigation und Hero führten visuell eher wie eine Website
- CRM-Funktionen waren vorhanden, aber nicht in einer professionellen Cockpit-Shell
- Desktop-first-Anspruch wurde durch pageartige Struktur geschwächt

Prototyp-CRM-Elemente, die als Zielbild weiter gelten:

- Sidebar-/Arbeitsbereich-Logik
- Tabellen/List Views
- Filter, Status, Suche
- Lead Detail View
- Booking Detail View
- Owner/Object Detailpflege
- Communication Log
- Tasks/To-dos
- Audit/Activity

Korrektur:

- Admin auf `admin-app-shell` mit Sidebar Navigation umgestellt
- Workspace-Header ersetzt Hero
- operative Statuschips oben rechts
- vorhandene CRM-Workspaces bleiben erhalten: Übersicht, CRM, Aufgaben, Support, Operations, Bestand, Partner, Eigentümer, Aktivität
- CRM-Workspace zeigt weiterhin Anfragen, Kunden und Buchungen

## Geänderte Dateien

- `apps/guest/app/deine-auszeit/[bookingId]/GuestStayClient.tsx`
- `apps/guest/app/globals.css`
- `apps/owner/app/dashboard/OwnerDashboardClient.tsx`
- `apps/owner/app/globals.css`
- `apps/admin/app/dashboard/AdminDashboardClient.tsx`
- `apps/admin/app/globals.css`

## QA

Automatisch grün:

- `npm run typecheck`
- `npm run lint`
- `npm run guest:build`
- `npm run owner:build`
- `npm run admin:build`

Browser-/DOM-Prüfung:

- Guest: `.guest-stay-overview` vorhanden, alte `.guest-hero-card` nicht mehr vorhanden, Bottom Navigation aktiv.
- Owner: `.owner-portal-layout` und `.owner-portal-sidebar` vorhanden.
- Admin: `.admin-app-shell`, `.admin-sidebar` und `.admin-workspace-head` vorhanden, alte `.admin-hero` nicht mehr vorhanden.
- Admin CRM: Workspace `CRM` sichtbar; Anfragen-, Kunden- und Buchungsbereiche vorhanden.
- Owner/Admin Desktop: kein horizontaler Overflow im geprüften Viewport (`scrollWidth == clientWidth`).

## Screenshots

Vorher-Referenz aus vorherigem Audit:

- Guest vorher: `docs/qa/design-ux-fixes-2026-07-01/guest-booking-active-mobile-390x844.png`
- Guest vorher: `docs/qa/design-ux-fixes-2026-07-01/guest-booking-active-desktop-1440x900.png`
- Owner vorher: `docs/qa/design-ux-fixes-2026-07-01/owner-dashboard-mobile-390x844.png`
- Owner vorher: `docs/qa/design-ux-fixes-2026-07-01/owner-dashboard-desktop-1440x900.png`
- Admin vorher: `docs/qa/design-ux-fixes-2026-07-01/admin-dashboard-mobile-final-390x844.png`
- Admin vorher: `docs/qa/design-ux-fixes-2026-07-01/admin-dashboard-desktop-hiddenfix-1440x900.png`

Nachher:

- Guest mobile: `docs/qa/app-shell-layout-fix-2026-07-01/guest-app-shell-mobile-390x844.png`
- Guest desktop: `docs/qa/app-shell-layout-fix-2026-07-01/guest-app-shell-desktop-1440x900.png`
- Owner mobile: `docs/qa/app-shell-layout-fix-2026-07-01/owner-portal-mobile-viewport-390x844.png`
- Owner desktop: `docs/qa/app-shell-layout-fix-2026-07-01/owner-portal-desktop-viewport-1440x900.png`
- Admin mobile: `docs/qa/app-shell-layout-fix-2026-07-01/admin-crm-cockpit-mobile-viewport-390x844.png`
- Admin desktop: `docs/qa/app-shell-layout-fix-2026-07-01/admin-crm-cockpit-desktop-viewport-1440x900.png`

## Bewertung

Der Layout-Grundcharakter ist korrigiert:

- Website bleibt Schaufenster.
- Guest App wirkt stärker wie eine persönliche Aufenthalts-App.
- Owner App wirkt stärker wie ein Eigentümerportal.
- Admin App wirkt stärker wie ein CRM-/Operations-Cockpit.

Offen für spätere Detailphase:

- Admin-Listen können noch stärker tabellarisch verdichtet werden.
- Owner-Detailansichten können in einer späteren Iteration als echte Detail-Panels statt nur Anchor-Sections aufgebaut werden.
- Guest Home kann später je Aufenthaltsphase weiter dynamisiert werden.
