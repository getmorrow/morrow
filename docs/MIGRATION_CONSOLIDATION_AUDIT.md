# Morrow Migration And Consolidation Audit

Stand: 2026-06-28

Dieses Dokument ist der neue Arbeitsrahmen fuer den Konsolidierungs-Sprint. Es gilt zusammen mit `docs/MORROW_MASTER_FRAME.md`, `docs/STRATEGIC_FOUNDATION_MORROW.md` und `docs/PLATFORM_ARCHITECTURE.md`.

Die konkrete Admin-CRM-Paritaet wird in `docs/ADMIN_CRM_PARITY_CHECKLIST.md` abgearbeitet. Die Payload-Grenzen und Normalisierungskandidaten sind in `docs/PAYLOAD_NORMALIZATION_INVENTORY.md` festgehalten.

## Leitentscheidung

Bis zur Admin-CRM-Paritaet werden keine neuen Produktfeatures gebaut.

Grund:

- Der Vite-Prototyp enthaelt weiterhin wichtige CRM-, Admin-, Guest- und Betriebslogik.
- Die neue Next-Struktur ist richtig, aber `apps/admin` ist noch nicht vollstaendig als Ersatz fuer den alten Admin-CRM bewiesen.
- Admin ist laut Architektur die Quelle der Wahrheit. Deshalb darf kein weiterer Funktionsausbau entstehen, der Datenlogik zwischen Prototyp, Next-Admin, Guest-App und Owner-App weiter verstreut.

## Fuehrende App Pro Bereich

| Bereich | Fuehrende App jetzt | Ziel-App | Entscheidung |
| --- | --- | --- | --- |
| Oeffentliche Website | `apps/web` | `apps/web` | Fuehrend fuer SEO, Ratgeber, Auszeiten, Eigentuemerseite, Erlebnispartner und Rechtstexte. Root-Vite ist hier nur noch Prototyp/Referenz. |
| Gaeste-App | `apps/guest` fuer Next-Zugang, Vite als Referenz | `apps/guest` | Next ist technisch fuehrend fuer codegeschuetzten Zugang. Vite bleibt Referenz fuer noch nicht ueberfuehrte Guest-UX-Details. |
| Eigentuemer-App | `apps/owner` | `apps/owner` | MVP-Light fuehrend, aber nur fuer Ausschnitte, die Admin/Supabase bereits pflegen kann. |
| Admin-App | `apps/admin` teilweise, Vite-Prototyp weiterhin Referenz | `apps/admin` | Noch nicht voll produktiv fuehrend. Next-Admin wird erst nach CRM-Paritaetscheck und fehlenden Kernfunktionen als alleinige Quelle der Wahrheit behandelt. |
| Shared Domain/Supabase | verteilt in Apps + `src/lib/morrowBackend.ts` | `packages/domain`, `packages/supabase` | Teilweise konsolidiert. Erste gemeinsame Typen, Select-Grenzen und Audit-Write-Helper sind vorhanden; Payload-Normalisierungsinventar ist dokumentiert. Mapper, Typen und Mutationen sind aber weiter zu stark in App-Komponenten verstreut. |

## Bestandsaufnahme

### Alter Vite-Prototyp

Wichtige Dateien:

- `src/App.tsx`: grosser Monolith fuer oeffentliche Website, Admin-CRM, Guest-App, Formularlogik und viele Workflows.
- `src/GuestLocalMap.tsx`: alte Kartenlogik fuer Gaestebereich.
- `src/data.ts`: statische Inhalte und Angebotsdaten fuer Prototyp.
- `src/data/localPlaces.ts`: lokale Orte/Kandidaten fuer Prototyp.
- `src/lib/morrowBackend.ts`: Supabase-Adapter fuer Prototyp mit LocalStorage-Fallback.
- `src/lib/supabase.ts`: Vite-Supabase-Client.

Was dort noch steckt:

