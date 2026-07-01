# Morrow Admin CRM Parity Checklist

Stand: 2026-07-01

Dieses Dokument bricht `docs/MIGRATION_CONSOLIDATION_AUDIT.md` in konkrete Admin-Paritaetstickets herunter. Es ist keine Feature-Roadmap, sondern eine Konsolidierungs-Checkliste: `apps/admin` darf erst dann als voll fuehrende Quelle der Wahrheit gelten, wenn diese Punkte gegen den alten Vite-Admin aus `src/App.tsx` abgenommen sind.

Die operative Testdurchfuehrung und Evidenzablage vor einem kontrollierten MVP-Start stehen in `docs/ADMIN_PARITY_QA_RUNBOOK.md`.

## Ziel

`apps/admin` ersetzt den alten Admin-CRM aus dem Vite-Prototypen fuer die operative Arbeit.

Bis dahin gilt:

- Alter Vite-Admin: Referenz fuer fehlende CRM-Funktionen.
- Neue `apps/admin`: Ziel-App und Konsolidierungsort.
- Keine neuen Produktfeatures, solange Kernparitaet fehlt.

## Evidenzquellen

| Quelle | Rolle |
| --- | --- |
| `src/App.tsx` | Alter CRM-/Admin-Prototyp mit Referenzfunktionen. |
| `src/lib/morrowBackend.ts` | Alte Supabase-/LocalStorage-Adapterlogik. |
| `apps/admin/app/dashboard/AdminDashboardClient.tsx` | Neue Admin-App und aktueller Konsolidierungsstand. |
| `supabase/migrations/*` | Tatsaechliche Datenbasis, RLS, RPCs und operative Tabellen. |
| `docs/MIGRATION_CONSOLIDATION_AUDIT.md` | Fuehrender Rahmen fuer Migration und Stop-Regel. |
| `docs/PAYLOAD_NORMALIZATION_INVENTORY.md` | Fuehrendes Inventar fuer JSON-Payload-Felder und Normalisierungskandidaten. |
| `npm run qa:admin-parity:structure` | Statischer Strukturcheck gegen alte Vite-Admin-Bereiche, Next-Workspaces, UI-Anker, Supabase-Tabellen und Doku. |

Wichtig: `qa:admin-parity:structure` beweist strukturelle Abdeckung, aber keine operative Freigabe. Die Freigabe bleibt der echte Lauf aus `docs/ADMIN_PARITY_QA_RUNBOOK.md` mit 24 manuellen Gates und Evidenz.

## Statuslogik

Die Statusspalte trennt bewusst Code-/Strukturabdeckung von operativer Freigabe:

- `migriert`: Bereich ist in Next fachlich ersetzt und durch QA/Evidenz abgenommen.
- `weitgehend migriert`: Bereich ist in `apps/admin` funktional angelegt, aber noch nicht durch den aktuellen Admin-Paritaetslauf freigegeben.
- `teilweise`: Bereich ist nur in einem Ausschnitt vorhanden oder noch bewusst light.
- `fehlt`: Bereich existiert noch nicht in der Ziel-App.
- `ersetzt`: alte Vite-Funktion wird bewusst nicht 1:1 uebernommen.

Aktueller Stand: Der Strukturcheck kann viele Bereiche als `weitgehend migriert` einstufen. Der neueste Admin-Paritaetslauf steht aber weiter auf Rot, weil die 24 manuellen Gates noch offene Evidenz haben. Deshalb ist `apps/admin` noch nicht alleinige operative Quelle der Wahrheit.

## Paritaetsstatus Nach Bereich

