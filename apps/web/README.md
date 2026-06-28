# Morrow Web App

Oeffentliche Next-App fuer die SEO-faehige Morrow Website.

Status: fuehrend fuer die oeffentliche Website. Der alte Root-Vite-Prototyp ist fuer Website-Routen nur noch Referenz und nicht mehr Produktionsarchitektur.

## Rolle

`apps/web` erzeugt Nachfrage, Vertrauen und Leads:

- Startseite.
- Auszeitenuebersicht und Auszeitdetailseiten.
- Eigentuemer-Landingpage.
- Erlebnispartner-Landingpage.
- Ratgeber und SEO-/GEO-Inhalte.
- Rechtstexte, Sitemap, Robots und Schema.org.
- Leadformulare fuer Gaeste, Eigentuemer und Erlebnispartner.

Operative Arbeit gehoert nicht in diese App. Leads gehen nach Supabase/Admin; Gaeste-, Owner- und Admin-App sind eigene App-Welten.

## Fuehrende Dokumente

- `docs/MIGRATION_CONSOLIDATION_AUDIT.md`
- `docs/PLATFORM_ARCHITECTURE.md`
- `docs/PRODUCTION_LAUNCH_CHECKLIST.md`
- `docs/LAUNCH_STATUS_SNAPSHOT_2026-06-28.md`
- `docs/MORROW_MASTER_FRAME.md`
- `docs/STYLEGUIDE_OPERATING_RULES.md`
- `docs/STRATEGIC_FOUNDATION_MORROW.md`

## Vorhanden

- Statisch/Server-gerenderte Next-Seiten fuer die oeffentliche Website.
- `sitemap.xml` und `robots.txt`.
- Rechteseiten als technische Arbeitsfassungen.
- Leadformulare mit WhatsApp-Opt-in optional und Reisegruppenfeldern.
- Analytics-Komponente mit Consent-Gate, aktiv nur bei gesetzten GA-/Meta-IDs.
- Redirect-Vorbereitung fuer Admin-, Guest- und Owner-App ueber App-URLs.

## Noch Nicht Launch-Frei

- Rechtstexte und Impressum enthalten teilweise Arbeitsfassungs-/Platzhalterhinweise.
- Juristische Freigabe fehlt.
- App-Redirect-URLs fuer Admin, Guest und Owner muessen in Production gesetzt werden.
- Secret-Rotation und finale Angebotsfreigabe muessen bestaetigt werden.
- Tracking-/Consent-Entscheidung und Conversion-Tests fehlen fuer Paid Ads.
- Ratgeber- und Keyword-Ausbau ist langfristig weiter offen, aber nicht Blocker fuer technische Migration.

## Lokale Nutzung

Aus dem Repo-Root:

```bash
npm run web:dev:port
npm run web:build
```

App-intern:

```bash
npm run -w @morrow/web dev -- --port 4300
npm run -w @morrow/web build
npm run -w @morrow/web typecheck
```

## Env

Root-`.env.local` wird lokal ueber `next.config.ts` geladen.

Public Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

App-Redirects:

```bash
MORROW_ADMIN_APP_URL=https://<admin-app-domain>
MORROW_GUEST_APP_URL=https://<guest-app-domain>
MORROW_OWNER_APP_URL=https://<owner-app-domain>
```

Optionales Tracking:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=...
NEXT_PUBLIC_META_PIXEL_ID=...
```

Nicht in Frontend-Env setzen:

- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- Supabase Personal Access Tokens

## QA Vor Launch

```bash
npm run web:build
QA_BASE_URL=https://www.getmorrow.de npm run qa:production
npm run qa:launch-gates
```

Mit echtem Lead-Test nur bewusst:

```bash
MORROW_QA_SUBMIT_LEAD=1 QA_BASE_URL=https://www.getmorrow.de npm run qa:production
```

Aktueller Go-/No-Go-Stand steht in `docs/LAUNCH_STATUS_SNAPSHOT_2026-06-28.md`.
