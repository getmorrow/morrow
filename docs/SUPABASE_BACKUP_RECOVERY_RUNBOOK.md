# Supabase Backup & Recovery Runbook

Status: MVP-Betriebsrahmen fuer Morrow.

Ziel: Operative Daten duerfen vor echten Gaesten nicht nur in Supabase liegen, sondern muessen regelmaessig exportierbar und im Notfall nachvollziehbar wiederherstellbar sein.

## Grundsatz

Supabase bleibt die Quelle der Wahrheit. Lokale Exporte sind keine zweite Datenbank, sondern ein Sicherheitsnetz fuer:

- versehentlich geloeschte Daten
- fehlerhafte Admin-Aenderungen
- fehlgeschlagene Migrationen
- schnelle operative Einsicht, falls Supabase kurzzeitig nicht erreichbar ist

Backups enthalten personenbezogene Daten. Sie duerfen nicht ins Git, nicht in Chatverlaeufe und nicht in ungesicherte Cloud-Ordner.

## Was Gesichert Wird

Das Skript `npm run supabase:backup` exportiert aktuell:

- `leads`
- `customers`
- `bookings`
- `packages`
- `package_dates`
- `properties`
- `experience_providers`
- `experience_blocks`
- `local_places`
- `support_messages`
- `support_status_events`
- `guest_feedback`
- `communication_events`
- `email_events`
- `admin_tasks`
- `admin_audit_logs`
- `owner_profiles`
- `owner_property_access`
- `owner_documents`
- `owner_operations`
- `owner_statements`
- `agencies`

Die Dateien landen unter `backups/supabase/<timestamp>/`. Der Ordner `backups/` ist in `.gitignore` ausgeschlossen.

## Backup Ausfuehren

Voraussetzungen lokal:

- `VITE_SUPABASE_URL` oder `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Ausfuehrung:

```bash
npm run supabase:backup
```

Optional anderer Zielordner:

```bash
MORROW_BACKUP_DIR="/sicherer/pfad/morrow-backups" npm run supabase:backup
```

Nach jedem Lauf pruefen:

- `manifest.json` ist vorhanden.
- Alle Tabellen haben `status: "exported"`.
- Die Zeilenanzahl wirkt plausibel.
- Der Ordner wurde an einem sicheren Ort abgelegt.

Letzter technischer Probe-Export:

- 2026-07-02: `backups/supabase/2026-07-02T07-40-10-178Z`
- 22 Tabellen exportiert
- 153 Zeilen gesichert
- 0 fehlgeschlagene Tabellen
- `manifest.json` geprueft

## Frequenz Fuer Phase 1

Vor echten zahlenden Gaesten:

- vor jeder Migration
- vor groesseren Admin-Datenimporten
- vor Veraenderungen an Buchungs-, Kunden-, Objekt- oder Auszeitdaten
- woechentlich im laufenden MVP-Betrieb

Wenn echte Buchungen aktiv sind:

- taeglich waehrend aktiver Aufenthalte
- immer vor Status- oder Datenmigrationen
- direkt nach einem groesseren Buchungstag

## Wiederherstellung Im Notfall

1. Problem eingrenzen:
   - Welche Tabelle ist betroffen?
   - Seit wann ist der Fehler sichtbar?
   - Gibt es Audit-Log- oder Kommunikationsereignisse zum Datensatz?

2. Keine weiteren Admin-Aenderungen ausfuehren, solange der Umfang unklar ist.

3. Passenden Backup-Ordner anhand `manifest.json` finden.

4. Einzelne Datensaetze vergleichen:
   - aktuelle Supabase-Daten
   - JSON-Datei aus Backup
   - Audit-Log fuer Aenderungsverlauf

5. Wiederherstellung bevorzugt gezielt, nicht pauschal:
   - einzelne Zeile per Supabase SQL Editor oder Admin-Script wieder einsetzen
   - keine komplette Tabelle ueberschreiben, wenn nur ein Datensatz betroffen ist

6. Nach Wiederherstellung:
   - betroffenen Gast-/Buchungs-/Objektdatensatz im Admin pruefen
   - Gaestebereich oder Eigentuemerbereich mit echtem Link pruefen, falls betroffen
   - kurzes internes Ereignis im Audit/Notizfeld dokumentieren

## Supabase Dashboard Backups

Zusaetzlich zu lokalen JSON-Exports muss im Supabase Dashboard geprueft werden:

- ob automatische Projekt-Backups im gebuchten Supabase-Plan aktiv sind
- wie lange Point-in-Time-Recovery verfuegbar ist
- ob das Datenbankpasswort und Recovery-Zugriff sicher verwahrt sind

Diese Pruefung ist vor dem ersten zahlenden Gast Pflicht.

## Nicht Im Repo Speichern

Nie committen:

- JSON-Backups
- Service Role Keys
- Supabase Access Tokens
- Datenbankpasswoerter
- Gastlisten
- Zahlungsbelege
- Exportordner

## Offene Erweiterungen

- verschluesselte Backups
- automatischer geplanter Export
- Restore-Script fuer einzelne Datensaetze
- Pruefsummen pro Exportdatei
- getrennte Backup-Rollen fuer Admin und Technik
