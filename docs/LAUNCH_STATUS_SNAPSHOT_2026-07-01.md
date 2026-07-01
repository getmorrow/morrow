# Morrow Launch Status Snapshot

Stand: 2026-07-01

Dieser Snapshot dokumentiert den aktuellen Go-/No-Go-Stand nach der Vereinheitlichung der QA-Env-Ladung in `scripts/lib/qa-env.mjs`.

## Kurzfazit

Morrow ist als öffentliche Website erreichbar und die Next-/Supabase-Plattform ist technisch weit. Für einen operativen MVP-Start mit echten zahlenden Gästen ist die Plattform aber weiterhin nicht freigegeben.

Aktueller Status:

- Interne Tests: grün
- Kontrollierte echte Leads: rot
- Zahlende Gäste: rot
- Paid Ads: rot

Hauptgrund: Die Admin-CRM-Parität ist noch nicht mit aktueller Evidenz bewiesen. `apps/admin` bleibt Ziel-App, aber noch nicht alleinige produktive Quelle der Wahrheit.

## Aktuelle QA-Ergebnisse

### `npm run qa:admin-parity:preflight`

Ergebnis: rot.

Vorhanden:

- `.env.local` wird gelesen.
- Supabase Public URL ist gesetzt.
- Supabase anon key ist gesetzt.

Fehlend:

- `ADMIN_BASE_URL` oder `MORROW_ADMIN_APP_URL`
- `GUEST_BASE_URL` oder `MORROW_GUEST_APP_URL`
- `OWNER_BASE_URL` oder `MORROW_OWNER_APP_URL`
- `ADMIN_EMAIL` und `ADMIN_PASSWORD`
- `GUEST_BOOKING_ID` und `GUEST_ACCESS_CODE`
- `OWNER_EMAIL` und `OWNER_PASSWORD`

Damit ist noch kein echter Admin-Paritätslauf möglich.

### `npm run qa:admin-parity:block1`

Ergebnis: rot.

Vorhanden:

- Supabase Public URL und anon key werden erkannt.
- `npm run qa:admin-audit` ist grün: 34 mutierende Admin-Funktionen schreiben Audit-Logs.

Blocker:

- `ADMIN_EMAIL` fehlt.
- `ADMIN_PASSWORD` fehlt.
- `npm run supabase:verify-admin` wird deshalb übersprungen.

Block 1 `Zugang Und Baseline` bleibt offen, bis Admin-Login/Rolle/Tabellenzugriff im aktuellen Lauf geprüft und mit Screenshot/Audit-Evidenz dokumentiert sind.

### `npm run qa:readiness`

Ergebnis: rot.

```text
internalTesting: green
controlledRealLeads: red
paidGuests: red
paidAds: red
blockers: 6
```

Blockergruppen:

- Admin-Paritätslauf ist nicht grün.
- Rechtstexte/Freigaben sind noch nicht sauber.
- App-URLs fehlen.
- Secret-Rotation ist nicht bestätigt.
- Angebotsdaten sind nicht final freigegeben.
- Tracking/Consent ist nicht freigegeben oder nicht vollständig konfiguriert.

### `npm run qa:launch-gates`

Ergebnis: rot.

```text
blockers: 9
warnings: 4
passed: 36
```

Blocker:

- Impressum enthält noch Arbeits-/Platzhalterhinweise.
- AGB enthält noch `Arbeitsfassung`.
- Stornobedingungen enthält noch `Arbeitsfassung`.
- `MORROW_LEGAL_APPROVED_AT` fehlt.
- `MORROW_ADMIN_APP_URL` fehlt.
- `MORROW_GUEST_APP_URL` fehlt.
- `MORROW_OWNER_APP_URL` fehlt.
- `MORROW_SECRETS_ROTATED_AT` fehlt.
- `MORROW_OFFER_DATA_APPROVED_AT` fehlt.

Warnings:

- GA4 fehlt.
- Meta Pixel fehlt.
- Tracking-Freigabe fehlt.
- Server-Secret ist im lokalen Shell-/Env-Kontext vorhanden und darf nicht in Frontend-Projekte gelangen.

### `npm run qa:migration-consolidation`

Ergebnis: rot.

Einziger Konsolidierungsblocker:

- Der neueste Admin-Paritätslauf `docs/qa/admin-parity/2026-06-30-admin-parity-run.md` ist nicht validiert grün.

## Nächster Abnahmeblock

Aus `npm run qa:admin-parity:status`:

- Nächster Block: `Zugang Und Baseline`
- Offene Gates: 1 `Admin-Login`, 23 `Audit-Log`

Vor dem manuellen Test müssen zuerst im aktuellen QA-Kontext gesetzt sein:

- App-URLs für Admin, Gäste-App und Owner-App
- Admin-Testlogin
- Gäste-Testbuchung
- Owner-Testlogin

Danach:

```bash
npm run qa:admin-parity:preflight
npm run qa:admin-parity:block1
npm run qa:admin-parity:status
```

Erst wenn Block 1 mit aktueller Evidenz abgeschlossen ist, wird Block 2 `Anfrage Zu Kunde Und Buchung` begonnen.

## Bewertung

Ergebnis: Rot

Freigabe für echte Leads: Nein

Freigabe für zahlende Gäste: Nein

Freigabe für Paid Ads: Nein

