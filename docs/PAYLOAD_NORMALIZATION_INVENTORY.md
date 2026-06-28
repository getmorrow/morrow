# Morrow Payload Normalization Inventory

Stand: 2026-06-28

Dieses Dokument gehoert zum Migration-/Konsolidierungs-Sprint. Es beschreibt, welche operativen Felder aktuell noch in JSON-`payload` liegen, welche App sie schreibt, welche Apps sie lesen und ob sie fuer den MVP als Payload akzeptabel sind oder spaeter relational normalisiert werden muessen.

Grundregel:

- Payload ist fuer flexible Copy, Hinweise, Listen und Uebergangsdaten okay.
- Payload ist nicht ideal fuer Felder, die gefiltert, validiert, berechtigt, automatisiert, abgerechnet oder app-uebergreifend eindeutig interpretiert werden muessen.
- Admin ist die Quelle der Wahrheit. Wenn Guest oder Owner ein Payload-Feld lesen, muss klar sein, ob Admin dieses Feld stabil pflegen kann.

## Statusklassen

| Status | Bedeutung |
| --- | --- |
| `MVP-Payload ok` | Kann fuer Phase 1 als JSON bleiben, weil es vor allem Copy, Notiz oder Darstellung ist. |
| `Normalisieren V1` | Sollte vor Markteintritt oder kurz danach relational werden, weil Workflows, Filter oder Gastkommunikation davon abhaengen. |
| `Normalisieren V2` | Kann spaeter normalisiert werden, wenn Volumen, Partnerzugang oder Reporting wachsen. |
| `Pruefen` | Feld ist noch uneinheitlich benannt, unklar befuellt oder in mehreren Apps unterschiedlich interpretiert. |

## Inventar Nach Bereich

