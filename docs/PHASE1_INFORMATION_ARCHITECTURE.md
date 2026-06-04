# Morrow Phase 1 Information Architecture

Zentrale Orientierung:
- `docs/MORROW_MASTER_FRAME.md`
- `docs/BRAND_ASSET_REGISTRY.md`

Status: Phase-1-Sitemap bestaetigt.

## Leitprinzip

Phase 1 soll Morrow als kuratierte Plattform verstaendlich machen, aber klein genug bleiben, um schnell Nachfrage zu testen.

Mobile-first:
- Alle Seiten werden zuerst fuer Mobile gedacht.
- Der meiste Traffic wird mobil erwartet.
- Formulare und CTAs muessen auf kleinen Screens besonders einfach sein.

Startlogik:
- Ort: Sankt Peter-Ording
- Pakete: `Family Escape` und `Couple Reset`
- Gaeste zuerst
- Eigentuemer sekundaer sichtbar
- Ratgeber fuer SEO/GEO
- Login erst nach Anfrage/Buchung

## Sitemap

Final fuer Phase 1:
- `/`
- `/pakete/family-escape`
- `/pakete/couple-reset`
- `/ratgeber`
- `/ratgeber/[artikel]`
- `/eigentuemer`
- `/partner/erlebnisanbieter`
- internes Admin/Leadbereich

Nicht Phase 1:
- `/pakete`
- `/sankt-peter-ording`
- Login/Portal
- App
- Kalender
- Direktbuchung

### `/`

Name: Plattform-Startseite

Zweck:
- Morrow in wenigen Sekunden verstaendlich machen.
- Ort + Pakete direkt zeigen.
- Gaeste zu Paketwahl und Anfrage fuehren.
- Eigentuemer sekundaer ansprechen.

First Screen:
- Headline: `Kuratierte Auszeiten in Sankt Peter-Ording.`
- Subline: `Morrow verbindet ausgewaehlte Unterkuenfte, lokale Erlebnisse und persoenliche Betreuung zu Urlaubspaketen fuer Familien und Paare.`
- Direkte Paket-Einstiege:
  - `Family Escape`
  - `Couple Reset`
- CTA: `Auszeit planen`

Sections:
- Hero mit Ort + zwei Paketkarten
- Warum Morrow: Unterkunft + Erlebnis + Betreuung
- Pakete in Sankt Peter-Ording
- Empfehlungen / lokaler Kurationsansatz
- Ratgeber-Teaser
- Eigentuemer-Teaser

Primary CTA:
- `Auszeit planen`

Secondary CTA:
- `Immobilie vorstellen`

Nicht auf die Startseite:
- Login
- interne Datenbank
- Agenten-/Workflow-Inhalte
- komplexes Dashboard
- Phase-1-/MVP-Sprache im sichtbaren UI
- eigener Sankt-Peter-Ording-Menuepunkt

### `/pakete`

Status Phase 1: nicht bauen.

Begruendung:
- Die Startseite zeigt bereits die zwei Pakete.
- Bei nur zwei Paketen waere eine eigene Uebersicht redundant.
- Die Detailseiten sind fuer Ads, SEO/GEO und Conversion wichtiger.

Spaeter sinnvoll, wenn:
- mehr Pakete existieren
- mehrere Orte existieren
- Filter oder Vergleichslogik gebraucht werden

### `/pakete/family-escape`

Name: Family Escape Paketdetail / Landingpage

Zweck:
- Familienpaket verkaufen bzw. Anfrage ausloesen.
- Konkretes Objekt, Zeitraum, Erlebnis und Empfehlungen zeigen.

Inhalte:
- Zielgruppe: Familien
- konkretes Objekt mit Fotos und Beschreibung
- maximale Personenanzahl nach Objekt
- konkrete Termine
- konkreter Preis
- enthaltenes Erlebnis
- Empfehlungen vor Ort fuer Familien
- persoenliche Betreuung
- Anfrageformular

