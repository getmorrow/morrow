# Admin Parity Preflight Fixlist

Stand: 2026-07-01

Quelle: `npm run qa:admin-parity:preflight`

Diese Liste dokumentiert, was vor dem echten Admin-Paritaetslauf noch gesetzt werden muss. Sie enthaelt bewusst keine Secret-Werte.

Wichtig: Der Preflight akzeptiert keine Platzhalterwerte wie `https://<admin-app-domain>`, `example.com`, Dummy-Buchungs-IDs oder bekannte Template-Beispiele.

Der Preflight gibt zusaetzlich `nextActions` aus. Diese Aktionen sind der operative Wegweiser fuer den naechsten Schritt, ersetzen aber keine manuelle Evidenz im Admin-Paritaetsprotokoll.

## Ergebnis

Status: rot

Aktuell im lokalen QA-Kontext vorhanden:

- Supabase Public URL
- Supabase anon key
- lokale `.env.local` wird gelesen

Fehlend:

| Bereich | Benoetigte Variable(n) | Zweck |
| --- | --- | --- |
| Admin-App | `ADMIN_BASE_URL` oder `MORROW_ADMIN_APP_URL` | Admin-App im App-QA und Paritaetslauf oeffnen. |
| Gaeste-App | `GUEST_BASE_URL` oder `MORROW_GUEST_APP_URL` | Persoenlichen Gaestebereich testen. |
| Owner-App | `OWNER_BASE_URL` oder `MORROW_OWNER_APP_URL` | Eigentuemer-App gegen Admin-Daten pruefen. |
| Admin-Testlogin | `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Admin-Login, Rolle und Tabellenzugriff fuer Block 1 pruefen. |
| Gaeste-Testbuchung | `GUEST_BOOKING_ID`, `GUEST_ACCESS_CODE` | Codegeschuetzten Gaestebereich und Guest-RPC pruefen. |
| Owner-Testlogin | `OWNER_EMAIL`, `OWNER_PASSWORD` | Owner-App Login/RPC gegen freigeschaltete Objekte pruefen. |

Historische Testdaten aus dem letzten vorbereiteten Lauf:

- Admin-Testlogin `auszeiten@getmorrow.de` wurde frueher per `npm run supabase:verify-admin` Login/RPC-geprueft.
- Guest-Testbuchung `e44489db-70ec-4935-8007-588985f2fb63` mit Access-Code `QA7509EE93` wurde frueher per `npm run supabase:verify-guest` RPC-geprueft.
- Owner-Testlogin `owner-qa-20260630@getmorrow.de` wurde frueher per `npm run supabase:verify-owner` Login/RPC-geprueft.

Wichtig: Diese historischen Datensaetze zaehlen fuer die aktuelle Abnahme nur, wenn die zugehoerigen Werte wieder lokal in `.env.local` oder als Shell-Exports gesetzt sind und die Checks im aktuellen Lauf erneut gruen sind.

Preflight-Regel:

- Eine App-URL gilt erst als gesetzt, wenn `<app-url>/health` erreichbar ist.
- Admin muss `{"app":"admin","status":"ok"}` liefern.
- Gaeste-App muss `{"app":"guest","status":"ok"}` liefern.
- Owner-App muss `{"app":"owner","status":"ok"}` liefern.
- Website-Pfade wie `https://www.getmorrow.de/admin` oder `https://www.getmorrow.de/deine-auszeit` duerfen nicht als App-Base-URLs gelten, solange sie kein passendes App-Health-Signal liefern.

## Live-Routing-Evidenz

Stand 2026-06-30:

- `https://www.getmorrow.de/health` liefert `{"app":"web","status":"ok"}`.
- `https://www.getmorrow.de/admin` liefert HTTP 404.
- `https://www.getmorrow.de/deine-auszeit` liefert HTTP 404.
- `https://www.getmorrow.de/owner` liefert HTTP 404.
- `https://www.getmorrow.de/app/eigentuemer` liefert HTTP 404.

Diese Pfade sind deshalb keine gueltigen App-URLs fuer den Paritaetslauf. Admin-, Gaeste- und Owner-App brauchen eigene Vercel-Deployments oder funktionierende Weiterleitungen auf eigene App-Domains.

Optional, aber fuer sauberere Protokolle hilfreich:

| Variable | Zweck |
| --- | --- |
| `QA_TESTER` | Name im generierten Admin-Paritaetsprotokoll. |
| `QA_ENVIRONMENT` | Umgebung im generierten Admin-Paritaetsprotokoll, z. B. `Production` oder `Staging`. |

## Eintragungsort

Lokal:

- `.env.local`
- Vorlage: `docs/qa/admin-parity/env.template`

Vercel/Deployment:

- App-spezifische Project Settings fuer `apps/admin`, `apps/guest`, `apps/owner`.
- Website-Projekt benoetigt zusaetzlich `MORROW_ADMIN_APP_URL`, `MORROW_GUEST_APP_URL`, `MORROW_OWNER_APP_URL` fuer Redirect-/Launch-Gates.

## App-Deployments Schliessen

Lokaler Strukturstand 2026-07-01:

- `npm run qa:app-deployment-config` ist gruen.
- `apps/web`, `apps/admin`, `apps/guest` und `apps/owner` besitzen jeweils `vercel.json`.
- Alle vier Apps haben einen `/health`-Endpunkt mit der erwarteten App-ID.

Der offene Punkt ist deshalb nicht mehr die Repo-Konfiguration, sondern die echte erreichbare Deployment-URL je App. Diese URLs muessen eigenstaendige App-Projekte sein oder auf eigenstaendige App-Projekte zeigen. Die oeffentliche Website unter `https://www.getmorrow.de` ersetzt diese App-URLs nicht.

Fuer jedes App-Projekt in Vercel:

| App | Root Directory | Build Command | Erwarteter Health-Check |
| --- | --- | --- | --- |
| Admin | `apps/admin` | aus `apps/admin/vercel.json` | `/health` liefert `app=admin` |
| Gaeste | `apps/guest` | aus `apps/guest/vercel.json` | `/health` liefert `app=guest` |
| Owner | `apps/owner` | aus `apps/owner/vercel.json` | `/health` liefert `app=owner` |

Danach lokal fuer QA setzen:

```bash
ADMIN_BASE_URL=https://<admin-app-domain>
GUEST_BASE_URL=https://<guest-app-domain>
OWNER_BASE_URL=https://<owner-app-domain>
ADMIN_EMAIL=<admin-test-email>
ADMIN_PASSWORD=<admin-test-password>
GUEST_BOOKING_ID=<booking-id>
GUEST_ACCESS_CODE=<access-code>
OWNER_EMAIL=<owner-test-email>
OWNER_PASSWORD=<owner-test-password>
```

Alternativ koennen fuer App-URL-Pruefungen auch `MORROW_ADMIN_APP_URL`, `MORROW_GUEST_APP_URL` und `MORROW_OWNER_APP_URL` genutzt werden. Damit bleiben `qa:admin-parity:preflight`, `qa:apps` und die Website-Redirect-Konfiguration konsistent.

Und im Website-Projekt fuer Redirects/Launch-Gates:

```bash
MORROW_ADMIN_APP_URL=https://<admin-app-domain>
MORROW_GUEST_APP_URL=https://<guest-app-domain>
MORROW_OWNER_APP_URL=https://<owner-app-domain>
```

## Guest-Testbuchung Erzeugen

Der Guest-Blocker kann mit einem echten QA-Datensatz vorbereitet werden:

```bash
npm run supabase:seed-active-guest-test
```

Die Ausgabe enthaelt:

```text
GUEST_BOOKING_ID=...
GUEST_ACCESS_CODE=...
```

Diese Werte danach lokal in `.env.local` oder als Shell-Exports setzen. Die alten Dummy-Werte `11111111-1111-4111-8111-111111111111` und `MORROW1` bleiben bewusst ungueltig fuer die Paritaetsabnahme.

## Owner-Testlogin Erzeugen

Der Owner-Blocker kann mit einem echten QA-Login vorbereitet werden:

```bash
OWNER_CREATE_AUTH_USER=1 \
OWNER_EMAIL=owner-qa-<datum>@getmorrow.de \
OWNER_NAME="Morrow QA Owner" \
OWNER_PROPERTY_IDS=<property-id> \
npm run supabase:seed-owner-access
```

Die Ausgabe enthaelt:

```text
OWNER_EMAIL=...
OWNER_PASSWORD=...
```

Das Passwort nicht committen. Die Werte lokal in `.env.local` oder als Shell-Exports setzen und mit `npm run supabase:verify-owner` pruefen.

## Danach Ausfuehren

1. Admin-, Gaeste- und Owner-App als getrennte Vercel-Projekte deployen oder bestehende App-Domains notieren.
2. Fuer jede App pruefen, dass `/health` die passende App-ID liefert.
3. Fehlende Werte aus `docs/qa/admin-parity/env.template` in `.env.local` oder als Shell-Exports setzen.
4. Preflight erneut ausfuehren:

```bash
npm run qa:admin-parity:preflight
```

Erwartung:

- Preflight wird gruen.
- Danach kann ein echtes Protokoll erzeugt werden:

```bash
npm run qa:admin-parity:new
```

## Bezug Zum Startstatus

Solange dieser Preflight rot ist:

- kein Admin-Paritaetslauf,
- keine Freigabe fuer kontrollierte echte Leads,
- keine Freigabe fuer zahlende Gaeste,
- keine Paid Ads.
