# Morrow Backend Foundation

Dieses Dokument beschreibt den ersten produktionsnahen Backend-Schritt fuer Phase 1.

## Ziel

Der aktuelle Prototyp darf lokal weiter funktionieren. Sobald Supabase konfiguriert ist, werden neue Leads und Support-Nachrichten zusaetzlich in Supabase gespeichert und Leads beim Start aus Supabase geladen.

## Aktivierung

1. Supabase-Projekt anlegen.
2. SQL aus `supabase/migrations/202606030001_morrow_phase1_core.sql` ausfuehren.
3. `.env.local` anlegen:

```bash
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

4. App neu starten.

## Phase-1-Tabellen

- `leads`: Gast-, Eigentuemer- und Erlebnisanbieteranfragen.
- `customers`: spaetere Kundensaetze nach Qualifizierung/Buchung.
- `bookings`: verbindliche Buchungen nach Reservierung/Zahlung.
- `packages`: Auszeiten wie Family Escape und Couple Reset.
- `package_dates`: verfuegbare feste Termine je Auszeit.
- `properties`: Unterkuenfte/Objekte, spaeter auch Wohnungen oder Hotel-Kooperationen.
- `experience_providers`: Erlebnisanbieterprofile.
- `experience_blocks`: Erlebnisbausteine, die mit Auszeiten und Anbietern verbunden werden.
- `local_places`: kuratierte Vor-Ort-Orte, Restaurants, Straende, Hilfe, Einkauf, Veranstaltungen.
- `admin_tasks`: Wiedervorlagen und operative Aufgaben.
- `support_messages`: Nachrichten aus dem Gaestebereich.

## Sicherheitsstand

Aktuell ist das Schema bewusst V1:
- oeffentliche Formulare duerfen Leads und Support-Nachrichten anlegen.
- Lesen/Bearbeiten ist fuer `authenticated` vorgesehen.
- Der Admin-Login ist der naechste Pflichtschritt, bevor echte Daten genutzt werden.

Nicht live gehen, bevor:
- Admin-Auth aktiv ist.
- RLS-Policies auf echte Rollen/Mitarbeitende eingeschraenkt sind.
- Datenschutz, Impressum und WhatsApp-Opt-in final sind.
- E-Mail-Automation aktiv ist.

## Naechster Schritt

Admin Auth:
- Supabase Auth einrichten.
- `/admin` schuetzen.
- Login-Screen in Morrow-CRM-Optik bauen.
- danach schrittweise Admin-Daten aus Supabase laden.

## Admin Auth V1

Umgesetzt:
- Wenn Supabase nicht konfiguriert ist, bleibt `/admin` als lokale Demo erreichbar.
- Wenn Supabase konfiguriert ist, wird `/admin` erst nach Supabase-Session und aktivem Admin-Profil angezeigt.
- Login erfolgt per E-Mail und Passwort.
- Tabelle `admin_users` definiert, welche E-Mail-Adressen Admin-Rechte haben.
- RLS nutzt `is_morrow_admin()`, damit eine normale Supabase-Session keine CRM-Daten lesen oder bearbeiten darf.
- Start-Admin: `auszeiten@getmorrow.de` mit Rolle `owner`.
- Die Admin-Topbar zeigt den Auth-Modus: lokale Demo oder freigegebene Admin-E-Mail.
- Abmelden ist sichtbar, sobald Supabase Auth aktiv ist.

Wichtig:
- In Supabase muessen zulaessige Redirect URLs gesetzt werden, z. B. `http://127.0.0.1:5173/admin` lokal und spaeter die produktive Domain.
- Neue Admins brauchen zwei Dinge: Auth-User in Supabase und Eintrag in `admin_users`.
- Oeffentliche Registrierung sollte in Supabase Auth deaktiviert bleiben. Selbst wenn jemand eine Session bekommt, blockt RLS alle CRM-Daten ohne `admin_users`-Freigabe.