- Lokaler Demo-/Fallback-Betrieb ueber LocalStorage.
- Alter Admin mit Bereichen: Uebersicht, Anfragen, Aufgaben, Gaestesupport, Kunden, Buchungen, Auszeiten, Erlebnisse, Vor Ort, Eigentuemer, Agenturen, Erlebnisanbieter, Aktivitaet.
- CRM-Funktionen fuer Leads inklusive Status, Wiedervorlagen, Archivierung, Loeschen von Test/Spam und Kundensatzbildung.
- Groessere Detail-Drawer fuer Leads, Buchungen, Auszeiten, Erlebnisse, Orte, Eigentuemer/Objekte und Anbieter.
- Guest-App-UX als Vorlage fuer App-Gefuehl, Vor-Ort-Karte, Hilfe, Feedback und Wiederbuchung.
- Prototyp-spezifische Speicher-Keys wie `morrow-admin-packages`, `morrow-admin-tasks`, `morrow-admin-bookings`, `morrow-admin-customers`.

Rolle ab jetzt:

- Referenz und Funktionsbasis.
- Keine neuen Features ausser kritische Fixes.
- Schrittweise als erledigt markieren, sobald Next-Paritaet plus Supabase-Datenfluss bewiesen ist.

### Neue Next-Apps

`apps/web`:

- Enthalten: Startseite, Auszeitenuebersicht, Family Escape, Couple Reset, Eigentuemer, Erlebnispartner, Ratgeberuebersicht, Ratgeberartikel, Rechtstexte, Sitemap, Robots, Schema.org und Analytics-Komponente.
- Status: Fuehrend fuer oeffentliche Website.
- Fehlend/Offen: Ratgeber systematisch ausbauen, finale Rechtspruefung, echte Tracking-IDs/Test-Events, Kampagnen-Landingpages bei Bedarf.

`apps/guest`:

- Enthalten: codegeschuetzter Zugang `/deine-auszeit/[bookingId]?code=...`, `get_guest_stay()`, Start, Auszeit, Buchung, Vor Ort, Hilfe, Feedback, Wiederkommen, Leaflet-Karte, Wetter, Gezeiten-V1, lokale Orte, Supportverlauf.
- Status: Next-Migration weit fortgeschritten, aber nicht komplett final.
- Fehlend/Offen: echte Live-/Amts-Gezeitenquelle, feinere Nach-Aufenthalt-Logik, Realtime/WhatsApp-nahe Supportkommunikation, weitere Statusvarianten.

`apps/owner`:

- Enthalten: Supabase-Login, `owner_profiles`, `owner_property_access`, `get_owner_dashboard()`, Objekte, Auszeiten, Termine, Buchungen, Dokumente, Abrechnungen, Operationsmeldungen, Rueckfragen und Antwort-/Statushistorie.
- Status: MVP-Light, sinnvoller Ausschnitt.
- Fehlend/Offen: echte Kalenderwirkung fuer Verfuegbarkeits-/Eigenbelegungsfreigaben, tieferes Performance-Dashboard, Abrechnungsdetails, Dokumenten-Upload, spaetere Rollen/Partnerportale.

`apps/admin`:

- Enthalten: Supabase-Login, Rollencheck, operative Uebersicht, Kennzahlen, Monitoring, Leads, Buchungen, Support, Feedback, lokale Orte, Erlebnisbausteine, Termine, Auszeiten, Unterkuenfte, Agenturen, Eigentuemerprofile, Objektzugriffe, Dokumente, Abrechnungen, Operationsmeldungen, Audit-Log.
- Status: echte operative Funktionen vorhanden, aber noch kein vollstaendiger Ersatz fuer alten Vite-Admin.
- Fehlend/Offen: CRM-Paritaet pruefen und Luecken schliessen, spaetere Entscheidung zu echten Admin-Routen statt clientseitiger Arbeitsbereiche, zentrale Kundennotiz/echte Customers-Quelle entscheiden, Aufgaben-Archivierungsstrategie, Medienbibliothek, Kommunikationsvorlagen, tiefere Filter, vollstaendige Detailseiten, konsolidierte Domain-/Mutation-Layer.

### Supabase

Fuehrende Tabellen/RPCs im aktuellen Stand:

- Kern: `leads`, `customers`, `bookings`, `packages`, `package_dates`, `properties`, `experience_providers`, `experience_blocks`, `local_places`, `admin_tasks`, `support_messages`.
- Kommunikation: `email_events`, `communication_events`, `support_status_events`.
- Feedback: `guest_feedback`.
- Admin/Rollen: `admin_users`, `get_morrow_admin_profile()`, `is_morrow_admin()`.
- Guest: `get_guest_stay()`, `get_guest_support_events()`.
- Owner: `owner_profiles`, `owner_property_access`, `owner_documents`, `owner_statements`, `owner_operations`, `get_owner_dashboard()`, `get_owner_operations()`, `get_owner_communication_events()`, `get_owner_support_status_events()`.
- Agenturen: `agencies`.

Risiko:

- Viele Felder liegen weiter in `payload`; die aktuelle Inventur und V1-Kandidaten stehen in `docs/PAYLOAD_NORMALIZATION_INVENTORY.md`.
- Typen und Mapper sind mehrfach in App-Komponenten statt in `packages/domain` oder `packages/supabase`.
- Einige Next-Admin-Mutationen schreiben direkt aus der Komponente in Supabase. Das funktioniert, ist aber schwer zu pruefen und wiederzuverwenden.

## Migrationsmatrix

