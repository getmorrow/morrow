# Morrow Phase 1 Wireframes

Zentrale Orientierung:
- `docs/MORROW_MASTER_FRAME.md`
- `docs/PHASE1_INFORMATION_ARCHITECTURE.md`
- `docs/BRAND_ASSET_REGISTRY.md`

Status: Strukturentwurf, noch kein UI-Design.

Grundregel:
- Mobile first.
- Der wichtigste Traffic wird mobil erwartet.
- Alle CTAs, Formulare und Paketkarten zuerst fuer mobile Nutzung denken.
- Desktop ist eine erweiterte Layout-Version.

## `/` Plattform-Startseite

Ziel:
- Morrow in wenigen Sekunden erklaeren.
- Pakete + Ort sichtbar machen.
- Gaeste in die zwei Pakete fuehren.
- Eigentuemer sekundaer ansprechen.
- Ratgeber als SEO/GEO-Signal sichtbar machen.

### Section 1: Hero / First Screen

Funktion:
- Hospitality-Marke + Plattformfunktion balancieren.
- Kein reiner Image-Hero, keine generische Suchmaschine.

Inhalte:
- Wordmark
- Headline: `Kuratierte Auszeiten in Sankt Peter-Ording.`
- Subline: `Morrow verbindet ausgewaehlte Unterkuenfte, lokale Erlebnisse und persoenliche Betreuung zu Urlaubspaketen fuer Familien und Paare.`
- Ortssignal: `Sankt Peter-Ording`
- Paketkarten direkt sichtbar:
  - `Family Escape`
  - `Couple Reset`
- CTA: `Auszeit planen`

Paketkarte im Hero:
- Paketname
- Zielgruppe
- Kurzversprechen
- `ab`-Preis
- Link: `Paket ansehen`

### Section 2: Warum Morrow

Funktion:
- Den Unterschied zu Airbnb/Booking/Agentur erklaeren.

Botschaft:
- nicht hunderte Optionen
- weniger Planungsstress
- Unterkunft, Erlebnis und Betreuung aus einer Hand

Inhalte als 3 Prinzipien:
- `Kuratierte Unterkuenfte`
- `Lokale Erlebnisse`
- `Persoenliche Betreuung`

### Section 3: Pakete In Sankt Peter-Ording

Funktion:
- Die zwei Startpakete detaillierter vergleichen.

Inhalte:
- `Family Escape`
  - fuer Familien
  - flexible Personenanzahl nach Objekt
  - Kinder und ggf. Hund mitgedacht
  - Erlebnisrichtungen: Watt, Reiten, Natur
- `Couple Reset`
  - fuer Paare
  - immer 2 Personen
  - ggf. Hund je Objekt
  - Erlebnisrichtungen: Wellness, Yoga, Dinner, gemeinsames Kochen

CTA je Paket:
- `Family Escape ansehen`
- `Couple Reset ansehen`

### Section 4: So Funktioniert Es

Funktion:
- Ablauf erklaeren, ohne nach Checkout zu wirken.

Schritte:
1. Paket waehlen
2. Termin anfragen
3. Persoenlich abstimmen
4. Anreisen und geniessen

Wichtig:
- kein Direkt-Checkout
- persoenliche Rueckmeldung
- konkrete Objekte und feste Termine

### Section 5: Sankt Peter-Ording Lokal Kuratiert

Funktion:
- Ort und Morrow-Kuration verbinden.

Inhalte:
- kurze SPO-Einfuehrung
- Strand, Watt, Natur, Restaurants, ruhige Orte
- Hinweis auf paketbezogene Empfehlungen vor Ort
- Ratgeber-Teaser

CTA:
- `Ratgeber lesen`

### Section 6: Ratgeber-Teaser

Funktion:
- SEO/GEO sichtbar machen.
- Nutzer in hilfreiche Inhalte fuehren.

Teaser:
- `Sankt Peter-Ording mit Kindern: entspannte Ideen fuer Familien`
- `Auszeit zu zweit in Sankt Peter-Ording: ruhige Orte und besondere Erlebnisse`
- `Was kann man in Sankt Peter-Ording machen? Erlebnisse fuer Familien und Paare`

