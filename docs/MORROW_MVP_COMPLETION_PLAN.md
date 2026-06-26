# Morrow MVP Completion Plan

Status: Arbeitsrahmen fuer den echten Phase-1-Start mit ersten zahlenden Gaesten.

Dieses Dokument ist die operative Bruecke zwischen `docs/MORROW_MASTER_FRAME.md`, `docs/PLATFORM_MODEL_PHASE2.md`, `docs/SUPABASE_STORAGE_AUDIT_2026-06-05.md` und dem aktuellen Produktstand.

Ziel: Morrow bleibt ein schlanker MVP, aber der Aufenthalt muss fuer Gaeste hochwertig, vorbereitet und intern sauber betreibbar sein.

## Leitentscheidung

Der MVP ist nicht mehr nur Landingpage plus Lead-System.

Der MVP ist ein manuell betreibbares Hospitality-System:

- Nachfrage erzeugen
- Anfrage qualifizieren
- Auszeit verbindlich buchen
- Aufenthalt vorbereiten
- Gast nach Buchung fuehren
- lokale Empfehlungen und Support bereitstellen
- aus echten Gaesten lernen

Nicht Ziel des MVPs:

- vollautomatischer Marktplatz
- breite Airbnb-artige Suche
- Partnerportale
- komplexes Payment-/Provisionssystem
- mehrere Orte gleichzeitig skalieren

## Bewertungslogik

Jeder Punkt wird in eine dieser Klassen eingeordnet:

- `MVP-kritisch`: Muss vor oder sehr nah am ersten zahlenden Gast funktionieren.
- `MVP-light`: Muss sichtbar oder strukturell angelegt sein, darf aber noch manuell/halbautomatisch laufen.
- `V2`: Wird vorbereitet, aber nicht vor dem ersten MVP-Start gebaut.

## Block 1: Operate

Ziel: Intern muss Morrow eine Auszeit wirklich anlegen, pflegen, buchen und vorbereiten koennen.

| Thema | Haben Wir | Brauchen Wir | MVP-Klasse | Status |
| --- | --- | --- | --- | --- |
| Paket-Builder fuer neue Auszeiten | Admin-Auszeiten existieren, Supabase-Sync vorhanden, Prototyp-Builder fuer Titel, Copy, Termine, Preise, Zielgruppe, Unterkunft, Medien, Erlebnisbausteine, Empfehlungen, Momente, FAQ und Status ist umgesetzt; Next-Admin kann Auszeiten neu anlegen, Name, Status, Ort, Unterkunft, Preise und Termine/Verfuegbarkeiten bearbeiten sowie Termine neu anlegen | Builder im Next-Admin spaeter mit Medienbibliothek, Copy, Detailsektionen und staerkerer Normalisierung weiter ausbauen | MVP-kritisch | Erledigt fuer MVP |
| Unterkunftsverwaltung | Objektprofile, Agenturen, Check-in-Typ, Support-Typ, Anreise/Abreise, Medien, Bildrechte, Ausstattung, Hausregeln, Schluesselinfos und Objekt-Support sind im Prototyp pflegbar; Next-Admin kann Unterkuenfte neu anlegen und Name, Status, Ort, Schlafplaetze, Zimmer, Eigentuemer-/Objektkontakt, Check-in, Support, Adresse, Anreisefenster, Check-out, Check-in-Hinweise, Ausstattung, Objektattribute, Erlebniswelten, Regeln, Medien, Bildbeschreibungen und Bildrechte bearbeiten | Medienbibliothek, Uploads, Reihenfolge und staerkere Normalisierung im Next-Admin weiter ausbauen | MVP-kritisch | Erledigt fuer MVP |
| Medienverwaltung | Bilder liegen als Assets/URLs; Next-Admin kann pro Unterkunft Medienzeilen, Bildbeschreibungen und Bildrechte pflegen | Echte Medienbibliothek mit Upload, Reihenfolge, Rechte-Status pro Bild und Wiederverwendung ueber Auszeiten | MVP-kritisch | Teilweise |
| Erlebnisbausteine | Erlebnisanbieter und Erlebnisbausteine existieren, Supabase-Sync vorhanden; Prototyp und Next-Admin koennen Anbieter, Auszeit-Zuordnung, Rolle, Inklusivstatus, Bestätigung, Preis-/Kapazitaets-/Verfuegbarkeitsnotiz und Gastnotiz pflegen; neue Erlebnisbausteine koennen direkt im Next-Admin angelegt werden | Spaeter staerker normalisieren, Anbieter-Verfuegbarkeiten separat pflegen und Medien/Verfuegbarkeitsregeln erweitern | MVP-kritisch | Erledigt fuer MVP |
| Buchungen | Kunden/Buchungen in Supabase, Statuslogik, Gaestebereich-Code getestet | Buchungsstatus, Zahlung, Vorbereitung, Aufgaben und Gaestebereich noch staerker miteinander koppeln | MVP-kritisch | Teilweise |
| Aufgaben automatisch bei Buchungsstatus | Statuswechsel erzeugen deduplizierte Standardaufgaben fuer Reserviert, Bezahlt, Vor Anreise, Aktiv und Abgeschlossen; Next-Admin liest `admin_tasks`, zeigt faellige Aufgaben und kann Aufgabenstatus aktualisieren | Spaeter je Auszeit-Typ und Saison feinere Templates ergaenzen | MVP-kritisch | Erledigt fuer MVP |
| Audit-Log | `admin_audit_logs` ist vorhanden; Next-Admin schreibt Status-, Notiz-, Buchungs-, Aufgaben-, Bestand-, Eigentümerprofil-, Eigentümerzugriff-, Erlebnis- und Terminänderungen und zeigt letzte Änderungen sowie datensatzbezogene Änderungen im Detaildrawer | Spaeter vollständige Diff-Ansicht, Filter, Export und Pflicht-Audit fuer alle Mutationen ergaenzen | MVP-light | Teilweise |
| Monitoring fehlender Daten | Zentrale Liste fehlender Pflichtdaten pro Auszeit, Buchung, Unterkunft und Support auf der neuen Next-Admin-Uebersicht vorhanden; Prototyp enthaelt zusaetzlich tiefere Detail-Sprungziele | Spaeter um lokale Orte, Partnerprofile, Erlebnisse und automatische Eskalation im Next-Admin erweitern | MVP-kritisch | Erledigt fuer MVP |

