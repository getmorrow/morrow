# 2026-06-30 - Admin Parity QA Run

Dieses Protokoll ist die konkrete Evidenz zum Runbook `docs/ADMIN_PARITY_QA_RUNBOOK.md`.
Ein leerer oder teilweise ausgefüllter Lauf gilt nicht als Freigabe.

## Kopf

Tester: Codex
Umgebung: Production consolidation

URLs:
- Website:
- Admin:
- Gäste-App:
- Owner-App:

Testdaten:
- Testlead:
- Testbuchung:
- Testkunde:
- Test-Auszeit:
- Test-Unterkunft:
- Test-Owner:

## Automatische Gates

- [ ] npm run typecheck
- [ ] npx supabase db push --dry-run --linked
- [ ] git diff --check
- [ ] npm run lint
- [ ] npm run qa:admin-audit
- [ ] npm run qa:readiness
- [ ] npm run admin:build
- [ ] npm run guest:build
- [ ] npm run owner:build
- [ ] QA_BASE_URL=https://www.getmorrow.de npm run qa:production
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
- 

## Bewertung

Ergebnis: Offen

Begründung:

Freigabe für echte Leads: Nein

Freigabe für zahlende Gäste: Nein

Nächste Korrekturen:
- 
