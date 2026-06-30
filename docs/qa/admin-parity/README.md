# Admin Parity QA Runs

Hier werden konkrete Admin-Paritaetslaeufe abgelegt.

Neues Protokoll erzeugen:

```bash
npm run qa:admin-parity:new
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
