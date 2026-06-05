# Supabase Storage Audit

Stand: 2026-06-05

Ziel: Morrow soll weg von Browser-Speicherung und hin zu Supabase als zentraler Datenquelle. Alles, was im Admin gepflegt wird, muss geräteübergreifend, teamfähig und für Gäste konsistent verfügbar sein.

## Kurzfazit

Supabase deckt die wichtigsten Phase-1-Flows bereits ab, aber noch nicht alle Admin-Daten sind wirklich remote-fähig.

Produktionsnah angebunden:
- Admin Auth mit freigegebenen Rollen.
- Leads aus Gast-, Eigentümer- und Erlebnisanbieterformularen.
- Lead-Bearbeitung, Status, Archivierung und Löschung.
- E-Mail-Automation und E-Mail-Protokoll.
- Kommunikationshistorie pro Anfrage.
- Admin-Aufgaben und Wiedervorlagen.
- Buchungsanlage aus bezahlten oder reservierten Gastanfragen.
- Gästebereich per Buchungs-ID und Zugangscode.
- Auszeiten, Termine und Unterkunft aus dem Auszeiten-Admin.

Noch nicht ausreichend zentral:
- Vor-Ort-Orte, Restaurants, Strände, Hilfe, Veranstaltungen und kuratierte Empfehlungen.
- Erlebnisanbieterprofile.
- Agenturprofile.
- Eigentümer-/Objektprofile außerhalb der Unterkunft, die direkt in einer Auszeit gespeichert wird.
- Kunden als echte, eigene Datensätze.
- Buchungen als vollwertige Admin-Quelle statt teilweise aus Leads abgeleitet.

## Modulstatus

| Bereich | Supabase-Tabelle vorhanden | Code nutzt Supabase | Browser-Speicher noch aktiv | Einschätzung |
| --- | --- | --- | --- | --- |
| Admin Auth | `admin_users` | Ja | Nein | Produktionsnah |
| Leads | `leads` | Ja | Fallback/Demo | Gut |
| E-Mail-Protokoll | `email_events` | Ja | Nein | Gut |
| Kommunikationshistorie | `communication_events` | Ja | Nur React-State bis Reload, wenn kein Supabase | Gut |
| Supportnachrichten | `support_messages`, `admin_tasks` | Ja, aber Anzeige läuft über Aufgaben | Fallback/Demo | V1 ok |
| Aufgaben | `admin_tasks` | Ja | Fallback/Demo | Gut |
| Auszeiten | `packages` | Ja | Cache/Fallback | Gut, aber Cache später entfernen |
| Termine | `package_dates` | Ja beim Speichern | Kein eigenes Admin-Quellmodell | V1 ok |
| Unterkünfte in Auszeiten | `properties` | Ja beim Paket-Sync | Cache/Fallback | V1 ok |
| Buchungen | `bookings` | Anlage/Update ja, Admin-Listen teils aus Leads | Nein als echte Liste | Nächster Reifegrad nötig |
| Kunden | `customers` | Tabelle ja, Code leitet Kunden aus Leads ab | Nein | Noch nicht umgesetzt |
| Erlebnisanbieter | `experience_providers` | Tabelle ja, Code schreibt lokal | Ja | Muss migriert werden |
| Erlebnisbausteine | `experience_blocks` | Tabelle ja, Code steckt in Paket-Payload | Ja/Package-Payload | Muss sauber verbunden werden |
| Eigentümerobjekte | `properties` | Nur über Paket-Unterkunft | Ja | Muss erweitert werden |
| Agenturen | Keine eigene Tabelle | Nein | Ja | Tabelle + Sync nötig |
| Vor-Ort-Orte & Events | `local_places` | Tabelle ja, Code schreibt lokal | Ja | Kritischster Migrationsblock |

## Konkrete Browser-Speicherstellen

