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
- Testlead: `30b9ff18-03f0-49fd-af4d-b5f6947114a4`
- Testbuchung: `30b9ff18-03f0-49fd-af4d-b5f6947114a4`
- Testkunde: `30b9ff18-03f0-49fd-af4d-b5f6947114a4`
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
| 2 | Neuer Gastlead | Technisch grün | `npm run qa:admin-parity:block2` grün mit `QA_BLOCK2_LEAD_ID=30b9ff18-03f0-49fd-af4d-b5f6947114a4`: Gastlead lesbar, Typ `guest`, Status `Vor Anreise`. |
| 3 | Leadstatus ändern | Technisch grün | Block-2-Check grün: Leadstatus ist über `Neu` hinaus fortgeschritten auf `Vor Anreise`. |
| 4 | Wiedervorlage setzen | Technisch grün | Block-2-QA-Fluss setzte `follow_up_at=2026-07-02`; Audit `2b10611d-347e-4a86-ac19-6dfb2cf04259`. |
| 5 | Lead archivieren/reaktivieren | Technisch grün | Block-2-QA-Fluss archivierte und reaktivierte den QA-Lead; final `archived_at=null`; Audits `13c72c5d-ef36-4582-b8d9-241c572b9732`, `2724814a-ed7f-4893-9050-e7ec8568d271`. |
| 6 | Lead reservieren | Technisch grün | Block-2-Check grün: verknüpfte Buchung `30b9ff18-03f0-49fd-af4d-b5f6947114a4`, Status `Vor Anreise`, Zahlung `bezahlt`. |
| 7 | Kunde prüfen | Technisch grün | Block-2-Check grün: Kundensatz `30b9ff18-03f0-49fd-af4d-b5f6947114a4`, `primary_lead_id` identisch, `customer_type=guest`. |
| 8 | Aufgabe erstellen | Technisch grün | Block-2-QA-Aufgabe `qa-block2-30b9ff18-03f0-49fd-af4d-b5f6947114a4` erstellt/aktualisiert, Status `open`, Priorität `high`; Audit `c0a4c7e3-d371-45b2-80cc-c3cd54f7aaf4`. |
| 9 | Aufgabenbezug öffnen | Technisch grün | Block-2-Check grün: Aufgabe referenziert `reference_type=booking`, `reference_id=30b9ff18-03f0-49fd-af4d-b5f6947114a4`. |
| 10 | Buchung bearbeiten | Technisch grün | Block-2-Check grün: Buchung hat Status, Zahlungsstatus und Gästebereich-Code; Audit `1c3b8efc-36c6-41c6-ab66-7f11cbf095c5`. |
| 11 | Gästebereich öffnen | Technisch grün | `npm run qa:admin-parity:block3` grün mit Buchung `30b9ff18-03f0-49fd-af4d-b5f6947114a4`: `get_guest_stay` liefert Buchung `Vor Anreise` und Auszeit `Couple Reset`. |
| 12 | Support senden | Technisch grün | Block-3-QA-Support `qa-block3-support-30b9ff18-03f0-49fd-af4d-b5f6947114a4` ist in `support_messages` sichtbar, Status `answered`. |
| 13 | Support beantworten | Technisch grün | Support-Antwort ist im Gästebereich per `get_guest_support_events` sichtbar; Communication Event `5f27bdff-58a7-4f3d-aa6b-fa1e9d5e4ee9`. |
| 14 | Feedback senden | Technisch grün | Feedback `qa-block3-feedback-30b9ff18-03f0-49fd-af4d-b5f6947114a4` gespeichert, Rating `5`, Wiederbuchungsinteresse `yes`. |
| 15 | Auszeit pflegen | Offen |  |
| 16 | Unterkunft pflegen | Offen |  |
| 17 | Erlebnisbaustein pflegen | Offen |  |
| 18 | Vor-Ort-Ort freigeben | Offen |  |
| 19 | Veranstaltung prüfen | Offen |  |
| 20 | Owner-Dokument | Offen |  |
| 21 | Owner-Abrechnung | Offen |  |
| 22 | Owner-Operation | Offen |  |
| 23 | Audit-Log | Technisch grün | `npm run qa:admin-audit` grün: 34 mutierende Admin-Funktionen schreiben Audit-Logs. Block-1-Check `npm run qa:admin-parity:block1` grün. |
| 24 | Kommunikationshistorie | Technisch grün | Block-3-Check grün: zentrale `communication_events` enthält Support-Antwort und Feedback für dieselbe Buchung; Events `5f27bdff-58a7-4f3d-aa6b-fa1e9d5e4ee9`, `998aa813-a7c5-46a7-a7ba-e84e957e6e81`. |

