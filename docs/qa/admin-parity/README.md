# Admin Parity QA Runs

Hier werden konkrete Admin-Paritaetslaeufe abgelegt.

Env-Vorlage fuer den Lauf:

```bash
docs/qa/admin-parity/env.template
```

Neues Protokoll erzeugen:

```bash
npm run qa:admin-parity:new
```

Vorher Voraussetzungen prüfen:

```bash
npm run qa:admin-parity:preflight
```

Blockweise technische Vorchecks ausführen:

```bash
npm run qa:admin-parity:block1
npm run qa:admin-parity:block2
npm run qa:admin-parity:block3
npm run qa:admin-parity:block4
npm run qa:admin-parity:block5
```

Für wiederholbare Läufe können die konkreten Datensätze in `env.template` gesetzt werden, zum Beispiel `QA_BLOCK2_LEAD_ID`, `QA_BLOCK4_PACKAGE_ID` oder `QA_BLOCK5_OWNER_PROFILE_ID`. Ohne diese Werte wählen die Checks die neuesten geeigneten Datensätze und sind dadurch weniger präzise als ein bewusst kuratierter Abnahmelauf.

Neuestes Protokoll validieren:

```bash
npm run qa:admin-parity:validate
```

Ein bestimmtes Protokoll validieren:

```bash
npm run qa:admin-parity:validate -- docs/qa/admin-parity/YYYY-MM-DD-admin-parity-run.md
```

Optional mit Angaben:

```bash
QA_RUN_DATE=2026-06-30 \
QA_TESTER="Gerwin / Codex" \
QA_ENVIRONMENT="Production" \
npm run qa:admin-parity:new
```

Regel:

- Ein Protokoll mit `Ergebnis: Gruen` oder `Ergebnis: Grün` ist Voraussetzung fuer zahlende Gaeste.
- Ein Protokoll mit `Ergebnis: Gelb` kann nur kontrollierte echte Leads erlauben.
- `Ergebnis: Offen` oder `Ergebnis: Rot` blockiert den Start.
- Alle automatischen und manuellen Gates brauchen Evidenz.
- `npm run qa:readiness` akzeptiert nur validierte Protokolle. Ein nur formal vorhandenes Protokoll reicht nicht.