Formular:
- Paket wird automatisch aus der Seite gespeichert, nicht abgefragt.
- Name
- E-Mail
- Telefonnummer
- gewuenschter Termin als Auswahl aus festen Paket-Terminen
- Personenanzahl
- optional: Alter der Kinder
- optional: Hund dabei?
- optional: Zustimmung zu WhatsApp-Kontakt fuer wichtige Nachrichten
- Nachricht / besondere Wuensche
- kein Kalender in Phase 1
- Mobile: Formular oeffnet per CTA als Bottom Drawer
- Desktop: Formular als eingebettetes Anfrage-Modul / Scrollziel

CTA:
- `Auszeit planen`
- Formular-Button spaeter ggf. `Anfrage senden`

### `/pakete/couple-reset`

Name: Couple Reset Paketdetail / Landingpage

Zweck:
- Paarpaket verkaufen bzw. Anfrage ausloesen.
- Emotionale Auszeit und Zweisamkeit klar machen.

Inhalte:
- Zielgruppe: Paare ab 28/30
- konkretes Objekt mit Fotos und Beschreibung
- immer fuer 2 Personen
- ggf. Hund optional, wenn Objekt geeignet
- konkrete Termine
- konkreter Preis
- enthaltenes Erlebnis
- Empfehlungen vor Ort fuer Paare
- Anlass-Ansprache: Geburtstag, Jahrestag, spontane Auszeit
- Anfrageformular

Formular:
- Paket wird automatisch aus der Seite gespeichert, nicht abgefragt.
- Name
- E-Mail
- Telefonnummer
- gewuenschter Termin als Auswahl aus festen Paket-Terminen
- optional: Hund dabei?
- optional: Anlass als Select
  - Jahrestag
  - Geburtstag
  - Einfach raus aus dem Alltag
  - Ueberraschung
  - Anderer Anlass
- optional: Zustimmung zu WhatsApp-Kontakt fuer wichtige Nachrichten
- Nachricht / besondere Wuensche
- kein Kalender in Phase 1
- Mobile: Formular oeffnet per CTA als Bottom Drawer
- Desktop: Formular als eingebettetes Anfrage-Modul / Scrollziel

CTA:
- `Auszeit planen`
- Formular-Button spaeter ggf. `Anfrage senden`

### `/sankt-peter-ording`

Name: Ortsseite

Status Phase 1: nicht bauen.

Zweck:
- Lokalen Kontext und Vertrauen schaffen.
- Morrow als kuratierter Anbieter fuer SPO positionieren.
- Pakete und Ratgeber verbinden.

Inhalte:
- Warum Sankt Peter-Ording
- fuer Familien
- fuer Paare
- lokale Erlebnisse
- passende Pakete
- Ratgeberartikel zu SPO

CTA:
- `Pakete ansehen`
- `Auszeit planen`

Phase-1-Entscheidung:
- SPO-Kontext erscheint zuerst auf Startseite, Paketdetailseiten und Ratgeberartikeln.
- Eine eigene Ortsseite wird erst sinnvoll, wenn genug Substanz vorhanden ist: mehrere Artikel, echte Paketdaten, Empfehlungen und lokale Inhalte.
- Spaeter wird `/sankt-peter-ording` als Ortshub fuer Pakete, Empfehlungen und Ratgeber gebaut.

### `/ratgeber`

Name: Ratgeber-Uebersicht

Zweck:
- SEO/GEO-Traffic aufbauen.
- Morrow als lokaler Kurator positionieren.

Inhalte:
- Artikelkategorien:
  - Familienurlaub in SPO
  - Paarzeit an der Nordsee
  - Erlebnisse in SPO
  - Unterkunft & Planung
  - Essen & Empfehlungen
- Teaser zu ersten Artikeln

Startartikel Phase 1:
1. `Sankt Peter-Ording mit Kindern: entspannte Ideen fuer Familien`
   - Paketbezug: `Family Escape`
   - Intention: Familien suchen konkrete Planungshilfe.
   - Themen: Strand, Watt, Reiten, Schlechtwetter, Essen mit Kindern, Unterkunftslage.