## Supabase Verbindung - 2026-06-03

Aktiv:
- `VITE_SUPABASE_URL` ist lokal gesetzt.
- `VITE_SUPABASE_ANON_KEY` ist lokal gesetzt.
- Tabellenmigration wurde im Supabase SQL Editor ausgefuehrt.
- API-Rechte und RLS-Policies wurden nachgezogen.

Geprueft:
- Oeffentliche Leads koennen mit `anon` geschrieben werden.
- Support-Nachrichten koennen mit `anon` geschrieben werden.
- `anon` bekommt keine Leserechte auf Leads. Das ist bewusst richtig.
- Server-/Admin-Kontext kann mit Service Role lesen, schreiben und aufraeumen.
- Ein echtes Formular aus der Website hat erfolgreich einen Lead in Supabase angelegt.

QA-Regel:
- Der Smoke-Test nutzt in Development `qa_local=1`, damit er keine echten QA-Leads in Supabase anlegt.
- Der Admin-Smoke nutzt in Development `admin_demo=1`, damit lokale QA ohne Supabase-Login moeglich bleibt.
- Beide Parameter greifen nur in `import.meta.env.DEV` und oeffnen die Production-App nicht.

## Admin Lead Sync V1

Umgesetzt:
- Neue oeffentliche Leads werden in Supabase angelegt.
- Bei aktiver Admin-Session werden Leads aus Supabase geladen.
- Bei aktiver Admin-Session werden Lead-Aenderungen nach Supabase geschrieben:
  - Status
  - Kontakt-/Formulardaten
  - interne Notizen
  - Wiedervorlage
  - Archivierung
  - Loeschen

Bewusste Grenze:
- Im lokalen `admin_demo`-Modus bleiben Admin-Aenderungen lokal.
- Im lokalen `qa_local`-Modus erzeugt die QA keine Supabase-Testleads.
- Aufgaben, Buchungen, Auszeiten, Objekte und lokale Orte werden als naechster Block auf Supabase-Mutations umgestellt.

## Admin Tasks Sync V1

Umgesetzt:
- Bei aktiver Admin-Session werden Admin-Aufgaben aus Supabase geladen.
- Neue Aufgaben werden in `admin_tasks` gespeichert.
- Statuswechsel wie `open`, `in_progress` und `done` werden synchronisiert.
- Erledigungszeitpunkt und Notizen bleiben im Payload erhalten.
- Loeschen von Aufgaben wird in Supabase gespiegelt.

Buchungs-Ops Einordnung:
- Buchungen sind im aktuellen Prototyp noch aus Gast-Leads abgeleitet.
- Buchungsrelevante Aenderungen wie Status, Zahlung, Check-in und Erlebnisstatus laufen deshalb bereits ueber den Lead-Sync.
- Operative Buchungsaufgaben laufen jetzt ueber den Task-Sync.

Naechster Backend-Schritt:
- Eigenstaendige `bookings`-Datensaetze erzeugen, sobald aus einem Gast-Lead verbindlich reserviert/bezahlt wird.
- Danach Gaestebereich langfristig aus `bookings` statt nur aus `leads` speisen.

## Booking Sync V1

Umgesetzt:
- Wenn ein Gast-Lead einen buchungsrelevanten Status bekommt, wird ein Datensatz in `bookings` angelegt oder aktualisiert.
- Relevante Status: `Reserviert`, `Bezahlt`, `Vor Anreise`, `Aktiv`, `Abgeschlossen`, `Storniert`.
- Gespeichert werden Status, Zahlungsstatus, Zugangscode, Termin, Gaestedaten, Check-in-/Erlebnisstatus und operative Notizen im Payload.
- `lead_id` verbindet die Buchung mit dem urspruenglichen Lead.

Bewusste Grenze:
- `package_id` bleibt fuer V1 in der relationalen Spalte noch `null`, weil `packages` noch nicht nach Supabase synchronisiert/ge-seedet sind.
- Paketbezug liegt bis zum Package-Sync im Payload ueber `packageSlug`, `packageName` und `packageId`.