CTA:
- `Zum Ratgeber`

### Section 7: Fuer Eigentuemer

Funktion:
- Sekundaerer B2B-Einstieg.
- Direktes Morrow-Modell ansprechen, nicht Agentur-Bruecke.

Botschaft:
- Mehr aus deiner Ferienimmobilie machen, ohne mehr operativen Aufwand.
- Morrow kuratiert Aufenthalte, positioniert Objekte hochwertig und baut Nachfrage auf.

Inhalte:
- bessere Positionierung
- kuratierte Pakete statt generische Inserate
- persoenliche Gaestebetreuung
- langfristig weniger operative Last

CTA:
- `Immobilie vorstellen`

### Section 8: Footer

Inhalte:
- Wordmark/Icon
- kurze Morrow-Beschreibung
- Links:
  - Pakete
  - Ratgeber
  - Fuer Eigentuemer
  - Erlebnis anbieten
- Kontakt

Nicht im Footer ueberbetonen:
- Login
- App
- interne Admin-/Agentenlogik

## Offene Checks Fuer Startseite

- [ ] Ist die Headline stark genug?
- [ ] Reicht der Hero, um Plattform + Marke in 5 Sekunden zu verstehen?
- [ ] Wirken die Paketkarten wie kuratierte Aufenthalte, nicht wie Produktkacheln?
- [ ] Ist der Eigentuemerbereich sichtbar, aber nicht dominant?
- [ ] Ist der Ratgeber sichtbar genug fuer SEO/GEO, aber nicht ablenkend?

## Paketdetailseiten Gemeinsame Struktur

Gilt fuer:
- `/pakete/family-escape`
- `/pakete/couple-reset`

Ziel:
- Das Paket als kuratierten Aufenthalt verkaufen.
- Konkretes Objekt, Erlebnis, Empfehlungen und Termin logisch verbinden.
- Anfrage ausloesen, ohne Direktbuchungsdruck.

Prinzip:
- Erst Gefuehl und Ergebnis.
- Dann was enthalten ist.
- Dann Objekt.
- Dann Erlebnis und Empfehlungen.
- Dann Termine, Preis und Anfrage.

Nicht wirken wie:
- Immobilieninserat
- Booking-Detailseite
- langer Ausstattungskatalog

### Section 1: Paket-Hero

Funktion:
- Sofort klaeren: fuer wen, wo, welches Gefuehl, was tun.

Inhalte:
- Paketname
- Zielgruppe
- Ort: Sankt Peter-Ording
- Kurzversprechen
- Hauptbild
- `ab`-Preis oder konkreter Paketpreis
- feste Termine als kurze Info
- CTA: `Auszeit anfragen`

### Section 2: Fuer Wen Ist Dieses Paket?

Funktion:
- Selbstselektion.
- Nutzer soll merken: Das ist fuer uns gemacht.

Inhalte:
- 3-4 klare Situationen oder Beduerfnisse
- keine generischen Benefits

### Section 3: Das Ist Enthalten

Funktion:
- Paketlogik verstehen.

Inhalte:
- konkrete Unterkunft
- 1 kuratiertes Erlebnis
- Empfehlungen vor Ort
- persoenliche Betreuung
- feste Termine

### Section 4: Die Unterkunft

Funktion:
- Vertrauen und Konkretheit.
- Das Objekt zeigen, ohne zum Makler-Expose zu werden.

Inhalte:
- Objektname
- Fotogalerie
- kurze kuratierte Beschreibung
- Schlafplaetze / Personenlogik
- relevante Ausstattung
- Lage grob beschrieben

Nicht:
- endlose Ausstattungsliste
- technische Inseratsprache

### Section 5: Das Erlebnis

Funktion:
- Zeigen, dass Morrow mehr als Unterkunft ist.

Inhalte:
- enthaltenes Erlebnis
- warum es zum Paket passt
- Anbieter nennen, wenn Kooperation sicher ist
- sonst Erlebnisrichtung beschreiben

### Section 6: Empfehlungen Vor Ort

Funktion:
- lokale Kuration beweisen.

Inhalte:
- 3-5 Empfehlungen
- Essen
- Natur/Ort
- wetterabhaengige Option
- zielgruppenspezifische Tipps