| Bereich | Vite-Referenz | Next-Stand | Status | Naechste Arbeit | Abnahmekriterium |
| --- | --- | --- | --- | --- | --- |
| Admin-Shell | `AdminSection` mit Bereichen `overview`, `leads`, `tasks`, `guestSupport`, `customers`, `bookings`, `packages`, `experiences`, `localPlaces`, `owners`, `agencies`, `experienceProviders`, `activity` | Clientseitige Arbeitsbereichsnavigation mit Uebersicht, CRM, Aufgaben, Support, Operations, Bestand, Partner, Eigentuemer, Aktivitaet plus sichtbarer Zuordnung der alten Bereiche je Workspace | weitgehend migriert | Spaeter echte Routen statt clientseitiger Bereiche entscheiden, wenn der Admin weiter waechst | Jeder alte Kernbereich ist in `apps/admin` eindeutig erreichbar und im jeweiligen Workspace benannt. |
| Uebersicht | Tagesboard, Faelligkeiten, Wiedervorlagen, kommende Termine, aktive Arbeit | Kennzahlen, kompakte Tagessteuerung mit Aufgaben/Leads/Support/Feedback, Monitoring und Audit | weitgehend migriert | Kuenftig ggf. kommende Termine/Termindruck noch staerker priorisieren | Uebersicht zeigt Tagessteuerung und verlinkt in Detailbereiche; Detailarbeit findet nicht auf der Uebersicht statt. |
| Leads/Anfragen | Status, Filter aktiv/archiviert, Typ/Status/Arbeitsstand, Wiedervorlage, Archiv, Reaktivierung, Testloeschung, Drawer | Leads laden, filtern, Status aendern, Detaildaten bearbeiten, Wiedervorlage setzen, archivieren, reaktivieren, Testdatensaetze loeschen, Reservierung anlegen, Drawer fuer Notiz/E-Mail/Historie; Wiedervorlage, WhatsApp-Zustimmung und Reisegruppe liegen strukturiert vor | weitgehend migriert | Spam-/Loeschpolicy und Marketing-Consent pruefen | Ein Lead kann von neu bis archiviert und reaktiviert komplett in Next bearbeitet werden; Historie bleibt sichtbar. |
| Kunden | Kundensatz aus Gastanfragen, Kunden-Cards, Kontaktlinks, Anfragehistorie, Buchungshistorie, Filter Anfrage/Buchung/faellig | Eigener Kundenbereich verbindet echte `customers`-Datensaetze mit Gastanfragen und Buchungen, zeigt Kontaktlinks, naechsten Schritt, Kundendetail, zentrale Kundennotiz, Anfrage-, Buchungs-, Kommunikations- und Aenderungshistorie | weitgehend migriert | Dedizierte Kundensuche, Dublettenbereinigung und spaetere Normalisierung der Customer-Erzeugung pruefen | Ein Gastkontakt ist unabhaengig von einzelner Anfrage auffindbar, mit Kontakt, Anfragen, Buchungen, Kundennotiz und naechstem Schritt. |
| Aufgaben | Aufgabenbereich mit direkter Anlage, Bezug, Faelligkeit, Prioritaet, Statusfilter, Bezugssprung, Loeschen, Wiedereroeffnen | Aufgaben werden geladen, koennen angelegt, bearbeitet, gefiltert, statusgeaendert, geloescht und ueber den Bezug geoeffnet werden; Audit wird geschrieben | weitgehend migriert | Archivierungsstrategie statt hartem Loeschen spaeter entscheiden; dedizierte Anbieterbearbeitung bleibt offen | Aufgabe kann angelegt, gefiltert, geoeffnet, bearbeitet, erledigt, wieder geoeffnet und geloescht werden. |
| Buchungen | Status, Zahlung, Reisegruppe, Hund, Check-in, Erlebnis, Aufgaben, Gaestebereich-Link, Follow-up | Status, Zahlung, Grunddaten, Reisegruppe, Fristen, Operationsstatus, naechste Aufgabe und Gaestebereich-Code/-Link liegen strukturiert in `bookings`; Drawer, E-Mail/Notiz/Historie vorhanden | weitgehend migriert | Aufgabenfluss, Kundenbezug und echte Termin-/Freigabelogik weiter schaerfen | Eine Buchung kann operativ von Reserviert bis Abgeschlossen gesteuert werden, inklusive Zahlung, Vorbereitung, Gastzugang und Historie. |
| Gaestesupport | Supportfaelle aus Guest-App, Dringlichkeit, Kategorie, Status, passende Buchung, Kommunikation | Supportsektion mit Status-, Dringlichkeits- und Kategoriefiltern, priorisierter Liste, Detaildrawer, Notiz, E-Mail und `support_status_events` vorhanden; Buchungs-/Owner-/Objekt-/Kontakt-/Zeitraumbezug liegt strukturiert in `support_messages` | weitgehend migriert | SLA-Zeitregeln, Realtime/WhatsApp-nahe Kommunikation und Owner-vs-Guest-Supportreporting spaeter schaerfen | Supportfall kann vollstaendig triagiert, beantwortet, dokumentiert und geschlossen werden. |
| Kommunikation | Kommunikationshistorie, Notizen, E-Mail, spaeter WhatsApp | Drawer-Notiz, freie E-Mail aus Lead/Buchung/Support ueber Edge Function, zentrale Kommunikationshistorie im Aktivitaetsbereich mit Suche und Kanal-/Richtungsfilter; Supportfall-, Template- und Quellenbezug liegen strukturiert in `communication_events` | weitgehend migriert | Vorlagenbibliothek, WhatsApp-Opt-in-Dokumentation und spaetere Template-Flows definieren | Alle relevanten Kontaktpunkte sind an Lead/Buchung/Support sichtbar, zentral auffindbar und auditierbar. |
| Auszeiten | Paket-Builder mit Name, Copy, Termine, Preise, Zielgruppe, Unterkunft, Medien, Erlebnis, Empfehlungen, Momente, FAQ, Status | Basisdaten, Preis, Unterkunft, Story/Copy, Medien, Highlights/Momente, Empfehlungen, FAQ, Termine, Erlebnisbausteine | weitgehend migriert | Launch-Check, Website-CMS-Grenze und spaetere Domain-Normalisierung klaeren | Neue Auszeit kann ohne Code fuer MVP angelegt, geprueft und veroeffentlichungsbereit gemacht werden. |
| Unterkuenfte | Objektprofil, Eigentuemerdaten, Agentur, Check-in, Regeln, Ausstattung, Medien, Rechte, Attribute, Erlebniswelten, Objektpruefung, verknuepfte Auszeiten | Objektprofil, Eigentuemerkontakt, Check-in, Adresse, Anreisefenster, Regeln, Ausstattung, Attribute, Erlebniswelten, Medien-URL-Listen, Medienrechte, Operationsstatus, Objektpruefung und verknuepfte Auszeiten liegen strukturiert in `properties` | weitgehend migriert | Medienbibliothek, Upload, Bildreihenfolge und Statushistorien klaeren | Unterkunft kann mit allen gast- und ownerrelevanten Daten in Next gepflegt werden. |
| Erlebnisbausteine | Erlebnis mit Anbieter, Rolle, Inklusivstatus, Preis, Kapazitaet, Verfuegbarkeit, Gastnotiz, Readiness, Qualitaet | Anlage/Bearbeitung mit Provider, Rolle, Inklusivstatus, Preis-/Kapazitaets-/Verfuegbarkeitsnotiz, Gastnotiz, Readiness-Pruefung und Qualitaetsnotiz/-score; operative Felder liegen strukturiert in `experience_blocks` | weitgehend migriert | Qualitaetshistorie und echte Termin-/Kontingentlogik klaeren | Erlebnisbaustein ist eindeutig Anbieter und Auszeit zugeordnet und fuer Gast/Admin interpretierbar. |
| Erlebnisanbieter | Anbieterprofile, Status, Kontakt, Notizen, Pipeline, Zuordnung, Konditionen, Verfuegbarkeit | Anbieterprofile koennen in Next angelegt, bearbeitet, pausiert/reaktiviert und geloescht werden; Kontaktperson, Zielgruppe, Konditionen, Verfuegbarkeit, Kooperationsstand und Notizen liegen strukturiert in `experience_providers`; verknuepfte Erlebnisbausteine sind sichtbar | weitgehend migriert | Statushistorie, Follow-up-Aufgaben und spaetere Partnerlogin-Grenze klaeren | Anbieter kann von Kandidat bis aktiver Partner nachvollziehbar betreut werden. |
| Agenturen | Agenturpartner, Kontakt, betreute Objekte, freie Termine, Status, Loeschen, Arbeitsuebersicht, Wiedervorlage | Agenturen koennen in Next angelegt, bearbeitet, pausiert/reaktiviert und geloescht werden; Objekte, Verfuegbarkeitsnotiz, Rueckmeldefrist, Wiedervorlage und interne Notiz liegen strukturiert in `agencies`; Agenturarbeit zeigt aktive Partner, offene Termine, Objektbezug und faellige Wiedervorlagen | weitgehend migriert | Kommunikationshistorie, echte Statushistorie und spaeterer strukturierter Verfuegbarkeitsprozess klaeren | Agentur kann als temporaerer Startpartner operationalisiert werden. |
| Vor-Ort-Orte | Kandidaten, Kategorien, Freigabe, Details, Bilder, Links, Karte | Pflege von `local_places` mit Kategorie, Status, Koordinaten, Links, Rating, Oeffnungszeiten, Beschreibung, Kueche, Eventdaten, Zielgruppe, Best-for, Bilder und Ortspruefung im Drawer | weitgehend migriert | Live-Daten, Medienqualitaet, Quellhistorie und Kandidaten-vs-Erlebnis-Trennung weiter pruefen | Freigegebene Orte erscheinen passend in Guest-App; Kandidaten bleiben intern; Admin sieht fehlende Pflichtinfos vor Freigabe. |
| Veranstaltungen | Event-Kandidaten, Termin, Zielgruppe, Passung, Quelle, Abgrenzung zu buchbaren Erlebnissen | Event-Datensaetze werden als `local_places.category = event` gepflegt; Drawer enthaelt Kuratierungsart, Datum/Zeit, Zielgruppe, Indoor/Outdoor und Morrow-Fit; Ortspruefung markiert buchbare Erlebnisse als falsch eingeordnet | teilweise | Scrape-Import, Terminqualitaet und Quellpruefung weiter konsolidieren | Oeffentliche Veranstaltungen koennen bewusst kuratiert werden, ohne bezahlte Erlebnisbausteine in der Vor-Ort-Karte zu vermischen. |
| Feedback | Feedback nach Aufenthalt, Historie, Wiederbuchungsimpuls | Feedbackliste, Durchschnitt, niedrige Bewertungen, strukturierter Gut-/Verbesserungs-Text, Wiederbuchungsinteresse und Eintrag in `communication_events` | teilweise | Tags/Aufgaben aus Feedback und Wiederbuchungsimpulse spaeter | Feedback ist sichtbar, in der Kommunikationshistorie nachvollziehbar und fuehrt zu Nachfassarbeit. |
| Owner-Daten | im alten Admin nur teilweise/konzeptionell | Profile, Zugriffe, Dokumente, Statements, Operations | Next besser als Vite | Paritaet nicht am Vite messen, sondern an Architektur | Owner-App zeigt nur Daten, die Admin pflegen und freigeben kann. |
| Audit | Aktivitaetsbereich, Supabase `admin_audit_logs` | Business-Mutationen im Next-Admin schreiben Audit; Aktivitaet wird angezeigt; statisches QA-Gate `npm run qa:admin-audit` prueft mutierende Admin-Funktionen auf `writeAuditLog`; der Supabase-Insert liegt in `packages/supabase` | weitgehend migriert | Semantische Vollstaendigkeit der Audit-Payloads und externe Edge-Function-Actions weiter pruefen | Jede kritische Admin-Aktion erzeugt einen nachvollziehbaren Audit-Eintrag und das Gate verhindert stille neue Mutationen ohne Audit. |
| Shared Types | lokale Typen in Admin-/Guest-/Owner-Komponenten | `packages/supabase` enthaelt gemeinsamen `JsonRecord`, geteilte Row-Basen und Selects fuer Leads, Buchungen, Kunden, Auszeiten, Unterkuenfte, Termine, Aufgaben, Orte, Kommunikation, Support, Feedback, Audit, Erlebnisbausteine, Anbieter, Agenturen, Owner-Profile/-Zugriffe sowie Owner-Dokumente, Owner-Abrechnungen und Owner-Operations; Payload-Felder sind in `docs/PAYLOAD_NORMALIZATION_INVENTORY.md` inventarisiert | teilweise | Weitere Row-Typen und Mapper priorisiert extrahieren, sobald ein Bereich fachlich stabil ist | Geteilte Datenformen werden nicht mehrfach unterschiedlich definiert; lokale Viewmodels bleiben bewusst app-spezifisch. |

