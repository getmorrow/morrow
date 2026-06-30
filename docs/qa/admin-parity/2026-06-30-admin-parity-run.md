# 2026-06-30 - Admin Parity QA Run

Dieses Protokoll ist die konkrete Evidenz zum Runbook `docs/ADMIN_PARITY_QA_RUNBOOK.md`.
Ein leerer oder teilweise ausgefüllter Lauf gilt nicht als Freigabe.

## Kopf

Tester: Codex
Umgebung: Production consolidation

URLs:
- Website: https://www.getmorrow.de
- Admin: Offen, `ADMIN_BASE_URL`/`MORROW_ADMIN_APP_URL` fehlt im QA-Kontext.
- Gäste-App: Offen, `GUEST_BASE_URL`/`MORROW_GUEST_APP_URL` fehlt im QA-Kontext.
- Owner-App: Offen, `OWNER_BASE_URL`/`MORROW_OWNER_APP_URL` fehlt im QA-Kontext.

Testdaten:
- Testlead:
- Testbuchung:
- Testkunde:
- Test-Auszeit:
- Test-Unterkunft:
- Test-Owner:

## Automatische Gates

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
- [ ] npm run qa:apps

## Manuelle Gates

| Nr. | Flow | Ergebnis | Evidenz |
| --- | --- | --- | --- |
| 1 | Admin-Login | Offen |  |
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
| 23 | Audit-Log | Offen |  |
| 24 | Kommunikationshistorie | Offen |  |

## Evidenz

Screenshots:
- 

Supabase-Datensätze:
- 

E-Mail-/Communication-Events:
- 

Audit-Log-Einträge:
- 

Offene Blocker:
- `npm run qa:readiness` rot: Admin-Paritätslauf nicht grün, Rechtstexte/Env/App-URLs/Secrets/Angebotsdaten/Tracking offen.
- `npm run qa:admin-parity:preflight` rot: Admin-, Gäste- und Owner-App-URL fehlen; Admin-Testlogin, Guest-Testbuchung mit Access-Code und Owner-Testlogin fehlen.
- `npm run qa:launch-gates` rot: 11 Blocker, darunter Rechtstexte/Arbeitsfassungen, Supabase Public Env, App-URLs, Secret-Rotation und Angebotsfreigabe.
- `npm run qa:apps` rot: `checkedApps: 0`, keine App Base URLs gesetzt.
- Manuelle Gates 1-24 noch nicht durchgeführt und ohne Evidenz.

## Bewertung

Ergebnis: Rot

Begründung: Automatische lokale Build-/Code-Gates sind weitgehend grün, aber App-URLs, Testzugänge, Recht/Freigaben und alle manuellen CRM-Paritätsflows fehlen noch.

Freigabe für echte Leads: Nein

Freigabe für zahlende Gäste: Nein

Nächste Korrekturen:
- 