| Bereich | Alte Datei/Funktion | Neue Ziel-App | Status | Prioritaet | Offene Risiken |
| --- | --- | --- | --- | --- | --- |
| Oeffentliche Startseite | `src/App.tsx`, `src/data.ts` | `apps/web/app/page.tsx`, `packages/domain` | migriert | hoch | Inhalte muessen weiter an Strategie/SEO ausgerichtet bleiben; Root-Vite darf nicht mehr fuehrend sein. |
| Auszeiten-Webseiten | `src/App.tsx`, Paketdaten | `apps/web/app/auszeiten/*`, `packages/domain` | migriert | hoch | Website-Inhalte sind statisch/domain-basiert; Admin-CMS fuer Website-Copy ist noch nicht Ziel des MVP. |
| Ratgeber | `src/App.tsx` Prototyp | `apps/web/app/ratgeber/*`, `packages/domain` | migriert / teilweise | hoch | Ausbauplan, interne Verlinkung, Keyword-Cluster und echte Artikelbreite offen. |
| Rechtstexte | Prototyp/Footer | `apps/web/app/agb`, `datenschutz`, `buchungsbedingungen`, `stornobedingungen`, `zahlungsbedingungen` | migriert / teilweise | hoch | Juristische Finalpruefung offen. |
| Leadformulare | Vite-Formulare + `morrowBackend.ts` | `apps/web/app/_components/LeadForm.tsx`, Supabase Edge Functions | migriert | hoch | Mailfehler duerfen Lead nicht blockieren; Tracking/UTM live pruefen. |
| Admin-Login/Rollen | `src/App.tsx` AdminAccess | `apps/admin/app/page.tsx`, `AdminLoginForm`, Supabase Auth/RPC | migriert | kritisch | Admin-Userpflege/Rotation operativ dokumentieren. |
| Admin-Shell | Vite `AdminSection` Navigation | `apps/admin/app/dashboard/AdminDashboardClient.tsx` | weitgehend migriert | kritisch | Alte Kernbereiche sind in Workspaces gebuendelt und im Hero sichtbar zugeordnet: Uebersicht, CRM, Aufgaben, Support, Operations, Bestand, Partner, Eigentuemer, Aktivitaet. Echte interne Routen bleiben spaetere Architekturentscheidung. |
| Admin-Uebersicht | Vite `overview` | `apps/admin/app/dashboard/AdminDashboardClient.tsx` | weitgehend migriert | kritisch | Next hat clientseitige Arbeitsbereiche fuer Uebersicht, CRM, Aufgaben, Support, Operations, Bestand, Partner, Eigentuemer und Aktivitaet; Uebersicht zeigt Kennzahlen, Tagessteuerung, Monitoring und Audit. Echte Routen bleiben spaetere Architekturentscheidung. |
| Anfragen/Leads | Vite `leads`, Lead-Drawer | `apps/admin` Leads-Sektion | weitgehend migriert | kritisch | Status, Reservierung, Detailbearbeitung im Drawer, Aktiv-/Archivfilter, normalisierte Wiedervorlage `leads.follow_up_at`, normalisierte WhatsApp-Zustimmung `leads.whatsapp_opt_in`/`whatsapp_consent_at`, normalisierte Reisegruppe `adults`/`children`/`children_ages`/`dog`, Reaktivierung und Testloeschung vorhanden; Spam-Policy und Marketing-Consent bleiben offen. |
| Kunden | Vite `customers` | `apps/admin` | weitgehend migriert | kritisch | Next verbindet echte `customers`-Datensaetze mit Gastanfragen und Buchungen, zeigt Kontaktlinks, Anfrage-/Buchungsbezug, naechsten Schritt, zentrale Kundennotiz und Kundendetail mit Kommunikations-/Aenderungshistorie; Dublettenbereinigung und spaetere Normalisierung der Customer-Erzeugung bleiben offen. |
| Buchungen | Vite `bookings`, Booking-Drawer | `apps/admin` Buchungssektion | weitgehend migriert | kritisch | Status, Zahlung, Grunddaten, Reisegruppe, Fristen, Operationsstatus, naechste Aufgabe und Gaestebereich-Code/-Link sind strukturiert in `bookings` vorhanden und werden in `get_guest_stay()` fuer die Gaeste-App bereitgestellt; Kundenbezug, Aufgabenfluss und spaetere Freigabe-/Termin-Normalisierung weiter pruefen. |
| Aufgaben | Vite `tasks` | `apps/admin` Aufgabenbereich + Supabase `admin_tasks` | weitgehend migriert | kritisch | Next kann Aufgaben anlegen, bearbeiten, filtern, Status aendern, loeschen und Bezuege oeffnen; Archivierungsstrategie und dedizierte Anbieterbearbeitung bleiben offen. |
| Gaestesupport | Vite `guestSupport` | `apps/admin` Supportsektion + `apps/guest` Hilfe | weitgehend migriert | kritisch | Status-, Dringlichkeits- und Kategoriefilter, priorisierte Liste, Notiz, E-Mail, Verlauf und `support_status_events` vorhanden; SLA-Zeitregeln, Realtime/WhatsApp und spaetere Vorlagen offen. |
| Kommunikationshistorie | Vite `communication_events` Adapter | `apps/admin` Drawer + Aktivitaetsbereich + Supabase | weitgehend migriert | kritisch | Drawer-Notiz, freie E-Mail, zentrale Kommunikationshistorie mit Suche und Kanal-/Richtungsfilter vorhanden; Vorlagenbibliothek, WhatsApp-Opt-in-Dokumentation und spaetere Template-Flows offen. |
| Auszeiten/Paket-Builder | Vite `packages` Builder | `apps/admin` Bestand + Termine + `packages` | weitgehend migriert | kritisch | Next kann Kernfelder, Termine, Unterkunft, Copy, Medien, Highlights/Momente, Empfehlungen und FAQ payload-basiert pflegen; Launch-Check, Website-CMS-Grenze und spaetere Domain-Normalisierung bleiben offen. |
| Unterkunftsverwaltung | Vite Owner/Property/Profile | `apps/admin` Bestand/Objekte | weitgehend migriert | kritisch | Objektprofil, Check-in, Adresse, Anreisefenster, Regeln, Ausstattung, Attribute, Erlebniswelten, Medien-URL-Listen, Medienrechte, Operationsstatus, Objektpruefung und verknuepfte Auszeiten liegen strukturiert in `properties`; Medienbibliothek, Upload, Bildreihenfolge und Statushistorien bleiben offen. |
| Erlebnisbausteine | Vite `experiences` | `apps/admin` Erlebnisse | weitgehend migriert | hoch | Anbieterzuordnung, Rolle, Inklusivstatus, Preis-/Kapazitaets-/Verfuegbarkeitsnotiz, Gastnotiz, Readiness-Pruefung und Qualitaetsnotiz/-score liegen strukturiert in `experience_blocks`; Qualitaetshistorie und echte Termin-/Kontingentlogik bleiben offen. |
| Erlebnisanbieter | Vite `experienceProviders` | `apps/admin` Anbietersektion | weitgehend migriert | hoch | Anbieterprofile koennen gepflegt, pausiert/reaktiviert und mit Konditionen, Verfuegbarkeit, Kooperationsstand und verknuepften Erlebnisbausteinen gefuehrt werden; Statushistorie, Follow-up-Aufgaben und Partnerlogin V2 offen. |
| Agenturen | Vite `agencies` | `apps/admin` Agenturen | weitgehend migriert | hoch | Agenturen koennen gepflegt, pausiert/reaktiviert, mit Objekten verbunden und ueber Verfuegbarkeitsnotiz, Rueckmeldefrist, Wiedervorlage und Arbeitsuebersicht gesteuert werden; Kommunikationshistorie, echte Statushistorie und strukturierter Verfuegbarkeitsprozess bleiben offen. |
| Vor-Ort-Orte | Vite `localPlaces`, `src/data/localPlaces.ts` | `apps/admin` Orte + `apps/guest` Vor Ort | weitgehend migriert | hoch | Kuratierung, Freigabe, Karte, Links, Beschreibung, Kueche, Eventdaten, Best-for, Bilder und Gastansicht liegen strukturiert in `local_places`; Admin prueft fehlende Koordinaten, Beschreibung, Bilder und kategoriespezifische Pflichtfelder. Live-Oeffnungszeiten/Ratings, Quellhistorie und Medienqualitaet bleiben offen. |
| Veranstaltungen | Vite Local Places/Event Scrape | `local_places` + `apps/admin` + `apps/guest` | teilweise | mittel | Event-Datensaetze bleiben `local_places` mit Kategorie `event`; Admin pflegt Kuratierungsart, Datum/Zeit, Zielgruppe, Indoor/Outdoor und Morrow-Fit. Buchbare Erlebnisse werden in der Ortspruefung als falsche Event-Freigabe markiert; Scrape-Import, Quellqualitaet und echte Terminpflege bleiben offen. |
| Guest-App | Vite Guest-App in `src/App.tsx`, `src/GuestLocalMap.tsx` | `apps/guest` | teilweise / weit | hoch | Next ist fuehrend fuer Zugang; einige UX-/Statusdetails aus Vite noch Referenz. |
| Feedback/Wiederbuchung | Vite Guest-Feedback | `apps/guest`, `guest_feedback`, `communication_events`, Edge Function | teilweise | mittel | Feedback-Mail, strukturierte Rueckmeldung, Wiederbuchungsinteresse, Speicherung in `guest_feedback` und Eintrag in der zentralen Kommunikationshistorie vorhanden; Admin-Auswertung, Tags, Aufgaben aus Feedback und Wiederbuchungsimpulse bleiben light. |
| Owner-App | Prototyp-Admin/Owner-Ideen | `apps/owner` | teilweise | hoch | MVP-Light vorhanden; nur weiterbauen, wenn Admin-Daten stabil pflegbar sind. |
| Owner-Dokumente | nicht voll im Vite-Fokus | `owner_documents`, `apps/admin`, `apps/owner` | migriert fuer MVP-Light | mittel | Upload und Dokumentenablage statt URL offen. |
| Owner-Abrechnungen | Prototyp-Idee | `owner_statements`, `apps/admin`, `apps/owner` | migriert fuer MVP-Light | mittel | Noch kein echtes Abrechnungssystem/Export. |
| Owner-Operations | Prototyp-Idee | `owner_operations`, `apps/admin`, `apps/owner` | migriert fuer MVP-Light | mittel | Reinigungs-/Maengelprozesse noch nicht voll operativ. |
| Audit-Log | Vite Aktivitaet + `admin_audit_logs` | `apps/admin`, `packages/supabase`, `scripts/qa-admin-audit-coverage.mjs` | weitgehend migriert | hoch | Business-Mutationen im Next-Admin schreiben Audit und werden statisch per `npm run qa:admin-audit` geprueft; der Insert laeuft ueber `insertAdminAuditLog` in `packages/supabase`. Semantische Payload-Tiefe und externe Edge-Function-Actions weiter pruefen. |
| Shared Domain/Types | verstreut in `src/App.tsx`, Apps | `packages/domain`, `packages/supabase`, `docs/PAYLOAD_NORMALIZATION_INVENTORY.md` | teilweise | kritisch | Erster gemeinsamer Supabase-Typanker fuer JSON-Payloads und `local_places` wird von Admin und Guest genutzt. Audit-Insert ist zentralisiert und Payload-Normalisierung ist inventarisiert. Viele Admin-/Guest-/Owner-Zeilen, Mapper und Payload-Konventionen liegen aber weiter app-lokal; Risiko fuer Logikdrift bleibt hoch. |
| Dev/Deployment | Root Vite Scripts + Next Scripts | Monorepo Scripts/Vercel Apps | weitgehend migriert | mittel | Root `npm run dev` bleibt bewusst Prototyp. Next-Apps haben feste Port-Scripts (`web:dev:port`, `admin:dev:port`, `guest:dev:port`, `owner:dev:port`) und app-eigene Vercel-Konfigurationen. |