Naechster Schritt:
- `packages`, `package_dates` und `properties` nach Supabase bringen.
- Danach `bookings.package_id` und spaeter `package_date_id` sauber relational setzen.

## Package / Dates / Property Sync V1

Umgesetzt:
- Auszeiten werden in `packages` gespeichert.
- Termine werden als `package_dates` gespeichert.
- Unterkuenfte werden als `properties` gespeichert.
- Admin-Aenderungen an Auszeiten synchronisieren bei aktiver Supabase-Session nach Supabase.
- Erstellen, Duplizieren, Bearbeiten, Pausieren und Loeschen von Auszeiten ist remote-faehig.
- Seed-Script `npm run supabase:seed-packages` schreibt die aktuellen Start-Auszeiten einmalig in Supabase.

Geprueft:
- `Family Escape` und `Couple Reset` sind in Supabase geseedet.
- Vier Starttermine sind in `package_dates` gespeichert.
- `Nordlicht Lodge` und `Dünenruhe Suite` sind in `properties` gespeichert.
- `bookings.package_id` kann jetzt relational auf `packages.id` zeigen.

Naechster Schritt:
- `package_date_id` in Buchungen setzen, sobald Termine nicht nur als Label, sondern mit stabilen Termin-IDs im Admin gewaehlt werden.
- Danach Gaestebereich auf echte `bookings` plus `packages` umstellen.

## Guest Stay Remote Access V1

Umgesetzt:
- Supabase RPC `get_guest_stay(p_booking_id, p_access_code)` ergaenzt.
- Oeffentlicher Zugriff auf den Gaestebereich erfolgt ueber Buchungs-ID plus Zugangscode.
- `bookings` bleibt nicht oeffentlich lesbar.
- Falscher Zugangscode liefert keine Daten.
- `GuestStayPage` kann jetzt eine Remote-Buchung aus Supabase laden, wenn lokal kein Lead vorhanden ist.
- Der bestehende lokale Demo-/Testlead-Fallback bleibt erhalten.

Geprueft:
- Testbooking mit Status `Bezahlt` angelegt.
- RPC mit richtigem Code liefert Buchung und Auszeit.
- RPC mit falschem Code liefert keine Daten.
- App-Seite `/deine-auszeit/:id?code=...` rendert aus Remote-Buchung.

Screenshot:
- `/Users/gerwins/Documents/New project/tmp/qa/guest-remote-booking-v1/mobile.png`

Naechster Schritt:
- E-Mail-Automation bauen, damit nach Anfrage/Buchung automatisch Bestätigung und spaeter Gaestebereich-Link versendet werden koennen.

## Supabase Storage Audit - 2026-06-05

Aktueller Stand:
- Leads, Admin Auth, E-Mail-Events, Kommunikationshistorie, Aufgaben, Auszeiten, Termine, Unterkuenfte aus Auszeiten, Buchungsanlage und Gaestebereich-Zugriff sind Supabase-angebunden.
- Browser-Speicherung existiert noch als Demo-/Fallback-Schicht.
- Kritische Admin-Module sind noch nicht Supabase-first: Vor-Ort-Orte und Veranstaltungen, Erlebnisanbieter, Agenturen, freie Eigentuemer-/Objektprofile, Kunden als eigene Datensaetze und Buchungen als vollwertige Admin-Quelle.

Wichtige Regel:
- Alles, was im Admin kuratiert oder freigegeben wird, muss kuenftig in Supabase landen. `localStorage` ist nur fuer lokale Demo oder technische Fallbacks erlaubt.

Prioritaet:
1. `local_places` produktionsnah anbinden, weil die Vor-Ort-Seite fuer den Gaestebereich ein Kernmehrwert ist.
2. `experience_providers` und `experience_blocks` anbinden.
3. Agenturen und Eigentuemerobjekte sauber trennen.
4. Kunden und Buchungen als echte CRM-Daten aus Supabase lesen.