Aktuell werden diese Keys im Browser genutzt:
- `morrow-phase-1-leads`: Demo-/Fallback-Leads.
- `morrow-admin-packages`: Cache/Fallback für Auszeiten.
- `morrow-admin-experience-providers`: Erlebnisanbieterprofile, aktuell lokal.
- `morrow-admin-owner-properties`: Eigentümer-/Objektprofile, aktuell lokal.
- `morrow-admin-tasks`: Cache/Fallback für Aufgaben.
- `morrow-admin-agencies`: Agenturen, aktuell lokal.
- `morrow-admin-local-places`: Vor-Ort-Orte, Restaurants, Strände, Hilfe, Events, aktuell lokal.

Wichtig: Browser-Speicher ist pro Gerät und pro Browser. Eine Freigabe im Admin ist dadurch nicht automatisch für andere Admins, andere Geräte oder Gäste verfügbar.

## Kritischer Punkt: Vor-Ort-Seite

Die Vor-Ort-Seite ist für die Guest Experience ein Kernmodul. Genau dieses Modul ist aktuell noch nicht sauber Supabase-first.

Ist-Zustand:
- Seed-Daten liegen in `src/data/localPlaces.ts`.
- Admin-Änderungen landen in `localStorage`.
- Importierte Veranstaltungen aus `/data/spo-events.json` werden ebenfalls lokal als Kandidaten gespeichert.
- Gäste sehen produktiv nur Seed-Daten oder Daten, die im gleichen Browser freigegeben wurden.

Soll-Zustand:
- Alle Vor-Ort-Kandidaten liegen in `local_places`.
- Admin liest, erstellt, bearbeitet, pausiert, lehnt ab und veröffentlicht über Supabase.
- Gäste bekommen nur freigegebene Orte über Supabase oder eine sichere RPC.
- Filter wie Essen, Strand, Erlebnis, Wetter, Gezeiten, Hilfe und Veranstaltungen nutzen dieselbe zentrale Datenquelle.
- Veranstaltungen bleiben getrennt von buchbaren Erlebnisbausteinen.

## Empfohlene Reihenfolge

1. Vor-Ort-Daten nach Supabase migrieren. Status: begonnen am 2026-06-05.
   - `local_places` erweitern, falls Felder fehlen.
   - Backend-Funktionen `fetch/upsert/deleteStoredLocalPlace` bauen. Erledigt.
   - Admin-Vor-Ort-Seite auf Supabase umstellen. Erledigt im Code.
   - Aktuelle Seed-Daten einmalig in Supabase schreiben. Skript vorhanden, Ausführung noch nötig.
   - Guest App aus Supabase lesen lassen. Erledigt im Code, Migration/Seed noch nötig.

2. Erlebnisanbieter und Erlebnisbausteine migrieren.
   - Anbieterprofile in `experience_providers` speichern.
   - Erlebnisbausteine in `experience_blocks` speichern.
   - Pakete verbinden Erlebnisbausteine relational statt nur im Payload.

3. Eigentümerobjekte und Agenturen trennen.
   - Eigentümerobjekte als `properties` remote speichern.
   - Agenturen als eigene Tabelle ergänzen.
   - Agenturen können Objekte verwalten, ohne dass sie mit Eigentümern vermischt werden.

4. Kunden und Buchungen stärken.
   - Kunden beim Übergang von Anfrage zu Buchung als `customers` anlegen.
   - Admin-Buchungen aus `bookings` lesen, nicht mehr aus Lead-Status ableiten.
   - Gästebereich langfristig aus `bookings`, `packages`, `properties`, `local_places` und `support_messages` speisen.

5. Browser-Speicher auf Demo/Fallback begrenzen.
   - In Production darf Admin-Speicherung nicht mehr von `localStorage` abhängen.
   - Lokaler Demo-Modus kann bleiben, muss aber klar getrennt sein.

## Entscheidung für den nächsten Schritt

Der nächste sinnvolle technische Schritt ist die Vor-Ort-Migration. Sie löst direkt das aktuelle Problem mit freigegebenen Veranstaltungen und macht den wertvollsten Teil des Gästebereichs produktionsfähig.
