# Morrow Daily Operations Scenario Audit

Stand: 2026-05-15

Ziel: Pruefen, ob der aktuelle Admin den realen Tagesbetrieb von Morrow abdeckt. Der Fokus liegt nicht auf perfekter Plattform, sondern auf den Situationen, die im Alltag beim Start mit kuratierten Auszeiten wirklich passieren.

## Ampel

- Gruen: im aktuellen System grundsaetzlich abgedeckt
- Gelb: teilweise abgedeckt, aber noch nicht robust genug
- Rot: fuer den Alltag relevant, aktuell noch nicht als eigener Workflow abgedeckt

## Grundstruktur, wie sie jetzt richtig ist

- `Anfragen`: Eingang aller Leads
- `Kunden`: aktive Gastkontakte und Historie
- `Buchungen`: konkrete reservierte, bezahlte oder abgeschlossene Aufenthalte
- `Auszeiten`: kuratierte Angebote mit Zielgruppe, Termin, Unterkunft und Erlebnis
- `Erlebnisse`: Erlebnisbausteine, die Auszeiten zugeordnet werden
- `Eigentümer`: Objekt- und Eigentümerprofile
- `Erlebnisanbieter`: Anbieterprofile

Diese Trennung ist fachlich richtig. Der Admin denkt dadurch nicht mehr nur in Leads, sondern in Beziehungen und Aufenthalten.

## Tagesstart

| Szenario | Erwarteter Ablauf | Aktuell | Bewertung | Luecke |
|---|---|---:|---|---|
| Gruender oeffnet morgens den Admin | Neue Anfragen, offene Pruefungen, faellige Wiedervorlagen und kommende Termine sind sichtbar | Ja | Gruen | Keine kritische Luecke |
| Es gibt viele neue Leads | Schnell erkennen, was zuerst bearbeitet werden muss | Teilweise | Gelb | Prioritaet, Quelle/Kampagne und Zeit seit letzter Aktion fehlen |
| Es gibt viele faellige Wiedervorlagen | Faellige Arbeit ist sichtbar | Ja | Gruen | Noch keine Aufgaben mit Besitzer/Erledigt-Status |
| Ein Aufenthalt startet bald | Kommende Termine werden angezeigt | Teilweise | Gelb | Noch keine echte Vor-Anreise-Checkliste pro Buchung |

## Gastanfrage

| Szenario | Erwarteter Ablauf | Aktuell | Bewertung | Luecke |
|---|---|---:|---|---|
| Neue Gastanfrage kommt rein | Lead landet unter `Anfragen` mit Kontakt, Auszeit, Termin und Nachricht | Ja | Gruen | Keine echte Backend-Persistenz |
| Gast gibt WhatsApp-Zustimmung | Opt-in wird gespeichert | Ja | Gruen | Noch keine Kommunikationshistorie |
| Gast fragt Family Escape an | Anfrage ist eindeutig der Auszeit zugeordnet | Ja | Gruen | Keine Quelle/Kampagne |
| Gast fragt Couple Reset an | Anfrage ist eindeutig der Auszeit zugeordnet | Ja | Gruen | Keine Quelle/Kampagne |
| Gast hat Hund | Info wird erfasst | Ja | Gruen | Noch keine automatische Passungswarnung je Unterkunft |
| Familie gibt Kinder/Personen an | Info wird erfasst | Ja | Gruen | Keine Kapazitaetsvalidierung gegen Unterkunft |
| Gast fragt einen nicht passenden Termin an | Status/Notiz kann gesetzt werden | Teilweise | Gelb | Kein eigener Grund `Termin nicht verfuegbar` |
| Gast ist unklar/hat Rueckfragen | Notiz und Wiedervorlage moeglich | Ja | Gruen | Keine Kommunikationshistorie |
| Gast hat kein Interesse mehr | Status `Kein Interesse` und Archiv moeglich | Ja | Gruen | Kein Grundfeld fuer Verlustgrund |

## Qualifizierung Und Rueckmeldung

| Szenario | Erwarteter Ablauf | Aktuell | Bewertung | Luecke |
|---|---|---:|---|---|
| Morrow prueft Anfrage | Status auf `In Pruefung`, Notiz, Wiedervorlage | Ja | Gruen | Keine separate interne Aufgabe |
| Morrow ruft Gast an | Kontaktinfos klickbar | Ja | Gruen | Kein Feld `letzte Kontaktaufnahme` |
| Morrow sendet E-Mail | Mailto-Link vorhanden | Teilweise | Gelb | Keine E-Mail-Vorlagen, kein Versand, keine Historie |
| Morrow nutzt WhatsApp | Nur bei Opt-in sichtbar | Teilweise | Gelb | Kein WhatsApp-Aktionsbutton/Template |
| Morrow macht Angebot | Status kann gesetzt werden | Teilweise | Gelb | Status `Angebot gesendet` fehlt |
| Gast braucht Bedenkzeit | Wiedervorlage moeglich | Ja | Gruen | Keine Aufgabe mit Prioritaet |

