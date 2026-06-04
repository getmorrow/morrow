# Morrow Admin CRM Structure

Ziel: Der Admin ist zuerst ein kleines CRM und Operations-Werkzeug, kein Website-Hero und kein vollständiges CMS.

## Leitprinzip

Die Admin-Startseite beantwortet nur:
- Was ist neu?
- Was muss geprüft werden?
- Welche Auszeiten sind live?
- Welcher Termin kommt als nächstes?

Detailarbeit passiert in eigenen Bereichen.

## Bereiche

### Übersicht

Daily Doing:
- neue Anfragen sehen
- offene Prüfungen erkennen
- nächsten Termin sehen
- aktive Auszeiten prüfen
- kompakte Arbeitsliste für fällige Punkte öffnen

Daten vorhanden:
- Leads mit Typ, Status, Kontakt, Bezug, erstellt am
- Auszeiten mit Preis, Termin, Unterkunft, Status
- Aufgaben mit Fälligkeit und Bezug
- Buchungen mit operativ offenen Punkten
- Kunden aus Gastanfragen

Daten fehlen später:
- Next Action pro Lead
- Verantwortliche Person
- Aufgaben und Fälligkeiten
- Kommunikationsverlauf

Aktueller Stand:
- Die Übersicht zeigt Tageskennzahlen, kommende Termine, Betriebsstatus und eine deduplizierte Arbeitsliste.
- Detailarbeit bleibt bewusst in den Bereichen Anfragen, Aufgaben, Kunden, Buchungen und Auszeiten.

### Aufgaben

Daily Doing:
- operative nächste Schritte sehen
- Aufgaben nach Status, Bezug und Priorität filtern
- fällige, überfällige und kommende Aufgaben unterscheiden
- direkt in den verbundenen Datensatz springen

Daten vorhanden:
- Titel
- Bezug zu Anfrage, Buchung, Auszeit oder Partnerbereich
- Fälligkeitsdatum
- Priorität
- Status offen/erledigt
- Notiz
- direkte Erstellung im Aufgabenbereich
- Sprung in verbundene Datensätze

Daten fehlen später:
- Verantwortliche Person
- Kommentare pro Aufgabe
- Aktivitätsverlauf
- automatische Aufgabenregeln

Aktueller Stand:
- Aufgaben zeigen Timing wie `überfällig`, `heute`, `demnächst` oder `erledigt`.
- Aufgaben können ihren Bezug öffnen, z. B. die passende Buchung.
- Aufgaben können direkt angelegt, erledigt, wieder geöffnet und gelöscht werden.

### Kunden

Daily Doing:
- Gastkontakte aus Anfragen wiederfinden
- sehen, ob ein Kontakt noch Anfrage, Reservierung oder Buchung ist
- Anfragehistorie und Buchungshistorie an einem Ort prüfen
- Kontakt direkt per E-Mail oder Telefon aufnehmen

Daten vorhanden:
- Kundensatz entsteht automatisch aus Gastanfragen
- Kontaktinfos
- Zielgruppe Familie oder Paar
- WhatsApp-Zustimmung
- Anfragehistorie
- verknüpfte Buchungen

Daten fehlen später:
- manuell angelegte Kunden ohne Anfrage
- Kommunikationsverlauf
- Präferenzen des Gastes
- wiederkehrende Gäste
- Rechnungs- und Zahlungsdetails

Aktueller Stand:
- Kunden werden aus Gastanfragen gebildet und nach operativer Relevanz sortiert.
- Kunden-Cards zeigen Kundenstatus, nächsten Schritt, letzte Auszeit, Quelle und Kontaktlinks.
- Filter trennen Anfragephase, gebuchte Kunden und heute fällige Kontakte.
- Der Kundendrawer bündelt Kontakt, Anfragehistorie und verbundene Buchungen.

### Buchungen

Daily Doing:
- reservierte und bezahlte Aufenthalte operativ steuern
- Zahlung, Check-in, Erlebnis und nächste Aufgabe prüfen
- Unterkunfts- und Schlüsselinfos für den Aufenthalt sehen
- Aufgaben direkt an der Buchung anlegen