### Section 7: Termine Und Preis

Funktion:
- Entscheidung vereinfachen.

Inhalte:
- feste Paket-Termine
- konkreter Preis
- was enthalten ist
- Hinweis: keine Direktbuchung, persoenliche Anfrage

Nicht:
- Kalender
- dynamische Verfuegbarkeit

### Section 8: Anfrageformular

Funktion:
- Lead erfassen.
- So schlank wie moeglich.
- Mobile-first Anfrageinteraktion.

Gemeinsam:
- Paket wird automatisch aus Seite gespeichert
- Name
- E-Mail
- Telefonnummer
- gewuenschter Termin als Select aus festen Terminen
- optionaler WhatsApp-Opt-in fuer wichtige Nachrichten zur Anfrage/Reise
- Nachricht / besondere Wuensche, optional

Interaktion:
- Mobile: CTA `Auszeit anfragen` oeffnet ein Bottom Drawer Formular von unten.
- Mobile Drawer: schliessbar, fokussiert, kurzer Formularfluss, Success-State im Drawer.
- Desktop: CTA scrollt zum eingebetteten Anfrage-Modul weiter unten.
- Kein Kalender.
- Kein Paket-Dropdown.
- Kein Pflicht-Login.

### Section 9: Ablauf Und Vertrauen

Funktion:
- Unsicherheit reduzieren.

Schritte:
1. Anfrage senden
2. Morrow meldet sich persoenlich
3. Details klaeren
4. Termin reservieren

## `/pakete/family-escape`

Zielgruppe:
- Familien

Kerngefuehl:
- gemeinsame Familienzeit ohne Planungsstress
- Eltern werden entlastet
- Kinder sind mitgedacht

Hero-Kurzversprechen:
`Gemeinsame Zeit an der Nordsee, vorbereitet fuer Eltern und Kinder.`

Fuer-wen-Punkte:
- Familien, die nicht alles selbst planen wollen
- Eltern, die eine schoene Zeit fuer Kinder und sich selbst suchen
- Familien, die Unterkunft, Erlebnis und lokale Empfehlungen aus einer Hand wollen
- Familien, die feste Termine und persoenliche Abstimmung schaetzen

Formular zusaetzlich:
- Personenanzahl
- Kinderalter, optional
- Hund dabei?, optional
- WhatsApp-Kontakt, optionaler Opt-in

Bildwelt:
- helle Unterkunft
- Familie am Strand
- Natur, Bewegung, Leichtigkeit
- kinderfreundliche Details

Erlebnisrichtungen:
- Wattwandern
- Reiten
- Naturerlebnis
- kindertaugliche lokale Aktivitaet

Empfehlungen:
- familienfreundliche Gastronomie
- Schlechtwetter-Idee
- Strandabschnitt
- ruhiger Ort fuer Eltern und Kinder

## `/pakete/couple-reset`

Zielgruppe:
- Paare ab 28/30

Kerngefuehl:
- raus aus Alltag, Arbeit oder privatem Stress
- Zeit zu zweit
- sich wiederfinden
- wenige Tage, die sich nach mehr Erholung anfuehlen

Hero-Kurzversprechen:
`Ein paar Tage raus aus dem Alltag. Nur ihr zwei, die Nordsee und alles vorbereitet.`

Fuer-wen-Punkte:
- Paare, die wieder bewusst Zeit miteinander verbringen wollen
- Paare mit Anlass wie Jahrestag oder Geburtstag
- Paare, die Entlastung statt Planung suchen
- Paare, die Ruhe, gutes Essen und ein passendes Erlebnis wollen

Formular zusaetzlich:
- Anlass als optionaler Select
  - Jahrestag
  - Geburtstag
  - Einfach raus aus dem Alltag
  - Ueberraschung
  - Anderer Anlass
- Hund dabei?, optional
- WhatsApp-Kontakt, optionaler Opt-in

Personenlogik:
- immer 2 Personen

Bildwelt:
- ruhige Unterkunft
- hochwertige Details
- Abendstimmung am Wasser
- Dinner
- Wellness / Yoga / Kochen
- Spaziergang

