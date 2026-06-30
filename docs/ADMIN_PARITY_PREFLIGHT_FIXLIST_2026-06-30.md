# Admin Parity Preflight Fixlist

Stand: 2026-06-30

Quelle: `npm run qa:admin-parity:preflight`

Diese Liste dokumentiert, was vor dem echten Admin-Paritaetslauf noch gesetzt werden muss. Sie enthaelt bewusst keine Secret-Werte.

## Ergebnis

Status: rot

Vorhanden:

- Supabase Public URL
- Supabase anon key
- lokale `.env.local` wird gelesen

Fehlend:

| Bereich | Benoetigte Variable(n) | Zweck |
| --- | --- | --- |
| Admin-App | `ADMIN_BASE_URL` oder `MORROW_ADMIN_APP_URL` | Admin-App im App-QA und Paritaetslauf oeffnen. |
| Gaeste-App | `GUEST_BASE_URL` oder `MORROW_GUEST_APP_URL` | Persoenlichen Gaestebereich testen. |
| Owner-App | `OWNER_BASE_URL` oder `MORROW_OWNER_APP_URL` | Eigentuemer-App gegen Admin-Daten pruefen. |
| Admin-Testlogin | `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Rollenbasierten Admin-Zugang pruefen. |
| Guest-Testbuchung | `GUEST_BOOKING_ID`, `GUEST_ACCESS_CODE` | Codegeschuetzten Gaestebereich oeffnen. |
| Owner-Testlogin | `OWNER_EMAIL`, `OWNER_PASSWORD` | Owner-App mit freigeschaltetem Objektzugriff pruefen. |

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