## Konsolidierungsreihenfolge

### Sprint A: CRM-Kern

Status: funktional weitgehend umgesetzt, aber vor Freigabe als alleiniger Admin noch gegen echte Workflows abnehmen.

1. Kundenbereich in `apps/admin` abnehmen.
2. Aufgabenbereich in `apps/admin` abnehmen.
3. Lead-Archiv, Wiedervorlagen, Reaktivierung und Testloeschung in realem QA-Flow pruefen.
4. Clientseitige Admin-Shell/Navigation mit realer Nutzung testen; spaeter entscheiden, ob echte interne Routen noetig werden.

Warum zuerst:

- Kunden, Aufgaben und Leads sind der taegliche CRM-Kern.
- Diese Bereiche sind in Next vorhanden, muessen aber vor Go-Live als Tagesarbeitsfluss getestet werden.
- Diese Abnahme reduziert operative Unsicherheit staerker als weitere Guest-/Owner-Features.

### Sprint B: Operative Tiefe

1. Buchungsdetail gegen Vite-Felder und MVP-Anforderungen abnehmen.
2. Auszeiten-Builder-Luecken abnehmen: Copy, FAQ, Medien, Momente, Empfehlungen sind payload-basiert pflegbar; Launch-Check und spaetere Normalisierung klaeren.
3. Unterkunftsverwaltung abnehmen: Objektpruefung und Auszeiten-Verknuepfung sind vorhanden; Medienbibliothek, Upload und Bildreihenfolge bleiben offen.
4. Erlebnisanbieter/Agenturen als Akquise-CRM abnehmen: Anbieterpflege und Agenturpflege sind vorhanden; Statushistorie, Kommunikationshistorie und strukturierter Verfuegbarkeitsprozess bleiben offen.