Erlebnisrichtungen:
- Wellness
- Yoga
- gemeinsames Kochen
- Dinner
- ruhige Zwei-Personen-Erlebnisse

Empfehlungen:
- Dinner-Ort
- Spaziergang / Sonnenuntergang
- ruhiger Strandabschnitt
- Wellness-/Yoga-Option

## Offene Checks Fuer Paketdetailseiten

- [ ] Ist das Paket als Aufenthalt spuerbar, nicht nur als Objekt?
- [ ] Ist das konkrete Objekt sichtbar genug?
- [ ] Ist das Erlebnis klar genug integriert?
- [ ] Sind feste Termine und Preis eindeutig?
- [ ] Ist das Formular schlank genug?
- [ ] Funktioniert das Formular mobile-first als Bottom Drawer?
- [ ] Unterscheiden sich Family Escape und Couple Reset emotional klar?

## `/eigentuemer`

Ziel:
- Eigentuemer hochwertiger Ferienimmobilien direkt ansprechen.
- Morrow als Hospitality-Operator positionieren.
- Nicht wie eine weitere klassische Agentur wirken.
- Nicht die aktuelle Phase-1-Agenturbruecke kommunizieren.

Prinzip:
- Sekundaer zur Gaesteansprache, aber professionell und sichtbar.
- Keine Dashboard-/Software-Versprechen in Phase 1.
- Kein harter Sales-Funnel.
- Persoenliche Pruefung und ausgewaehlte Zusammenarbeit betonen.

### Section 1: Hero

Funktion:
- Schnell klaeren, warum Eigentümer weiterlesen sollten.

Headline:
`Mehr aus deiner Ferienimmobilie machen. Ohne mehr Aufwand.`

Subline:
`Morrow kuratiert hochwertige Aufenthalte rund um passende Objekte und verbindet Positionierung, Gaesteerlebnis und operative Betreuung.`

CTA:
- `Immobilie vorstellen`

### Section 2: Fuer Wen Ist Das?

Funktion:
- Qualifizieren, ohne auszuschliessen.

Inhalte:
- Eigentuemer hochwertiger Ferienwohnungen oder Ferienhaeuser
- Eigentuemer in Wasserorten, zuerst Sankt Peter-Ording
- Eigentuemer, die mehr Auslastung oder bessere Positionierung wollen
- Eigentuemer, die weniger operative Last wollen
- Eigentuemer, die keine Blackbox-Agentur suchen

### Section 3: Was Morrow Uebernimmt

Funktion:
- Morrow-Operator-Rolle erklaeren.

Inhalte:
- Positionierung des Objekts
- Paketlogik rund um Unterkunft + Erlebnis
- Gaestekommunikation
- Empfehlungen und lokale Erlebnisse
- persoenliche Betreuung
- perspektivisch Revenue-Optimierung

### Section 4: Warum Anders Als Klassische Agentur?

Funktion:
- Differenzierung zu lokalen Vermietungsagenturen.

Botschaft:
- Morrow verkauft Aufenthalte, nicht nur Naechte.
- Objekte werden Teil kuratierter Pakete.
- Gaeste werden an die Hand genommen.
- Der Aufenthalt wird emotional und operativ mitgedacht.

Vergleichspunkte:
- klassische Agentur: Objekt listen, verwalten, buchen
- Morrow: Objekt kuratieren, Paket bauen, Erlebnis integrieren, Gast begleiten

### Section 5: So Startet Die Zusammenarbeit

Funktion:
- Niedrige Einstiegshuerde.

Schritte:
1. Immobilie vorstellen
2. Persoenliches Gespraech
3. Objekt pruefen
4. Paketmoeglichkeit entwickeln
5. Zusammenarbeit abstimmen

Hinweis:
- Keine automatische Aufnahme.
- Morrow arbeitet mit ausgewaehlten Objekten.

### Section 6: Formular

Funktion:
- Eigentuemerkontakt qualifizieren.

Felder:
- Name
- E-Mail
- Telefonnummer
- Ort der Immobilie
- Art der Immobilie
- Anzahl Schlafplaetze
- aktuelle Vermietung
- optional Link zum Objekt / Expose / Inserat
- optional Nachricht