## Block 2: Guest Comfort

Ziel: Nach der Buchung fuehlt sich Morrow wie Komfort an, nicht wie eine lose E-Mail-Kette.

| Thema | Haben Wir | Brauchen Wir | MVP-Klasse | Status |
| --- | --- | --- | --- | --- |
| Gaestebereich | Live-Zugang per Buchungscode getestet; Prototyp enthaelt volle App-Logik; `apps/guest` ist als Next-App gestartet und laedt Buchung/Auszeit ueber `get_guest_stay()`, zeigt Start, Auszeit, Buchung, Vor Ort, Hilfe und Feedback als mobil-first App-Shell; Vor-Ort-Bereich hat Filter, Live-Wetter mit 1-/3-/14-Tage-Umschaltung, Gezeitenmodul, interaktive Leaflet-Karte, Auszeit-/Orts-Pins, Cluster-Aufloesung, kuratierte Ortskarten und Local-Detail-Drawer; lokaler Dev-Zugang `/deine-auszeit/dev-active?code=MORROWDEV` wurde mobil im Browser getestet | Echte Live-Gezeitenquelle, Veranstaltungen und feinere Support-/Nach-Aufenthalt-Logik aus dem Prototyp migrieren; Supabase-Testdatensatz via `supabase:seed-active-guest-test` live ausfuehren, sobald `SUPABASE_SERVICE_ROLE_KEY` lokal gesetzt ist | MVP-kritisch | Teilweise |
| Anreise, Schluessel, Unterkunftsregeln | Check-in-Daten, Adresse, Regeln, Check-out und Support-Zustaendigkeit sind am Paket/Objekt pflegbar; Buchungsseite im Gaestebereich zeigt die Infos klar aus Admin-Daten | Spaeter buchungsspezifische Sonderhinweise und echte Freigabezeitpunkte pro Buchung ergaenzen | MVP-kritisch | Erledigt fuer MVP |
| Tagesplan / Meine Auszeit | Eigener Bereich im Gaestebereich vorhanden; Ablaufpunkte sind pro Auszeit im Admin pflegbar und erscheinen als kompakte Timeline mit Detail-Drawer | Spaeter buchungsspezifische Abweichungen und echte Tageszeiten pro Buchung ergaenzen | MVP-kritisch | Erledigt fuer MVP |
| Kuratierte Karte | Prototyp enthaelt Karte, Filter, Pins, Drawer, Restaurants, Orte und Veranstaltungen; Next-Guest enthaelt Leaflet-Karte, Filter, Auszeit-Pin, Orts-Pins, Cluster-Aufloesung bei `Alle`, Namen-Pins bei aktiven Kategorien und Detail-Drawer fuer einzelne Orte; Next-Admin kann `local_places` als Vor-Ort-Datensaetze mit Kategorie, Status, Koordinaten, Links, Rating, Oeffnungszeiten, Veranstaltungsdatum/-zeit, Beschreibung, Zielgruppen-Passung und Bildern pflegen; Next-Guest liest `package_fit`, Oeffnungszeiten und Veranstaltungszeit fuer passende Empfehlungen | Echte Kandidaten-Datenqualitaet, Veranstaltungsdaten und Live-Daten weiter pruefen | MVP-kritisch | Teilweise |
| Live-Daten | Next-Guest ruft Open-Meteo fuer 14 Tage Wettervorschau ab und zeigt Heute/3 Tage/14 Tage mit Fallback; Gezeiten und Veranstaltungen sind als Module/Daten vorbereitet | Live-Gezeitenquelle, Veranstaltungsdaten in Next-Guest und Fehlerzustand weiter ausbauen | MVP-light | Teilweise |
| Restaurant-Reservierungen | Reservierungs-/Website-/Speisekartenlinks als externe Links vorhanden | Pro Restaurant kuratierte Reservierungslinks, Bilder, Kueche, Preisgefuehl, Oeffnungszeiten, Bewertung | MVP-kritisch | Teilweise |
| Support-Chat | Gaeste koennen im Bereich Hilfe eine Nachricht mit Kategorie und Dringlichkeit senden; Next-Guest hat einen strukturierten Hilfe-Flow mit Thema, Dringlichkeit und Zuständigkeits-Hinweis; Next-Admin zeigt Supportfaelle als eigene Sektion mit Detail-Drawer, Statuswechsel, Historie, interner Notiz und E-Mail-Antwort aus dem Supportfall | Spaeter echte In-App-Chat-Antwort und WhatsApp-Templates ergaenzen | MVP-kritisch | Erledigt fuer MVP |
| Schadens-/Problem-Tickets | Objektproblem-Flow unterscheidet Morrow-Objektbetreuung von Agentur/Hotel-Partnerfaellen und priorisiert dringende Themen; `support_messages` hat Status, Dringlichkeit und Updated-At als Workflowfelder | Spaeter Partnerweiterleitung und Status pro Ticket weiter normalisieren | MVP-kritisch | Erledigt fuer MVP |
| Feedback nach Aufenthalt | Feedback-Ansicht im Gaestebereich, Speicherung in `guest_feedback`, Kommunikationshistorie und automatische Resend-Edge-Function fuer faellige Feedback-Mails 1 Tag nach Abschluss sind live; serverseitiger Supabase-Cron `morrow-post-stay-feedback-daily` ruft die Function taeglich um 07:15 UTC mit Vault-Secrets und eigenem Automation-Secret auf; Live-Function, Dedupe, gesicherter Cron-Pfad und `pg_net`-Response wurden am 2026-06-23 getestet; Next-Admin zeigt Durchschnitt, letzte Rückmeldungen, Wiederkehrinteresse und niedrige Bewertungen als Prüfsignal | Spaeter Feedback-Auswertung mit Tags, Aufgabenautomatik und Wiederbuchungsimpulsen vertiefen | MVP-light | Erledigt fuer MVP |
| Wiederbuchung | Abgeschlossene Buchungen zeigen im Next-Gästebereich eine reduzierte Rückkehr-Erfahrung mit Rückblick, Feedback, alten Buchungsdetails und Empfehlungen zu passenden nächsten Auszeiten | Spaeter personalisierte Wiederbuchungsimpulse, E-Mail-Nurturing und saisonale Empfehlungen ergänzen | MVP-light | Teilweise |

