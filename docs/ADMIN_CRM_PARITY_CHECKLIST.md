# Morrow Admin CRM Parity Checklist

Stand: 2026-06-27

Dieses Dokument bricht `docs/MIGRATION_CONSOLIDATION_AUDIT.md` in konkrete Admin-Paritaetstickets herunter. Es ist keine Feature-Roadmap, sondern eine Konsolidierungs-Checkliste: `apps/admin` darf erst dann als voll fuehrende Quelle der Wahrheit gelten, wenn diese Punkte gegen den alten Vite-Admin aus `src/App.tsx` abgenommen sind.

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

## Paritaetsstatus Nach Bereich

| Bereich | Vite-Referenz | Next-Stand | Status | Naechste Arbeit | Abnahmekriterium |
| --- | --- | --- | --- | --- | --- |
| Admin-Shell | `AdminSection` mit Bereichen `overview`, `leads`, `tasks`, `guestSupport`, `customers`, `bookings`, `packages`, `experiences`, `localPlaces`, `owners`, `agencies`, `experienceProviders`, `activity` | Clientseitige Arbeitsbereichsnavigation mit Uebersicht, CRM, Aufgaben, Support, Operations, Bestand, Partner, Eigentuemer, Aktivitaet | teilweise | Pruefen, ob spaeter echte Routen statt clientseitiger Bereiche noetig sind | Jeder alte Kernbereich ist in `apps/admin` eindeutig erreichbar, nicht nur als Kartenblock. |
| Uebersicht | Tagesboard, Faelligkeiten, Wiedervorlagen, kommende Termine, aktive Arbeit | Kennzahlen, Aufgaben, Monitoring, Audit, Feedback | teilweise | Uebersicht auf Tagesarbeit fokussieren und zu Detailbereichen verlinken | Uebersicht zeigt nur Tagessteuerung; Detailarbeit findet in Bereichen statt. |
| Leads/Anfragen | Status, Filter aktiv/archiviert, Typ/Status/Arbeitsstand, Wiedervorlage, Archiv, Reaktivierung, Testloeschung, Drawer | Leads laden, filtern, Status aendern, Detaildaten bearbeiten, Wiedervorlage setzen, archivieren, reaktivieren, Testdatensaetze loeschen, Reservierung anlegen, Drawer fuer Notiz/E-Mail/Historie | weitgehend migriert | Spam-/Loeschpolicy und ggf. eigene Wiedervorlage-Spalte pruefen | Ein Lead kann von neu bis archiviert und reaktiviert komplett in Next bearbeitet werden; Historie bleibt sichtbar. |
| Kunden | Kundensatz aus Gastanfragen, Kunden-Cards, Kontaktlinks, Anfragehistorie, Buchungshistorie, Filter Anfrage/Buchung/faellig | Eigener Kundenbereich leitet Gastkontakte aus `leads` + `bookings` ab, zeigt Kontaktlinks, naechsten Schritt, Kundendetail mit Anfrage-, Buchungs-, Kommunikations- und Aenderungshistorie | teilweise | Zentrale Kundennotiz als eigenes Feld/Tabelle pruefen; spaeter echte `customers`-Quelle entscheiden | Ein Gastkontakt ist unabhaengig von einzelner Anfrage auffindbar, mit Kontakt, Anfragen, Buchungen und naechstem Schritt. |
| Aufgaben | Aufgabenbereich mit direkter Anlage, Bezug, Faelligkeit, Prioritaet, Statusfilter, Bezugssprung, Loeschen, Wiedereroeffnen | Aufgaben werden geladen, koennen angelegt, bearbeitet, gefiltert, statusgeaendert, geloescht und ueber den Bezug geoeffnet werden; Audit wird geschrieben | weitgehend migriert | Archivierungsstrategie statt hartem Loeschen spaeter entscheiden; dedizierte Anbieterbearbeitung bleibt offen | Aufgabe kann angelegt, gefiltert, geoeffnet, bearbeitet, erledigt, wieder geoeffnet und geloescht werden. |
| Buchungen | Status, Zahlung, Reisegruppe, Hund, Check-in, Erlebnis, Aufgaben, Gaestebereich-Link, Follow-up | Status, Zahlung, Grunddaten, Operationsdaten, Gaestebereich-Code/-Link, Drawer, E-Mail/Notiz/Historie vorhanden | weitgehend migriert | Aufgabenfluss und Kundenbezug weiter schaerfen; Gaestebereich-Freigabe spaeter noch staerker normalisieren | Eine Buchung kann operativ von Reserviert bis Abgeschlossen gesteuert werden, inklusive Zahlung, Vorbereitung, Gastzugang und Historie. |
| Gaestesupport | Supportfaelle aus Guest-App, Dringlichkeit, Kategorie, Status, passende Buchung, Kommunikation | Supportsektion, Status, Notiz, E-Mail, `support_status_events` vorhanden | migriert/teilweise | Detailfilter, SLA/Dringlichkeit, Owner-vs-Guest-Kontext pruefen | Supportfall kann vollstaendig triagiert, beantwortet, dokumentiert und geschlossen werden. |
| Kommunikation | Kommunikationshistorie, Notizen, E-Mail, spaeter WhatsApp | Drawer-Notiz und freie E-Mail aus Lead/Buchung/Support ueber Edge Function | teilweise | Vorlagen, zentrale Suche, WhatsApp-Opt-in-Dokumentation und Kanalfilter definieren | Alle relevanten Kontaktpunkte sind an Lead/Buchung/Support sichtbar und auditierbar. |
| Auszeiten | Paket-Builder mit Name, Copy, Termine, Preise, Zielgruppe, Unterkunft, Medien, Erlebnis, Empfehlungen, Momente, FAQ, Status | Basisdaten, Preis, Unterkunft, Story/Copy, Medien, Highlights/Momente, Empfehlungen, FAQ, Termine, Erlebnisbausteine | weitgehend migriert | Launch-Check, Website-CMS-Grenze und spaetere Domain-Normalisierung klaeren | Neue Auszeit kann ohne Code fuer MVP angelegt, geprueft und veroeffentlichungsbereit gemacht werden. |
| Unterkuenfte | Objektprofil, Eigentuemerdaten, Agentur, Check-in, Regeln, Ausstattung, Medien, Rechte, Attribute, Erlebniswelten | Viele Felder vorhanden, aber Medien nur URL-/Payload-basiert | teilweise | Medien-/Rechteworkflow und strukturierte Attribute konsolidieren | Unterkunft kann mit allen gast- und ownerrelevanten Daten in Next gepflegt werden. |
| Erlebnisbausteine | Erlebnis mit Anbieter, Rolle, Inklusivstatus, Preis, Kapazitaet, Verfuegbarkeit, Gastnotiz | Anlage/Bearbeitung mit Provider, Rolle, Preis-/Kapazitaets-/Verfuegbarkeitsnotiz | weitgehend migriert | separates Erlebnisprofil, Qualitaetsbewertung und Verfuegbarkeit pruefen | Erlebnisbaustein ist eindeutig Anbieter und Auszeit zugeordnet und fuer Gast/Admin interpretierbar. |
| Erlebnisanbieter | Anbieterprofile, Status, Kontakt, Notizen, Pipeline, Zuordnung | Anbieter werden gelesen/gepflegt; Akquiselogik begrenzt | teilweise | Anbieter-CRM mit Statushistorie und Follow-up gegen Vite pruefen | Anbieter kann von Kandidat bis aktiver Partner nachvollziehbar betreut werden. |
| Agenturen | Agenturpartner, Kontakt, betreute Objekte, freie Termine, Status, Loeschen | CRUD teilweise vorhanden, Status/Loeschen vorhanden | teilweise | Verfuegbarkeitsprozess, Kommunikationshistorie und Objektbezug schaerfen | Agentur kann als temporaerer Startpartner operationalisiert werden. |
| Vor-Ort-Orte | Kandidaten, Kategorien, Freigabe, Details, Bilder, Links, Karte | Pflege von `local_places` mit Kategorie, Status, Koordinaten, Links, Rating, Oeffnungszeiten, Bilderpayload | migriert/teilweise | Datenqualitaet und Kandidaten-vs-Erlebnis-Trennung pruefen | Freigegebene Orte erscheinen passend in Guest-App; Kandidaten bleiben intern. |
| Feedback | Feedback nach Aufenthalt, Historie, Wiederbuchungsimpuls | Feedbackliste, Durchschnitt, niedrige Bewertungen als Signal | teilweise | Tags/Aufgaben aus Feedback und Wiederbuchungsimpulse spaeter | Feedback ist sichtbar, nachvollziehbar und fuehrt zu Nachfassarbeit. |
| Owner-Daten | im alten Admin nur teilweise/konzeptionell | Profile, Zugriffe, Dokumente, Statements, Operations | Next besser als Vite | Paritaet nicht am Vite messen, sondern an Architektur | Owner-App zeigt nur Daten, die Admin pflegen und freigeben kann. |
| Audit | Aktivitaetsbereich, Supabase `admin_audit_logs` | Viele Mutationen schreiben Audit; Aktivitaet wird angezeigt | teilweise | Vollstaendigkeit je Mutation pruefen | Jede kritische Admin-Aktion erzeugt einen nachvollziehbaren Audit-Eintrag. |