## Admin-Funktionsparitaet

### In beiden Welten vorhanden

- Admin-Zugang mit Supabase-Rollenbezug.
- Leads lesen und Status aendern.
- Gastlead in Reservierung/Buchung ueberfuehren.
- Buchungsstatus und Zahlungsstatus bearbeiten.
- Interne Notizen und Kommunikationsereignisse.
- Supportfaelle lesen und Status aendern.
- Aufgaben lesen und Status aendern.
- Auszeiten, Unterkuenfte, Termine, Erlebnisbausteine und lokale Orte aus Supabase lesen.
- Eigentuemerprofile, Objektzugriffe, Agenturen und Erlebnisanbieter als operative Datenbereiche.
- Audit-Log/Activity-Grundlage.

### In `apps/admin` vorhanden, aber noch nicht paritaetisch bewiesen

- CRM-Filter und Arbeitsansichten aus dem alten Admin.
- Kundenbereich mit Anfrage- und Buchungshistorie, echter `customers`-Quelle und zentraler Kundennotiz.
- Aufgabenbearbeitung, Loeschung und Statusflow.
- Spam-Policy und Marketing-Consent pruefen; Wiedervorlage, WhatsApp-Kontaktzustimmung und Lead-Reisegruppe sind normalisiert.
- Pruefen, ob clientseitige Arbeitsbereiche fuer MVP reichen oder echte Admin-Routen noetig werden.
- Voller Auszeiten-Builder inklusive Copy, FAQ, Medien, Momente, Empfehlungen und Launch-Check.
- Voller Unterkunfts-Editor inklusive Medienreihenfolge, Rechteworkflow und strukturierter Attribute ohne Payload-Drift.
- Voller Erlebnisanbieter-/Eigentuemer-/Agentur-Akquise-CRM mit Follow-ups und Statushistorie.