## Block 3: Communication

Ziel: Kommunikation ist nachvollziehbar, persoenlich und nicht verteilt ueber private Kanaele.

| Thema | Haben Wir | Brauchen Wir | MVP-Klasse | Status |
| --- | --- | --- | --- | --- |
| E-Mail-Automation | Resend/Supabase Edge Functions getestet; Lead-Mails funktionieren; Feedback-Mail nach Aufenthalt laeuft serverseitig ueber Supabase-Cron; Statusmails fuer Reservierung, Zahlung/Bestaetigung und Vor Anreise sind als Admin-getriggerte Function live, dedupliziert und mit Kommunikationshistorie getestet | Spaeter weitere Statusmails, manuelle E-Mail-Komposition und bessere Template-Verwaltung | MVP-kritisch | Erledigt fuer MVP |
| Kommunikationshistorie | `communication_events` vorhanden; Next-Admin hat Detail-Drawer fuer Anfragen, Buchungen und Support mit Historie, klickbaren Kontaktdaten und interner Notiz, die als Kommunikationsereignis gespeichert wird; freie E-Mail-Antworten aus Anfrage, Buchung und Support heraus laufen ueber Resend und werden in `email_events` sowie `communication_events` dokumentiert | WhatsApp-Templates, Vorlagenbibliothek und spaeter bessere Kommunikationszentrale ergaenzen | MVP-kritisch | Teilweise |
| WhatsApp-Opt-in | Formularabfrage/Opt-in vorhanden | Zustimmung sauber speichern, Texte/Einwilligung rechtlich pruefen, manuelle WhatsApp-Nutzung dokumentieren | MVP-kritisch | Teilweise |
| WhatsApp-Templates | Nicht umgesetzt | V2 oder MVP-light: vorbereitete Textbausteine, noch manuell versenden | MVP-light | Offen |
| Push-Benachrichtigungen | Nicht umgesetzt | Nicht noetig fuer ersten MVP-Start, spaeter PWA/App | V2 | Offen |
| Interne Erinnerungen | Aufgaben/Wiedervorlagen vorhanden | Automatische interne Erinnerungen aus Status/Faelligkeit | MVP-kritisch | Teilweise |

