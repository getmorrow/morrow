# Morrow Migration Completion Audit

Stand: 2026-07-01

Dieses Dokument prüft die ursprüngliche Kurskorrektur gegen den aktuellen Projektstand. Es dient nicht als neue Roadmap, sondern als Nachweis, ob die Konsolidierung schon als abgeschlossen gelten darf.

## Ergebnis

Die Dokumentations- und Entscheidungsbasis der Migration ist hergestellt. Die Konsolidierungsbasis ist hergestellt, weil die Admin-Paritaetsbloecke 1 bis 5 mit 24/24 manuellen Gates und Evidenz im aktuellen Protokoll nachgewiesen sind.

Wichtig: Das ist keine Launch-Freigabe. Launch-Gates bleiben davon getrennt. Rechtstexte, Secret-Rotation, Angebotsfreigabe und Tracking/Consent muessen vor echten zahlenden Gaesten weiterhin separat geschlossen werden.

Aktuelle Entscheidung:

- Keine neuen Produktfeatures.
- `apps/web` bleibt führend für die öffentliche Website.
- `apps/guest` bleibt führend für den codegeschützten Gästebereich, mit Vite als Referenz für noch nicht abgenommene UX-Details.
- `apps/owner` bleibt MVP-Light und zeigt nur von Admin/Supabase gepflegte Ausschnitte.
- `apps/admin` ist fachlich als Ziel-App fuer die Quelle der Wahrheit abgenommen, bleibt aber bis zu den finalen Launch-Gates operativ vorsichtig zu behandeln.
- Alter Vite-Admin bleibt als historische Referenz eingefroren, nicht mehr als fuehrende Produktbasis fuer neue Arbeit.

## Anforderungsprüfung

| Nr. | Anforderung aus Kurskorrektur | Aktuelle Evidenz | Status | Bewertung |
| --- | --- | --- | --- | --- |
| 1 | Bestandsaufnahme: alter Vite-Prototyp, Next-Stand, fehlende Bereiche | `docs/MIGRATION_CONSOLIDATION_AUDIT.md` Abschnitte `Bestandsaufnahme`, `Alter Vite-Prototyp`, `Neue Next-Apps`, `Supabase` | Erfüllt | Der Prototyp, die Next-Apps und offene Risiken sind beschrieben. |
| 2 | Migrationsmatrix mit Bereich, alter Funktion, Ziel-App, Status, Priorität, Risiken | `docs/MIGRATION_CONSOLIDATION_AUDIT.md` Abschnitt `Migrationsmatrix` | Erfüllt | Matrix ist vorhanden und deckt Website, Admin, Guest, Owner, Supabase und Shared Types ab. |
| 3 | Admin-Funktionsparität gegen alten Admin prüfen | `docs/ADMIN_CRM_PARITY_CHECKLIST.md`; `docs/MIGRATION_CONSOLIDATION_AUDIT.md` Abschnitt `Admin-Funktionsparitaet`; `docs/qa/admin-parity/2026-06-30-admin-parity-run.md` | Erfüllt | Fachliche Parität ist dokumentiert und mit 24/24 manuellen Gates inklusive Evidenz technisch nachgewiesen. |
| 4 | Führende App pro Bereich festlegen | `docs/MIGRATION_CONSOLIDATION_AUDIT.md` Abschnitt `Fuehrende App Pro Bereich`; `docs/PLATFORM_ARCHITECTURE.md` | Erfüllt | Führungsrollen sind klar, inklusive Einschränkung für Admin. |
| 5 | Dev-/Betriebsbasis dokumentieren | `docs/MIGRATION_CONSOLIDATION_AUDIT.md` Abschnitte `Dev- Und Betriebsbasis`, `Lokale Apps`, `Build- Und QA-Kommandos`, `Env-Handling`, `Routen` | Erfüllt | Ports, Startkommandos, Env-Regeln, QA-Kommandos und Routen sind dokumentiert. |
| 6 | Danach erst wieder neue Features bauen | `docs/MIGRATION_CONSOLIDATION_AUDIT.md` Leitentscheidung; `docs/ADMIN_PARITY_QA_RUNBOOK.md`; `docs/PRODUCTION_LAUNCH_CHECKLIST.md` | Erfüllt für Migration, blockiert für Launch | Migration/CRM-Parität ist belegt. Neue Launch-relevante Features bleiben trotzdem blockiert, bis Block 6 abgeschlossen ist. |
| 7 | Admin als Quelle der Wahrheit erst nach CRM-Parität | `docs/ADMIN_PARITY_QA_RUNBOOK.md`; `docs/ADMIN_CRM_PARITY_CHECKLIST.md`; `docs/LAUNCH_STATUS_SNAPSHOT_2026-07-01.md` | Erfüllt für CRM-Parität | `apps/admin` ist als Ziel-App fachlich abgenommen; finale Produktiv-/Launch-Freigabe hängt weiter an Readiness- und Launch-Gates. |

## Belegte Fortschritte