## Reservierung

| Szenario | Erwarteter Ablauf | Aktuell | Bewertung | Luecke |
|---|---|---:|---|---|
| Unterkunft muss bei Agentur/Eigentümer blockiert werden | Aus Anfrage entsteht Reservierungsprozess | Teilweise | Gelb | Reservierung ist nur Status, kein eigenes Objekt |
| Erlebnis muss angefragt werden | Erlebnisbaustein hat Bestaetigungsstatus | Teilweise | Gelb | Keine Aufgabe pro Anbieter und Termin |
| Termin wird gehalten | Status `Reserviert` erzeugt Buchungsliste | Ja | Gruen | Keine Ablaufzeit fuer Reservierung |
| Reservierung laeuft ab | Admin muss warnen | Nein | Rot | Reservierungsfrist fehlt |
| Unterkunft nicht verfuegbar | Alternative oder Absage dokumentieren | Teilweise | Gelb | Kein strukturierter Ablehnungs-/Alternativflow |
| Erlebnis nicht verfuegbar | Ersatzbaustein pruefen | Teilweise | Gelb | Keine Ersatzlogik |

## Buchung Und Zahlung

| Szenario | Erwarteter Ablauf | Aktuell | Bewertung | Luecke |
|---|---|---:|---|---|
| Gast sagt verbindlich zu | Buchung erscheint unter `Buchungen` | Ja, ueber Status | Gruen | Noch kein eigener Buchungsdatensatz |
| Zahlung offen | Buchung zeigt Zahlung offen | Ja | Gruen | Kein Betrag, Faelligkeit, Zahlungslink |
| Zahlung bezahlt | Buchung zeigt bezahlt | Ja | Gruen | Kein Zahlungsdatum, keine Rechnung |
| Buchung wird storniert | Statusfluss braucht Storno | Nein | Rot | Status `Storniert` fehlt in Buchungslogik |
| Gast will umbuchen | Neue Termin-/Auszeitlogik noetig | Nein | Rot | Umbuchungsflow fehlt |
| Gast aendert Personen/Hund | Details sollten in Buchung editierbar sein | Teilweise | Gelb | Kein Buchungsdetail-Drawer |

## Vor Anreise

| Szenario | Erwarteter Ablauf | Aktuell | Bewertung | Luecke |
|---|---|---:|---|---|
| Check-in-Infos muessen vorbereitet werden | Objekt hat Schluesselart und spaeteste Anreise | Teilweise | Gelb | Infos nicht mit Buchung verknuepft und nicht freigebbar |
| Safe-Code muss gespeichert werden | Objektfeld existiert konzeptionell, aktuell nicht voll operativ | Teilweise | Gelb | Kein sensibler Zugriffsschutz, kein Codefeld im sichtbaren Adminflow |
| Gast soll Anreiseinfos erhalten | Spaeter Guest-Login/Companion | Nein | Rot | Keine Freigabe-/Sendelogik |
| Erlebnisdetails werden bestaetigt | Erlebnisstatus sichtbar | Teilweise | Gelb | Kein Termin-/Teilnehmerbezug |
| Restaurant/Empfehlungen vorbereiten | Empfehlungen existieren in Auszeit-Inhalten | Teilweise | Gelb | Keine operative Empfehlungs-/Reservierungsaufgabe |
| Wetter/Alternativen pruefen | Teil des Konzepts | Nein | Rot | Kein Wetter-/Plan-B-Workflow |

## Aufenthalt Aktiv

| Szenario | Erwarteter Ablauf | Aktuell | Bewertung | Luecke |
|---|---|---:|---|---|
| Gast hat Frage vor Ort | Supportkontakt / spaeter Chat | Nein | Rot | Kein Support-/Ticketbereich |
| Etwas in der Unterkunft ist kaputt | Ticket erstellen und an Agentur/Eigentümer weiterleiten | Nein | Rot | Ticket- und Eskalationssystem fehlt |
| Erlebnis faellt wegen Wetter aus | Ersatz oder Kommunikation | Nein | Rot | Kein Incident-/Alternative-Workflow |
| Gast kommt spaet an | Anreiseinfo und Kontaktperson sichtbar | Teilweise | Gelb | Noch nicht pro Buchung steuerbar |
| Morrow muss Partner informieren | Interne Aufgabe/Kommunikation | Nein | Rot | Kein Partner-Kommunikationslog |

