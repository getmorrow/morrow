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

Hauptgrund: Die manuelle Admin-CRM-Parität, das Plattform-Routing, die Live-Lead-Erfassung, normalisierte Lead-Attribution und ein Supabase-Backup sind technisch belegt, aber die finalen Launch-Gates fuer Recht, Secret-Rotation, Angebotsfreigabe und Tracking-/Consent-Entscheidung sind noch nicht geschlossen.

Einordnung der Entfernung zum Start:

- Oeffentliche Website: technisch live, aber Launch-Gates fuer Recht, finale Freigaben und Tracking noch rot.
- App-Fundament: live unter der deutschen Plattformstruktur erreichbar; `npm run qa:production` prueft `/admin`, `/app/gast`, `/app/eigentuemer` und die Legacy-Redirects erfolgreich gegen `https://www.getmorrow.de`.
- Live-Lead-Erfassung: echter QA-Testlead ueber `www.getmorrow.de` wurde in Supabase inklusive Attribution verifiziert und danach archiviert.
- Lead-Attribution: neue Anfragen speichern Quelle, Kampagne, Medium, Content, Term, Referrer, Landingpage, aktuellen Pfad, Klick-IDs und CTA-Ausloeser normalisiert auf `leads`; alte Payload-Werte bleiben als Fallback vorhanden.
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

Ergebnis: gruen fuer alle drei App-Projekte nach BasePath-Asset-Fix und nach zusaetzlichem Full-App-Check ueber die finale Plattformstruktur.

```text
checkedApps: 3
partial: false
missingApps: []
admin: health ok, landing ok, login/dashboard ok
guest: health ok, landing ok, stay ok
owner: health ok, landing ok, login/dashboard ok
```

Einordnung:

- Direkte Vercel-App-Origins werden im QA-Script automatisch auf die jeweiligen BasePaths normalisiert.
- Admin-, Guest- und Owner-App laden Logo/Fonts nicht mehr aus Root-Pfaden.
- Der zusaetzliche Full-App-Lauf am 2026-07-02 nutzte `https://www.getmorrow.de/admin`, `https://www.getmorrow.de/app/eigentuemer` und `https://www.getmorrow.de/app/gast` als Base-URLs. Admin-Login/Dashboard, Owner-Login/Dashboard und ein persoenlicher Guest-Stay mit Supabase-Testbuchung wurden in einem gemeinsamen Lauf geprueft.
- Zugehoerige Evidence liegt in `docs/qa/workflow-ux-final-2026-07-02/`: `admin-13-www-full-qa-dashboard-desktop.png`, `owner-08-www-full-qa-dashboard-desktop.png`, `guest-09-www-full-qa-stay-mobile.png`.
- Nach dem Full-App-Lauf waren `npm run qa:production`, `npm run typecheck`, `npm run lint` und `git diff --check` gruen.

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

### Lead-Attribution

Ergebnis: technisch vorbereitet, Consent-/Tracking-Freigabe weiter offen.

```text
remote migration: 202607020001_leads_attribution_fields.sql
normalized fields: source, campaign, medium, content, term, referrer, landing_path, current_path, gclid, fbclid, conversion_event, conversion_label, conversion_path
```

Einordnung:

- Website-Leads speichern Attribution nicht mehr nur verschachtelt im Payload, sondern auch normalisiert auf `leads`.
- Alte Leads werden aus vorhandenen Payload-Werten zurückbefuellt, soweit Daten vorhanden sind.
- Das Admin-Detail liest die normalisierten Werte bevorzugt und nutzt Payload nur als Fallback.
- `npm run qa:launch-gates` prueft jetzt, dass das Formular die normalisierten Attributionsfelder schreibt.
- Die Marketing-/Consent-Entscheidung bleibt davon getrennt: GA4/Meta/Ads-Tracking wird erst nach Freigabe aktiviert.


### `npm run qa:readiness`

Ergebnis: rot, zuletzt erneut nach dem Full-App-Lauf am 2026-07-02 geprueft.

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

Ergebnis: rot, zuletzt erneut nach dem Full-App-Lauf am 2026-07-02 geprueft.

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

### `npm run qa:app-deployment-config`

Ergebnis: grün.

```text
checkedApps: web, admin, guest, owner
blockers: 0
passed: 16
```

Geprüft:

- Web-, Admin-, Guest- und Owner-App nutzen das erwartete Next.js-Deployment-Setup.
- Install-/Build-Commands sind monorepo-sicher und zielen auf die richtigen Workspaces.
- Health-Routen identifizieren die jeweilige App korrekt.

### Frische Workspace-Builds

Ergebnis: grün.

```bash
npm run -w @morrow/web build
npm run -w @morrow/admin build
npm run -w @morrow/guest build
npm run -w @morrow/owner build
```

Alle vier Next-Apps bauen aus dem aktuellen Stand erfolgreich. Der Root-`npm run build` baut weiterhin den eingefrorenen Vite-Prototyp und ist nicht der fuehrende Produktionsnachweis fuer die neue Plattformarchitektur.

## Nächster Abnahmeblock

Aus `npm run qa:admin-parity:status`:

- Nächster Block: `Finale Bewertung`
- Offene manuelle Gates: keine
- Offene automatische Gates: `npm run qa:readiness`, `npm run qa:launch-gates`

Vor einem echten Start muessen zuerst erledigt und belegt werden:

- Rechtstexte rechtlich/fachlich freigeben; die oeffentlichen Platzhaltertexte sind bereinigt, aber die Freigabevariable bleibt bis zur echten Freigabe leer.
- Geteilte Secrets rotieren und Freigabezeitpunkt setzen.
- Angebotsdaten final pruefen: Termine, Preise, enthaltene Leistungen, Bildrechte, Verantwortlichkeit.
- Tracking-/Consent-Entscheidung treffen: `MORROW_TRACKING_MODE=disabled` fuer Start ohne Paid Ads oder `enabled` mit GA4/Meta IDs fuer Paid Ads. Die technische Lead-Attribution ist vorbereitet; die Consent- und Werbetracking-Freigabe bleibt separat offen.
- App-Workflows erneut nur dann wiederholen, wenn an Admin-, Owner- oder Guest-App wieder Code geändert wird. Der aktuelle Full-App-Lauf über `www.getmorrow.de` ist grün belegt.

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