## Block 4: Data And Architecture

Ziel: Supabase ist die fuehrende Datenquelle fuer alles, was operativ relevant ist.

| Thema | Haben Wir | Brauchen Wir | MVP-Klasse | Status |
| --- | --- | --- | --- | --- |
| Supabase als Quelle | Leads, Kunden, Buchungen, Auszeiten, Vor-Ort-Daten, Anbieter, Agenturen, Objekte angebunden; Next-Web Anfrageformulare schreiben Gast-, Eigentümer- und Erlebnispartner-Leads direkt nach Supabase und lösen danach die Lead-Mailfunktion aus; ein Mailfehler blockiert die gespeicherte Anfrage nicht; Next-Admin zeigt Quelle/Kampagne/UTM-Kontext an Anfragen | LocalStorage nur noch Demo/Fallback; alle Admin-Mutationen remote bestaetigen | MVP-kritisch | Teilweise |
| Relationale Struktur | Tabellen vorhanden, Payload noch stark genutzt | Buchungen, Kunden, Zahlungen, Pakete, Termine, Anbieter staerker normalisieren | MVP-light | Teilweise |
| Zahlungen | Zahlung bleibt manuell; Next-Admin kann in Buchungen Zahlungsstatus, Betrag, Datum, Zahlungsart, Referenz und Beleglink dokumentieren und schreibt Änderungen ins Audit-Log | Payment-Provider, Rechnungslogik und automatische Zahlungsabgleiche spaeter ergaenzen | MVP-light | Teilweise |
| Automatische Gaestebereich-Freigabe | Status `Bezahlt` schaltet frei, getestet | Freigabe an Zahlungs-/Buchungsstatus koppeln, klare Sperr-/Fehlerzustaende | MVP-kritisch | Teilweise |
| Testdaten | Testdaten markiert und aus KPIs ausgeschlossen | Testfilter optional in Admin | MVP-light | Teilweise |
| Backup/Recovery | Runbook `docs/SUPABASE_BACKUP_RECOVERY_RUNBOOK.md` vorhanden; `npm run supabase:backup` exportiert die operativ wichtigen Supabase-Tabellen als lokale JSON-Sicherung mit Manifest; `backups/` ist vom Git ausgeschlossen | Supabase Dashboard Backups/PITR vor dem ersten zahlenden Gast aktiv pruefen und spaeter verschluesselte/geplante Backups ergaenzen | MVP-kritisch | Teilweise |

## Block 5: Legal And Trust

Ziel: Buchbare Auszeiten duerfen nicht ohne klare Bedingungen live gehen.