## Nach Aufenthalt

| Szenario | Erwarteter Ablauf | Aktuell | Bewertung | Luecke |
|---|---|---:|---|---|
| Aufenthalt abschliessen | Status `Abgeschlossen` moeglich | Ja | Gruen | Keine Abschlusscheckliste |
| Feedback einholen | E-Mail/WhatsApp nach Zustimmung | Nein | Rot | Kein Feedbackflow |
| Bewertung/Testimonial anfragen | Fuer Website spaeter wichtig | Nein | Rot | Kein Consent- und Testimonial-Modul |
| Wiederkehrende Gaeste erkennen | Kundenseite zeigt Historie | Teilweise | Gelb | Keine echte Buchungshistorie je Kunde |
| Probleme intern auswerten | Notiz moeglich | Teilweise | Gelb | Kein Incident-Log, keine Tags |

## Auszeiten Pflege

| Szenario | Erwarteter Ablauf | Aktuell | Bewertung | Luecke |
|---|---|---:|---|---|
| Neue Auszeit anlegen | Admin kann neue Auszeit aus Vorlage erstellen | Ja | Gruen | Noch nicht als vollstaendiger CMS-Editor |
| Auszeit duplizieren | Moeglich | Ja | Gruen | Keine Launch-Checkliste |
| Auszeit pausieren | Moeglich | Ja | Gruen | Keine Regel: was passiert mit offenen Anfragen |
| Termine aendern | Aktuell im Drawer teilweise pflegbar | Teilweise | Gelb | Termine sind noch keine eigenen Datensaetze |
| Preis aendern | Teilweise bearbeitbar | Teilweise | Gelb | Keine Preisversionierung |
| Unterkunft wechseln | Zuordnung konzeptionell da | Teilweise | Gelb | Kein Verfuegbarkeits-/Rechtecheck |
| Mehrere Erlebnisse pro Auszeit | Datenmodell vorhanden | Ja | Gruen | Keine Kapazitaet je Erlebnis |
| Auszeit darf erst live gehen, wenn alles passt | Nein | Rot | Launch-Checkliste fehlt |

## Eigentümer Und Unterkuenfte

| Szenario | Erwarteter Ablauf | Aktuell | Bewertung | Luecke |
|---|---|---:|---|---|
| Eigentümer meldet Immobilie | Lead landet in `Anfragen` | Ja | Gruen | Kein direkter Konvertieren-Button zu Objektprofil |
| Objektprofil anlegen | Moeglich | Ja | Gruen | Kein Bild-/Rechtecheck als Pflichtfeld |
| Objekt einer Auszeit zuordnen | Sichtbar ueber Auszeiten/Objektprofile | Ja | Gruen | Keine echte Belegungs-/Verfuegbarkeitsverwaltung |
| Schluesseluebergabe erfassen | Feld vorhanden | Teilweise | Gelb | Noch nicht in Buchung/Gastinfo integriert |
| Spaeteste Anreise erfassen | Feld vorhanden | Ja | Gruen | Noch nicht pro Termin/Buchung freigebbar |
| Agentur als Startpartner verwalten | Konzeptionell relevant | Nein | Rot | Agenturkontakte fehlen als eigener Datentyp |
| Eigentuemer direkt betreuen | Spaetere Phase | Teilweise | Gelb | Keine Eigentümerabrechnung, kein Portal |

## Erlebnisanbieter

| Szenario | Erwarteter Ablauf | Aktuell | Bewertung | Luecke |
|---|---|---:|---|---|
| Anbieter meldet sich | Lead landet in `Anfragen` | Ja | Gruen | Kein Konvertieren-Button zu Anbieterprofil |
| Anbieterprofil anlegen | Moeglich | Ja | Gruen | Konditionen/Kapazitaeten fehlen |
| Anbieter mit Erlebnis verbinden | Moeglich | Ja | Gruen | Noch keine Terminverfuegbarkeit |
| Erlebnis fuer Familie/Paar bewerten | Zielgruppenfit vorhanden | Teilweise | Gelb | Keine Qualitaetsbewertung |
| Erlebnis wetterabhaengig | Konzeptionell wichtig | Nein | Rot | Feld/Workflow fehlt |
| Anbieter pausieren | Moeglich | Ja | Gruen | Keine Warnung fuer betroffene Auszeiten |

## Daten, Reporting Und Wachstum