2. `Auszeit zu zweit in Sankt Peter-Ording: ruhige Orte und besondere Erlebnisse`
   - Paketbezug: `Couple Reset`
   - Intention: Paare suchen Anlass, Inspiration und Kurzurlaub.
   - Themen: Spaziergaenge, Wellness, Dinner, Yoga, Sonnenuntergang, besondere Unterkuenfte.

3. `Was kann man in Sankt Peter-Ording machen? Erlebnisse fuer Familien und Paare`
   - Paketbezug: beide Pakete
   - Intention: breiter SEO/GEO-Einstieg fuer Erlebnis-Suchen.
   - Themen: Natur, Strand, lokale Anbieter, wetterabhaengige Optionen, saisonale Hinweise.

CTA:
- artikelabhaengig zu passenden Paketen

### `/ratgeber/[artikel]`

Name: Ratgeberartikel

Zweck:
- Suchintention beantworten.
- Vertrauen und Expertise aufbauen.
- weich zu passenden Paketen fuehren.

Struktur:
- klare Frage/Keyword im Titel
- hilfreicher lokaler Inhalt
- Morrow-Empfehlung ohne harte Sales-Sprache
- passender Paket-CTA
- direkte Antwort auf die Suchfrage am Anfang
- interne Links zu passenden Paketen
- spaeter FAQ-Block und strukturierte Daten

CTA:
- `Passendes Paket ansehen`
- `Auszeit planen`

### `/eigentuemer`

Name: Eigentuemer-Seite

Zweck:
- Direktes Angebot an Eigentuemer erklaeren.
- Nicht Agentur-Kooperation kommunizieren, sondern langfristiges Morrow-Modell.

Inhalte:
- Morrow als Hospitality-Operator
- bessere Positionierung
- mehr Auslastung
- weniger operative Last
- keine Blackbox
- wie eine Zusammenarbeit aussehen kann
- Kontaktformular

Formular:
- Name
- E-Mail
- Telefonnummer
- Ort der Immobilie
- Art der Immobilie
  - Ferienwohnung
  - Ferienhaus
  - Reetdachhaus
  - Apartment
  - anderes
- Anzahl Schlafplaetze
- aktuelle Vermietung
  - Ja, ueber mich selbst
  - Ja, ueber eine Agentur
  - Ja, ueber Plattformen
  - Nein, noch nicht
- Link zum Objekt / Expose / Inserat, optional
- Nachricht, optional

Nicht im Formular abfragen:
- Umsatz
- Auslastung
- konkrete Probleme oder sensible wirtschaftliche Details

Diese Themen gehoeren in den persoenlichen Call.

CTA:
- `Immobilie vorstellen`

Wichtig:
- Keine falschen Dashboard-Versprechen in Phase 1.
- Fremdagenturen sind interne Markteintrittsbruecke, nicht Kernbotschaft fuer Eigentuemer.

### `/partner/erlebnisanbieter`

Name: Erlebnisanbieter-Seite

Status Phase 1: sekundär, im Footer verlinkt.

Zweck:
- Lokalen Erlebnisanbietern eine einfache Moeglichkeit geben, sich fuer Kooperationen zu melden.
- Aufbau der Erlebnisanbieter-Datenbank unterstuetzen.
- Nicht den Gaeste-Funnel auf der Startseite ueberladen.

Navigation:
- Nicht in der Hauptnavigation.
- Link im Footer: `Erlebnis anbieten`
- Optional als kleiner Hinweis auf `/eigentuemer`: `Du bietest ein lokales Erlebnis an?`

Inhalte:
- Morrow sucht passende lokale Erlebnisse fuer kuratierte Aufenthaltspakete.
- Fokus auf Qualitaet, Zielgruppenfit und persoenliche Zusammenarbeit.
- keine offene Marketplace-Registrierung, sondern kuratierte Partneranfrage.

Formular:
- Name
- E-Mail
- Telefonnummer
- Name des Angebots / Unternehmens
- Ort
- Art des Erlebnisses
  - Natur
  - Wellness
  - Kulinarik
  - Sport / Aktiv
  - Familie / Kinder
  - Kultur
  - Sonstiges
