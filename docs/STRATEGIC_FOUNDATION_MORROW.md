# Strategisches Fundament Fuer Morrow

Stand: 2026-06-23

Dieses Dokument ist die strategische Grundlage fuer Morrow. Es ergaenzt `docs/MORROW_MASTER_FRAME.md` und muss bei groesseren Produkt-, Design-, Content-, Marketing- und Codeentscheidungen mitgedacht werden.

## Kernthese

Morrow ist keine klassische Ferienvermietungsagentur und soll auch nicht wie eine weitere Agentur positioniert oder gebaut werden.

Morrow ist eine neue Kategorie im Ferienvermietungsmarkt von Sankt Peter-Ording:

**Eine kuratierte Gaesteplattform fuer besondere Auszeiten und gleichzeitig ein digitales Ertrags-, Eigentuemer- und Operationssystem fuer Ferienimmobilien.**

Die bestehende Plattform unter `getmorrow.de` ist die Grundlage. Die Marke heisst `Morrow`; `get` ist nur Teil der Domain.

Bestehender Code wird nicht verworfen. Ziel ist, die bestehende Plattform strategisch zu schaerfen, zu optimieren und modular zu erweitern.

Architekturstand ab 2026-06-24:
Das aktuelle Vite/React-Projekt bleibt Prototyp und Funktionsbasis. Fuer die oeffentliche Website ist es nicht die finale Produktionsarchitektur, weil Morrow fuer SEO, GEO, Indexierung und organisches Wachstum crawlbares HTML braucht. Die neue Produktionsrichtung ist ein Next.js/React-Monorepo mit Supabase. Zuerst wird `apps/web` als oeffentliche SEO-Website migriert; Gaeste-App und Admin-App folgen danach schrittweise.

## Marktlogik

Sankt Peter-Ording ist ein grosser, attraktiver und touristisch starker Ferienmarkt. Die Nachfrage ist vorhanden. Das Problem liegt nicht im Markt, sondern im dominanten Betriebsmodell.

Klassische Ferienvermietungsagenturen arbeiten haeufig passiv:

- Objekt aufnehmen
- Fotos machen
- Inserat schreiben
- Objekt auf eigener Website und Portalen listen
- auf Buchungen warten
- Gaeste verwalten
- Reinigung koordinieren
- Rechnungen manuell pruefen
- Eigentuemer abrechnen
- 20-30% Provision nehmen

Viele Anbieter arbeiten manuell, wenig transparent und ohne konsequente Performance-Logik. Es gibt oft keine objektindividuelle Vermarktung, keine systematische Lueckenvermarktung, keine echte Eigentuemertransparenz und wenig datengetriebene Steuerung.

## Zentrale Marktchance

Morrow greift nicht an, weil der Markt klein oder schlecht versorgt ist. Morrow greift an, weil der Markt gross ist, aber das dominante Betriebsmodell veraltet ist.

Die Chance:

**Ein modernes, digitales, aktives und transparentes Vermietungsmodell kann Eigentuemern mehr Nettoerloes bringen als klassische Agenturen, bei niedrigerer Provision und besserer Steuerung.**

Morrow soll nicht nur guenstiger sein. Morrow soll beweisen:

- aktiver
- digitaler
- transparenter
- ertragsorientierter
- besser fuer Eigentuemer
- inspirierender fuer Gaeste

Kernsatz:

**Klassische Agenturen verwalten Ferienwohnungen. Morrow steigert den Ertrag von Ferienimmobilien.**

## Zielbild

Morrow verbindet zwei Welten.

### Fuer Gaeste

Morrow ist eine kuratierte Plattform fuer Auszeiten in Sankt Peter-Ording.

Gaeste sollen nicht nur eine Unterkunft suchen, sondern einen passenden Reiseanlass finden:

- Hundeurlaub
- Wellness-Auszeit
- Kaminwochenende
- Familienferien
- Workation
- Last Minute
- Luxus in SPO
- Nebensaison am Meer
- Silvester an der Nordsee

### Fuer Eigentuemer

Morrow ist ein modernes Vermietungs- und Ertragssystem.

Eigentuemer sollen sehen:

- was ihr Objekt erwirtschaftet
- wo Luecken entstehen
- welche Vermarktungsmassnahmen laufen
- wie Preise gesteuert werden
- welche Buchungen eingehen
- wann gereinigt wurde
- welche Maengel bestehen
- welche Kosten entstanden sind
- wie die Abrechnung zustande kommt
- wie viel netto ausgezahlt wird

## Produktlogik

Ein Objekt ist nicht nur ein Objekt.

Ein Objekt kann mehrere buchbare Reiseprodukte sein. Ein Haus mit Sauna, Kamin, Hund erlaubt und Garten ist gleichzeitig:

- Hundeurlaub in SPO
- Wellness-Auszeit
- Kaminwochenende
- Familienurlaub
- Nebensaison-Auszeit
- Workation am Meer
- Last-Minute-Kurztrip

Deshalb braucht jedes Objekt strukturierte Attribute.

Aus diesen Attributen entstehen:

- Erlebniswelten
- Landingpages
- Kampagnen
- Lueckenangebote
- Preisempfehlungen
- Eigentuemer-Insights
- Gaesteempfehlungen

Diese Logik muss in der Plattform systematisch abgebildet werden.

## Differenzierung

Morrow unterscheidet sich von klassischen Agenturen durch fuenf Kernprinzipien.

### 1. Aktive Vermarktung Statt Passives Listing

Klassische Agenturen stellen Objekte online und warten. Morrow erkennt Nachfrageanlaesse, erstellt Erlebniswelten und vermarktet Objekte aktiv.

### 2. Lueckenmarketing Statt Leerstand Akzeptieren

Freie Zeitraeume werden nicht hingenommen. Morrow erkennt Buchungsluecken und macht daraus konkrete Angebote, zum Beispiel `3 Naechte Kamin-Auszeit mit Hund in SPO`.

### 3. Transparenz Statt Blackbox

Eigentuemer sollen live sehen, was passiert. Nicht nur Monatsabrechnung, sondern Performance-Dashboard.

### 4. Digitale Prozesse Statt Excel Und Papier

Reinigung, Maengel, Handwerker, Rechnungen, Abrechnungen und Freigaben sollen digital gesteuert werden.

### 5. Nettoerloes Statt Provisionsdenken

Das Ziel ist nicht nur eine niedrigere Provision. Das Ziel ist eine messbar hoehere Nettoauszahlung fuer Eigentuemer.

## Proof-Ziel Fuer Phase 1

Das kurzfristige Ziel ist nicht, sofort die groesste Agentur in SPO zu werden.

Das erste Ziel ist ein belastbarer Proof:

- 20-30 aktive Pilotobjekte
- mindestens 10-15% niedrigere Provision als klassische Anbieter
- messbar hoehere Nettoauszahlung fuer Eigentuemer
- funktionierender Eigentuemerbereich
- funktionierender Adminbereich
- erste Erlebniswelten live
- Lueckenmarketing light live
- transparente Monatsabrechnungen
- digitale Reinigungs- und Maengelprozesse
- erste Direktbuchungen ueber Morrow
- echte Case Studies mit Vorher-/Nachher-Zahlen

Wenn das erreicht ist, ist der Proof erbracht.

## Skalierungsziel Danach

Nach erfolgreichem Proof lautet das Ziel:

**100 Objekte in Sankt Peter-Ording und die staerkste Eigentuemermarke im Ort werden.**

Das bedeutet:

- Eigentuemer vertrauen Morrow mehr als klassischen Agenturen
- Morrow steht fuer moderne, transparente Ferienvermietung
- Morrow erzeugt eigene Direktnachfrage
- Morrow hat bessere Daten ueber Auslastung, Preise und Luecken
- Morrow betreibt effizientere Prozesse
- Morrow kann mit weniger Personal mehr Objekte besser steuern

## Plattformbereiche

Morrow besteht aus vier Hauptbereichen.

### 1. Oeffentliche Gaesteseite

Fuer kuratierte Auszeiten, Erlebniswelten und Direktbuchungen.

### 2. Gaestelogin

Besteht bereits und wird zur digitalen Gaestemappe und Buchungszentrale ausgebaut.

