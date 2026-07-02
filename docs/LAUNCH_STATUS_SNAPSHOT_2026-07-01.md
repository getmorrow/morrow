# Morrow Launch Status Snapshot

Stand: 2026-07-02

Dieser Snapshot dokumentiert den aktuellen Go-/No-Go-Stand nach Abschluss der manuellen Admin-Paritaetsbloecke 1 bis 5, nach der deutschen Plattform-Routing-Freigabe unter `www.getmorrow.de` und nach Live-Testlead/Backup-Probe.

## Kurzfazit

Morrow ist als öffentliche Website erreichbar und die Next-/Supabase-Plattform ist technisch weit. Für einen operativen MVP-Start mit echten zahlenden Gästen ist die Plattform aber weiterhin nicht freigegeben.

Aktueller Status:

- Interne Tests: grün
- Kontrollierte echte Leads: rot
- Zahlende Gäste: rot
- Paid Ads: rot

Hauptgrund: Die manuelle Admin-CRM-Parität, das Plattform-Routing, die Live-Lead-Erfassung und ein Supabase-Backup sind technisch belegt, aber die finalen Launch-Gates fuer Recht, Secret-Rotation, Angebotsfreigabe und Tracking sind noch nicht geschlossen.

Einordnung der Entfernung zum Start:

- Oeffentliche Website: technisch live, aber Launch-Gates fuer Recht, finale Freigaben und Tracking noch rot.
- App-Fundament: live unter der deutschen Plattformstruktur erreichbar; `npm run qa:production` prueft `/admin`, `/app/gast`, `/app/eigentuemer` und die Legacy-Redirects erfolgreich gegen `https://www.getmorrow.de`.
- Live-Lead-Erfassung: echter QA-Testlead ueber `www.getmorrow.de` wurde in Supabase inklusive Attribution verifiziert und danach archiviert.
- Backup/Recovery: technischer Supabase-Probeexport vom 2026-07-02 war erfolgreich.
- Operativer MVP: noch nicht freigegeben, weil Recht/Secrets/Angebotsfreigabe/Tracking und die finale Bewertung offen sind.
- Zahlende Gaeste und Paid Ads: noch nicht freigegeben.

## Aktuelle QA-Ergebnisse

### `npm run qa:admin-parity:status`

Ergebnis: technisch lesbar, Gesamtbewertung weiter rot.

```text
manualGates: 24
manualOpen: 0
manualMissingEvidence: 0
automaticOpen:
- npm run qa:readiness
- npm run qa:launch-gates
nextBlock: Finale Bewertung
```

Einordnung:

- Die manuellen Gates 1 bis 24 sind technisch gruen dokumentiert.
- Block 5 Owner-App ist mit Owner-Profil, Objektzugriff, Dokument, Abrechnung, Operation und Audit-Evidenz abgeschlossen.
- Der Admin-Paritaetslauf bleibt rot, weil die automatischen finalen Gates noch nicht abgehakt werden duerfen.

### Live `npm run qa:production`

```text
baseUrl: https://www.getmorrow.de
checkedPages: 12
checkedForms: 4
appRoutes: admin, guest, owner
redirects: 4
leadVerification: true
```

Geprueft:

- `https://www.getmorrow.de`
- `https://www.getmorrow.de/admin`
- `https://www.getmorrow.de/app/gast`
- `https://www.getmorrow.de/app/eigentuemer`
- Redirect `/deine-auszeit/...` -> `/app/gast/deine-auszeit/...`
- Redirect `/owner` -> `/app/eigentuemer`
- Redirect `/app/guest` -> `/app/gast`
- Redirect `/app/owner` -> `/app/eigentuemer`
- echter Testlead mit Quelle `qa`, Medium `rehearsal`, Kampagne `production-rehearsal-20260702073619` und Formular `Auszeit anfragen`; Lead `50dfe27d-0649-4d70-82cd-674208001f0e` wurde danach archiviert.

### Live `npm run qa:apps`

Ergebnis: gruen fuer alle drei App-Projekte nach BasePath-Asset-Fix.

```text
checkedApps: 3
partial: false
missingApps: []
admin: health ok, landing ok
guest: health ok, landing ok
owner: health ok, landing ok
```

Einordnung:

- Direkte Vercel-App-Origins werden im QA-Script automatisch auf die jeweiligen BasePaths normalisiert.
- Admin-, Guest- und Owner-App laden Logo/Fonts nicht mehr aus Root-Pfaden.
- Login-/persoenliche Stay-Pruefungen wurden in diesem Lauf uebersprungen, weil keine `ADMIN_EMAIL`/`ADMIN_PASSWORD`, `OWNER_EMAIL`/`OWNER_PASSWORD` und `GUEST_BOOKING_ID`/`GUEST_ACCESS_CODE` in `.env.local` gesetzt waren.