- Website / Instagram / Link
- kurze Beschreibung
- geeignet fuer
  - Familien
  - Paare
  - beide
- Nachricht

CTA:
- `Erlebnis anbieten`

### Intern: `/?admin=1` oder spaeter `/admin`

Name: Internes Admin

Zweck:
- Leads verwalten.
- Status pflegen.
- Pakete perspektivisch selbst anlegen, bearbeiten, pausieren und veroeffentlichen.

Inhalte:
- Leadliste
- Paket
- Termin
- Kontakt
- Status
- Paketliste
- Paket-Editor
- Objekt-/Bilddaten
- Preis und feste Termine
- enthaltene Leistungen, Erlebnis und Empfehlungen

Phase-1-Entscheidung:
- Fuer den ersten Prototyp koennen Pakete noch als Startdaten im Code liegen.
- Die Struktur muss aber so gebaut werden, dass Pakete spaeter aus Supabase/Admin geladen werden koennen.
- Neue Pakete duerfen langfristig keinen Code-Eingriff brauchen.

Nicht oeffentlich kommunizieren.

## Phase-1-Umfangsempfehlung

Finaler Umfang fuer Launch:
- `/`
- `/pakete/family-escape`
- `/pakete/couple-reset`
- `/eigentuemer`
- `/partner/erlebnisanbieter`
- `/ratgeber` mit 2-3 Startartikeln
- internes Admin

Optional spaeter:
- `/pakete`
- `/sankt-peter-ording`
- weitere Ratgeberartikel
- Login/Portal nach erster echter Buchung

## Spaeterer Reisebereich / Portal

Status Phase 1: nicht bauen, nur Architektur vormerken.

Zweck:
- Persoenlicher Reisebereich nach Anfrage/Buchung.
- Kein generisches Nutzerkonto.
- Companion fuer den Aufenthalt.

Inhalte nach Anfrage:
- Anfrage-Status
- ausgewaehltes Paket
- Termin
- Personenanzahl
- Hinweis auf persoenliche Rueckmeldung
- Kontaktmoeglichkeit

Inhalte nach Reservierung/Buchung:
- Unterkunftsdetails
- Check-in-Informationen
- Erlebnisdetails
- Empfehlungen vor Ort
- Ansprechpartner
- wichtige Zeiten
- offene Angaben, z. B. Ankunftszeit, Kinderalter, Hund

Ortsgebundene Inhalte:
- oeffentliche Veranstaltungen
- Wochenmarkt
- Straende
- Entdeckungen im Ort
- Gastronomie
- Wetterbericht
- Ebbe und Flut

Interaktive Funktionen:
- Karte mit Filtern
- Route auf Smartphone starten ueber hinterlegten Kartendienst
- Chat mit Morrow-Support
- Eskalations-/Ticketsystem fuer Defekte oder Probleme am Objekt
- Weiterleitung an Ferienvermietungsanbieter oder spaeter Morrow-Operations

Spaetere Zusatzservices:
- Private Cooking
- Yoga
- Wellness
- weitere kuratierte Services

## Offene Entscheidungen

- [x] Phase-1-Sitemap bestaetigt
- [x] `/pakete` wird in Phase 1 nicht gebaut; Paket-Auswahl erfolgt auf `/`
- [x] `/sankt-peter-ording` wird in Phase 1 nicht gebaut; SPO-Kontext erscheint auf Startseite, Paketseiten und Ratgeber
- [x] Drei Startartikel fuer Ratgeber definiert
- [x] Paketspezifische Gastformulare definiert; Paket wird aus Seite gespeichert, kein Paket-Dropdown
- [x] Eigentuemerformular definiert
- [x] Erlebnisanbieter-Formular als Footer-/Partnerseite definiert
- [x] WhatsApp-Opt-in als optionales Formularfeld fuer wichtige Nachrichten definiert
- [x] Paketdetailstruktur als Wireframe definiert
- [x] Spaetere Portal-/Companion-Inhalte definiert
