# Morrow Admin App

Interne Next-App fuer das operative Morrow-System.

Status: echte Supabase-basierte Admin-Funktionen vorhanden, aber noch nicht als vollstaendiger Ersatz fuer den alten Vite-Admin-CRM freigegeben.

## Aktuelle Aufgabe

Diese App befindet sich in der Migration-/Konsolidierungsphase.

Vor weiterem Featurebau muss die CRM-Paritaet gegen den alten Vite-Prototyp aus `src/App.tsx` geprueft und geschlossen werden. Der aktuelle Arbeitsrahmen steht in:

- `docs/MIGRATION_CONSOLIDATION_AUDIT.md`
- `docs/PLATFORM_ARCHITECTURE.md`
- `docs/STRATEGIC_FOUNDATION_MORROW.md`

## Vorhanden

- Supabase Auth Login.
- Admin-Rollencheck ueber `get_morrow_admin_profile()`.
- Operative Uebersicht mit Kennzahlen, Monitoring, Aufgaben, Audit und Feedback.
- Leads lesen, Status aendern und Gastlead als Reservierung anlegen.
- Buchungen lesen, Status und Zahlungs-/Operationsdaten bearbeiten.
- Supportfaelle lesen, Status aendern, interne Notiz speichern und E-Mail-Antwort senden.
- Freie E-Mail-Antworten aus Anfrage, Buchung und Support ueber `admin-send-message`.
- Auszeiten, Unterkuenfte, Termine, Erlebnisbausteine und Vor-Ort-Orte pflegen.
- Agenturen, Eigentuemerprofile und Objektzugriffe pflegen.
- Owner-Dokumente, Owner-Abrechnungen und Owner-Operationsmeldungen anlegen/statusaendern.
- Audit-Log fuer viele Admin-Mutationen.

## Noch nicht als paritaetisch bewiesen

- Kundenbereich als eigener CRM-Arbeitsbereich.
- Aufgabenbereich mit voller Erstellung, Bearbeitung, Filterung, Bezugssprung, Loeschen/Archivieren.
- Lead-Archiv, Reaktivierung, Wiedervorlagen und Test-/Spam-Loeschen wie im Vite-Admin.
- Vollstaendiger Auszeiten-Builder inklusive Copy, FAQ, Medien, Momente, Empfehlungen und Launch-Check.
- Vollstaendige Medienbibliothek und Bildrechte-Workflow.
- Kommunikationsvorlagen und WhatsApp-nahe Workflows.
- Echte Bereichsnavigation statt langer Dashboard-Seite.
- Gemeinsame Domain-/Supabase-Typen in `packages/domain` und `packages/supabase`.

## Lokale Nutzung

```bash
npm run admin:dev -- --port 4301
npm run admin:build
```

Root-`.env.local` wird lokal ueber `next.config.ts` geladen. Public Supabase-Variablen muessen als `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` oder als alte lokale `VITE_SUPABASE_*` Werte vorhanden sein.

## Regel

Admin ist Ziel-Quelle der Wahrheit. Bis zur CRM-Paritaet gilt jedoch:

- `apps/admin` ist die Ziel-App und darf konsolidiert werden.
- Der alte Vite-Admin bleibt Referenz fuer fehlende CRM-Funktionen.
- Neue Featureideen werden geparkt, bis die Paritaetsluecken dokumentiert und priorisiert abgearbeitet sind.
