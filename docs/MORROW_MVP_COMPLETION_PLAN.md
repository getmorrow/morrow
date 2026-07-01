# Morrow MVP Completion Plan

Status: Arbeitsrahmen fuer den echten Phase-1-Start mit ersten zahlenden Gaesten.

Dieses Dokument ist die operative Bruecke zwischen `docs/MORROW_MASTER_FRAME.md`, `docs/PLATFORM_MODEL_PHASE2.md`, `docs/SUPABASE_STORAGE_AUDIT_2026-06-05.md` und dem aktuellen Produktstand.

Ziel: Morrow bleibt ein schlanker MVP, aber der Aufenthalt muss fuer Gaeste hochwertig, vorbereitet und intern sauber betreibbar sein.

## Konsolidierungsstopp 2026-06-27

Vor weiterem Featurebau gilt `docs/MIGRATION_CONSOLIDATION_AUDIT.md` als fuehrender Sprint-Rahmen. Die konkrete Admin-CRM-Paritaet wird in `docs/ADMIN_CRM_PARITY_CHECKLIST.md` abgearbeitet.

Die neue Next-Plattformstruktur ist grundsaetzlich richtig, aber `apps/admin` ist noch nicht als vollstaendiger Ersatz fuer den alten Vite-Admin-CRM abgenommen. Deshalb werden neue Produktfeatures geparkt, bis Bestandsaufnahme, Migrationsmatrix, Admin-Funktionsparitaet, fuehrende Apps und Dev-/Betriebsbasis konsolidiert sind.

Wichtig:

- `apps/web` ist fuehrend fuer die oeffentliche Website.
- `apps/guest` ist Ziel-App fuer den Gaestebereich.
- `apps/owner` ist Ziel-App fuer den Eigentuemerbereich.
- `apps/admin` ist Ziel-App fuer die Quelle der Wahrheit, bleibt aber bis zur CRM-Paritaet in Konsolidierung.
- Der Vite-Prototyp bleibt Referenz fuer noch nicht migrierte CRM-/Admin-Funktionen.

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
| Unterkunftsverwaltung | Objektprofile, Agenturen, Check-in-Typ, Support-Typ, Anreise/Abreise, Medien, Bildrechte, Ausstattung, Hausregeln, Schluesselinfos und Objekt-Support sind im Prototyp pflegbar; Next-Admin kann Unterkuenfte neu anlegen und Name, Status, Ort, Schlafplaetze, Zimmer, Eigentuemer-/Objektkontakt, Check-in, Support, Adresse, Anreisefenster, Check-out, Check-in-Hinweise, Ausstattung, Objektattribute, Erlebniswelten, Regeln, Medien, Bildbeschreibungen und Bildrechte bearbeiten; Next-Admin lädt `agencies`, kann Phase-1-Agenturen anlegen/bearbeiten, Status ändern, Objekt-IDs verbinden und Kontakt/Verfügbarkeitsnotiz pflegen | Medienbibliothek, Uploads, Reihenfolge und staerkere Normalisierung im Next-Admin weiter ausbauen | MVP-kritisch | Erledigt fuer MVP |
| Medienverwaltung | Bilder liegen als Assets/URLs; Next-Admin kann pro Unterkunft Medienzeilen, Bildbeschreibungen und Bildrechte pflegen | Echte Medienbibliothek mit Upload, Reihenfolge, Rechte-Status pro Bild und Wiederverwendung ueber Auszeiten | MVP-kritisch | Teilweise |
| Erlebnisbausteine | Erlebnisanbieter und Erlebnisbausteine existieren, Supabase-Sync vorhanden; Prototyp und Next-Admin koennen Anbieter, Auszeit-Zuordnung, Rolle, Inklusivstatus, Bestätigung, Preis-/Kapazitaets-/Verfuegbarkeitsnotiz und Gastnotiz pflegen; neue Erlebnisbausteine koennen direkt im Next-Admin angelegt werden | Spaeter staerker normalisieren, Anbieter-Verfuegbarkeiten separat pflegen und Medien/Verfuegbarkeitsregeln erweitern | MVP-kritisch | Erledigt fuer MVP |
| Buchungen | Kunden/Buchungen in Supabase, Statuslogik, Gaestebereich-Code getestet; Next-Admin hat einen Buchungsdetail-Drawer mit Zahlungsdaten, Reservierungsfrist, Zahlungsfrist, Personen/Kinder/Hund, Check-in-Status, Erlebnisstatus, nächster Aufgabe, interner Notiz, E-Mail und Historie | Buchungsstatus, Zahlung, Vorbereitung, Aufgaben und Gaestebereich spaeter noch staerker normalisieren und automatisieren | MVP-kritisch | Teilweise |
| Aufgaben automatisch bei Buchungsstatus | Statuswechsel erzeugen deduplizierte Standardaufgaben fuer Reserviert, Bezahlt, Vor Anreise, Aktiv und Abgeschlossen; Next-Admin liest `admin_tasks`, zeigt faellige Aufgaben und kann Aufgabenstatus aktualisieren | Spaeter je Auszeit-Typ und Saison feinere Templates ergaenzen | MVP-kritisch | Erledigt fuer MVP |
| Audit-Log | `admin_audit_logs` ist vorhanden; Next-Admin schreibt Status-, Notiz-, Buchungs-, Aufgaben-, Bestand-, Eigentümerprofil-, Eigentümerzugriff-, Erlebnis- und Terminänderungen und zeigt letzte Änderungen sowie datensatzbezogene Änderungen im Detaildrawer | Spaeter vollständige Diff-Ansicht, Filter, Export und Pflicht-Audit fuer alle Mutationen ergaenzen | MVP-light | Teilweise |
| Monitoring fehlender Daten | Zentrale Liste fehlender Pflichtdaten pro Auszeit, Buchung, Unterkunft und Support auf der neuen Next-Admin-Uebersicht vorhanden; Prototyp enthaelt zusaetzlich tiefere Detail-Sprungziele | Spaeter um lokale Orte, Partnerprofile, Erlebnisse und automatische Eskalation im Next-Admin erweitern | MVP-kritisch | Erledigt fuer MVP |
| Eigentümer-Rückkanal | Next-Owner kann strukturierte Rückfragen zu Objekt, Buchung, Eigenbelegung/Verfügbarkeit und Abrechnung als `support_messages` an Admin senden; Zeitraumfragen enthalten Von-/Bis-Daten im Payload; `get_owner_dashboard().messages` zeigt die letzten gesendeten Anliegen mit Status, Objektbezug und Zeitraum; `get_owner_communication_events()` zeigt sichtbare Admin-Antworten; `get_owner_support_status_events()` zeigt Statuswechsel am jeweiligen Anliegen; Verfügbarkeits-/Eigenbelegungsanfragen erzeugen automatisch eine offene Admin-Aufgabe zur Prüfung | Spaeter echte Kalenderwirkung und automatische Kalenderblocker fuer bestaetigte Verfügbarkeitsfreigaben ergänzen | MVP-light | Teilweise |

