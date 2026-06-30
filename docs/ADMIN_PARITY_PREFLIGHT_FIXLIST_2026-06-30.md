# Admin Parity Preflight Fixlist

Stand: 2026-06-30

Quelle: `npm run qa:admin-parity:preflight`

Diese Liste dokumentiert, was vor dem echten Admin-Paritaetslauf noch gesetzt werden muss. Sie enthaelt bewusst keine Secret-Werte.

Wichtig: Der Preflight akzeptiert keine Platzhalterwerte wie `https://<admin-app-domain>`, `example.com`, Dummy-Buchungs-IDs oder bekannte Template-Beispiele.

## Ergebnis

Status: rot

Vorhanden:

- Supabase Public URL
- Supabase anon key
- Guest-Testbuchung `e44489db-70ec-4935-8007-588985f2fb63` mit Access-Code `QA7509EE93` ist erzeugt und per `npm run supabase:verify-guest` RPC-geprueft.
- Owner-Testlogin `owner-qa-20260630@getmorrow.de` ist erzeugt und per `npm run supabase:verify-owner` Login/RPC-geprueft.
- lokale `.env.local` wird gelesen

Fehlend:

| Bereich | Benoetigte Variable(n) | Zweck |
| --- | --- | --- |
| Admin-App | `ADMIN_BASE_URL` oder `MORROW_ADMIN_APP_URL` | Admin-App im App-QA und Paritaetslauf oeffnen. |
| Gaeste-App | `GUEST_BASE_URL` oder `MORROW_GUEST_APP_URL` | Persoenlichen Gaestebereich testen. |
| Owner-App | `OWNER_BASE_URL` oder `MORROW_OWNER_APP_URL` | Eigentuemer-App gegen Admin-Daten pruefen. |
| Admin-Testlogin | `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Rollenbasierten Admin-Zugang pruefen. |

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

1. Fehlende Werte aus `docs/qa/admin-parity/env.template` in `.env.local` oder als Shell-Exports setzen.
2. Preflight erneut ausfuehren:

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
