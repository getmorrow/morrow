# Morrow Launch Status Snapshot

Stand: 2026-06-30

Dieser Snapshot hält den aktuellen Go-/No-Go-Stand nach der Verschärfung von `qa:apps` fest. Er ersetzt nicht `docs/ADMIN_PARITY_QA_RUNBOOK.md`, sondern zeigt, welche Gates heute noch blockieren.

## Kurzfazit

Morrow ist weiterhin öffentlich erreichbar und technisch weit, aber noch nicht für einen voll freigegebenen MVP-Start mit zahlenden Gästen bereit.

Aktueller Status:

- Öffentliche Website: Production-Basischeck grün.
- Admin-Paritätslauf: angelegt, aber rot/offen.
- Admin-Paritäts-Statusreport: grün ausführbar; zeigt aktuell 4 offene automatische Gates, 24 offene manuelle Gates und 24 fehlende Gate-Evidenzen.
- Admin-Paritäts-Strukturcheck: grün; strukturelle Abdeckung ersetzt keine manuelle Abnahme.
- Prototyp-Speicher-Inventar: grün; alte Vite-LocalStorage- und Fallback-Datenflüsse sind dokumentiert, aber nicht produktiv führend.
- Launch-Gates: rot durch 11 Blocker.
- App-QA: rot, weil Admin-, Gäste- und Owner-App-URLs nicht gesetzt sind.
- App-Deployment-Konfiguration: gruen pruefbar im Repo; echte App-Deployments/URLs fehlen trotzdem.
- Paid Ads: nicht freigeben.
- Zahlende Gäste: nicht freigeben.
- Kontrollierte echte Leads: erst nach rechtlicher/env-seitiger Mindestbereinigung und mindestens gelbem Admin-Paritätslauf.

## Ausgeführte Checks

### `npm run qa:readiness`

Ergebnis: rot.

```text
ok: false
latestAdminParityRun: docs/qa/admin-parity/2026-06-30-admin-parity-run.md
adminParityResult: Offen
openRunbookManualGates: 24
uncheckedRunbookTemplateItems: 37
openParityRunManualGates: 24
uncheckedParityRunItems: 12
missingParityRunEvidenceRows: 24
legalPlaceholderFiles: 3
blockerGroups: 7
```

Blockergruppen:

- Admin-Paritätslauf unter `docs/qa/admin-parity/2026-06-30-admin-parity-run.md` ist vorhanden, aber nicht grün: 12 automatische Gates offen, 24 manuelle Gates offen, 24 Evidenzen fehlen.
- Rechtstexte/Freigaben noch nicht sauber.
- Supabase Public Env im aktuellen Gate-Kontext nicht gesetzt.
- Admin-, Gäste- und Owner-App-URLs im aktuellen Gate-Kontext nicht gesetzt.
- Secret-Rotation nicht bestätigt.
- Angebotsdaten nicht freigegeben.
- Tracking/Consent nicht freigegeben oder nicht konfiguriert.

Dieser Check ist die kompakte Startstufen-Ampel für:

- interne Tests
- kontrollierte echte Leads
- zahlende Gäste
- Paid Ads

### `npm run qa:admin-parity:preflight`

Ergebnis: rot.

Detail-Fixliste: `docs/ADMIN_PARITY_PREFLIGHT_FIXLIST_2026-06-30.md`

Vorhanden:

- Supabase Public URL lokal gesetzt.
- Supabase anon key lokal gesetzt.

Vorbereitet:

- Admin-Testlogin `auszeiten@getmorrow.de`; `npm run supabase:verify-admin` ist per Login/RPC grün.
- Guest-Testbuchung `e44489db-70ec-4935-8007-588985f2fb63` mit Access-Code `QA7509EE93`; `npm run supabase:verify-guest` ist per RPC grün.
- Owner-Testlogin `owner-qa-20260630@getmorrow.de`; `npm run supabase:verify-owner` ist per Login/RPC grün.

Fehlend:

- Admin-App-URL.
- Gäste-App-URL.
- Owner-App-URL.

Live-Routing-Evidenz:

- `https://www.getmorrow.de/health` ist grün und meldet `app=web`.
- `https://www.getmorrow.de/admin`, `/deine-auszeit`, `/owner` und `/app/eigentuemer` liefern aktuell HTTP 404.
- Die App-Pfade der Website ersetzen deshalb keine eigenen Admin-/Gaeste-/Owner-App-URLs.

### `npm run qa:migration-consolidation`

Ergebnis: rot.

```text
ok: false
blockers: 1
passed: 24
```

Blocker:

- Der neueste Admin-Paritätslauf `docs/qa/admin-parity/2026-06-30-admin-parity-run.md` ist noch nicht validiert grün.
- Ergebnis steht auf `Offen`.
- 12 automatische Gates sind nicht abgehakt.
- 24 manuelle Gates stehen auf `Offen`.
- 24 manuelle Gates haben noch keine Evidenz.