- Bestandsaufnahme und Migrationsmatrix existieren zentral.
- Admin-Paritätscheckliste existiert mit Status pro Bereich.
- Operatives Admin-Paritäts-Runbook existiert inklusive Stop-Regeln und Evidenzvorlage.
- Konkreter Admin-Paritäts-Ausführungsplan existiert in `docs/ADMIN_PARITY_EXECUTION_PLAN.md` und ordnet die 24 Gates in eine praktische Testreihenfolge.
- `qa:admin-parity:status` erzeugt eine kompakte Arbeitsliste zum neuesten Paritätslauf und zeigt offene automatische Gates, manuelle Gates und Evidenzlücken.
- Launch-Status-Snapshot `docs/LAUNCH_STATUS_SNAPSHOT_2026-07-01.md` dokumentiert aktuelle Blocker aus `qa:readiness`, `qa:launch-gates` und der finalen Bewertung.
- Build-/QA-Kommandos sind dokumentiert und zuletzt für Konsolidierungsänderungen grün gelaufen.
- `qa:admin-audit` prüft aktuell 34 mutierende Admin-Funktionen auf Audit-Logs.
- `qa:admin-parity:structure` prüft strukturell, dass alte Vite-Admin-Kernbereiche in Next-Workspaces, UI-Ankern, Supabase-Tabellen und Doku abgebildet bleiben.
- `qa:app-deployment-config` prüft die lokalen Vercel-Konfigurationen und Health-Endpunkte für Web, Admin, Guest und Owner.
- `docs/PROTOTYPE_STORAGE_INVENTORY.md` inventarisiert die lokalen Vite-Speicher-Keys und Prototyp-Fallbacks; `qa:prototype-storage` prüft, dass bekannte LocalStorage-Keys und alte Adaptertabellen nicht undokumentiert bleiben.
- `qa:migration-consolidation` prüft die Konsolidierungsartefakte gegen die ursprüngliche Kurskorrektur und trennt Migrationsevidenz bewusst von Launch-Freigaben.
- Die QA-Ausgaben lesen `.env.local` ueber `scripts/lib/qa-env.mjs` konsistent aus.
- `qa:admin-parity:preflight`, `qa:admin-parity:status` und `qa:admin-parity:block1` geben konkrete `nextActions` bzw. fehlende Preflight-Inputs aus.
- Historische Admin-, Guest- und Owner-QA-Identitäten/Testdaten sind dokumentiert, gelten aber nur als aktuelle Evidenz, wenn die Werte im laufenden QA-Kontext gesetzt und erneut geprüft werden.

## Nicht Als Launch-Freigabe Bewiesen

Diese Punkte verhindern nicht mehr die Migrationskonsolidierung, aber weiterhin den Start mit echten zahlenden Gästen oder Paid Ads:

1. Der aktuelle Admin-Paritaetslauf steht weiter auf `Rot`, weil die automatischen finalen Gates `qa:readiness` und `qa:launch-gates` noch offen sind.
2. `npm run qa:launch-gates` ist rot durch Rechtstexte/Freigabe, Secret-Rotation und Angebotsfreigabe.
3. `npm run qa:readiness` ist rot, weil Recht/Freigaben, Secret-Rotation, Angebotsfreigabe und Tracking/Consent noch nicht final sind.
4. Tracking/Consent ist nicht final entschieden oder nicht vollständig konfiguriert.

## Abschlusskriterium Für Dieses Ziel

Die Migration/Konsolidierungsbasis gilt als abgeschlossen, wenn mindestens diese Evidenz vorliegt:

- Ein Admin-Paritätsprotokoll unter `docs/qa/admin-parity/` ist mit realitätsnahen Testdaten vollständig ausgefüllt.
- Alle 24 manuellen Admin-Paritaetsgates haben Evidenz und keine offenen manuellen Punkte.
- `npm run qa:migration-consolidation` ist grün.
- `npm run qa:apps` prueft Admin-, Guest- und Owner-Production- oder Staging-URLs tatsaechlich mit `checkedApps: 3`.
- `apps/admin` wird in `docs/MIGRATION_CONSOLIDATION_AUDIT.md` als fachlich abgenommene Ziel-App markiert, waehrend Launch-Gates getrennt bleiben.

Launch-Freigabe ist ein nachgelagertes Kriterium und verlangt zusaetzlich gruenes `npm run qa:readiness` und `npm run qa:launch-gates`.

## Nächster Sachlicher Schritt

Nicht neue Produktfeatures bauen.

Als nächstes keine neuen Produktfeatures bauen, sondern Block 6 abschließen:

1. Rechtstexte finalisieren und `MORROW_LEGAL_APPROVED_AT` erst nach Freigabe setzen.
2. Geteilte Secrets rotieren und `MORROW_SECRETS_ROTATED_AT` setzen.
3. Angebotsdaten final freigeben und `MORROW_OFFER_DATA_APPROVED_AT` setzen.
4. Tracking-/Consent-Entscheidung treffen und ggf. GA4/Meta IDs plus `MORROW_TRACKING_APPROVED_AT` setzen.
5. `npm run qa:readiness`, `npm run qa:launch-gates` und `npm run qa:admin-parity:status` erneut ausführen.