### In `apps/admin` gegenueber Vite verbessert

- Direkter Supabase-Login/Rollencheck ohne Demo-Bypass als Produktpfad.
- Owner-spezifische Tabellen fuer Dokumente, Abrechnungen und Operationsmeldungen.
- Guest- und Owner-Supportantworten koennen ueber sichtbare Kommunikationsereignisse in die jeweilige App zuruecklaufen.
- Statuswechsel fuer Owner-Support koennen als Statushistorie sichtbar werden.
- Health-Endpunkt und Vercel-Projektfaehigkeit.

### Datenlogik bereits korrekt in Supabase angelegt

- Admin-User/RLS fuer Adminzugriff.
- Public Lead Inserts und Lead-Notification.
- Guest-Stay-RPC und codegeschuetzter Guest-Supportverlauf.
- Communication Events, Email Events, Guest Feedback.
- Owner Profiles, Object Access, Owner Documents, Owner Statements, Owner Operations.
- Admin Tasks, Support Messages und Audit Logs.

### Dashboard/Stubs oder noch zu schwache Funktionen

- `apps/admin/README.md` war bis zu diesem Audit noch als Platzhalter formuliert.
- `apps/admin` ist aktuell eher eine lange operative Seite als ein ausgereifter CRM-Arbeitsbereich.
- `packages/domain` ist fuer Website-Inhalte stark, aber nicht fuer operative Admin-Domaenen.
- `packages/supabase` typisiert Owner stark, aber nicht Admin/Guest komplett.
- Lokale Ports und Fuehrungsrollen waren bisher ueber mehrere Dokumente verteilt.

## Dev- Und Betriebsbasis

### Lokale Apps