Daten vorhanden:
- Buchung entsteht aus Gastanfrage mit Status `Reserviert`, `Bezahlt`, `Vor Anreise`, `Aktiv`, `Abgeschlossen` oder `Storniert`
- Status und Zahlung
- Termin, Personen, Hund
- Unterkunft, Schlüsselübergabe, späteste Anreise
- Erlebnisstatus
- Aufgaben an der Buchung
- operative Signale pro Buchung: Zahlung offen, Check-in offen, Erlebnis klären, heute fällig
- Arbeitsstatus pro Buchung, damit dringende Fälle schneller erkennbar sind
- persönlicher Gästebereich wird ab Status `Bezahlt`, `Vor Anreise`, `Aktiv` oder `Abgeschlossen` freigeschaltet
- Gästebereich-Link und Zugangscode sind in Buchungsliste/Drawer sichtbar

Daten fehlen später:
- echte Buchungsnummern
- Zahlungsanbieter
- Rechnungen
- Dokumente und erweiterte Gästeinformationen
- automatisierte Pre-Arrival-Kommunikation

Aktueller Stand:
- Bezahlte Buchungen können den Bereich `Deine Auszeit` öffnen.
- Gäste sehen dort Termin, Unterkunft, Check-in, Erlebnis, lokale Empfehlungen, WhatsApp-Freigabe und einen Supportkontakt.
- Reservierte Buchungen bleiben noch gesperrt, bis Buchung/Zahlung verbindlich sind.

### Anfragen

Daily Doing:
- neue Leads qualifizieren
- Status ändern
- Kontakt aufnehmen
- Anfrage Richtung Reservierung/Buchung bewegen
- fällige Wiedervorlagen erkennen

Daten vorhanden:
- Gast-, Eigentümer- und Erlebnispartner-Leads
- Status
- Kontaktinfos
- Bezug zur Auszeit oder zum Partnerangebot
- nächster Schritt aus Status und Wiedervorlage
- Filter nach Arbeitsstand

Daten fehlen später:
- Leadquelle
- letzte Kontaktaufnahme
- nächste Aufgabe
- Aufgaben und Fälligkeiten
- Kommunikationsverlauf
- Priorität

Aktueller Stand:
- Anfragen zeigen neben Kontakt und Bezug auch den nächsten operativen Schritt.
- Fällige Wiedervorlagen werden hervorgehoben und zuerst angezeigt.
- Die Ansicht kann nach aktiv/archiviert, Typ, Status und Arbeitsstand gefiltert werden.

### Auszeiten

Daily Doing:
- Live-Auszeiten prüfen
- Termine und Preise überblicken
- Unterkunfts- und Erlebnisverknüpfung kontrollieren
- Status verwalten

Daten vorhanden:
- Name, Zielgruppe, Ort
- Preis, Termine
- verknüpfte Unterkunft
- Erlebnisbausteine
- Status
- Objektverbindung aus dem internen Objektbestand
- Anbieterzuordnung pro Erlebnisbaustein
- Unterkunftsdetails für operative Vorbereitung

Daten fehlen später:
- Terminslots als eigene Datensätze
- Verfügbarkeitsstatus pro Termin
- Launch-Checkliste
- interne Notizen

Aktueller Stand:
- Auszeiten können im Admin bearbeitet werden.
- Erlebnisbausteine können hinzugefügt, entfernt und mit Erlebnisanbieterprofilen verbunden werden.
- Unterkunft, Preis, Termine, Leistungen und Check-in-Basisdaten sind pflegbar.

### Erlebnisse

Daily Doing:
- verfügbare Erlebnisbausteine sehen
- prüfen, welche Erlebnisse in einer Auszeit enthalten sind
- optionale Erlebnisse und Empfehlungen unterscheiden
- offene Partnerzuordnung erkennen