| Bereich / Tabelle | Payload-Felder Heute | Schreibt Fuehrend | Liest | Status | Entscheidung / Naechster Schritt |
| --- | --- | --- | --- | --- | --- |
| `leads` | `selectedDate`, `occasion`, `internalNote`, `utm`, `updatedAt`, Testmarker; `followUpAt`, `whatsappOptIn`, `adults`, `children`, `childrenAges` und `dog` nur noch als Fallback/Spiegel | Admin, Web-Leadflow | Admin | `follow_up_at`, `whatsapp_opt_in`, `whatsapp_consent_at`, `adults`, `children`, `children_ages` und `dog` normalisiert; `MVP-Payload ok` fuer Anlass/Notizen/UTM | Wiedervorlage, WhatsApp-Zustimmung und Reisegruppe liegen strukturiert vor und werden aus altem Payload backfilled. UTM kann Payload bleiben, solange Reporting nicht granular wird. |
| `customers` | `sourceLeadIds`, `bookingIds`, `lastContactAt`, `updatedAt`, Testmarker | Admin | Admin | `Pruefen` | Kundennotiz liegt bereits in `customers.notes`. Verknuepfungen sollten langfristig ueber echte Lead-/Booking-Relationen statt Payload-Arrays laufen. |
| `bookings` | `guestName`, `email`, `phone`, `selectedDate`, `adults`, `children`, `childrenAges`, `dog`, `guestAccessCode`, `reservationDeadline`, `paymentDueDate`, `paymentAmount`, `paymentDate`, `paymentMethod`, `paymentReference`, `paymentProofUrl`, `checkInStatus`, `experienceStatus` und `nextTask` nur noch als Fallback/Spiegel; `internalNote`, `updatedAt` | Admin | Admin, Guest, Owner teilweise | Buchungs-Kernfelder normalisiert; `Normalisieren V1` fuer echte Termin-/Task-/Freigabelogik bleibt | Gastkontakt, Terminlabel, Reisegruppe, Zahlungsdetails, Fristen, Guest-Code, Check-in-/Erlebnisstatus und naechste Aufgabe liegen als Spalten vor und werden fuer `get_guest_stay()` in den Gaestebereich gemerged. Freitextnotiz kann Payload bleiben. |
| `packages` | `headline`, `subheadline`, `shortDescription`, `experienceFeeling`, `includedItems`, `highlights`, `recommendations`, `faq`, `launchNote`, `heroImage`, `galleryImages`, `updatedAt` | Admin | Admin, Guest; Website aktuell aus `packages/domain` | `MVP-Payload ok`, spaeter `Normalisieren V2` | Fuer MVP ist paketbezogene Story/Copy als Payload akzeptabel. Spaeter braucht es eine klare CMS-Grenze: Website-Copy in `packages/domain`/CMS, operative Paketdaten in Supabase. |
| `package_dates` | `note`, `updatedAt` | Admin | Admin, Guest/Owner ueber Package-Kontext | `MVP-Payload ok` | Termin-Kernfelder sind relational. Notiz kann Payload bleiben. |
| `properties` | `description`, `ownerName`, `email`, `phone`, `propertyType`, `currentRental`, `address`, `earliestArrival`, `latestArrival`, `checkOutTime`, `keySafeCode`, `checkInInstructions`, `amenities`, `attributes`, `experienceWorlds`, `houseRules`, `media`, `mediaAltTexts`, `cleaningStatus`, `maintenanceStatus` und `lastCheck` nur noch als Fallback/Spiegel; `updatedAt` | Admin | Admin, Guest, Owner | Property-Kernfelder normalisiert; `Normalisieren V2` fuer echte Medienbibliothek, Upload, Bildreihenfolge und Statushistorien | Unterkunftsdaten sind gast- und ownerrelevant. Check-in, Adresse, Regeln, Ausstattung, Medien-URL-Listen, Medien-Alttexte und Operationsstatus liegen als Spalten vor und werden in `get_owner_dashboard()` fuer die Owner-App bereitgestellt. |
| `experience_providers` | `contactName`, `audienceFit`, `collaborationNote`, `pricingNote`, `availabilityNote`, `notes` nur noch als Fallback/Spiegel; `updatedAt` | Admin | Admin | Partnerprofil-Kernfelder normalisiert; `Normalisieren V2` fuer Statushistorie, Follow-ups und echte Verfuegbarkeitsstruktur | Anbieterprofile haben Kontaktperson, Zielgruppenfit, Kooperationsstand, Konditionen, Verfuegbarkeit und interne Notizen als Spalten. Bei Partnerlogin braucht es spaeter eigene Tabellen/Statushistorie. |
| `agencies` | `nextFollowUpAt`, `next_follow_up_at`, `notes`, `note`, `internalNote` nur noch als Fallback/Spiegel; `updatedAt` | Admin | Admin | Agentur-Wiedervorlage und interne Notiz normalisiert; `Normalisieren V2` fuer Statushistorie und strukturierte Verfuegbarkeiten | Agenturen haben Kontakt, Objektbezug, Rueckmeldefrist, Verfuegbarkeitsnotiz, Wiedervorlage und interne Notiz als Spalten. Payload bleibt fuer historische Import-/Status-Snapshots. |
| `experience_blocks` | `guestNote`, `priceNote`, `capacityNote`, `availabilityNote`, `qualityScore`, `qualityNote` nur noch als Fallback/Spiegel; `updatedAt` | Admin | Admin, Guest spaeter direkt | Preis-/Kapazitaets-/Verfuegbarkeitsnotiz, Gastnotiz und Qualitaetspruefung normalisiert; echte Termin-/Kontingentlogik bleibt `Normalisieren V2` | Erlebnisbausteine haben Anbieter, Auszeit, Rolle, Inklusivstatus, Preislogik, Kapazitaet, Verfuegbarkeit, Gastnotiz und Qualitaetsbewertung als Spalten. Payload bleibt fuer flexible Zusatznotizen. |
| `local_places` | `description`, `guestDescription`, `routeNote`, `morrowNote`, `cuisine`, `curationKind`, `eventDate`, `eventTime`, `eventAudience`, `eventSetting`, `eventFitNote`, `bestFor`, `audiences` und `images` nur noch als Fallback/Spiegel; `openingHours`, `ratingValue`, `updatedAt` | Admin/Scrape-Import | Admin, Guest | Event-/Kuratierungs-/Bilder-/Best-for-Kernfelder normalisiert; `Normalisieren V1` fuer Live-Oeffnungszeiten/Ratings bleibt | Kategorie, Koordinaten, Links, Rating, `opening_hours`, `package_fit`, Beschreibung, Kueche, Kuratierungsart, Event-Zeit, Zielgruppe, Bilder und Best-for liegen strukturiert vor. Live-Oeffnungszeiten/Ratings und Quellhistorie bleiben offen. |
| `support_messages` | `bookingId`, `ownerProfileId`, `propertyId`, `source`, `subject`, Kontakt-/Objekt-/Auszeitname und angefragter Zeitraum nur noch als Fallback/Spiegel; Statusnotizen, `updatedAt`, interne Kontextdaten | Guest, Owner, Admin | Admin, Guest, Owner | Support-Kontext normalisiert; `Pruefen` fuer SLA, Routing, Realtime/WhatsApp und Statusnotizen | Gast- und Owner-Support haben strukturierte Bezugspunkte zu Buchung, Owner, Objekt, Kontakt und Zeitraum. Payload bleibt fuer historische Kontext-Snapshots und RLS-Fallback. |
| `communication_events` | `supportId`, `templateKey` und `source` nur noch als Fallback/Spiegel; Mail-/Template-/Kontextdaten | Admin, Edge Functions, Guest/Owner-Flows | Admin, Guest/Owner teilweise | Support-/Template-/Source-Kontext normalisiert; `MVP-Payload ok` fuer Zustell- und Snapshot-Kontext | Ereignisse haben strukturierte Bezüge zu Lead, Buchung, Kunde und Supportfall sowie Template-/Quellenkontext. Payload bleibt fuer historische Zustellantworten, freie Template-Daten und Momentaufnahmen. |
| `guest_feedback` | `loved`, `improve`, `returnInterest`, Freitext-Details, `updatedAt` | Guest | Admin | `MVP-Payload ok`, spaeter `Normalisieren V2` | Strukturierte Kernelemente sind vorhanden. Tags, Aufgaben und Wiederbuchungsimpulse koennen spaeter normalisiert werden. |
| `owner_documents` | `periodLabel`, Dokumentkontext, `updatedAt` | Admin | Admin, Owner | `MVP-Payload ok` | Sobald Upload/Versionierung kommt, braucht es Storage-Metadaten und ggf. Dokumentversionen. |
| `owner_statements` | Abrechnungsnotizen, `updatedAt` | Admin | Admin, Owner | `Normalisieren V2` | Fuer MVP-Light okay. Bei echter Abrechnung braucht es Positionen, Waehrung, Steuer, Exportstatus. |
| `owner_operations` | Operationskontext, Dienstleister-/Objektinfos, `updatedAt` | Admin | Admin, Owner | `Normalisieren V2` | Bei echtem Operationssystem braucht es Statushistorie, Verantwortliche, Dateien und Objektbezug. |
| `admin_tasks` | Bezugsdetails, urspruenglicher Kontext, `updatedAt` | Admin | Admin | `MVP-Payload ok`, spaeter `Pruefen` | Aufgabe hat relationale Kernfelder. Payload kann Kontext-Snapshot bleiben, solange Bezug sauber ueber `reference_type`/`reference_id` laeuft. |
| `admin_audit_logs` | Snapshot der Aenderung, `from`, `to`, IDs, Statuswerte, technische Details | Admin via `insertAdminAuditLog` | Admin | `MVP-Payload ok` | Audit-Payload ist absichtlich Snapshot. Wichtig ist semantische Mindesttiefe je kritischer Aktion. |