| App | Kommando | Typischer Port | Zweck |
| --- | --- | --- | --- |
| Vite-Prototyp | `npm run prototype:dev` oder aktuell auch `npm run dev` | `5173` | Prototyp/Funktionsreferenz, nicht finale Produktionsarchitektur. |
| Web | `npm run web:dev:port` | `4300` | Oeffentliche SEO-Website. |
| Admin | `npm run admin:dev:port` | `4301` | Neue Admin-App, noch in CRM-Paritaetsphase. |
| Guest | `npm run guest:dev:port` | `4310` | Gaeste-App / Deine Auszeit. |
| Owner | `npm run owner:dev:port` | `4320` | Eigentuemer-App MVP-Light. |

Hinweis: Ohne Portargument nimmt Next typischerweise `3000` und sucht bei belegtem Port weiter. Fuer Tests und Review sind die festen `*:dev:port`-Kommandos der Standard; die ungebundenen `web:dev`, `admin:dev`, `guest:dev` und `owner:dev` bleiben fuer Sonderfaelle verfuegbar.

### Admin-Workspace-Zuordnung

| Neuer Workspace | Alte Vite-Admin-Bereiche | Zweck im Konsolidierungsstand |
| --- | --- | --- |
| Uebersicht | Uebersicht | Tagessteuerung, Kennzahlen, Monitoring, Audit-Auszug. |
| CRM | Anfragen, Kunden, Buchungen | Gast-CRM von Anfrage bis Buchung. |
| Aufgaben | Aufgaben | Fälligkeiten, Prioritäten, Bezuege und Aufgabenstatus. |
| Support | Gaestesupport, Feedback | Supportfaelle, Gastnachrichten und Rueckmeldungen nach Aufenthalt. |
| Operations | Erlebnisse, Vor Ort, Termine | Erlebnisbausteine, lokale Orte, Veranstaltungen und Pakettermine. |
| Bestand | Auszeiten, Unterkuenfte | Paket-Builder, Objektprofile, Regeln, Medien- und Check-in-Daten. |
| Partner | Agenturen, Erlebnisanbieter | Phase-1-Agenturen und Erlebnispartner. |
| Eigentuemer | Eigentuemer | Owner-Profile, Zugriffe, Dokumente, Abrechnungen und Operationsmeldungen. |
| Aktivitaet | Aktivitaet, Kommunikation | Audit-Log und zentrale Kommunikationshistorie. |

### Build- Und QA-Kommandos

- Gesamter Typecheck: `npm run typecheck`
- Lint: `npm run lint`
- Web Build: `npm run web:build`
- Admin Build: `npm run admin:build`
- Guest Build: `npm run guest:build`
- Owner Build: `npm run owner:build`
- Apps-Production-QA: `npm run qa:apps`
- Public-Website-QA: `QA_BASE_URL=https://www.getmorrow.de npm run qa:production`
- Admin-Audit-QA: `npm run qa:admin-audit`
- Guest-RPC/Browsertest: `npm run supabase:verify-guest`
- Owner-RPC/E2E-Test: `npm run supabase:verify-owner`
- Supabase Backup: `npm run supabase:backup`

### Env-Handling