## Konsolidierungsreihenfolge

### Sprint A: CRM-Kern

1. Kundenbereich in `apps/admin` herstellen.
2. Aufgabenbereich in `apps/admin` paritaetisch machen.
3. Lead-Archiv, Wiedervorlagen, Reaktivierung und Testloeschung pruefen/umsetzen.
4. Admin-Shell/Navigation entscheiden, damit Bereiche nicht als lange Seite verschwimmen.

Warum zuerst:

- Kunden, Aufgaben und Leads sind der taegliche CRM-Kern.
- Ohne diese Bereiche ist `apps/admin` noch kein gleichwertiger Ersatz fuer den Vite-Admin.
- Diese Arbeit reduziert operative Unsicherheit staerker als weitere Guest-/Owner-Features.

### Sprint B: Operative Tiefe

1. Buchungsdetail gegen Vite-Felder und MVP-Anforderungen abnehmen.
2. Auszeiten-Builder-Luecken abnehmen: Copy, FAQ, Medien, Momente, Empfehlungen sind payload-basiert pflegbar; Launch-Check und spaetere Normalisierung klaeren.
3. Unterkunftsverwaltung und Medien-/Rechteworkflow klaeren.
4. Erlebnisanbieter/Agenturen als Akquise-CRM schaerfen.

