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
| Paket-Builder fuer neue Auszeiten | Admin-Auszeiten existieren, Supabase-Sync vorhanden, Builder fuer Titel, Copy, Termine, Preise, Zielgruppe, Unterkunft, Medien, Erlebnisbausteine, Empfehlungen, Momente, FAQ und Status ist umgesetzt und end-to-end getestet | Builder spaeter mit Medienbibliothek und stärkerer Normalisierung weiter ausbauen | MVP-kritisch | Erledigt fuer MVP |
| Unterkunftsverwaltung | Objektprofile, Agenturen, Check-in-Typ, Support-Typ, Anreise/Abreise, Medien, Bildrechte, Ausstattung, Hausregeln, Schluesselinfos und Objekt-Support sind pflegbar und end-to-end getestet | Medienbibliothek, Alt-Texte und staerkere Normalisierung spaeter ausbauen | MVP-kritisch | Erledigt fuer MVP |
| Medienverwaltung | Bilder liegen als Assets/URLs, keine echte Medienbibliothek | Pro Unterkunft und Auszeit Medien mit Rechten, Alt-Text, Reihenfolge | MVP-kritisch | Offen |
| Erlebnisbausteine | Erlebnisanbieter und Erlebnisbausteine existieren, Supabase-Sync vorhanden; Preis, Kapazitaet, Verfuegbarkeit, Anbieter, Rolle, Bestätigung und Gastnotiz sind im Admin pflegbar und getestet | Spaeter staerker normalisieren und Anbieter-Verfuegbarkeiten separat pflegen | MVP-kritisch | Erledigt fuer MVP |
| Buchungen | Kunden/Buchungen in Supabase, Statuslogik, Gaestebereich-Code getestet | Buchungsstatus, Zahlung, Vorbereitung, Aufgaben und Gaestebereich noch staerker miteinander koppeln | MVP-kritisch | Teilweise |
| Aufgaben automatisch bei Buchungsstatus | Statuswechsel erzeugen deduplizierte Standardaufgaben fuer Reserviert, Bezahlt, Vor Anreise, Aktiv und Abgeschlossen; Vorschau im Buchungs-Drawer und Test mit Testbuchung bestanden | Spaeter je Auszeit-Typ und Saison feinere Templates ergaenzen | MVP-kritisch | Erledigt fuer MVP |
| Audit-Log | Kommunikationshistorie vorhanden, kein vollstaendiger Aenderungsverlauf | Wer hat Status, Buchung, Paket, Unterkunft, Erlebnis geaendert? | MVP-light | Offen |
| Monitoring fehlender Daten | Zentrale Liste fehlender Pflichtdaten pro Auszeit, Buchung, Unterkunft und Erlebnis auf der Admin-Uebersicht vorhanden; direkte Sprungziele in Datensaetze getestet | Spaeter um lokale Orte, Partnerprofile und automatische Eskalation erweitern | MVP-kritisch | Erledigt fuer MVP |

## Block 2: Guest Comfort

Ziel: Nach der Buchung fuehlt sich Morrow wie Komfort an, nicht wie eine lose E-Mail-Kette.

| Thema | Haben Wir | Brauchen Wir | MVP-Klasse | Status |
| --- | --- | --- | --- | --- |
| Gaestebereich | Live-Zugang per Buchungscode getestet, App-artige Struktur vorhanden | Login/Access-Flow finalisieren, Inhalte pro Buchung vollstaendig aus Admin-Daten speisen | MVP-kritisch | Teilweise |
| Anreise, Schluessel, Unterkunftsregeln | Check-in-Daten, Adresse, Regeln, Check-out und Support-Zustaendigkeit sind am Paket/Objekt pflegbar; Buchungsseite im Gaestebereich zeigt die Infos klar aus Admin-Daten | Spaeter buchungsspezifische Sonderhinweise und echte Freigabezeitpunkte pro Buchung ergaenzen | MVP-kritisch | Erledigt fuer MVP |
| Tagesplan / Meine Auszeit | Eigener Bereich im Gaestebereich vorhanden; Ablaufpunkte sind pro Auszeit im Admin pflegbar und erscheinen als kompakte Timeline mit Detail-Drawer | Spaeter buchungsspezifische Abweichungen und echte Tageszeiten pro Buchung ergaenzen | MVP-kritisch | Erledigt fuer MVP |
| Kuratierte Karte | Karte, Filter, Pins, Drawer, Restaurants, Orte, Veranstaltungen vorhanden | Datenqualitaet weiter kuratieren, Kategorien finalisieren, Pin-/Drawer-UX fortlaufend testen | MVP-kritisch | Teilweise |
| Live-Daten | Wetter, Gezeiten, Veranstaltungen integriert | Wetter/Gezeiten stabil beobachten, Quellen/Fehlerzustand sauber anzeigen | MVP-light | Teilweise |
| Restaurant-Reservierungen | Reservierungs-/Website-/Speisekartenlinks als externe Links vorhanden | Pro Restaurant kuratierte Reservierungslinks, Bilder, Kueche, Preisgefuehl, Oeffnungszeiten, Bewertung | MVP-kritisch | Teilweise |
| Support-Chat | Supportnachricht/Supporttask-Grundlage vorhanden | Gaeste koennen im Bereich Nachricht senden; Admin sieht sie als Supportthema | MVP-kritisch | Teilweise |
| Schadens-/Problem-Tickets | Supportkategorien vorhanden | Spezifischer Flow fuer Objektproblem, je nach Support-Typ Morrow/Agentur/Hotel | MVP-kritisch | Teilweise |
| Feedback nach Aufenthalt | Nicht umgesetzt | Feedbackformular oder E-Mail nach Abreise, Wiederbuchungsimpuls | MVP-light | Offen |
| Wiederbuchung | Nicht umgesetzt | Nach Aufenthalt leichte Rueckkehr-CTA, Empfehlung fuer naechste Auszeit | MVP-light | Offen |