- Root `.env.local` ist lokal die zentrale Quelle.
- Next-Apps laden Root-`.env.local` ueber ihre `next.config.ts`.
- Public Supabase Variablen:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - alternativ lokal weiter `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
- Server-/Admin-Secrets gehoeren nicht in Browsercode.
- Supabase Service Role, Resend Key, GitHub PAT und aehnliche Secrets muessen rotiert bleiben, wenn sie im Arbeitsverlauf geteilt wurden.

### Shared Types Und Payload-Grenzen

- `packages/supabase` ist der technische Typanker fuer Supabase-nahe Row-Formen, Browserclient und app-uebergreifende Datenformen.
- `LocalPlaceRowBase`, `LocalPlaceCategory`, `LocalPlaceStatus` und `JsonRecord` werden als erste gemeinsame Typen von `apps/admin` und `apps/guest` genutzt.
- `localPlaceBaseSelectColumns` und `localPlaceAdminSelectColumns` sind die erste gemeinsame Repository-Grenze fuer Vor-Ort-Daten: Guest liest nur Gastspalten, Admin liest zusaetzlich `created_at`.
- `AdminAuditLogRow`, `AdminAuditLogInput`, `adminAuditLogSelectColumns` und `insertAdminAuditLog` sind die erste gemeinsame Schreib-Grenze fuer Admin-Aktivitaet. Die Admin-Komponente behaelt `writeAuditLog` als UI-State-Wrapper und QA-Anker.
- `docs/PAYLOAD_NORMALIZATION_INVENTORY.md` ist die fuehrende Liste fuer Payload-Felder, V1-Normalisierungskandidaten und bewusst flexible Payload-Bereiche.
- `packages/domain` bleibt der Ort fuer oeffentliche Website-/Marken-/Content-Domaenen wie Auszeiten, Ratgeber und Routen.
- App-spezifische UI-Drafts, Formulare und abgeleitete Viewmodels bleiben zunaechst in der jeweiligen App.
- Payload-basierte Felder sind Migrationsuebergang, nicht Zielarchitektur. Jede Normalisierung muss zuerst dokumentieren, welche App fuehrend schreibt und welche Apps nur lesen.

### Routen

| Welt | Route lokal/produktiv | Bemerkung |
| --- | --- | --- |
| Website | `/` | Fuehrend in `apps/web`. |
| Auszeiten | `/auszeiten`, `/auszeiten/family-escape`, `/auszeiten/couple-reset` | Public SEO/Conversion. |
| Ratgeber | `/ratgeber`, `/ratgeber/[slug]` | Public SEO/GEO. |
| Eigentuemer Landingpage | `/eigentuemer` | Public Akquise, nicht Owner-App. |
| Erlebnispartner | `/partner/erlebnisanbieter` und aktuell auch `/erlebnispartner` | Doppelte/alternative Route pruefen und langfristig vereinheitlichen. |
| Guest-App | `/deine-auszeit/[bookingId]?code=...` | Eigene App-Welt, kein Website-Footer. |
| Owner-App | `/owner` oder Weiterleitung ueber `/app/eigentuemer` | Geschuetzt, MVP-Light. |
| Admin-App | `/admin` bzw. App-Root des Admin-Projekts | Geschuetzt, noch CRM-Paritaetsphase. |
| Health | `/health` je Next-App | Deployment-Identitaet pruefen. |

## Konsolidierungs-Backlog Vor Neuem Featurebau

1. `apps/admin` gegen alten Vite-Admin bereichsweise abnehmen.
2. Admin-README und Plattformdoku auf realen Stand bringen.
3. Clientseitige Admin-Arbeitsbereiche gegen reale Nutzung testen und spaeter entscheiden, ob echte Admin-Routen noetig werden.
4. Kundenbereich in `apps/admin` paritaetisch weiterfuehren: zentrale Kundennotiz und Entscheidung echte `customers`-Quelle vs. Ableitung.
5. Aufgabenbereich paritaetisch weiterfuehren: Archivierungsstrategie statt hartem Loeschen und dedizierte Anbieterbearbeitung entscheiden.
6. Lead-Spam-/Loeschpolicy und Marketing-Consent pruefen/entscheiden; `leads.follow_up_at`, WhatsApp-Kontaktzustimmung und Lead-Reisegruppe sind bereits normalisiert.
7. Domain-/Supabase-Typen aus App-Komponenten in `packages/domain` und `packages/supabase` ziehen.
8. Entscheiden, welche Vite-Funktionen explizit ersetzt sind und welche als Referenz offen bleiben.
9. QA-Gates fuer Admin-Paritaet definieren: mindestens Login, Leads, Reservierung, Buchung, Aufgabe, Supportantwort, Paket, Unterkunft, Erlebnis, Ort, Owner-Dokument, Abrechnung, Operation.
10. Erst danach neue Produktfeatures wieder aufnehmen.

## Naechster empfohlener Schritt

Nicht weiter Guest-/Owner-Features bauen.

Als naechstes sollte ein Admin-Paritaets-Sprint beginnen:

1. `docs/ADMIN_CRM_PARITY_CHECKLIST.md` als fuehrende Ticketliste verwenden.
2. Mit Kunden und Aufgaben starten, weil diese im alten CRM zentrale Arbeitsbereiche waren und in Next noch nicht gleichwertig sind.
3. Danach Lead-Archiv/Wiedervorlagen und echte Bereichsnavigation.
4. Erst nach diesen Gates wieder Featureideen aufnehmen.