## Evidenz

Screenshots:
- `tmp/qa/apps-production/admin-dashboard.png`
- `tmp/qa/apps-production/owner-dashboard.png`
- `tmp/qa/apps-production/guest-stay.png`

Supabase-Datensätze:
- Admin-Testlogin `auszeiten@getmorrow.de` geprüft; `npm run supabase:verify-admin` grün per Login/RPC: Rolle `owner`, Status `active`, Kern-Tabellen lesbar.
- Guest-Testbuchung `30b9ff18-03f0-49fd-af4d-b5f6947114a4` erzeugt; `npm run supabase:verify-guest` grün per RPC: Status `Vor Anreise`, Auszeit `Couple Reset`, Gast `Sophie Krüger`.
- Owner-Testlogin `owner-qa-20260701b@getmorrow.de` erzeugt; `npm run supabase:verify-owner`/`npm run qa:apps` grün per Login/RPC: Owner-App erreichbar und Dashboard sichtbar.
- Block-2-Testfluss `30b9ff18-03f0-49fd-af4d-b5f6947114a4` technisch grün: Lead, Follow-up, Archiv/Reaktivierung, Buchung, Kunde, Aufgabe und Aufgabenbezug wurden über Supabase/Admin-Zugriff geprüft.
- Block-3-Testfluss `30b9ff18-03f0-49fd-af4d-b5f6947114a4` technisch grün: `support_messages`, `guest_feedback` und `communication_events` sind an Buchung/Lead gekoppelt und über Gäste- sowie Admin-Zugriff lesbar.

E-Mail-/Communication-Events:
- Support-Antwort: `5f27bdff-58a7-4f3d-aa6b-fa1e9d5e4ee9`, `event_type=support:qa-block3-support-30b9ff18-03f0-49fd-af4d-b5f6947114a4`, Kanal `email`, Status `sent`.
- Feedback-Historie: `998aa813-a7c5-46a7-a7ba-e84e957e6e81`, `event_type=guest_feedback`, Kanal `app`, Status `recorded`.

Audit-Log-Einträge:
- Audit-Baseline statisch geprüft: `npm run qa:admin-audit` meldet `admin-audit-coverage-ok: 34 mutating functions write audit logs`.
- Block-2-Audits: `2b10611d-347e-4a86-ac19-6dfb2cf04259`, `13c72c5d-ef36-4582-b8d9-241c572b9732`, `2724814a-ed7f-4893-9050-e7ec8568d271`, `c0a4c7e3-d371-45b2-80cc-c3cd54f7aaf4`, `1c3b8efc-36c6-41c6-ab66-7f11cbf095c5`.

Offene Blocker:
- `npm run qa:readiness` rot: Admin-Paritätslauf nicht grün, Rechtstexte/Secrets/Angebotsdaten/Tracking offen.
- `npm run qa:admin-parity:preflight` grün mit Admin-, Gäste- und Owner-App-URL, Admin-Testlogin, Guest-Testbuchung und Owner-Testlogin.
- `npm run qa:launch-gates` rot: 6 Blocker, darunter Rechtstexte/Arbeitsfassungen, Rechtsfreigabe, Secret-Rotation und Angebotsfreigabe.
- `npm run qa:apps` grün: `checkedApps: 3`, Admin-Login, Owner-Login und Guest-Stay geprüft.
- Live-Routing geprüft: `https://www.getmorrow.de/health` meldet `app=web`; App-Redirects zeigen auf Admin-, Gäste- und Owner-App.
- Manuelle Gates 2-14 und 24 sind technisch grün; Gates 15-22 noch nicht durchgeführt und ohne Evidenz.
- Beobachtetes Schema-Risiko: Die Live-API akzeptierte `support_messages.customer_id` nicht (`PGRST204`), obwohl einige Codepfade Kontextfelder erwarten. Block 3 nutzt daher Buchung/Lead/Payload als verifizierte Kopplung; Normalisierung von Support-Kontextfeldern bleibt zu prüfen.

## Bewertung

Ergebnis: Rot

Begründung: App-URLs, Testzugänge sowie Block 1, Block 2 und Block 3 sind technisch grün. Der Lauf bleibt rot, weil Bestand und Owner-Flows in Gates 15-22 noch nicht mit Evidenz abgenommen sind und Recht/Freigaben weiter offen sind.

Freigabe für echte Leads: Nein

Freigabe für zahlende Gäste: Nein

Nächste Korrekturen:
- 