### Sprint C: Technische Konsolidierung

1. Gemeinsame Admin-/Guest-/Owner-Typen nach `packages/domain` oder `packages/supabase` ziehen. Stand: breit begonnen mit geteilten Row-Basen und Selects fuer Leads, Buchungen, Kunden, Auszeiten, Unterkuenfte, Termine, Aufgaben, Vor-Ort-Orte, Kommunikation, Support, Feedback, Audit, Erlebnisbausteine, Anbieter, Agenturen sowie Owner-Daten.
2. Supabase-Mutationen aus Komponenten in klare Helper/Repository-Funktionen ziehen. Stand: begonnen mit gemeinsamen Select-Grenzen und `insertAdminAuditLog`; der naechste technische Schritt waeren Repository-/Service-Helper fuer Admin-Mutationen, nicht neue Produktfunktionen.
3. Payload-Felder inventarisieren: was bleibt Payload, was wird normalisiert. Stand: dokumentiert in `docs/PAYLOAD_NORMALIZATION_INVENTORY.md`; `leads.follow_up_at`, WhatsApp-Kontaktzustimmung, Lead-Reisegruppe, operative Booking-Kernfelder, Property-Kernfelder und Local-Place-Kuratierungsfelder sind normalisiert, weitere V1-Kandidaten sind Live-Oeffnungszeiten/Ratings und Medienqualitaet.
4. QA-Skripte fuer Admin-Paritaet ergaenzen.