## Block 2: Guest Comfort

Ziel: Nach der Buchung fuehlt sich Morrow wie Komfort an, nicht wie eine lose E-Mail-Kette.

| Thema | Haben Wir | Brauchen Wir | MVP-Klasse | Status |
| --- | --- | --- | --- | --- |
| Gaestebereich | Live-Zugang per Buchungscode getestet; Prototyp enthaelt volle App-Logik; `apps/guest` ist als Next-App gestartet und laedt Buchung/Auszeit ueber `get_guest_stay()`, zeigt Start, Auszeit, Buchung, Vor Ort, Hilfe und Feedback als mobil-first App-Shell; Vor-Ort-Bereich hat Filter, Live-Wetter mit 1-/3-/14-Tage-Umschaltung, Gezeiten-V1 mit Heute-/3-/4-Tage-Orientierung, interaktive Leaflet-Karte, Auszeit-/Orts-Pins, Cluster-Aufloesung, kuratierte Ortskarten und Local-Detail-Drawer; Hilfe zeigt gesendete Supportnachrichten und sichtbare Morrow-Antworten ueber `get_guest_support_events()`; lokaler Dev-Zugang `/deine-auszeit/dev-active?code=MORROWDEV` wurde mobil im Browser getestet; Supabase-Testdatensatz `/deine-auszeit/11111111-1111-4111-8111-111111111111?code=MORROW1` ist live gesetzt und mit `npm run supabase:verify-guest` per RPC sowie optional per Browser pruefbar | Echte Live-/Amts-Gezeitenquelle und feinere Nach-Aufenthalt-Logik aus dem Prototyp migrieren | MVP-kritisch | Teilweise |
| Anreise, Schluessel, Unterkunftsregeln | Check-in-Daten, Adresse, Regeln, Check-out und Support-Zustaendigkeit sind am Paket/Objekt pflegbar; Buchungsseite im Gaestebereich zeigt die Infos klar aus Admin-Daten | Spaeter buchungsspezifische Sonderhinweise und echte Freigabezeitpunkte pro Buchung ergaenzen | MVP-kritisch | Erledigt fuer MVP |
| Tagesplan / Meine Auszeit | Eigener Bereich im Gaestebereich vorhanden; Ablaufpunkte sind pro Auszeit im Admin pflegbar und erscheinen als kompakte Timeline mit Detail-Drawer | Spaeter buchungsspezifische Abweichungen und echte Tageszeiten pro Buchung ergaenzen | MVP-kritisch | Erledigt fuer MVP |
| Kuratierte Karte | Prototyp enthaelt Karte, Filter, Pins, Drawer, Restaurants, Orte und Veranstaltungen; Next-Guest enthaelt Leaflet-Karte, Filter, Auszeit-Pin, Orts-Pins, Cluster-Aufloesung bei `Alle`, Namen-Pins bei aktiven Kategorien und Detail-Drawer fuer einzelne Orte; Next-Admin kann `local_places` als Vor-Ort-Datensaetze mit Kategorie, Status, Koordinaten, Links, Rating, Oeffnungszeiten, Veranstaltungsdatum/-zeit, Beschreibung, Zielgruppen-Passung und Bildern pflegen; Next-Guest liest `package_fit`, Oeffnungszeiten und Veranstaltungszeit fuer passende Empfehlungen und zeigt Veranstaltungen als eigenen sortierten Vor-Ort-Baustein | Echte Kandidaten-Datenqualitaet, Veranstaltungsdaten und Live-Daten weiter pruefen | MVP-kritisch | Teilweise |
| Live-Daten | Next-Guest ruft Open-Meteo fuer 14 Tage Wettervorschau ab und zeigt Heute/3 Tage/14 Tage mit Fallback; Gezeiten-V1 zeigt berechnete Orientierung mit Heute/3 Tage/4 Tage und bewusstem Tageshinweis; Veranstaltungen werden aus kuratierten `local_places` nach Termin sortiert und im Vor-Ort-Bereich angezeigt | Live-/Amts-Gezeitenquelle, Veranstaltungsdatenqualitaet und Fehlerzustand weiter ausbauen | MVP-light | Teilweise |
| Restaurant-Reservierungen | Reservierungs-/Website-/Speisekartenlinks als externe Links vorhanden | Pro Restaurant kuratierte Reservierungslinks, Bilder, Kueche, Preisgefuehl, Oeffnungszeiten, Bewertung | MVP-kritisch | Teilweise |
| Support-Chat | Gaeste koennen im Bereich Hilfe eine Nachricht mit Kategorie und Dringlichkeit senden; Next-Guest hat einen strukturierten Hilfe-Flow mit Thema, Dringlichkeit, Zuständigkeits-Hinweis und sichtbarem Verlauf; `get_guest_support_events()` liefert nur Supportfaelle zur eigenen Buchung plus sichtbare Morrow-Antworten; Next-Admin zeigt Supportfaelle als eigene Sektion mit Detail-Drawer, Statuswechsel, Historie, interner Notiz und E-Mail-Antwort aus dem Supportfall | Spaeter echte Chat-Realtime-UI und WhatsApp-Templates ergaenzen | MVP-kritisch | Erledigt fuer MVP |
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
| Conversion-Tracking | Zentrale Web-Analytics-Komponente vorhanden; CTA-Klicks und Formular-Submits auf Auszeiten, Anfrage, Eigentuemer, Erlebnispartner und Ratgeber werden ueber `data-conversion` an GA/Meta gemeldet, wenn die Public IDs gesetzt sind und Consent erteilt wurde; `npm run qa:production` prueft Formulare, Consent-Gate und optional Live-Testlead | Events live mit echten GA4-/Meta-Pixel-IDs und Test-Events pruefen | MVP-kritisch | Teilweise |
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
- `apps/owner` ist als geschuetzte Eigentuemer-App gestartet und zeigt MVP-Light Objekttransparenz, freie Zeitraeume, Buchungen, Lueckenmarketing-Light, Vermarktungslogik, offene Objektpunkte, Operationsstatus, Dokumente und Abrechnungsausblick.
- Eigentümer können im Next-Owner-Dashboard strukturierte Rückfragen zu Objekt, Buchung, Eigenbelegung/Verfügbarkeit oder Abrechnung senden; diese landen über `support_messages` im Admin-Supportfluss, sind per RLS auf aktive `owner_profiles` begrenzt und werden als Rückfragen-Historie im Eigentümerbereich angezeigt.
- Admin-Antworten zu Eigentümer-Rückfragen werden aus `communication_events` über `get_owner_communication_events()` gefiltert und im Eigentümerbereich unter dem jeweiligen Anliegen angezeigt; interne Notizen bleiben ausgeblendet.
- Der Eigentuemerzugriff ist strukturell ueber `owner_profiles` und `owner_property_access` vorbereitet und im Next-Admin pflegbar.
- Die Eigentuemer-App liest eigene Objekte, Auszeiten, Termine und Buchungen ueber `get_owner_dashboard()`.
- Eigentümerdokumente sind als eigene Tabelle `owner_documents` normalisiert, werden im Next-Admin pro Unterkunft gepflegt und über `get_owner_dashboard().documents` nur für freigegebene Objektzugriffe sichtbar gemacht.
- Eigentümerabrechnungen sind als eigene Tabelle `owner_statements` normalisiert, werden im Next-Admin pro Unterkunft gepflegt und über `get_owner_dashboard().statements` nur für freigegebene Finanzzugriffe sichtbar gemacht.
- Eigentümer-Operationsmeldungen sind als eigene Tabelle `owner_operations` normalisiert, werden im Next-Admin pro Unterkunft gepflegt und über `get_owner_operations()` nur für freigegebene Operationszugriffe sichtbar gemacht.
- `apps/web`, `apps/admin`, `apps/guest` und `apps/owner` mappen lokale `VITE_SUPABASE_*` Public-Variablen auf `NEXT_PUBLIC_SUPABASE_*`, damit lokale Next-Tests denselben Supabase-Zugang wie der Prototyp nutzen koennen.
- `npm run supabase:verify-owner` prueft die Owner-Tabellen, `get_owner_dashboard()`, `get_owner_operations()`, `get_owner_communication_events()`, `get_owner_support_status_events()` und optional mit `OWNER_EMAIL`/`OWNER_PASSWORD` einen echten freigeschalteten Eigentuemerzugang; mit `OWNER_VERIFY_TEMP_OWNER=1` erzeugt der Test alternativ einen temporaeren Eigentuemerzugang, prueft Login/RPC/Support/Antwortverlauf/Statushistorie/Dokumente/Abrechnungen/Operationsmeldungen und raeumt ihn wieder auf.
- Die Owner-Migrationen bis `202606270009` sind remote in Supabase angewendet; ein temporaerer Owner-E2E-Test mit `Nordlicht Lodge` hat Login, Dashboard-RPC, Supportnachricht, Eigenbelegungs-/Verfügbarkeitsanfrage, automatische Admin-Aufgabe, Rückfragen-Historie, Dokumentensichtbarkeit, Abrechnungen und Operationsmeldungen erfolgreich geprueft.
- `apps/web`, `apps/admin`, `apps/guest` und `apps/owner` besitzen eigene Vercel-Konfigurationen fuer getrennte Next.js-Projekte aus dem Monorepo.
- `apps/web` kann `/admin`, `/deine-auszeit/...`, `/owner` und `/app/eigentuemer` per `MORROW_ADMIN_APP_URL`, `MORROW_GUEST_APP_URL` und `MORROW_OWNER_APP_URL` auf die jeweiligen App-Projekte weiterleiten.
- Alle vier Next-Apps haben einen `/health` Endpunkt zur Deployment- und App-Identitaetspruefung.
- `npm run qa:apps` prueft nach Deployment die App-Welten inklusive `/health` und optionalen Admin-, Owner- und Gaeste-Testzugängen.
- `apps/guest` ist als Next-App gestartet und liest codegeschuetzte Buchungen ueber `get_guest_stay()` sowie den sichtbaren Supportverlauf ueber `get_guest_support_events()`; ein aktiver Supabase-Testdatensatz fuer `Couple Reset` ist live gesetzt und mit `npm run supabase:verify-guest` pruefbar; die tieferen Prototyp-Funktionen muessen schrittweise migriert werden.
- `apps/admin` ist als Next-App gestartet und kann nach Admin-Login operative Supabase-Daten lesen, Anfrage-, Buchungs-, Support- und Aufgabenstatus aktualisieren, Detail-Drawer mit Kommunikationshistorie nutzen, interne Notizen speichern, freie E-Mail-Antworten aus Anfrage/Buchung/Support senden, Monitoringhinweise anzeigen, Eigentuemerprofile/Objektzugriffe vorbereiten, lokale Vor-Ort-Orte/Kandidaten pflegen sowie Auszeiten, Termine und Erlebnisbausteine bearbeiten/neu anlegen und Unterkuenfte inklusive operativer Anreise-/Regel-/Medienfelder, Ausstattung, Objektattributen und Erlebniswelten pflegen.

