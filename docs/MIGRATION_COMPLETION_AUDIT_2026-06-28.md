# Morrow Migration Completion Audit

Stand: 2026-06-28

Dieses Dokument prüft die ursprüngliche Kurskorrektur gegen den aktuellen Projektstand. Es dient nicht als neue Roadmap, sondern als Nachweis, ob die Konsolidierung schon als abgeschlossen gelten darf.

## Ergebnis

Die Dokumentations- und Entscheidungsbasis der Migration ist weitgehend hergestellt. Die Konsolidierung ist aber noch nicht abgeschlossen, weil `apps/admin` noch nicht mit einem echten Admin-Paritätslauf als alleinige Quelle der Wahrheit bewiesen wurde.

Aktuelle Entscheidung:

- Keine neuen Produktfeatures.
- `apps/web` bleibt führend für die öffentliche Website.
- `apps/guest` bleibt führend für den codegeschützten Gästebereich, mit Vite als Referenz für noch nicht abgenommene UX-Details.
- `apps/owner` bleibt MVP-Light und zeigt nur von Admin/Supabase gepflegte Ausschnitte.
- `apps/admin` bleibt Ziel-App, aber noch nicht vollständig produktiv freigegeben.
- Alter Vite-Admin bleibt Referenz, bis `docs/ADMIN_PARITY_QA_RUNBOOK.md` grün durchlaufen wurde oder fehlende Funktionen ausdrücklich als ersetzt/nicht mehr benötigt dokumentiert sind.

## Anforderungsprüfung

| Nr. | Anforderung aus Kurskorrektur | Aktuelle Evidenz | Status | Bewertung |
| --- | --- | --- | --- | --- |
| 1 | Bestandsaufnahme: alter Vite-Prototyp, Next-Stand, fehlende Bereiche | `docs/MIGRATION_CONSOLIDATION_AUDIT.md` Abschnitte `Bestandsaufnahme`, `Alter Vite-Prototyp`, `Neue Next-Apps`, `Supabase` | Erfüllt | Der Prototyp, die Next-Apps und offene Risiken sind beschrieben. |
| 2 | Migrationsmatrix mit Bereich, alter Funktion, Ziel-App, Status, Priorität, Risiken | `docs/MIGRATION_CONSOLIDATION_AUDIT.md` Abschnitt `Migrationsmatrix` | Erfüllt | Matrix ist vorhanden und deckt Website, Admin, Guest, Owner, Supabase und Shared Types ab. |
| 3 | Admin-Funktionsparität gegen alten Admin prüfen | `docs/ADMIN_CRM_PARITY_CHECKLIST.md`; `docs/MIGRATION_CONSOLIDATION_AUDIT.md` Abschnitt `Admin-Funktionsparitaet` | Teilweise erfüllt | Fachliche Parität ist dokumentiert, aber noch nicht durch echten End-to-End-Abnahmelauf bewiesen. |
| 4 | Führende App pro Bereich festlegen | `docs/MIGRATION_CONSOLIDATION_AUDIT.md` Abschnitt `Fuehrende App Pro Bereich`; `docs/PLATFORM_ARCHITECTURE.md` | Erfüllt | Führungsrollen sind klar, inklusive Einschränkung für Admin. |
| 5 | Dev-/Betriebsbasis dokumentieren | `docs/MIGRATION_CONSOLIDATION_AUDIT.md` Abschnitte `Dev- Und Betriebsbasis`, `Lokale Apps`, `Build- Und QA-Kommandos`, `Env-Handling`, `Routen` | Erfüllt | Ports, Startkommandos, Env-Regeln, QA-Kommandos und Routen sind dokumentiert. |
| 6 | Danach erst wieder neue Features bauen | `docs/MIGRATION_CONSOLIDATION_AUDIT.md` Leitentscheidung; `docs/ADMIN_PARITY_QA_RUNBOOK.md`; `docs/PRODUCTION_LAUNCH_CHECKLIST.md` | Offen | Neue Features bleiben blockiert, bis Admin-Parität und Launch-Gates mit Evidenz durchlaufen sind. |
| 7 | Admin als Quelle der Wahrheit erst nach CRM-Parität | `docs/ADMIN_PARITY_QA_RUNBOOK.md`; `docs/ADMIN_CRM_PARITY_CHECKLIST.md`; `docs/LAUNCH_STATUS_SNAPSHOT_2026-06-28.md` | Offen | Ziel ist definiert, aber das Runbook ist noch nicht grün ausgeführt. |

## Belegte Fortschritte