Nicht abfragen:
- Umsatz
- Auslastung
- sensible wirtschaftliche Details

CTA:
- `Immobilie vorstellen`

### Section 7: Vertrauen / Haltung

Funktion:
- Sicherheit geben.

Inhalte:
- persoenliche Pruefung
- transparente Zusammenarbeit
- kein Massenmodell
- Fokus auf Qualitaet und Gaesteerlebnis

## Offene Checks Fuer Eigentuemer-Seite

- [ ] Wirkt Morrow wie ein Hospitality-Operator, nicht wie eine weitere Agentur?
- [ ] Ist der Einstieg fuer Eigentuemer niedrig genug?
- [ ] Werden keine sensiblen Daten zu frueh abgefragt?
- [ ] Bleibt die Seite sekundär zur Gaesteprioritaet?

## `/partner/erlebnisanbieter`

Ziel:
- Lokalen Erlebnisanbietern einen einfachen Kooperations-Einstieg geben.
- Aufbau der Anbieter- und Erlebnisdatenbank unterstuetzen.
- Nicht als offene Marketplace-Registrierung wirken.
- Nicht die Hauptnavigation oder den Gaeste-Funnel ueberladen.

Platzierung:
- Link im Footer: `Erlebnis anbieten`
- Optional kleiner Hinweis auf Eigentuemerseite
- Nicht in der Hauptnavigation

### Section 1: Hero

Funktion:
- Sofort klaeren, dass Morrow kuratierte lokale Erlebnisse sucht.

Headline:
`Bietest du ein besonderes Erlebnis am Wasser an?`

Subline:
`Morrow verbindet ausgewaehlte Unterkuenfte mit lokalen Erlebnissen. Wenn dein Angebot zu unseren Paketen passt, lernen wir dich gern kennen.`

CTA:
- `Erlebnis anbieten`

### Section 2: Welche Erlebnisse Passen?

Funktion:
- Anbieter qualifizieren.

Kategorien:
- Natur
- Wellness
- Kulinarik
- Sport / Aktiv
- Familie / Kinder
- Kultur
- Sonstiges

Hinweis:
- Qualitaet, Verlaesslichkeit und Zielgruppenfit sind wichtiger als Masse.

### Section 3: Wie Morrow Arbeitet

Funktion:
- Kurationsprinzip erklaeren.

Schritte:
1. Angebot einreichen
2. Morrow prueft Zielgruppenfit
3. Persoenliches Kennenlernen
4. Integration in passendes Paket
5. Gemeinsame Abstimmung von Ablauf und Verfuegbarkeit

### Section 4: Fuer Wen Dein Erlebnis Geeignet Ist

Funktion:
- Paketfit abfragen und erklaeren.

Zielgruppen:
- Familien
- Paare
- beide

Beispiele:
- Family Escape: Natur, Reiten, Watt, kindertaugliche Aktivitaeten
- Couple Reset: Wellness, Yoga, Kochen, Dinner, ruhige Zwei-Personen-Erlebnisse

### Section 5: Formular

Funktion:
- Anbieter qualifizieren.

Felder:
- Name
- E-Mail
- Telefonnummer
- Name des Angebots / Unternehmens
- Ort
- Art des Erlebnisses
- Website / Instagram / Link
- kurze Beschreibung
- geeignet fuer Familien, Paare oder beide
- Nachricht

CTA:
- `Erlebnis anbieten`

### Section 6: Hinweis

Funktion:
- Erwartung setzen.

Inhalte:
- Morrow kuratiert Partner.
- Ein Eintrag ist keine automatische Aufnahme.
- Wir melden uns persoenlich, wenn das Angebot zu einem Paket oder Ort passt.

## Offene Checks Fuer Erlebnisanbieter-Seite

- [ ] Wirkt es kuratiert statt wie offene Marketplace-Registrierung?
- [ ] Ist klar, dass die Seite sekundär ist?
- [ ] Ist der Formularumfang fuer Anbieter zumutbar?
- [ ] Werden Family Escape und Couple Reset als Paketkontext verstaendlich?

## `/ratgeber`