Naechste technische Prioritaet:

1. Owner-, Admin- und Guest-App als getrennte Vercel-Projekte konfigurieren und mit `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` produktiv testen.
2. Admin-App weiter ausbauen: Kommunikationsvorlagen, echte Medienbibliothek, Detailsektionen und tieferes Monitoring migrieren.
3. Guest-App vertiefen: echte Live-/Amts-Gezeitenquelle, Veranstaltungen, Support-Chat-Antworten und Nach-Aufenthalt-Modus weiter aus dem Prototyp ueberfuehren.
4. Owner-App danach vertiefen: Abrechnungsdatensaetze, Dokumentenablage, Operationshistorie und Eigentuemer-Kommunikation.
   - Stand 2026-06-27: Dokumentenablage V1 ist als `owner_documents` mit Admin-Pflege, Owner-RLS, RPC-Ausgabe und Owner-Anzeige umgesetzt; Build, Typecheck und Lint bestanden.
   - Stand 2026-06-27: Eigentümer-Rückfragen werden im RPC als `messages` zurückgegeben, im Dashboard angezeigt und im temporären Owner-E2E-Test gegen Supabase geprüft.
   - Stand 2026-06-27: Admin-Antworten auf Eigentümer-Rückfragen werden über `get_owner_communication_events()` als sichtbarer Verlauf unter dem jeweiligen Anliegen angezeigt und im temporären Owner-E2E-Test geprüft.
   - Stand 2026-06-27: Statuswechsel an Eigentümer-Rückfragen werden in `support_status_events` protokolliert, über `get_owner_support_status_events()` angezeigt und im temporären Owner-E2E-Test geprüft.
   - Stand 2026-06-27: Eigenbelegungs-/Verfügbarkeitsanfragen aus der Owner-App erzeugen automatisch eine Admin-Aufgabe mit Zeitraum, Objekt- und Eigentümerkontext.
   - Stand 2026-06-27: Abrechnung V1 ist als `owner_statements` mit Admin-Pflege, Owner-RLS, RPC-Ausgabe und Owner-Anzeige umgesetzt.
   - Stand 2026-06-27: Operationshistorie V1 ist als `owner_operations` mit Admin-Pflege, Owner-RLS, RPC-Ausgabe und Owner-Anzeige umgesetzt.