| Thema | Haben Wir | Brauchen Wir | MVP-Klasse | Status |
| --- | --- | --- | --- | --- |
| AGB | Web-Arbeitsfassung unter `/agb` vorhanden und im Footer verlinkt | AGB fuer Anfrage/Buchung/Leistungspartner juristisch final pruefen lassen | MVP-kritisch | Teilweise |
| Buchungsbedingungen | Web-Arbeitsfassung unter `/buchungsbedingungen` vorhanden und im Footer verlinkt | Was ist verbindlich, wann entsteht Buchung, was ist enthalten? juristisch finalisieren | MVP-kritisch | Teilweise |
| Stornobedingungen | Web-Arbeitsfassung unter `/stornobedingungen` vorhanden und im Footer verlinkt | Fristen, Kosten, Sonderfaelle je Buchungsmodell final festlegen | MVP-kritisch | Teilweise |
| Zahlungsbedingungen | Web-Arbeitsfassung unter `/zahlungsbedingungen` vorhanden und im Footer verlinkt | Zahlung wann, wohin, Beleg, Reservierung bis wann final festlegen | MVP-kritisch | Teilweise |
| Datenschutz | Web-Arbeitsfassung unter `/datenschutz` vorhanden und im Footer verlinkt; optionale GA-/Meta-Messung startet in Next-Web erst nach Consent | Supabase, Resend, WhatsApp, Tracking, Supportdaten final pruefen | MVP-kritisch | Teilweise |
| WhatsApp/Marketing-Einwilligung | Technisch teilweise | Rechtstext/Opt-in-Formulierung finalisieren | MVP-kritisch | Offen |
| Bildrechte | Teilweise als Feld vorhanden | Pro Unterkunft/Erlebnis dokumentieren | MVP-kritisch | Teilweise |
| Secret-Rotation | Secrets wurden im Arbeitsverlauf geteilt | Supabase Service Role, PAT, Resend Key, Admin-Passwort rotieren | MVP-kritisch | Offen |

## Block 6: Growth

Ziel: Morrow kann Nachfrage erzeugen und messen, ohne direkt zu ueberautomatisieren.

| Thema | Haben Wir | Brauchen Wir | MVP-Klasse | Status |
| --- | --- | --- | --- | --- |
| Ratgeberbereich | Vorhanden | Systematischer Ausbau mit Keyword-Clustern und interner Verlinkung | MVP-kritisch | Teilweise |
| Keyword-Cluster | Dokument `SEO_GEO_KEYWORD_PLAN.md` vorhanden | SPO/Familienurlaub/Paar-Auszeit/Nordsee priorisieren, Artikelplan pflegen | MVP-kritisch | Teilweise |
| Schema.org | Next-Web gibt strukturierte Daten fuer Organisation, Website, Auszeiten-Listen, Auszeit-Angebote, FAQ, Breadcrumbs, Ratgeber-Artikel, Eigentuemer- und Erlebnispartner-Service aus | Spaeter mit echten Review-/Availability-/LocalBusiness-Daten und Search Console Validierung erweitern | MVP-light | Teilweise |
| Conversion-Tracking | Zentrale Web-Analytics-Komponente vorhanden; CTA-Klicks und Formular-Submits auf Auszeiten, Anfrage, Eigentuemer, Erlebnispartner und Ratgeber werden ueber `data-conversion` an GA/Meta gemeldet, wenn die Public IDs gesetzt sind und Consent erteilt wurde | Events live mit echten GA4-/Meta-Pixel-IDs und Test-Events pruefen | MVP-kritisch | Teilweise |
| Meta/Google Ads messen | GA4/Meta-Pixel sind env-gesteuert vorbereitet; PageView und Custom-CTA-Events werden bei gesetzten IDs erst nach Consent ausgelöst | Pixel/Conversions/UTM in Production sauber testen und Zielereignisse in Meta/Google Ads anlegen | MVP-kritisch | Teilweise |
| Landingpages pro Auszeit/Zielgruppe | Paketseiten vorhanden | Kampagnenspezifische Landingpages optional fuer Ads | MVP-light | Teilweise |
| E-Mail-Nurturing | Nicht umgesetzt | Fuer MVP reicht manuelle Nachfassung plus Statusmails | MVP-light | Offen |
| Retargeting | Nicht umgesetzt | Spaeter, nicht vor erstem kontrollierten Start | V2 | Offen |
| Partner-Akquise-System | Admin-Bereiche und Leadformulare vorhanden | Akquise-Pipeline, Quellen, Kontaktstatus, Follow-ups | MVP-light | Teilweise |
| Angebotsseiten fuer Eigentuemer/Erlebnisanbieter | Seiten vorhanden/teilweise | Copy und Conversion weiter schaerfen | MVP-light | Teilweise |

## V2 Nach Dem MVP-Start

Diese Punkte bleiben bewusst nachgelagert:

- Erlebnisanbieter-Login
- Agentur-/Hotel-Login
- Verfuegbarkeiten durch Partner melden
- Stammdaten durch Partner pflegen
- Anfragen durch Partner bestaetigen/ablehnen
- Dokumente und Absprachen im Partnerportal
- Performance fuer Eigentuemer
- Provisions-/Abrechnungsuebersicht
- Push-Benachrichtigungen als PWA/App-Funktion
- Retargeting-Automation
- Vollstaendiges Payment-/Provisionssystem

## Architekturstand Nach Next-Migration

Stand: 2026-06-26

- `apps/web` enthaelt die migrierte oeffentliche SEO-Website mit Startseite, Auszeiten, Eigentuemerpfad, Erlebnispartnerpfad und Ratgeber.
- `apps/owner` ist als geschuetzte Eigentuemer-App gestartet und zeigt MVP-Light Objekttransparenz, freie Zeitraeume, Buchungen, Lueckenmarketing-Light, Vermarktungslogik, offene Objektpunkte, Operationsstatus, Dokumenthinweise und Abrechnungsausblick.
- Der Eigentuemerzugriff ist strukturell ueber `owner_profiles` und `owner_property_access` vorbereitet und im Next-Admin pflegbar.
- Die Eigentuemer-App liest eigene Objekte, Auszeiten, Termine und Buchungen ueber `get_owner_dashboard()`.
- `apps/admin` und `apps/owner` mappen lokale `VITE_SUPABASE_*` Public-Variablen auf `NEXT_PUBLIC_SUPABASE_*`, damit lokale Next-Tests denselben Supabase-Zugang wie der Prototyp nutzen koennen.
- `npm run supabase:verify-owner` prueft die Owner-Tabellen, `get_owner_dashboard()` und optional mit `OWNER_EMAIL`/`OWNER_PASSWORD` einen echten freigeschalteten Eigentuemerzugang.
- Die Migration muss noch remote in Supabase angewendet werden, sobald `SUPABASE_ACCESS_TOKEN` oder Datenbankpasswort lokal verfuegbar ist.
- `apps/guest` ist als Next-App gestartet und liest codegeschuetzte Buchungen ueber `get_guest_stay()`; die tieferen Prototyp-Funktionen muessen schrittweise migriert werden.
- `apps/admin` ist als Next-App gestartet und kann nach Admin-Login operative Supabase-Daten lesen, Anfrage-, Buchungs-, Support- und Aufgabenstatus aktualisieren, Detail-Drawer mit Kommunikationshistorie nutzen, interne Notizen speichern, freie E-Mail-Antworten aus Anfrage/Buchung/Support senden, Monitoringhinweise anzeigen, Eigentuemerprofile/Objektzugriffe vorbereiten, lokale Vor-Ort-Orte/Kandidaten pflegen sowie Auszeiten, Termine und Erlebnisbausteine bearbeiten/neu anlegen und Unterkuenfte inklusive operativer Anreise-/Regel-/Medienfelder, Ausstattung, Objektattributen und Erlebniswelten pflegen.

Naechste technische Prioritaet:

1. Supabase Owner-Migration live anwenden, `admin-send-message` deployen und ersten echten Owner-Zugang testen.
2. Admin-App weiter ausbauen: Kommunikationsvorlagen, echte Medienbibliothek, Detailsektionen und tieferes Monitoring migrieren.
3. Guest-App vertiefen: interaktive Karte, lokale Detail-Drawer, Wetter, Gezeiten, Veranstaltungen, Support-Chat und Nach-Aufenthalt-Modus aus dem Prototyp ueberfuehren.
4. Owner-App danach vertiefen: echte Abrechnungsdatensaetze, Dokumentenablage, Operationshistorie und Eigentuemer-Kommunikation.
5. Fuer die Next-Guest-App einen aktiven Supabase-Testdatensatz mit gueltigem Access-Code live pflegen; lokaler Dev-Zugang ist vorhanden, Live-Seed wartet auf `SUPABASE_SERVICE_ROLE_KEY`.

## Empfohlene Umsetzungsreihenfolge

### Sprint 1: Operate stabilisieren

1. Paket-Builder fertigstellen.
   - Stand 2026-06-05: Builder-Oberflaeche erweitert; Build, Smoke-Test und End-to-End-Test mit temporaerer Test-Auszeit bestanden.
   - Stand 2026-06-26: Next-Admin kann Termine neu anlegen und bestehenden Auszeiten zuordnen; Build und Typecheck bestanden.
   - Stand 2026-06-26: Next-Admin kann Auszeiten neu als Entwurf anlegen, Basisdaten setzen und Unterkuenfte verbinden; Build und Typecheck bestanden.