## Block 3: Communication

Ziel: Kommunikation ist nachvollziehbar, persoenlich und nicht verteilt ueber private Kanaele.

| Thema | Haben Wir | Brauchen Wir | MVP-Klasse | Status |
| --- | --- | --- | --- | --- |
| E-Mail-Automation | Resend/Supabase Edge Function getestet, Lead-Mails funktionieren | Statusbasierte Mails: Anfrage, Reservierung, Zahlung/Bestaetigung, Vor Anreise, Nach Aufenthalt | MVP-kritisch | Teilweise |
| Kommunikationshistorie | `communication_events` vorhanden, Lead-Drawer hat Historie | E-Mail aus Anfrage/Buchung heraus senden, manuelle Notizen, Supporteintraege konsistent verbinden | MVP-kritisch | Teilweise |
| WhatsApp-Opt-in | Formularabfrage/Opt-in vorhanden | Zustimmung sauber speichern, Texte/Einwilligung rechtlich pruefen, manuelle WhatsApp-Nutzung dokumentieren | MVP-kritisch | Teilweise |
| WhatsApp-Templates | Nicht umgesetzt | V2 oder MVP-light: vorbereitete Textbausteine, noch manuell versenden | MVP-light | Offen |
| Push-Benachrichtigungen | Nicht umgesetzt | Nicht noetig fuer ersten MVP-Start, spaeter PWA/App | V2 | Offen |
| Interne Erinnerungen | Aufgaben/Wiedervorlagen vorhanden | Automatische interne Erinnerungen aus Status/Faelligkeit | MVP-kritisch | Teilweise |

## Block 4: Data And Architecture

Ziel: Supabase ist die fuehrende Datenquelle fuer alles, was operativ relevant ist.

| Thema | Haben Wir | Brauchen Wir | MVP-Klasse | Status |
| --- | --- | --- | --- | --- |
| Supabase als Quelle | Leads, Kunden, Buchungen, Auszeiten, Vor-Ort-Daten, Anbieter, Agenturen, Objekte angebunden | LocalStorage nur noch Demo/Fallback; alle Admin-Mutationen remote bestaetigen | MVP-kritisch | Teilweise |
| Relationale Struktur | Tabellen vorhanden, Payload noch stark genutzt | Buchungen, Kunden, Zahlungen, Pakete, Termine, Anbieter staerker normalisieren | MVP-light | Teilweise |
| Zahlungen | Zahlung manuell ueber Status | Payment-Provider nicht zwingend fuer ersten MVP, aber Zahlungsnachweis/Status muss sauber dokumentiert sein | MVP-light | Offen |
| Automatische Gaestebereich-Freigabe | Status `Bezahlt` schaltet frei, getestet | Freigabe an Zahlungs-/Buchungsstatus koppeln, klare Sperr-/Fehlerzustaende | MVP-kritisch | Teilweise |
| Testdaten | Testdaten markiert und aus KPIs ausgeschlossen | Testfilter optional in Admin | MVP-light | Teilweise |
| Backup/Recovery | Nicht geprueft | Supabase Backup/Export-Prozess dokumentieren | MVP-kritisch | Offen |

## Block 5: Legal And Trust

Ziel: Buchbare Auszeiten duerfen nicht ohne klare Bedingungen live gehen.

| Thema | Haben Wir | Brauchen Wir | MVP-Klasse | Status |
| --- | --- | --- | --- | --- |
| AGB | Nicht final | AGB fuer Anfrage/Buchung/Leistungspartner pruefen lassen | MVP-kritisch | Offen |
| Buchungsbedingungen | Nicht final | Was ist verbindlich, wann entsteht Buchung, was ist enthalten? | MVP-kritisch | Offen |
| Stornobedingungen | Nicht final | Fristen, Kosten, Sonderfaelle | MVP-kritisch | Offen |
| Zahlungsbedingungen | Nicht final | Zahlung wann, wohin, Beleg, Reservierung bis wann | MVP-kritisch | Offen |
| Datenschutz | Vorhanden/zu pruefen | Supabase, Resend, WhatsApp, Tracking, Supportdaten final pruefen | MVP-kritisch | Offen |
| WhatsApp/Marketing-Einwilligung | Technisch teilweise | Rechtstext/Opt-in-Formulierung finalisieren | MVP-kritisch | Offen |
| Bildrechte | Teilweise als Feld vorhanden | Pro Unterkunft/Erlebnis dokumentieren | MVP-kritisch | Teilweise |
| Secret-Rotation | Secrets wurden im Arbeitsverlauf geteilt | Supabase Service Role, PAT, Resend Key, Admin-Passwort rotieren | MVP-kritisch | Offen |

