# 2026-06-30 - Admin Parity QA Run

Dieses Protokoll ist die konkrete Evidenz zum Runbook `docs/ADMIN_PARITY_QA_RUNBOOK.md`.
Ein leerer oder teilweise ausgefüllter Lauf gilt nicht als Freigabe.

## Kopf

Tester: Codex
Umgebung: Production consolidation

URLs:
- Website: https://www.getmorrow.de
- Admin: https://morrow-admin.vercel.app
- Gäste-App: https://morrow-guest.vercel.app
- Owner-App: https://morrow-owner.vercel.app

Testdaten:
- Testlead:
- Testbuchung: `30b9ff18-03f0-49fd-af4d-b5f6947114a4`
- Testkunde:
- Test-Auszeit:
- Test-Unterkunft:
- Test-Owner: `owner-qa-20260701b@getmorrow.de`
- Test-Admin: `auszeiten@getmorrow.de`

## Automatische Gates

- [x] npm run qa:admin-parity:preflight
- [x] npm run typecheck
- [x] npx supabase db push --dry-run --linked
- [x] git diff --check
- [x] npm run lint
- [x] npm run qa:admin-audit
- [ ] npm run qa:readiness
- [x] npm run admin:build
- [x] npm run guest:build
- [x] npm run owner:build
- [x] QA_BASE_URL=https://www.getmorrow.de npm run qa:production
- [ ] npm run qa:launch-gates
- [x] npm run qa:apps

## Manuelle Gates

| Nr. | Flow | Ergebnis | Evidenz |
| --- | --- | --- | --- |
| 1 | Admin-Login | Technisch grün | `npm run supabase:verify-admin` grün: `auszeiten@getmorrow.de`, Rolle `owner`, Status `active`, 10 Kern-Tabellen lesbar. Browser-Login in `morrow-admin` grün; Screenshot `tmp/qa/apps-production/admin-dashboard.png`. |
| 2 | Neuer Gastlead | Offen |  |
| 3 | Leadstatus ändern | Offen |  |
| 4 | Wiedervorlage setzen | Offen |  |
| 5 | Lead archivieren/reaktivieren | Offen |  |
| 6 | Lead reservieren | Offen |  |
| 7 | Kunde prüfen | Offen |  |
| 8 | Aufgabe erstellen | Offen |  |
| 9 | Aufgabenbezug öffnen | Offen |  |
| 10 | Buchung bearbeiten | Offen |  |
| 11 | Gästebereich öffnen | Offen |  |
| 12 | Support senden | Offen |  |
| 13 | Support beantworten | Offen |  |
| 14 | Feedback senden | Offen |  |
| 15 | Auszeit pflegen | Offen |  |
| 16 | Unterkunft pflegen | Offen |  |
| 17 | Erlebnisbaustein pflegen | Offen |  |
| 18 | Vor-Ort-Ort freigeben | Offen |  |
| 19 | Veranstaltung prüfen | Offen |  |
| 20 | Owner-Dokument | Offen |  |
| 21 | Owner-Abrechnung | Offen |  |
| 22 | Owner-Operation | Offen |  |
| 23 | Audit-Log | Technisch grün | `npm run qa:admin-audit` grün: 34 mutierende Admin-Funktionen schreiben Audit-Logs. Block-1-Check `npm run qa:admin-parity:block1` grün. |
| 24 | Kommunikationshistorie | Offen |  |

## Evidenz

Screenshots:
- `tmp/qa/apps-production/admin-dashboard.png`
- `tmp/qa/apps-production/owner-dashboard.png`
- `tmp/qa/apps-production/guest-stay.png`

Supabase-Datensätze:
- Admin-Testlogin `auszeiten@getmorrow.de` geprüft; `npm run supabase:verify-admin` grün per Login/RPC: Rolle `owner`, Status `active`, Kern-Tabellen lesbar.
- Guest-Testbuchung `e44489db-70ec-4935-8007-588985f2fb63` mit Access-Code `QA7509EE93` erzeugt; `npm run supabase:verify-guest` grün per RPC: Status `Vor Anreise`, Auszeit `Couple Reset`, Gast `Sophie Krüger`.
- Owner-Testlogin `owner-qa-20260630@getmorrow.de` erzeugt; `npm run supabase:verify-owner` grün per Login/RPC: 1 Objekt, 1 Auszeit, 2 Termine, 6 Buchungen sichtbar.

E-Mail-/Communication-Events:
- 

Audit-Log-Einträge:
- Audit-Baseline statisch geprüft: `npm run qa:admin-audit` meldet `admin-audit-coverage-ok: 34 mutating functions write audit logs`.

Offene Blocker:
- `npm run qa:readiness` rot: Admin-Paritätslauf nicht grün, Rechtstexte/Secrets/Angebotsdaten/Tracking offen.
- `npm run qa:admin-parity:preflight` grün mit Admin-, Gäste- und Owner-App-URL, Admin-Testlogin, Guest-Testbuchung und Owner-Testlogin.
- `npm run qa:launch-gates` rot: 6 Blocker, darunter Rechtstexte/Arbeitsfassungen, Rechtsfreigabe, Secret-Rotation und Angebotsfreigabe.
- `npm run qa:apps` grün: `checkedApps: 3`, Admin-Login, Owner-Login und Guest-Stay geprüft.
- Live-Routing geprüft: `https://www.getmorrow.de/health` meldet `app=web`; App-Redirects zeigen auf Admin-, Gäste- und Owner-App.
- Manuelle Gates 2-22 und 24 noch nicht durchgeführt und ohne Evidenz.

## Bewertung

Ergebnis: Rot

Begründung: App-URLs, Testzugänge und Block 1 sind technisch grün. Der Lauf bleibt rot, weil die Kern-CRM-, Gäste-App-, Bestand-, Owner- und Kommunikationsflows 2-22 und 24 noch nicht manuell mit Evidenz abgenommen sind und Recht/Freigaben weiter offen sind.

Freigabe für echte Leads: Nein

Freigabe für zahlende Gäste: Nein

Nächste Korrekturen:
- 