Detailaudit:
- `docs/SUPABASE_STORAGE_AUDIT_2026-06-05.md`

## Local Places Sync V1 - 2026-06-05

Umgesetzt im Code:
- Admin-Vor-Ort-Orte koennen aus `local_places` geladen werden.
- Bearbeiten, Freigeben, Pausieren, Ablehnen, Importieren und Loeschen synchronisiert nach Supabase, sobald Admin Auth aktiv ist.
- Der Gaestebereich kann freigegebene Orte aus Supabase laden.
- Statische/lokale Orte bleiben nur als Fallback fuer lokale Demo und Uebergang.
- Seed-Skript `npm run supabase:seed-local-places` schreibt die aktuellen kuratierten Orte in `local_places`.

Migration erforderlich:
- `supabase/migrations/202606050001_local_places_public_read.sql` ausfuehren, damit Gaeste nur freigegebene Orte lesen duerfen.

Naechster Schritt:
- Nach Migration und Seed auf Live pruefen, ob Vor-Ort-Filter, Karte, Drawer und Veranstaltungen aus Supabase kommen.
- Danach Erlebnisanbieter und Erlebnisbausteine nach Supabase migrieren.

## Experience Providers / Blocks Sync V1 - 2026-06-05

Umgesetzt im Code:
- Erlebnisanbieter koennen aus `experience_providers` geladen werden.
- Erstellen, Bearbeiten, Pausieren, Import aus Rohkalender und Loeschen synchronisiert nach Supabase, sobald Admin Auth aktiv ist.
- Paket-Sync spiegelt Erlebnisbausteine aus `experienceItems` zusaetzlich nach `experience_blocks`.
- Seed-Skript `npm run supabase:seed-experiences` schreibt Start-Anbieter und spiegelt Erlebnisbausteine aus bestehenden Supabase-Paketen.

Bewusste Grenze:
- Die Admin-UI arbeitet V1 weiter ueber die Auszeiten/Paket-Formulare. `experience_blocks` ist jetzt die relationale Spiegelung fuer naechste Ausbaustufen, noch nicht die alleinige Quelle der UI.

Naechster Schritt:
- Erlebnisbausteine spaeter direkt aus `experience_blocks` laden und bearbeiten, damit Auszeiten, Anbieter und Bausteine komplett relational arbeiten.

## Admin Audit Log V1 - 2026-06-23

Umgesetzt im Code:
- Migration `202606230003_admin_audit_logs.sql` ergänzt.
- Neue Tabelle `admin_audit_logs` protokolliert Admin-Aktionen mit Actor, Aktion, Entität, Label, Payload und Zeitstempel.
- RLS erlaubt Lesen und Schreiben nur für freigegebene Morrow-Admins über `is_morrow_admin()`.
- Admin-Speicheraktionen schreiben Audit-Einträge für Leads, Buchungen, Auszeiten, Objektprofile, Erlebnisanbieter, lokale Orte, Aufgaben und Agenturen.

Bewusste Grenze:
- Audit-Log ist zunächst Backend-Grundlage. Eine eigene Admin-Timeline/Activity-Ansicht folgt später.
- Die Migration muss im verknüpften Supabase-Projekt ausgeführt werden, bevor Live-Audit-Einträge gespeichert werden.

## Owner Properties / Agencies Sync V1 - 2026-06-05

Umgesetzt im Code:
- Eigentümer-/Objektprofile können aus `properties` geladen werden.
- Erstellen, Bearbeiten, Pausieren, Profilanlage aus Eigentümeranfrage und Löschen synchronisiert nach Supabase, sobald Admin Auth aktiv ist.
- Agenturen sind als eigene Tabelle `agencies` ergänzt.
- Agenturen können geladen, erstellt, bearbeitet, pausiert, mit Objekten verbunden und gelöscht werden.
- Seed-Skript `npm run supabase:seed-owners-agencies` schreibt die Startobjekte und Startagenturen nach Supabase.