5. Fuer die Next-Guest-App einen aktiven Supabase-Testdatensatz mit gueltigem Access-Code live pflegen.
   - Stand 2026-06-27: Live-Testdatensatz `11111111-1111-4111-8111-111111111111` mit Code `MORROW1` ist gesetzt; `GUEST_VERIFY_SEED=1 npm run supabase:verify-guest` und `GUEST_BASE_URL=http://localhost:4310 npm run supabase:verify-guest` liefen erfolgreich.
   - Stand 2026-06-27: Guest-Supportverlauf ist ueber `get_guest_support_events()` codegeschuetzt sichtbar; der Verifier kann mit `GUEST_VERIFY_SUPPORT_REPLY=1` einen temporären Supportfall plus Morrow-Antwort prüfen.

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

- [ ] Admin-Paritaetsabnahme nach `docs/ADMIN_PARITY_QA_RUNBOOK.md` mit Testlead/Testbuchung dokumentiert.
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

Aktueller Go-/No-Go-Snapshot: `docs/LAUNCH_STATUS_SNAPSHOT_2026-07-01.md`

Weiter mit Production-Rehearsal und Launch-Gates:

`Live-Leadflow, Tracking, Rechtstexte, Secret-Rotation und finale Angebotsdaten fuer den ersten kontrollierten Marktstart absichern`

Definition of Done:

- `docs/ADMIN_PARITY_QA_RUNBOOK.md` ist mit Evidenz durchlaufen; Ergebnis ist fuer echte Leads mindestens gelb und fuer zahlende Gaeste gruen.
- Echte Next-Web Anfrage mit UTM landet live in Supabase, loest Lead-Mail aus und zeigt Quelle/Kampagne im Admin; Basischeck ueber `QA_BASE_URL=https://www.getmorrow.de npm run qa:production`.
- Consent-Tracking wird mit echten GA4-/Meta-IDs getestet und Zielereignisse fuer Anfrage/Submit werden dokumentiert.
- Impressum, Datenschutz, AGB, Buchungs-, Storno- und Zahlungsbedingungen sind mit echten Unternehmens- und Angebotsdaten juristisch final geprueft.
- Supabase Service Role, Resend Key, GitHub PAT und Admin-/Testpasswoerter sind rotiert und nur noch in sicheren Umgebungen hinterlegt.
- Finale Angebotsdaten fuer die erste Auszeit sind geprueft: Unterkunft, Bilderrechte, Termin, Preis, Erlebnis, Restaurant-/Ortsempfehlungen und Supportzustaendigkeit.