### Sprint C: Technische Konsolidierung

1. Gemeinsame Admin-/Guest-/Owner-Typen nach `packages/domain` oder `packages/supabase` ziehen.
2. Supabase-Mutationen aus Komponenten in klare Helper/Repository-Funktionen ziehen.
3. Payload-Felder inventarisieren: was bleibt Payload, was wird normalisiert.
4. QA-Skripte fuer Admin-Paritaet ergaenzen.

## Detailtickets Fuer Sprint A

### A1 Kundenbereich

Problem:

- Vite hat einen echten Kundenbereich mit Kundenstatus, naechstem Schritt, Anfragehistorie und Buchungshistorie.
- `apps/admin` laedt aktuell keine eigene `customers`-Liste und hat keinen gleichwertigen Kundenarbeitsbereich.

Umsetzung:

- Kunden werden im ersten Konsolidierungsschritt deterministisch aus Gast-`leads` + `bookings` abgeleitet. Eine eigene `customers`-Tabelle wird fuer A1 nicht vorausgesetzt.
- Kundenliste mit Kontakt, letzter Anfrage, Statusphase, Quelle, naechstem Schritt und Kontaktlinks ist in `apps/admin` vorhanden.
- Kundendetail mit Anfragehistorie, Buchungshistorie, Kommunikationsereignissen und internen Notizen aus Anfragen/Buchungen ist vorhanden.
- Filter: alle, Anfragephase, gebucht, heute/faellig ist in `apps/admin` vorhanden.
- Lead- und Buchungsdetails werden weiterhin ueber die bestehenden Drawer geoeffnet; der Kundendetail-Drawer fasst die Historie zusammen.
- Zentrale Kundennotiz unabhaengig von einzelner Anfrage/Buchung. Stand: offen.

Abnahme:

- Ein Gastlead taucht als Kunde auf. Stand: umgesetzt ueber Ableitung.
- Eine Reservierung/Buchung ist beim Kunden sichtbar. Stand: umgesetzt als Zaehler und direkter Drawer-Sprung.
- E-Mail/Telefon sind klickbar. Stand: umgesetzt.
- Kommunikationshistorie und interne Notizen aus Anfrage/Buchung sind sichtbar. Stand: umgesetzt.
- Keine Testdaten zaehlen in Kernkennzahlen, wenn markiert. Stand: umgesetzt fuer Kundenkennzahl/Kundenliste anhand Payload-Testmarkern.

### A2 Aufgabenbereich

Problem:

- Vite kann Aufgaben erstellen, filtern, statusaendern, referenzieren, springen und loeschen.
- `apps/admin` zeigt Aufgaben im Tagesbereich und kann Status aendern, aber kein vollwertiger Aufgabenbereich.

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
- Wiedervorlage/Faelligkeit pflegen. Stand: umgesetzt inline in der Leadliste und im Lead-Drawer ueber Payload `followUpAt`.
- Filter fuer aktiv, archiviert, faellig, Typ, Status. Stand: umgesetzt.
- Reaktivieren. Stand: umgesetzt.
- Test-/Spam-Loeschen nur mit Bestaetigung und Audit. Stand: umgesetzt fuer als Test erkennbare Leads.
- Eigene relationale Wiedervorlage-Spalte statt Payload. Stand: offen/Architekturentscheidung.
- Tiefe Lead-Detailbearbeitung im Drawer. Stand: umgesetzt fuer Kontakt, Typ, Status, Auszeit, Quelle/Kampagne, Termin, Personen/Kinder/Hund, Anlass, WhatsApp-Opt-in und Wiedervorlage.

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
- Uebersicht bleibt kurz und zeigt Kennzahlen, Monitoring und Aktivitaet.
- Detailarbeit ist jeweils in einem sichtbaren Arbeitsbereich gebuendelt.
- Offene Architekturentscheidung: spaeter echte interne Routen, falls Admin weiter waechst.

Abnahme:

- Nutzer kann gezielt in einen Arbeitsbereich wechseln. Stand: umgesetzt.
- Keine zentrale Seite muss alle Detailarbeit gleichzeitig tragen. Stand: umgesetzt durch `activeWorkspace`.
- Mobile/kleine Viewports bleiben bedienbar. Stand: technisch umgesetzt mit bestehender flexibler Navigation; visuelle QA auf echten Viewports bleibt sinnvoll.

## QA-Gates Fuer Admin-Paritaet

Vor der Freigabe von `apps/admin` als alleiniger Admin muessen diese Gates durchlaufen:

1. Admin-Login mit freigeschaltetem Admin-User.
2. Neuer Gastlead sichtbar.
3. Leadstatus aendern.
4. Lead mit Wiedervorlage versehen.
5. Lead archivieren und reaktivieren.
6. Gastlead reservieren und Buchung sehen.
7. Kunde mit Anfrage- und Buchungshistorie sehen.
8. Aufgabe fuer Buchung erstellen, erledigen und wieder oeffnen.
9. Aufgabe oeffnet ihren Bezug.
10. Buchung: Status, Zahlung, Reisegruppe, Check-in und naechste Aufgabe speichern.
11. Supportfall beantworten; Antwort erscheint im Guest-/Owner-Verlauf, wenn sichtbar.
12. Auszeit anlegen/bearbeiten und Termin zuordnen.
13. Unterkunft anlegen/bearbeiten inklusive Check-in, Regeln und Medienrechte.
14. Erlebnisbaustein mit Anbieter verbinden.
15. Vor-Ort-Ort als Kandidat anlegen und freigeben.
16. Owner-Dokument, Owner-Abrechnung und Owner-Operation anlegen/freigeben.
17. Audit-Log zeigt die kritischen Aktionen.
18. `npm run admin:build`, `npm run typecheck`, `npm run lint` laufen durch.

## Entscheidungsregel

Wenn ein Bereich nicht paritaetisch ist, gibt es nur zwei erlaubte Wege:

1. Die Paritaet in `apps/admin` herstellen.
2. Bewusst dokumentieren, dass die alte Vite-Funktion ersetzt oder nicht mehr benoetigt wird.

Ein stilles Weglassen gilt nicht als Migration.