Ziel:
- SEO/GEO-Traffic aufbauen.
- Morrow als lokalen Kurator positionieren.
- Nutzern echte Orientierung geben.
- Weich zu passenden Paketen fuehren.

Prinzip:
- Kein generischer Blog.
- Keine duennen Listenartikel.
- Jede Seite beantwortet eine konkrete Suchintention.
- Inhalte muessen lokal, hilfreich und paketnah sein.

### Section 1: Ratgeber-Hero

Funktion:
- Ratgeber als Teil der Morrow-Kuration erklaeren.

Headline:
`Ruhig geplant. Lokal empfohlen.`

Subline:
`Unser Ratgeber sammelt Ideen, Orte und Hinweise fuer Auszeiten in Sankt Peter-Ording: fuer Familien, Paare und alle, die weniger suchen und besser ankommen wollen.`

### Section 2: Startartikel

Funktion:
- Die drei wichtigsten SEO/GEO-Einstiege zeigen.

Artikel:
1. `Sankt Peter-Ording mit Kindern: entspannte Ideen fuer Familien`
2. `Auszeit zu zweit in Sankt Peter-Ording: ruhige Orte und besondere Erlebnisse`
3. `Was kann man in Sankt Peter-Ording machen? Erlebnisse fuer Familien und Paare`

Karte je Artikel:
- Titel
- Zielgruppe / Thema
- kurze Beschreibung
- Link: `Artikel lesen`

### Section 3: Kategorien

Funktion:
- Spaetere Skalierung vorbereiten.

Kategorien:
- Familienurlaub
- Paarzeit
- Erlebnisse
- Essen & Empfehlungen
- Wetter & Saison

### Section 4: Paket-Verknuepfung

Funktion:
- Ratgeber mit Conversion verbinden.

Inhalte:
- Passende Pakete:
  - Family Escape
  - Couple Reset

CTA:
- `Passende Auszeit planen`

## `/ratgeber/[artikel]`

Ziel:
- Konkrete Suchfrage beantworten.
- Vertrauen und lokale Kompetenz aufbauen.
- Zu passendem Paket fuehren.

### Artikel-Struktur

1. Titel mit Suchintention
2. kurze direkte Antwort / Zusammenfassung am Anfang
3. lokale Abschnitte mit konkreten Empfehlungen
4. zielgruppenspezifische Hinweise
5. Morrow-Kurationshinweis
6. passender Paket-CTA
7. FAQ-Block

### Artikel 1: SPO Mit Kindern

Suchintention:
- Familien suchen entspannte Ideen und Orientierung.

Inhalte:
- Strand mit Kindern
- Watt / Natur
- Reiten oder Tiere
- Schlechtwetter
- Essen mit Kindern
- ruhige Zeiten / praktische Hinweise

Paket-CTA:
- `Family Escape ansehen`

### Artikel 2: Auszeit Zu Zweit

Suchintention:
- Paare suchen Inspiration fuer eine bewusste Auszeit.

Inhalte:
- ruhige Orte
- Spaziergaenge
- Wellness / Yoga
- Dinner
- Sonnenuntergang
- Anlassideen: Geburtstag, Jahrestag, Alltag raus

Paket-CTA:
- `Couple Reset ansehen`

### Artikel 3: Was Kann Man In SPO Machen?

Suchintention:
- Breite Erlebnis-Suche.

Inhalte:
- Natur
- Strand
- Aktivitaeten
- Gastronomie
- wetterabhaengige Ideen
- fuer Familien und Paare getrennt markieren

Paket-CTA:
- `Auszeit planen`

### SEO/GEO-Regeln

- Hauptfrage am Anfang beantworten.
- Keine Keyword-Fuellung.
- Lokale Details nutzen.
- Interne Links zu Paketen setzen.
- FAQ-Block vorbereiten.
- Spaeter strukturierte Daten fuer Artikel/FAQ pruefen.

## Offene Checks Fuer Ratgeber

- [ ] Beantwortet jeder Artikel eine echte Suchintention?
- [ ] Ist der Inhalt lokal genug?
- [ ] Fuehrt jeder Artikel weich zu einem passenden Paket?
- [ ] Wirkt der Ratgeber wie Morrow-Kuration, nicht wie generischer SEO-Text?