### Supabase Backup-Probe

Ergebnis: gruen.

```text
backupDir: backups/supabase/2026-07-02T07-40-10-178Z
tables: 22
rows: 153
failed: 0
```

Einordnung:

- `manifest.json` wurde maschinell geprueft.
- `backups/` ist von Git ignoriert.
- Das Runbook `docs/SUPABASE_BACKUP_RECOVERY_RUNBOOK.md` wurde auf die tatsaechliche Tabellenliste aktualisiert.


### `npm run qa:readiness`

Ergebnis: rot.

```text
internalTesting: green
controlledRealLeads: red
paidGuests: red
paidAds: red
blockers: 4
legalPlaceholderFiles: 0
openRunbookManualGates: 24
uncheckedRunbookTemplateItems: 42
openParityRunManualGates: 0
missingParityRunEvidenceRows: 0
trackingModeKnown: false
trackingDecisionApproved: false
```

Blockergruppen:

- Rechtstexte enthalten keine erkannten Platzhalter mehr; die echte Rechtsfreigabe fehlt noch.
- Secret-Rotation ist nicht bestätigt.
- Angebotsdaten sind nicht final freigegeben.
- Tracking/Consent ist noch nicht entschieden: `MORROW_TRACKING_MODE` und `MORROW_TRACKING_APPROVED_AT` fehlen.

### `npm run qa:launch-gates`

Ergebnis: rot.

```text
blockers: 3
warnings: 3
passed: 42
```

Blocker:

- `MORROW_LEGAL_APPROVED_AT` fehlt.
- `MORROW_SECRETS_ROTATED_AT` fehlt.
- `MORROW_OFFER_DATA_APPROVED_AT` fehlt.

Warnings:

- Tracking-Modus fehlt: `MORROW_TRACKING_MODE=enabled` oder `disabled`.
- Tracking-Freigabe fehlt: `MORROW_TRACKING_APPROVED_AT`.
- Server-Secret ist im lokalen Shell-/Env-Kontext vorhanden und darf nicht in Frontend-Projekte gelangen.

### `npm run qa:migration-consolidation`

Ergebnis: grün.

```text
passed: 80
warnings: 0
blockers: 0
```

Konsolidierungsstatus:

- `npm run qa:migration-consolidation` ist gruen: 0 Blocker, 0 Warnungen, 80 bestandene Pruefungen.
- Der neueste Admin-Paritätslauf `docs/qa/admin-parity/2026-06-30-admin-parity-run.md` beweist 24/24 manuelle Gates mit Evidenz.
- Die Launch-Freigabe bleibt davon getrennt und weiter rot, bis Recht/Freigaben, Secret-Rotation, Angebotsdaten und Tracking/Consent geschlossen sind.

Die Strukturpruefungen sichern inzwischen nicht nur die Konsolidierungsdokumente und Scripts ab, sondern auch:

- die automatischen Admin-Paritaets-Gates `block1` bis `block5` in Runbook und Protokollgenerator,
- die gezielten QA-Selectoren `QA_BLOCK2_*`, `QA_BLOCK4_*` und `QA_BLOCK5_*` im Env-Template,
- die erweiterten Testdatenlabels fuer Erlebnisbaustein, Vor-Ort-Ort, Veranstaltung und Owner-Daten.

## Nächster Abnahmeblock

Aus `npm run qa:admin-parity:status`:

- Nächster Block: `Finale Bewertung`
- Offene manuelle Gates: keine
- Offene automatische Gates: `npm run qa:readiness`, `npm run qa:launch-gates`

Vor einem echten Start muessen zuerst erledigt und belegt werden:

- Rechtstexte rechtlich/fachlich freigeben; die oeffentlichen Platzhaltertexte sind bereinigt, aber die Freigabevariable bleibt bis zur echten Freigabe leer.
- Geteilte Secrets rotieren und Freigabezeitpunkt setzen.
- Angebotsdaten final pruefen: Termine, Preise, enthaltene Leistungen, Bildrechte, Verantwortlichkeit.
- Tracking-/Consent-Entscheidung treffen: `MORROW_TRACKING_MODE=disabled` fuer Start ohne Paid Ads oder `enabled` mit GA4/Meta IDs fuer Paid Ads.
- Optional: `qa:apps` mit echten Admin-/Owner-/Guest-Testzugängen gegen die App-Domains wiederholen, falls an App-Login/Portal-Flows erneut gearbeitet wird.

Danach:

```bash
npm run qa:readiness
npm run qa:launch-gates
npm run qa:admin-parity:status
```

Erst wenn diese Gates gruen sind, darf das Protokoll von `Rot` auf eine Startfreigabe umgestellt werden.

## Bewertung

Ergebnis: Rot

Freigabe für echte Leads: Nein

Freigabe für zahlende Gäste: Nein

Freigabe für Paid Ads: Nein