### 3. Eigentuemer- Und Agenturbereich

Fuer Eigentuemer-Dashboard, Objekte, Buchungen, Luecken, Eigenbelegung, Abrechnungen, Reinigung, Maengel und Freigaben.

### 4. Adminbereich

Als internes Betriebssystem fuer Morrow: Objektverwaltung, Eigentuemer, Gaeste, Buchungen, Erlebniswelten, Lueckenmarketing, Reinigung, Maengel, Handwerker, Rechnungen, Abrechnungen und Kampagnen.

## MVP-Prioritaeten

### Prioritaet 1: Strategische Website-Schaerfung

- Startseite klarer positionieren
- Gaeste- und Eigentuemerpfad sichtbar machen
- Eigentuemer-Landingpage schaerfen
- CTA `Kostenlose Ertragspotenzial-Analyse anfordern`
- Erlebniswelten sichtbar machen

### Prioritaet 2: Objektattribute Und Erlebniswelten

- strukturierte Objektattribute einfuehren
- Erlebniswelten im Admin pflegbar machen
- Objekte automatisch oder manuell Erlebniswelten zuordnen

### Prioritaet 3: Eigentuemerbereich

- Eigentuemerdashboard
- eigene Objekte
- Buchungen
- freie Luecken
- Eigenbelegung
- Abrechnungen
- Maengel
- Reinigung

### Prioritaet 4: Adminbereich

- operative Tagesansicht
- Objektverwaltung
- Eigentuemerverwaltung
- Buchungen
- Erlebniswelten
- Lueckenmarketing
- Reinigung
- Maengel
- Abrechnung

### Prioritaet 5: Lueckenmarketing Light

- freie Zeitraeume erkennen
- Angebotsvorschlaege generieren
- Erlebniswelt vorschlagen
- Status im Admin verwalten
- im Eigentuemerbereich sichtbar machen

### Prioritaet 6: Digitale Operationsprozesse

- Reinigungstasks
- Checklisten
- Maengeltickets
- Handwerkertickets
- Foto-Upload
- Statuslogik

### Prioritaet 7: Abrechnung Light

- Buchungen, Kosten und Provision zusammenfuehren
- Eigentuemerabrechnung erzeugen
- Belege zuordnen
- Auszahlung darstellen

## Entscheidungsleitplanken

Jede Produktentscheidung muss mindestens auf eines dieser Ziele einzahlen:

- mehr Buchungen
- mehr Nettoerloes fuer Eigentuemer
- niedrigere operative Kosten
- bessere Eigentuemertransparenz
- bessere Gaesteerfahrung
- weniger manuelle Arbeit
- bessere Skalierbarkeit
- staerkere Differenzierung gegenueber klassischen Agenturen

Nicht bauen, weil ein Feature nett ist. Bauen, wenn es den Proof staerker macht.

## Entwicklungsleitlinie

Bitte nicht sofort alles bauen.

Erst analysieren. Dann priorisieren. Dann modular erweitern.

Die wichtigste Leitlinie:

**Bestehendes optimieren, strategisch schaerfen und MVP-faehig erweitern, nicht neu bauen.**

Jede technische Entscheidung soll auf das Proof-Ziel einzahlen: 20-30 aktive Pilotobjekte, niedrigere Provision, hoehere Nettoauszahlung, Eigentuemerbereich, Adminbereich, Erlebniswelten, Lueckenmarketing, transparente Abrechnung, digitale Prozesse und erste Direktbuchungen.

## Kuerzeste Zusammenfassung

Morrow soll in SPO beweisen, dass moderne Ferienvermietung anders funktioniert:

- Nicht passiv listen. Aktiv vermarkten.
- Nicht Excel und Papier. Digitale Workflows.
- Nicht Blackbox. Eigentuemertransparenz.
- Nicht ein Objekt gleich ein Inserat. Ein Objekt gleich mehrere Reiseprodukte.
- Nicht Provision kassieren. Nettoertrag steigern.

Erstes Ziel:

**20-30 Pilotobjekte und Proof.**

Naechstes Ziel:

**100 Objekte in SPO und staerkste Eigentuemermarke im Ort.**