2. Unterkunftsverwaltung erweitern: Medien, Rechte, Regeln, Check-in, Ausstattung.
   - Stand 2026-06-05: Objektprofile erweitert; Build, Smoke-Test und End-to-End-Test mit temporaerem Testobjekt bestanden.
   - Stand 2026-06-26: Next-Admin kann Unterkuenfte neu als Entwurf anlegen und Basis-/Check-in-/Supportdaten pflegen; Build und Typecheck bestanden.
   - Stand 2026-06-26: Next-Admin kann Adresse, Anreisefenster, Check-out, Check-in-Hinweise, Regeln, Medienliste und Bildrechte pflegen; Monitoring weist fehlende Check-in-/Regel-/Medienangaben aus; Build, Typecheck und Lint bestanden.
   - Stand 2026-06-26: Next-Admin kann Ausstattung, Objektattribute, Erlebniswelten und Bildbeschreibungen pflegen; Monitoring weist fehlende Ausstattung, Attribute und Erlebniswelten aus; Build, Typecheck und Lint bestanden.
3. Erlebnisbausteine erweitern: Anbieter, Preis, Kapazitaet, Verfuegbarkeit.
   - Stand 2026-06-05: Erlebnis-Drawer und Erlebniskarten erweitert; Build, Smoke-Test und Speichern/Ruecksetzen-Test bestanden.
   - Stand 2026-06-26: Next-Admin kann Erlebnisbausteine neu anlegen und mit Auszeit/Anbieter verbinden; Build und Typecheck bestanden.
4. Monitoring fehlender Pflichtdaten bauen.
   - Stand 2026-06-05: Zentrales Pflichtdaten-Monitoring auf der Admin-Uebersicht gebaut; Build, Sichttest und Sprung in Datensatz bestanden.
5. Automatische Aufgaben bei Buchungsstatus einfuehren.
   - Stand 2026-06-09: Statusbasierte Standardaufgaben fuer Reserviert, Bezahlt, Vor Anreise, Aktiv und Abgeschlossen gebaut; Dedupe-Logik, Drawer-Vorschau, Build und Test mit Testbuchung bestanden.

### Sprint 2: Guest Comfort fertig machen

1. Gaestebereich `Meine Auszeit`/Tagesplan bauen.
   - Stand 2026-06-09: Eigener Bereich gebaut, mobil entschlackt, Ablaufpunkte pro Auszeit im Admin pflegbar und im Gaestebereich getestet.
2. Anreise, Schluessel, Unterkunftsregeln aus Admin-Daten anzeigen.
   - Stand 2026-06-09: Adresse, Anreisefenster, Schluesselart, Schluesselhinweis, Check-out, Regeln und Objekt-Support aus Auszeit/Objekt-Daten im Gaestebereich angezeigt; Paket-Builder und Monitoring erweitert; Build und Sichttest bestanden.
3. Support-/Problem-Ticket-Flow finalisieren.
   - Stand 2026-06-09: Hilfe-Formular mit Kategorie und Dringlichkeit gebaut; Supportfall landet im Admin mit Buchungsbezug, Zuständigkeit, naechstem Schritt und Kommunikationshistorie; Objektproblem unterscheidet Morrow vs. Partner; Build und E2E-Test bestanden.
4. Feedback nach Aufenthalt ergaenzen.
   - Stand 2026-06-09: Feedback-Ansicht im Gaestebereich, Feedbackspeicherung, Kommunikationshistorie und automatische Resend-Function fuer 1 Tag nach Abschluss gebaut; Supabase-Migration und Function-Deploy erledigt; Tabellen-/Function-Smoke-Test und Sofort-End-to-End-Test mit Feedback-Mail, Feedbackformular und Kommunikationshistorie bestanden; echter zeitversetzter Mail-Test ist fuer 2026-06-10 angelegt.
5. Nach-Aufenthalt-Modus im Gaestebereich.
   - Stand 2026-06-09: Status `Abgeschlossen` zeigt reduzierte Navigation, Rückblick auf die alte Buchung, Feedback und neue Auszeiten statt operativer Vor-Ort-/Anreise-Logik; Build und Browser-Sichttest bestanden.

### Sprint 3: Kommunikation und Recht