- Bestandsaufnahme und Migrationsmatrix existieren zentral.
- Admin-Paritätscheckliste existiert mit Status pro Bereich.
- Operatives Admin-Paritäts-Runbook existiert inklusive Stop-Regeln und Evidenzvorlage.
- Konkreter Admin-Paritäts-Ausführungsplan existiert in `docs/ADMIN_PARITY_EXECUTION_PLAN.md` und ordnet die 24 Gates in eine praktische Testreihenfolge.
- Launch-Status-Snapshot dokumentiert aktuelle Blocker aus `qa:launch-gates`.
- Build-/QA-Kommandos sind dokumentiert und zuletzt für Konsolidierungsänderungen grün gelaufen.
- `qa:admin-audit` prüft aktuell 34 mutierende Admin-Funktionen auf Audit-Logs.
- `qa:admin-parity:structure` prüft strukturell, dass alte Vite-Admin-Kernbereiche in Next-Workspaces, UI-Ankern, Supabase-Tabellen und Doku abgebildet bleiben.
- `qa:app-deployment-config` prüft die lokalen Vercel-Konfigurationen und Health-Endpunkte für Web, Admin, Guest und Owner.
- `docs/PROTOTYPE_STORAGE_INVENTORY.md` inventarisiert die lokalen Vite-Speicher-Keys und Prototyp-Fallbacks; `qa:prototype-storage` prüft, dass bekannte LocalStorage-Keys und alte Adaptertabellen nicht undokumentiert bleiben.
- `qa:migration-consolidation` prüft die Konsolidierungsartefakte gegen die ursprüngliche Kurskorrektur und bleibt rot, bis ein validierter grüner Admin-Paritätslauf existiert.
- Admin-, Guest- und Owner-QA-Identitäten/Testdaten sind vorbereitet und per Supabase-Login/RPC geprüft; die echten App-Base-URLs fehlen weiterhin.

## Nicht Als Abgeschlossen Bewiesen

Diese Punkte verhindern, dass die Konsolidierung als fertig markiert wird:

1. Es liegt noch kein grün validiertes Protokoll unter `docs/qa/admin-parity/` vor; der aktuelle Lauf `docs/qa/admin-parity/2026-06-30-admin-parity-run.md` steht auf `Rot`.
2. `apps/admin` ist funktional weit, aber noch nicht per Runbook als alleinige Quelle der Wahrheit freigegeben.
3. `npm run qa:admin-parity:structure` ist grün und belegt strukturelle Abdeckung, ersetzt aber keine manuelle 24-Gate-Abnahme.
4. `npm run qa:apps` prüft ohne vollständige `ADMIN_BASE_URL`, `GUEST_BASE_URL` und `OWNER_BASE_URL` nicht alle App-Deployment-URLs und muss deshalb als rotes App-QA-Ergebnis behandelt werden. Teilprüfungen sind nur mit `MORROW_QA_ALLOW_PARTIAL_APPS=1` zulässig.
5. `npm run qa:launch-gates` ist rot durch 11 Blocker, zuletzt dokumentiert in `docs/LAUNCH_STATUS_SNAPSHOT_2026-06-30.md`.
6. `npm run qa:admin-parity:preflight` ist rot; Admin-/Guest-/Owner-Testdaten sind vorbereitet, aber die echten App-URLs fehlen weiter. Details stehen in `docs/ADMIN_PARITY_PREFLIGHT_FIXLIST_2026-06-30.md`.
7. Rechtstexte, Secret-Rotation, Angebotsfreigabe und App-URL-/Env-Konfiguration sind noch nicht final.

## Abschlusskriterium Für Dieses Ziel

Die Konsolidierung darf erst als abgeschlossen gelten, wenn mindestens diese Evidenz vorliegt:

- Ein Admin-Paritätsprotokoll unter `docs/qa/admin-parity/` ist mit realitätsnahen Testdaten vollständig ausgefüllt.
- `npm run qa:admin-parity:validate` ist grün.
- `npm run qa:migration-consolidation` ist grün.
- Ergebnis des validierten Protokolls ist grün oder jedes rote/gelbe Ergebnis ist bewusst als nicht mehr benötigte Vite-Funktion dokumentiert.
- `npm run qa:launch-gates` läuft ohne Blocker oder bekannte Blocker sind ausdrücklich als Nicht-Launch-relevant dokumentiert.
- `npm run qa:apps` prüft Admin-, Guest- und Owner-Production- oder Staging-URLs tatsächlich mit `checkedApps: 3` und läuft ohne vollständige App-URLs nicht grün durch.
- `apps/admin` wird danach in `docs/MIGRATION_CONSOLIDATION_AUDIT.md` entweder als führend freigegeben oder der alte Vite-Admin bleibt weiter als Referenz markiert.

## Nächster Sachlicher Schritt

Nicht neue Produktfeatures bauen.

Als nächstes die App-URLs und Testdaten für das Runbook vorbereiten, dann die Admin-Paritätsabnahme praktisch durchlaufen:

1. Admin-, Guest- und Owner-Apps in Vercel als eigene Projekte/Deployments erreichbar machen.
2. `ADMIN_BASE_URL`, `GUEST_BASE_URL` und `OWNER_BASE_URL` auf echte App-Domains setzen; jede Domain muss `/health` mit der passenden App-ID liefern.
3. `docs/ADMIN_PARITY_PREFLIGHT_FIXLIST_2026-06-30.md` abarbeiten.
4. `npm run qa:admin-parity:preflight` ausführen und fehlende URLs/Testzugänge schließen.
5. `docs/ADMIN_PARITY_EXECUTION_PLAN.md` von Block 1 bis 6 abarbeiten.
6. Die 24 manuellen Gates mit Evidenz abnehmen.
7. `npm run qa:admin-parity:validate`, `npm run qa:readiness`, `npm run qa:migration-consolidation` und `npm run qa:apps` ausführen.