Bewusste Grenze:
- `properties` wird V1 sowohl für Unterkunftsdaten aus Auszeiten als auch für Objektprofile genutzt. Der vollständige Admin-Kontext liegt im Payload.

Naechster Schritt:
- Kunden und Buchungen als echte CRM-Daten aus Supabase lesen, nicht nur aus Leads ableiten.

## Email Automation V1

Umgesetzt:
- Migration `202606030005_email_events.sql` fuer E-Mail-Protokollierung.
- Supabase Edge Function `lead-notification` angelegt.
- Supabase Edge Function `lead-notification` deployed.
- Die Function verschickt:
  - Anfragebestätigung an den Gast/Eigentümer/Erlebnisanbieter.
  - interne Benachrichtigung an Morrow.
- Die E-Mails haben einen gebrandeten HTML-Aufbau mit Text-Fallback.
- E-Mail-Provider: Resend per REST API.
- Versandereignisse werden in `email_events` protokolliert.
- Frontend ruft die Function nur auf, wenn `VITE_ENABLE_EMAIL_AUTOMATION=true` gesetzt ist.
- Lokale Umgebung ist mit `VITE_ENABLE_EMAIL_AUTOMATION=true` aktiviert.

Benötigte Secrets fuer die Supabase Edge Function:
- `RESEND_API_KEY`
- `MORROW_EMAIL_FROM` = `Morrow <auszeiten@getmorrow.de>`
- `MORROW_INTERNAL_LEAD_EMAIL` = `auszeiten@getmorrow.de`
- `SUPABASE_SERVICE_ROLE_KEY`

Lokale/Production Aktivierung:
1. Migration `202606030005_email_events.sql` in Supabase ausführen.
2. Edge Function deployen: `supabase functions deploy lead-notification`.
3. Secrets setzen:
   - `supabase secrets set RESEND_API_KEY=...`
   - `supabase secrets set MORROW_EMAIL_FROM="Morrow <auszeiten@getmorrow.de>"`
   - `supabase secrets set MORROW_INTERNAL_LEAD_EMAIL=auszeiten@getmorrow.de`
4. In Vercel/Vite setzen: `VITE_ENABLE_EMAIL_AUTOMATION=true`.

Status 2026-06-03:
- Secrets fuer Resend, Absender und interne Lead-Adresse wurden im Supabase Projekt gesetzt.
- Function wurde deployed und direkt mit einem Testlead erfolgreich aufgerufen.
- Echter Website-Formulartest ueber `/auszeiten/family-escape` erfolgreich: Lead wurde gespeichert, Gastbestaetigung und interne Benachrichtigung wurden mit Status `sent` protokolliert.
- Family-Formular speichert Erwachsene, Kinder und Kinderalter getrennt; E-Mail-Zusammenfassung nutzt diese Angaben statt nur einer Gesamtpersonenanzahl.
- Admin Lead-Drawer zeigt gespeicherte `email_events` pro Anfrage: Gastbestätigung, interne Benachrichtigung, Status, Empfänger und Zeitpunkt.
- `communication_events` ergänzt als zentrale Kommunikationshistorie pro Lead/Buchung/Kunde.
- Admin Lead-Drawer zeigt eine Kommunikationshistorie, die bestehende E-Mail-Events und manuell dokumentierte Kommunikation zusammenführt.
- Manuelle Kommunikationseinträge können im Lead-Drawer als Telefon, E-Mail, WhatsApp, Support oder Notiz gespeichert werden.

Bewusste Grenze:
- Ohne aktivierte ENV wird kein E-Mail-Aufruf gemacht. Leads werden trotzdem gespeichert.
- Service Role Key darf nur als Supabase Function Secret genutzt werden, nie im Browser.