### `npm run qa:admin-parity:status`

Ergebnis: grün ausführbar, aber Status des Laufes rot.

```text
file: docs/qa/admin-parity/2026-06-30-admin-parity-run.md
result: Rot
automaticOpen: 4
manualOpen: 24
manualMissingEvidence: 24
evidenceSectionsFilled: 1
nextBlock: Zugang Und Baseline
```

Offene automatische Gates:

- `npm run qa:admin-parity:preflight`
- `npm run qa:readiness`
- `npm run qa:launch-gates`
- `npm run qa:apps`

Wichtig: Der Statusreport ist nur eine Arbeitsliste. Er ersetzt nicht `npm run qa:admin-parity:validate` und gibt keine Launch-Freigabe.
Der nächste abzuarbeitende Block ist aktuell `Zugang Und Baseline`: Admin-Login und Audit-Log-Baseline müssen zuerst mit Evidenz belegt werden.

### `npm run qa:admin-parity:block1`

Ergebnis im aktuellen lokalen Shell-Kontext: rot.

Blocker:

- `npm run supabase:verify-admin` kann ohne `ADMIN_EMAIL` und `ADMIN_PASSWORD` im aktuellen Shell-Kontext nicht laufen.
- Supabase Public URL und anon key werden inzwischen aus `.env.local` gelesen.
- `npm run qa:admin-audit` bleibt der statische Teil fuer Audit-Abdeckung und ist separat gruen dokumentiert.

Wichtig: Dieser Block-1-Check ist nur technische Vorpruefung fuer `Zugang Und Baseline`. Die eigentliche Abnahme braucht weiterhin Screenshot Admin-Dashboard, Admin-User/Rolle und Audit-Log-Evidenz im Paritaetsprotokoll.

### `npm run qa:admin-parity:structure`

Ergebnis: grün.

Dieser Check prüft strukturell:

- alle 13 alten Vite-Admin-Bereiche aus `src/App.tsx`,
- Zuordnung zu Next-Admin-Workspaces,
- sichtbare UI-Anker,
- erwartete Supabase-Tabellen,
- Dokumentation in Paritäts- oder Migrationsdoku.

Wichtig: Dieser Check verhindert stilles Weglassen, ersetzt aber nicht die manuelle Admin-Paritätsabnahme mit echten Workflows.

### `npm run qa:prototype-storage`

Ergebnis: grün.

```text
ok: true
blockers: 0
passed: 55
```

Dieser Check prüft:

- bekannte Vite-LocalStorage-Keys aus dem alten Prototyp,
- dokumentierte Prototyp-Fallbacks in `docs/PROTOTYPE_STORAGE_INVENTORY.md`,
- wichtige alte Adaptertabellen aus `src/lib/morrowBackend.ts`,
- die Verknüpfung des Speicherinventars mit dem Konsolidierungs-Audit.

Wichtig: Dieser Check ist ein Konsolidierungsschutz. Er bedeutet nicht, dass der alte Prototyp produktiv führend bleibt. Operative Zielstruktur bleibt Supabase plus `apps/admin`.

### `npm run qa:launch-gates`

Ergebnis: rot.

```text
ok: false
blockers: 11
warnings: 3
passed: 35
exit: 1
```

Blocker:

| Bereich | Blocker |
| --- | --- |
| Recht | Impressum enthält noch Arbeits-/Platzhalterhinweise. |
| Recht | AGB enthält noch `Arbeitsfassung`. |
| Recht | Stornobedingungen enthält noch `Arbeitsfassung`. |
| Freigabe | `MORROW_LEGAL_APPROVED_AT` fehlt. |
| Env | `NEXT_PUBLIC_SUPABASE_URL` oder `VITE_SUPABASE_URL` fehlt im aktuellen Gate-Kontext. |
| Env | `NEXT_PUBLIC_SUPABASE_ANON_KEY` oder `VITE_SUPABASE_ANON_KEY` fehlt im aktuellen Gate-Kontext. |
| Env | `MORROW_ADMIN_APP_URL` fehlt. |
| Env | `MORROW_GUEST_APP_URL` fehlt. |
| Env | `MORROW_OWNER_APP_URL` fehlt. |
| Sicherheit | `MORROW_SECRETS_ROTATED_AT` fehlt nach Secret-Rotation. |
| Angebot | `MORROW_OFFER_DATA_APPROVED_AT` fehlt nach finaler Angebotsfreigabe. |

Warnings:

| Bereich | Warning |
| --- | --- |
| Tracking | `NEXT_PUBLIC_GA_MEASUREMENT_ID` fehlt. |
| Tracking | `NEXT_PUBLIC_META_PIXEL_ID` fehlt. |
| Freigabe | `MORROW_TRACKING_APPROVED_AT` fehlt. |