## Block 6: Growth

Ziel: Morrow kann Nachfrage erzeugen und messen, ohne direkt zu ueberautomatisieren.

| Thema | Haben Wir | Brauchen Wir | MVP-Klasse | Status |
| --- | --- | --- | --- | --- |
| Ratgeberbereich | Vorhanden | Systematischer Ausbau mit Keyword-Clustern und interner Verlinkung | MVP-kritisch | Teilweise |
| Keyword-Cluster | Dokument `SEO_GEO_KEYWORD_PLAN.md` vorhanden | SPO/Familienurlaub/Paar-Auszeit/Nordsee priorisieren, Artikelplan pflegen | MVP-kritisch | Teilweise |
| Schema.org | Nicht sicher vollstaendig | Article, FAQ, Breadcrumb, LocalBusiness/Offer wo sinnvoll | MVP-light | Offen |
| Conversion-Tracking | Nicht final geprueft | Anfrage-Submit, CTA-Klick, Paketdetail, Ratgeber-CTA messen | MVP-kritisch | Offen |
| Meta/Google Ads messen | Nicht final | Pixel/Conversions/UTM sauber testen | MVP-kritisch | Offen |
| Landingpages pro Auszeit/Zielgruppe | Paketseiten vorhanden | Kampagnenspezifische Landingpages optional fuer Ads | MVP-light | Teilweise |
| E-Mail-Nurturing | Nicht umgesetzt | Fuer MVP reicht manuelle Nachfassung plus Statusmails | MVP-light | Offen |
| Retargeting | Nicht umgesetzt | Spaeter, nicht vor erstem kontrollierten Start | V2 | Offen |
| Partner-Akquise-System | Admin-Bereiche und Leadformulare vorhanden | Akquise-Pipeline, Quellen, Kontaktstatus, Follow-ups | MVP-light | Teilweise |
| Angebotsseiten fuer Eigentuemer/Erlebnisanbieter | Seiten vorhanden/teilweise | Copy und Conversion weiter schaerfen | MVP-light | Teilweise |

## V2 Nach Dem MVP-Start

Diese Punkte bleiben bewusst nachgelagert:

- Erlebnisanbieter-Login
- Eigentuemer-Login
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

## Empfohlene Umsetzungsreihenfolge

### Sprint 1: Operate stabilisieren

1. Paket-Builder fertigstellen.
   - Stand 2026-06-05: Builder-Oberflaeche erweitert; Build, Smoke-Test und End-to-End-Test mit temporaerer Test-Auszeit bestanden.
2. Unterkunftsverwaltung erweitern: Medien, Rechte, Regeln, Check-in, Ausstattung.
   - Stand 2026-06-05: Objektprofile erweitert; Build, Smoke-Test und End-to-End-Test mit temporaerem Testobjekt bestanden.
3. Erlebnisbausteine erweitern: Anbieter, Preis, Kapazitaet, Verfuegbarkeit.
   - Stand 2026-06-05: Erlebnis-Drawer und Erlebniskarten erweitert; Build, Smoke-Test und Speichern/Ruecksetzen-Test bestanden.
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
4. Feedback nach Aufenthalt ergaenzen.

### Sprint 3: Kommunikation und Recht

1. Statusbasierte E-Mails definieren und umsetzen.
2. Kommunikationszentrale aus Lead/Buchung heraus nutzbar machen.
3. WhatsApp-Opt-in rechtlich und technisch finalisieren.
4. AGB, Buchungs-, Storno-, Zahlungsbedingungen sichtbar einbinden.
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
- [ ] Supportnachricht aus Gaestebereich landet als Admin-Thema.
- [ ] Status-E-Mails fuer Reservierung/Bestaetigung/Vor Anreise getestet.
- [ ] AGB/Buchungsbedingungen/Storno/Zahlung final verlinkt.
- [ ] Datenschutz/WhatsApp/Tracking rechtlich geprueft.
- [ ] Conversion-Tracking fuer Anfrage getestet.
- [ ] Secrets rotiert.

## Naechster Konkreter Schritt

Weiter mit Sprint 2, Punkt 3:

`Support-/Problem-Ticket-Flow finalisieren`

Definition of Done:

- Gaeste koennen aus dem Bereich Hilfe eine Nachricht mit Kategorie, Dringlichkeit und Buchungsbezug senden.
- Objektproblem unterscheidet nach Support-Typ: Morrow, Agentur oder Hotel/Gastgeber.
- Die Nachricht landet als Admin-Supportthema mit Historie an Kunde/Buchung.
- Der Gast sieht eine klare Bestaetigung und naechsten Schritt.