Daten vorhanden:
- Erlebnisname
- zugeordnete Auszeit
- Zielgruppe über die Auszeit
- Rolle: enthalten, optional, Empfehlung, geplant
- Preislogik: enthalten oder nicht enthalten
- Bestätigungsstatus
- optionale Provider-Felder
- Anbieterfilter
- direkte Verbindung zum Erlebnisanbieterprofil

Daten fehlen später:
- eigenes Erlebnisprofil
- konkreter Erlebnispartner
- Kapazität, Dauer und Saison
- Wetterabhängigkeit
- Konditionen und Verfügbarkeit
- interne Qualitätsbewertung

Aktueller Stand:
- Erlebnisbausteine können aus der Erlebnisse-Ansicht heraus mit Anbieterprofilen verbunden werden.
- Anbieterprofile zeigen ihre verknüpften Erlebnisbausteine und können direkt zurück in den Baustein springen.
- Offene Bausteine ohne Anbieter sind in den Kennzahlen sichtbar.

### Eigentümer

Daily Doing:
- direkte Eigentümer- und Objektbeziehungen pflegen
- Objektpotenzial einschätzen
- Bild-/Textrechte, Schlüsselübergabe und Anreiseinformationen sichern
- verbundene Auszeiten prüfen

Daten vorhanden:
- Objektprofile
- Kontaktinfos
- Objektort
- Objekttyp
- Schlafplätze
- aktuelle Vermietungssituation
- Statusfilter
- Schlüsselübergabe und späteste Anreise
- verknüpfte Agentur, falls das Objekt in Phase 1 über eine Agentur kommt
- verknüpfte Auszeiten mit direktem Sprung in den Auszeit-Drawer

Daten fehlen später:
- Rechte an Bildern und Texten
- Verfügbarkeiten und Konditionen
- Eigentümervertrag
- Provisionsmodell
- Dokumente und Übergabeprotokolle

Aktueller Stand:
- Eigentümerprofile sind keine Eingangsliste für Leads mehr. Eingehende Eigentümeranfragen bleiben zentral unter `Anfragen`.
- Objektprofile zeigen, ob aktuell eine Agentur beteiligt ist.
- Aus dem Objektprofil kann direkt die verbundene Auszeit geöffnet werden.

### Agenturen

Daily Doing:
- Phase-1-Agenturkontakte pflegen
- freie Termine, Objektzugang und Rückmeldefristen prüfen
- betreute Objekte mit Agenturprofilen verbinden
- aus der Agentur direkt in das passende Objekt springen

Daten vorhanden:
- Agenturprofil mit Ansprechpartner, E-Mail, Telefon und Ort
- Statusfilter für alle, aktiv, Lead und pausiert
- Rückmeldefrist in Tagen
- Verfügbarkeitsnotiz
- betreute Objekte als Checkbox-Verknüpfung
- direkter Sprung vom Agenturprofil ins Objektprofil

Daten fehlen später:
- automatische Aufgaben aus Rückmeldefristen
- konkrete Freigaben pro Objekt und Termin
- Agenturvertrag oder Kooperationsnotizen als Dokumente
- Kommunikationshistorie pro Agentur

### Erlebnisanbieter

Daily Doing:
- Erlebnisanbieteranfragen prüfen
- Passung zu Familie, Paar oder beiden Zielgruppen bewerten
- Verfügbarkeit, Kapazität und Wetterabhängigkeit klären
- mögliche Erlebnisbausteine für Auszeiten vorbereiten

Daten vorhanden:
- Erlebnisanbieter-Leads
- Kontaktinfos
- Unternehmens- oder Angebotsname
- Ort
- Statusfilter
- verknüpfte Erlebnisbausteine
- Sprung vom Anbieterprofil in den verbundenen Erlebnisbaustein
- Art des Erlebnisses
- Zielgruppenfit

Daten fehlen später:
- Anbieterprofil
- konkrete Erlebnisse je Anbieter
- Dauer, Saison und Wetterabhängigkeit
- Kapazität und Mindestteilnehmer
- Konditionen und Abrechnung
- interne Qualitätsbewertung
- Zuordnung zu Erlebnisbausteinen und Auszeiten