## Detailtickets Fuer Sprint A

### A1 Kundenbereich

Problem:

- Vite hat einen echten Kundenbereich mit Kundenstatus, naechstem Schritt, Anfragehistorie und Buchungshistorie.
- `apps/admin` hat inzwischen einen Kundenarbeitsbereich mit echter `customers`-Quelle; die verbleibende Arbeit ist Workflow-Abnahme, Dublettenlogik und spaetere Normalisierung der Customer-Erzeugung.

Umsetzung:

- Kunden werden deterministisch aus echter `customers`-Tabelle plus Gast-`leads` und `bookings` zusammengefuehrt.
- Kundenliste mit Kontakt, letzter Anfrage, Statusphase, Quelle, naechstem Schritt und Kontaktlinks ist in `apps/admin` vorhanden.
- Kundendetail mit Anfragehistorie, Buchungshistorie, zentraler Kundennotiz, Kommunikationsereignissen und internen Notizen aus Anfragen/Buchungen ist vorhanden.
- Filter: alle, Anfragephase, gebucht, heute/faellig ist in `apps/admin` vorhanden.
- Lead- und Buchungsdetails werden weiterhin ueber die bestehenden Drawer geoeffnet; der Kundendetail-Drawer fasst die Historie zusammen.
- Zentrale Kundennotiz unabhaengig von einzelner Anfrage/Buchung. Stand: umgesetzt ueber `customers.notes` mit Audit.
- Neue Reservierungen aus Gastanfragen erzeugen oder aktualisieren einen Kundensatz und verknuepfen die Buchung ueber `customer_id`.

Abnahme:

- Ein Gastlead taucht als Kunde auf. Stand: umgesetzt ueber Ableitung.
- Eine Reservierung/Buchung ist beim Kunden sichtbar. Stand: umgesetzt als Zaehler und direkter Drawer-Sprung.
- E-Mail/Telefon sind klickbar. Stand: umgesetzt.
- Kommunikationshistorie und interne Notizen aus Anfrage/Buchung sind sichtbar. Stand: umgesetzt.
- Zentrale Kundennotiz kann gespeichert und in der Aenderungshistorie nachvollzogen werden. Stand: umgesetzt.
- Keine Testdaten zaehlen in Kernkennzahlen, wenn markiert. Stand: umgesetzt fuer Kundenkennzahl/Kundenliste anhand Payload-Testmarkern.

