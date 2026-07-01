# Morrow Launch Status Snapshot

Stand: 2026-07-01

Dieser Snapshot dokumentiert den aktuellen Go-/No-Go-Stand nach Abschluss der manuellen Admin-Paritaetsbloecke 1 bis 5 und nach der Vereinheitlichung der QA-Env-Ladung fuer App-Production-Checks.

## Kurzfazit

Morrow ist als öffentliche Website erreichbar und die Next-/Supabase-Plattform ist technisch weit. Für einen operativen MVP-Start mit echten zahlenden Gästen ist die Plattform aber weiterhin nicht freigegeben.

Aktueller Status:

- Interne Tests: grün
- Kontrollierte echte Leads: rot
- Zahlende Gäste: rot
- Paid Ads: rot

Hauptgrund: Die manuelle Admin-CRM-Parität ist technisch belegt, aber die finalen Launch-Gates fuer Recht, Secret-Rotation, Angebotsfreigabe und Tracking sind noch nicht geschlossen. `apps/admin` ist als Ziel-App fachlich naheliegend, wird aber erst nach Block 6/finalen Gates als alleinige produktive Quelle der Wahrheit freigegeben.

Einordnung der Entfernung zum Start:

- Oeffentliche Website: technisch live, aber Launch-Gates fuer Recht, finale Freigaben und Tracking noch rot.
- App-Fundament: lokal konsistent; `npm run qa:app-deployment-config`, `npm run qa:apps` und die Health-Endpunkte fuer Web/Admin/Guest/Owner sind gruen, sobald die QA-URLs gesetzt sind.
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

### `npm run qa:apps`

Ergebnis: gruen fuer alle drei App-URLs.

```text
checkedApps: 3
partial: false
missingApps: []
```

Mit gesetzten QA-Zugangsdaten wurden Admin-, Owner- und Guest-Flows zusaetzlich isoliert geoeffnet. Dabei fiel ein Owner-App-Bildpfad aus Supabase-Payload auf, der live auf ein nicht vorhandenes Legacy-Asset zeigte. Der Owner-Code normalisiert solche Legacy-Bildpfade jetzt auf ein vorhandenes Owner-App-Fallback-Asset; der Fix ist nach Deployment live zu pruefen.


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
```

Blockergruppen:

- Rechtstexte enthalten keine erkannten Platzhalter mehr; die echte Rechtsfreigabe fehlt noch.
- Secret-Rotation ist nicht bestätigt.
- Angebotsdaten sind nicht final freigegeben.
- Tracking/Consent ist nicht freigegeben oder nicht vollständig konfiguriert.

### `npm run qa:launch-gates`

Ergebnis: rot.

```text
blockers: 3
warnings: 4
passed: 42
```

Blocker:

- `MORROW_LEGAL_APPROVED_AT` fehlt.
- `MORROW_SECRETS_ROTATED_AT` fehlt.
- `MORROW_OFFER_DATA_APPROVED_AT` fehlt.

Warnings:

- GA4 fehlt.
- Meta Pixel fehlt.
- Tracking-Freigabe fehlt.
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
- Tracking-/Consent-Entscheidung treffen und, falls aktiv, GA4/Meta IDs setzen.
- Nach Deployment den Owner-App-Bildfallback mit `qa:apps` erneut gegen Production pruefen.

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