## Sofortige V1-Kandidaten

Diese Felder sind die wichtigsten Kandidaten fuer fruehe Normalisierung, weil sie in Workflows, Filtern, Automationen oder im Gaestebereich relevant sind:

1. `leads.followUpAt` aus Payload in eigene Spalte oder eigene Follow-up-Tabelle. Stand: umgesetzt als `leads.follow_up_at` mit Payload-Fallback.
2. `leads.whatsappOptIn` und Marketing-/Kontakt-Einwilligungen in eigene Consent-Struktur. Stand: WhatsApp-Kontaktzustimmung umgesetzt als `leads.whatsapp_opt_in` plus `whatsapp_consent_at`; breitere Marketing-Consent-Struktur bleibt offen.
3. Reisegruppe in Leads und Bookings: Erwachsene, Kinder, Kinderalter, Hund. Stand: fuer `leads` und `bookings` umgesetzt als `adults`, `children`, `children_ages` und `dog` mit Payload-Fallback.
4. Buchungsfristen und Zahlungsdetails: Reservierungsfrist, Zahlungsfrist, Zahlungsstatusdetails. Stand: operative Felder in `bookings` normalisiert; echte Aufgaben-/Reminderlogik bleibt offen.
5. `bookings.guestAccessCode` beziehungsweise Freigabe/Zugang als stabile Buchungszugangsstruktur. Stand: `guest_access_code` existiert strukturiert; Freigabestatus/Guest-App-Zugang bleibt ueber Buchungsstatus gesteuert.
6. Unterkunfts-Check-in: Adresse, Schluesselart, Code, Anreisefenster, Checkout, Ansprechpartner. Stand: operative Property-Felder in `properties` normalisiert; echte Medienbibliothek, Upload und Statushistorien bleiben offen.
7. Lokale Events: Datum, Uhrzeit, Quelle, Zielgruppe, Indoor/Outdoor, Kuratierungsstatus.
8. Lokale Bilder/Oeffnungszeiten/Ratings als strukturierte Daten statt reinem Payload. Stand: Bilder und Event-/Kuratierungsfelder normalisiert; Live-Oeffnungszeiten/Ratings bleiben offen.

## Bewusst Als Payload Lassen

Diese Felder sind fuer Phase 1 bewusst flexibel:

- Story-/Copy-Felder einer Auszeit: Headlines, Gefuehl, Empfehlungen, FAQ, Highlights.
- Interne Notizen und Momentaufnahmen.
- Audit-Payload als Aenderungs-Snapshot.
- Kommunikationspayloads als Zustell-/Kontext-Snapshot.
- Best-for-/Empfehlungslisten, solange sie nicht fuer harte Filter oder Automationen gebraucht werden.

## Nächster Technischer Schritt

Wenn weiter konsolidiert wird, sollte nicht wahllos normalisiert werden. Die Reihenfolge sollte sein:

1. Gemeinsame Payload-Key-Konstanten und kleine Mapper fuer `lead`, `booking`, `property`, `local_place`.
2. Danach eine Supabase-Migration fuer den ersten V1-Kandidaten.
3. Erst dann Admin-/Guest-/Owner-Code auf die neue Struktur umstellen.
4. Zum Schluss Vite-Referenz markieren: ersetzt, migriert oder bewusst verworfen.