### `QA_BASE_URL=https://www.getmorrow.de npm run qa:production`

Ergebnis: grün.

```text
ok: true
checkedPages: 12
checkedForms: 4
```

Nicht geprüft:

- App-Redirects, weil `MORROW_ADMIN_APP_URL`, `MORROW_GUEST_APP_URL` und `MORROW_OWNER_APP_URL` fehlen.
- Consent-Banner, weil keine GA-/Meta-IDs gesetzt sind.
- Echter Lead-Submit, weil `MORROW_QA_SUBMIT_LEAD` nicht aktiviert war.

Screenshot:

- `tmp/qa/production-rehearsal/family-form-mobile.png`

### `npm run qa:apps`

Ergebnis: rot.

```text
ok: false
checkedApps: 0
reason: No app base URLs set. Provide ADMIN_BASE_URL, OWNER_BASE_URL and/or GUEST_BASE_URL.
exit: 1
```

Aktuelle Regel:

- Ohne App-URLs ist `qa:apps` rot.
- Mit nur einem oder zwei App-URLs ist `qa:apps` ebenfalls rot.
- Vollständige App-QA verlangt Admin-, Gäste- und Owner-App.
- Teilprüfungen sind nur bewusst mit `MORROW_QA_ALLOW_PARTIAL_APPS=1` möglich und gelten nicht als Launch-Abnahme.

### `npm run qa:app-deployment-config`

Ergebnis: gruen.

Dieser Check prueft nur die lokale Deployment-Basis:

- `apps/web`, `apps/admin`, `apps/guest` und `apps/owner` haben eigene Vercel-Konfigurationen.
- Die Build Commands zeigen auf das jeweilige Workspace-Package.
- Jede App hat einen `/health`-Endpoint mit passender App-ID.

Wichtig:

- Das beweist nicht, dass die Apps live erreichbar sind.
- Die Live-Pruefung bleibt `npm run qa:apps` mit echten `ADMIN_BASE_URL`, `GUEST_BASE_URL` und `OWNER_BASE_URL`.
- Aktuell ist diese Live-Pruefung weiter rot, weil die App-URLs fehlen.

## Bewertung Nach Startstufe

| Startstufe | Status | Begründung |
| --- | --- | --- |
| Interne Tests | Grün | Lokale Checks und Doku-Gates laufen; Runbook ist vorbereitet. |
| Öffentliche Website live sichtbar | Grün/Gelb | Website ist erreichbar, aber Rechtstexte, Env und Freigaben sind offen. |
| Kontrollierte echte Leads | Rot | Erst nach rechtlicher Mindestbereinigung, App-URLs und Admin-Paritätslauf mindestens gelb. |
| Zahlende Gäste | Rot | Admin-Paritätsrun muss grün sein; App-QA, Recht, Secrets und Angebotsdaten müssen abgeschlossen sein. |
| Paid Ads | Rot | Tracking/Consent, Recht, Conversion-Messung und Angebotsfreigabe sind nicht final. |

## Nächste Konsolidierungsschritte

### Reihenfolge Bis Kontrollierte Echte Leads

1. App-Projekt-URLs für Admin, Gäste und Owner final in Vercel setzen und in `.env.local`/Shell für QA hinterlegen.
2. Testdaten für den Paritätslauf vorbereiten: Admin-Testlogin, Guest-Testbuchung mit Access-Code, Owner-Testlogin.
3. `npm run qa:admin-parity:preflight` grün bekommen.
4. `docs/ADMIN_PARITY_EXECUTION_PLAN.md` mit echten Testdaten abarbeiten und `docs/qa/admin-parity/2026-06-30-admin-parity-run.md` mit Evidenz füllen.
5. Rechtstexte und Impressum aus Arbeitsfassung/Platzhalterstatus bringen.
6. Supabase Public Env im Launch-Gate-Kontext setzen.
7. `npm run qa:admin-parity:validate`, `npm run qa:readiness`, `npm run qa:migration-consolidation`, `npm run qa:launch-gates`, `QA_BASE_URL=https://www.getmorrow.de npm run qa:production` und `npm run qa:apps` erneut ausführen.

### Danach Erst Für Zahlende Gäste

1. Geteilte Secrets rotieren und `MORROW_SECRETS_ROTATED_AT` erst danach setzen.
2. Finale Angebotsdaten freigeben und `MORROW_OFFER_DATA_APPROVED_AT` setzen.
3. Tracking-/Consent-Entscheidung treffen und bei Bedarf GA/Meta-IDs testen.
4. Admin-Paritätslauf auf `Grün` bringen; `Gelb` reicht höchstens für kontrollierte echte Leads, nicht für zahlende Gäste.