| Szenario | Erwarteter Ablauf | Aktuell | Bewertung | Luecke |
|---|---|---:|---|---|
| Welche Ads bringen Anfragen? | Quelle/Kampagne messen | Nein | Rot | Leadquelle, UTM, Kampagne fehlen |
| Welche Auszeit konvertiert besser? | Leads/Buchungen je Auszeit auswerten | Teilweise | Gelb | Keine Conversion-Metrik |
| Wie viele echte Buchungen? | Buchungen sichtbar | Teilweise | Gelb | Kein Umsatz, keine Abschlussrate |
| Warum verlieren wir Leads? | Verlustgruende speichern | Nein | Rot | Grundfeld fehlt |
| Welche Termine sind knapp? | Terminbestand pruefen | Teilweise | Gelb | Keine Kapazitaets-/Verfuegbarkeitslogik |
| Daten exportieren | Spaeter vorgesehen | Nein | Rot | Export fehlt |

## Fazit

Der aktuelle Admin deckt den Phase-1-Einstieg solide ab:
- neue Anfragen sehen
- Leads bearbeiten
- Status, Notizen und Wiedervorlagen pflegen
- aktive Kunden aus Gastanfragen erkennen
- reservierte und bezahlte Aufenthalte sehen
- Auszeiten, Erlebnisse, Objekte und Anbieter als zentrale Plattformobjekte verwalten

Die groesste Luecke ist nicht mehr die Navigation, sondern der operative Uebergang:

`Anfrage -> Reservierung -> Buchung -> Vor Anreise -> Aufenthalt -> Nachbereitung`

Aktuell wird dieser Uebergang noch zu stark ueber einen einfachen Leadstatus abgebildet. Fuer den Alltag braucht Morrow als naechstes ein echtes Buchungs-/Operations-Detail.

## Naechste Prioritaeten

### Prioritaet 1: Buchungsdetail-Drawer

Warum: Sobald echte Buchungen entstehen, wird hier der Tagesbetrieb gefuehrt.

Felder:
- Buchungsnummer
- Kunde
- Auszeit
- Termin
- Unterkunft
- Erlebnisbausteine
- Status: Reserviert, Bezahlt, Vor Anreise, Aktiv, Abgeschlossen, Storniert
- Zahlungsstatus
- Zahlungsfrist
- Reservierungsfrist
- Personen
- Hund
- interne Notiz
- naechste Aufgabe
- Check-in-Status
- Erlebnisstatus

Status: Next-Admin-Erweiterung am 2026-06-27:
Der Buchungsdetail-Drawer speichert jetzt Reservierungsfrist, Zahlungsfrist, Personen, Kinderalter, Hund, Check-in-Status, Erlebnisstatus und nächste Aufgabe im Booking-Payload und protokolliert die Änderung im Audit-Log.

### Prioritaet 2: Aufgabenmodul Light

Warum: Wiedervorlagen reichen fuer Leads, aber nicht fuer Operations.

Status: Grundversion umgesetzt am 2026-05-15.

Felder:
- Aufgabe
- Bezug: Anfrage, Buchung, Auszeit, Objekt, Erlebnis, Anbieter
- Faelligkeit
- Status: offen, erledigt
- Prioritaet
- Verantwortlich spaeter

### Prioritaet 3: Reservierungsstatus trennen

Warum: `Reserviert` ist nicht dasselbe wie `Buchung bezahlt`.

Noetige Status:
- Anfrage
- In Klaerung
- Reservierung angefragt
- Angebot gesendet
- Reserviert
- Zahlung offen
- Bezahlt
- Vor Anreise
- Aktiv
- Abgeschlossen
- Storniert

### Prioritaet 4: Agenturkontakte ergaenzen

Warum: Phase 1 arbeitet mit Ferienagenturen. Diese sind weder Eigentümer noch normale Erlebnisanbieter.

Status: Grundversion umgesetzt am 2026-05-15.

Datentyp:
- Agentur
- Ansprechpartner
- E-Mail
- Telefon
- betreute Objekte
- freie Termine
- Rueckmeldefristen
- Notizen

### Prioritaet 5: Leadquelle und Verlustgrund

Warum: MVP validiert Nachfrage. Ohne Quelle und Verlustgrund lernen wir zu wenig.

Felder:
- Leadquelle
- Kampagne/UTM
- Verlustgrund
- Conversion-Notiz

Status:
- Umgesetzt in `Anfragen`: Leadquelle, Kampagne/Kontext, Verlustgrund und Conversion-Notiz sind im Lead-Drawer pflegbar.
- Öffentliche Formulare übernehmen `utm_source`, `source`, `utm_campaign` und `campaign` automatisch in den Lead.
- Die Anfragen-Übersicht zeigt erste MVP-Lernwerte: Top-Quelle, Gast-zu-Buchung und häufigster Verlustgrund.

Regel:
- Verlustgründe werden nicht öffentlich kommuniziert. Sie sind reine interne Lernfelder für Ads, Copy, Angebot und Follow-up.