1. Statusbasierte E-Mails definieren und umsetzen.
2. Kommunikationszentrale aus Lead/Buchung heraus nutzbar machen.
   - Stand 2026-06-26: Next-Admin kann aus Anfrage/Buchung freie E-Mail-Antworten ueber `admin-send-message` senden; Versand wird in `email_events`, `communication_events` und Audit-Log dokumentiert; Build, Typecheck und Lint bestanden.
   - Stand 2026-06-26: Supportfaelle koennen denselben E-Mail-Pfad nutzen; Support-Ereignisse ohne Lead-/Booking-Bezug bleiben ueber `event_type = support:<id>` in der Historie auffindbar; Build, Typecheck und Lint bestanden.
3. WhatsApp-Opt-in rechtlich und technisch finalisieren.
4. AGB, Buchungs-, Storno-, Zahlungsbedingungen sichtbar einbinden.
   - Stand 2026-06-26: Next-Web hat Footer-Links und Web-Arbeitsfassungen fuer Impressum, Datenschutz, AGB, Buchungsbedingungen, Stornobedingungen und Zahlungsbedingungen. Die Seiten sind technisch sichtbar und ueber Sitemap angebunden; finaler Rechtscheck und vollstaendige Anbieterkennzeichnung bleiben offen.
5. Secrets und Admin-Passwort rotieren.

### Sprint 4: Growth-Messung

1. Conversion-Tracking einbauen.
2. UTM/Quelle/Kampagne sauber pruefen.
3. Schema.org Basics ergaenzen.
4. Ratgeber-Cluster priorisieren.
5. Landingpages fuer Ads bei Bedarf erstellen.

## Abnahmetests Vor Erstem Zahlenden Gast

- [x] Admin-Login funktioniert live.
- [x] Anfrage landet in Supabase.
- [x] E-Mail-Automation fuer Anfrage getestet.
- [x] Anfrage zu Kunde/Buchung getestet.
- [x] Gaestebereich mit Access-Code getestet.
- [x] Testdaten werden markiert und aus KPIs ausgeschlossen.
- [x] Neue Auszeit komplett im Admin anlegen.
- [x] Unterkunft mit Medien, Regeln, Check-in und Rechten im Admin pflegen.
- [x] Erlebnis mit Anbieter, Preis/Kapazitaet/Verfuegbarkeit im Admin pflegen.
- [x] Pflichtdaten-Monitoring auf Admin-Uebersicht zeigt Blocker und oeffnet Datensaetze.
- [x] Buchung erzeugt automatische Aufgaben.
- [x] Gaestebereich zeigt Anreise, Schluessel und Regeln aus Admin-Daten.
- [x] Supportnachricht aus Gaestebereich landet als Admin-Thema.
- [x] Feedback nach Aufenthalt kann in Supabase gespeichert werden.
- [x] Feedback erzeugt live Kommunikationshistorie aus einem echten Gaestebereich-Test.
- [x] Feedback-Mail wird 1 Tag nach Abschluss automatisch versendet.
- [x] Status-E-Mails fuer Reservierung/Bestaetigung/Vor Anreise getestet.
- [ ] AGB/Buchungsbedingungen/Storno/Zahlung final verlinkt.
- [ ] Datenschutz/WhatsApp/Tracking rechtlich geprueft.
- [ ] Conversion-Tracking fuer Anfrage getestet.
- [ ] Secrets rotiert.

## Naechster Konkreter Schritt

Weiter mit Production-Rehearsal und Launch-Gates:

`Live-Leadflow, Tracking, Rechtstexte, Secret-Rotation und finale Angebotsdaten fuer den ersten kontrollierten Marktstart absichern`

Definition of Done:

- Echte Next-Web Anfrage mit UTM landet live in Supabase, loest Lead-Mail aus und zeigt Quelle/Kampagne im Admin.
- Consent-Tracking wird mit echten GA4-/Meta-IDs getestet und Zielereignisse fuer Anfrage/Submit werden dokumentiert.
- Impressum, Datenschutz, AGB, Buchungs-, Storno- und Zahlungsbedingungen sind mit echten Unternehmens- und Angebotsdaten juristisch final geprueft.
- Supabase Service Role, Resend Key, GitHub PAT und Admin-/Testpasswoerter sind rotiert und nur noch in sicheren Umgebungen hinterlegt.
- Finale Angebotsdaten fuer die erste Auszeit sind geprueft: Unterkunft, Bilderrechte, Termin, Preis, Erlebnis, Restaurant-/Ortsempfehlungen und Supportzustaendigkeit.
