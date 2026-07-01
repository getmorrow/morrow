# Morrow Prototype Storage Inventory

Stand: 2026-07-01

Dieses Dokument gehoert zum Migration-/Konsolidierungs-Sprint. Es inventarisiert die lokalen Speicher-Keys und Prototyp-Fallbacks aus dem alten Vite-System. Ziel ist nicht, den Prototyp weiter auszubauen, sondern sichtbar zu halten, welche lokalen Datenfluesse noch als Referenz existieren und welche Supabase-/Next-Zielstruktur sie ersetzt.

Fuehrende Regel:

- `apps/admin` und Supabase sind das Ziel fuer operative Daten.
- Der Vite-Prototyp darf lokale Speicher-Keys nur noch als Referenz, Demo oder Rueckfall fuer alte Tests nutzen.
- Neue produktive Logik darf keine neuen `morrow-admin-*`-LocalStorage-Keys einfuehren.

## Speicher-Keys

| Speicher-Key | Alte Rolle Im Vite-Prototyp | Neue Zielstruktur | Status | Risiko |
| --- | --- | --- | --- | --- |
| `morrow-phase-1-leads` | Phase-1-Leads, lokaler Leadflow und Admin-Demo. | `leads`, `customers`, `bookings`, `communication_events` in Supabase; Web-Leadflow ueber Next/Supabase. | ersetzt/fallback | Alte lokale Leads duerfen nicht als produktive Quelle gelten. |
| `morrow-admin-packages` | Lokale Paket-/Auszeitenpflege. | `packages`, `package_dates`, `properties`, `experience_blocks` in Supabase; `apps/admin` Bestand/Operations. | ersetzt/fallback | Website-Copy bleibt bewusst getrennt von operativer Paketpflege. |
| `morrow-admin-experience-providers` | Lokale Erlebnisanbieterprofile. | `experience_providers` in Supabase; `apps/admin` Partner/Erlebnisse. | ersetzt/fallback | Partnerlogin V2 darf spaeter keine Prototypdaten lesen. |
| `morrow-admin-owner-properties` | Lokale Eigentuemer-/Objektprofile. | `properties`, `owner_profiles`, `owner_property_access` in Supabase. | ersetzt/fallback | Objekt- und Owner-Verantwortlichkeiten muessen in Admin/Supabase gepflegt werden. |
| `morrow-admin-tasks` | Lokale Admin-Aufgaben. | `admin_tasks` in Supabase. | ersetzt/fallback | Aufgaben-Archivierungsstrategie bleibt offen; neue Tasks duerfen nicht nur lokal entstehen. |
| `morrow-admin-agencies` | Lokale Agenturpartner. | `agencies` in Supabase. | ersetzt/fallback | Strukturierter Verfuegbarkeitsprozess bleibt offen. |
| `morrow-admin-customers` | Lokale Kundenliste. | `customers` plus relationale Bezuege zu `leads` und `bookings`. | ersetzt/fallback | Dublettenlogik bleibt zu pruefen. |
| `morrow-admin-bookings` | Lokale Buchungen. | `bookings` in Supabase; Guest-Zugang ueber `guest_access_code` und `get_guest_stay()`. | ersetzt/fallback | Buchungsstatus muss im Admin-Paritaetslauf bewiesen werden. |
| `morrow-admin-local-places` | Lokale Vor-Ort-Orte/Kandidaten. | `local_places` in Supabase; `apps/admin` Kuratierung, `apps/guest` Vor-Ort-Ansicht. | ersetzt/fallback | Live-Oeffnungszeiten/Ratings und Quellhistorie bleiben offen. |
| `morrow-feedback-submitted-<lead-id>` | Lokale Feedback-Deduplizierung im alten Gaestebereich. | `guest_feedback` und `communication_events` in Supabase; Next-Gaeste-App fuehrend. | ersetzt/fallback | Altes lokales Flag ist kein Nachweis fuer echtes Feedback. |
| `morrow-admin-*` | Catch-all zum Leeren alter Admin-Prototyp-Caches. | Keine produktive Zielstruktur; nur Cleanup alter Browserdaten. | cleanup-only | Darf nicht als Datenmodell verstanden werden. |

## Prototyp-Adapter

`src/lib/morrowBackend.ts` bleibt eine Referenz- und Uebergangsschicht fuer den Vite-Prototyp. Der Adapter schreibt bei vorhandener Supabase-Konfiguration in echte Tabellen und faellt sonst auf lokale Demo-Logik zurueck.

Wichtige Tabellen, die der Adapter bereits adressiert:

- `leads`
- `support_messages`
- `admin_tasks`
- `customers`
- `bookings`
- `packages`
- `package_dates`
- `properties`
- `email_events`
- `communication_events`
- `guest_feedback`
- `local_places`
- `experience_providers`
- `experience_blocks`
- `agencies`
- `admin_audit_logs`

## Konsolidierungsentscheidung

Solange der Admin-Paritaetslauf nicht gruen ist:

- Vite bleibt Referenz fuer fehlende oder unbewiesene Arbeitsablaeufe.
- Next/Supabase bleiben Zielarchitektur.
- Neue Features duerfen keine neuen Prototyp-Speicher-Keys oder LocalStorage-Datenmodelle einfuehren.

Der automatische Schutz dafuer ist:

```bash
npm run qa:prototype-storage
```

Dieser Check prueft, dass bekannte lokale Speicher-Keys dokumentiert bleiben und die wichtigsten alten Adaptertabellen in `src/lib/morrowBackend.ts` explizit vorhanden sind.