### A2 Aufgabenbereich

Problem:

- Vite kann Aufgaben erstellen, filtern, statusaendern, referenzieren, springen und loeschen.
- `apps/admin` hat inzwischen einen eigenen Aufgabenbereich; offen bleiben Workflow-Abnahme, Archivierungsstrategie und bessere Bearbeitung mancher Partner-/Anbieterbezuege.

Umsetzung:

- Eigener Aufgabenbereich mit Liste ist in `apps/admin` vorhanden.
- Aufgabe erstellen mit Titel, Bezug, Faelligkeit, Prioritaet und Notiz ist in `apps/admin` vorhanden.
- Filter nach Status, Bezug und Prioritaet sind in `apps/admin` vorhanden.
- Status: offen, in Arbeit, erledigt ist in `apps/admin` vorhanden.
- Bezug oeffnet passenden Datensatz oder fuehrt in den passenden Bereich. Stand: umgesetzt fuer Lead, Buchung, Support, Auszeit, Unterkunft, Vor-Ort-Ort, Owner-Profil; Anbieter-Bezug fuehrt in den Erlebnisbereich.
- Loeschen nur fuer Fehleintraege mit Bestaetigung und Audit. Stand: umgesetzt als Admin-Delete.
- Dedizierte Aufgabenbearbeitung nach Anlage. Stand: umgesetzt im Aufgabenformular.
- Archivierungsstrategie statt hartem Loeschen. Stand: offen/Produktentscheidung.

Abnahme:

- Aufgabe fuer Lead/Buchung/Auszeit/Ort/Eigentuemer/Anbieter anlegen. Stand: umgesetzt ueber Supabase-Insert.
- Aufgabe filtern. Stand: umgesetzt.
- Aufgabe bearbeiten. Stand: umgesetzt.
- Aufgabe erledigen und wieder oeffnen. Stand: umgesetzt ueber Statuswechsel.
- Aufgabe loeschen. Stand: umgesetzt mit Bestaetigung und Audit.
- Bezug oeffnet passenden Drawer/Bereich. Stand: teilweise umgesetzt; Anbieter-Bezug braucht spaeter dedizierte Anbieterbearbeitung.
- Audit-Log wird geschrieben. Stand: umgesetzt fuer Anlage, Bearbeitung, Statuswechsel und Loeschung.

### A3 Lead-Archiv Und Wiedervorlagen

Problem:

- Vite unterscheidet aktive/archivierte Leads, Wiedervorlagen und Test-/Spam-Loeschung.
- `apps/admin` aendert Status, aber Archiv-/Follow-up-Paritaet ist nicht bewiesen.

Umsetzung:

- `archived_at` in Next-Admin sichtbar und nutzbar machen. Stand: umgesetzt.
- Wiedervorlage/Faelligkeit pflegen. Stand: umgesetzt inline in der Leadliste und im Lead-Drawer ueber `leads.follow_up_at`; alte Payload-Werte bleiben Fallback.
- Filter fuer aktiv, archiviert, faellig, Typ, Status. Stand: umgesetzt.
- Reaktivieren. Stand: umgesetzt.
- Test-/Spam-Loeschen nur mit Bestaetigung und Audit. Stand: umgesetzt fuer als Test erkennbare Leads.
- Eigene relationale Wiedervorlage-Spalte statt Payload. Stand: umgesetzt als `leads.follow_up_at` mit Migration und Backfill aus Payload.
- Tiefe Lead-Detailbearbeitung im Drawer. Stand: umgesetzt fuer Kontakt, Typ, Status, Auszeit, Quelle/Kampagne, Termin, Personen/Kinder/Hund, Anlass, WhatsApp-Opt-in und Wiedervorlage; WhatsApp-Opt-in schreibt `leads.whatsapp_opt_in` plus `whatsapp_consent_at`.

Abnahme:

- Lead-Kontakt- und Qualifizierungsdaten koennen im Drawer bearbeitet werden. Stand: umgesetzt.
- Lead kann archiviert und reaktiviert werden. Stand: umgesetzt.
- Faellige Wiedervorlage erscheint in Uebersicht/Leadfilter. Stand: umgesetzt im Leadfilter; Uebersicht nutzt offene Anfragen und aktive Aufgaben.
- Archivierte Leads verschwinden aus Tagesarbeit, bleiben auffindbar. Stand: umgesetzt ueber Aktiv/Archiv-Filter.
- Loeschen ist begrenzt, bestaetigt und auditierbar. Stand: umgesetzt fuer Testleads.

### A4 Admin-Shell

Problem:

- Vite hatte klare Admin-Bereiche.
- `apps/admin` ist aktuell eine lange Seite mit vielen Sektionen, wodurch CRM-Arbeit unklar wird.

Umsetzung:

- Entscheidung: Fuer den Konsolidierungsschritt wird eine clientseitige Arbeitsbereichsnavigation umgesetzt. Damit bleiben die bestehenden Drawer und Mutationen stabil, waehrend die lange Seite in Arbeitsbereiche aufgeteilt wird.
- Bereiche vorhanden: Uebersicht, CRM, Aufgaben, Support, Operations, Bestand, Partner, Eigentuemer, Aktivitaet.
- Jeder Workspace zeigt im Hero, welche alten Vite-Admin-Bereiche darin migriert sind.
- Uebersicht bleibt kurz und zeigt Kennzahlen, Tagessteuerung, Monitoring und Aktivitaet.
- Detailarbeit ist jeweils in einem sichtbaren Arbeitsbereich gebuendelt.
- Offene Architekturentscheidung: spaeter echte interne Routen, falls Admin weiter waechst.

Abnahme:

- Nutzer kann gezielt in einen Arbeitsbereich wechseln. Stand: umgesetzt.
- Alte Kernbereiche sind in den Workspaces sichtbar benannt. Stand: umgesetzt.
- Keine zentrale Seite muss alle Detailarbeit gleichzeitig tragen. Stand: umgesetzt durch `activeWorkspace`.
- Mobile/kleine Viewports bleiben bedienbar. Stand: technisch umgesetzt mit bestehender flexibler Navigation; visuelle QA auf echten Viewports bleibt sinnvoll.

## QA-Gates Fuer Admin-Paritaet

Vor der Freigabe von `apps/admin` als alleiniger Admin muessen die 24 manuellen Gates aus `docs/ADMIN_PARITY_QA_RUNBOOK.md` mit Evidenz durchlaufen werden:

1. Admin-Login.
2. Neuer Gastlead.
3. Leadstatus aendern.
4. Wiedervorlage setzen.
5. Lead archivieren/reaktivieren.
6. Lead reservieren.
7. Kunde pruefen.
8. Aufgabe erstellen.
9. Aufgabenbezug oeffnen.
10. Buchung bearbeiten.
11. Gaestebereich oeffnen.
12. Support senden.
13. Support beantworten.
14. Feedback senden.
15. Auszeit pflegen.
16. Unterkunft pflegen.
17. Erlebnisbaustein pflegen.
18. Vor-Ort-Ort freigeben.
19. Veranstaltung pruefen.
20. Owner-Dokument.
21. Owner-Abrechnung.
22. Owner-Operation.
23. Audit-Log.
24. Kommunikationshistorie.

Automatische Schutzgates bleiben zusaetzlich Pflicht: insbesondere `npm run qa:admin-parity:preflight`, `npm run qa:admin-audit`, `npm run qa:admin-parity:structure`, `npm run admin:build`, `npm run typecheck`, `npm run lint`, `git diff --check`, `npm run qa:readiness` und `npm run qa:launch-gates`.

Aktuell zeigt `npm run qa:admin-parity:status` noch alle 24 manuellen Gates als offen. Diese Liste ist deshalb eine Abnahmeliste, keine Aussage, dass `apps/admin` bereits produktiv fuehrend ist.

Die konkrete Durchfuehrung inklusive Stop-Regeln, automatischer Gates und Evidenzfeldern ist in `docs/ADMIN_PARITY_QA_RUNBOOK.md` festgelegt.

## Entscheidungsregel

Wenn ein Bereich nicht paritaetisch ist, gibt es nur zwei erlaubte Wege:

1. Die Paritaet in `apps/admin` herstellen.
2. Bewusst dokumentieren, dass die alte Vite-Funktion ersetzt oder nicht mehr benoetigt wird.

Ein stilles Weglassen gilt nicht als Migration.
