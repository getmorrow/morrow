# Morrow Lead Playbook

## Ziel

Die Datenbank ist eine Partner-Pipeline fuer Sankt Peter-Ording und Umkreis. Sie dient dazu, Erlebnisanbieter und Ferienimmobilien-Anbieter zu finden, zu qualifizieren und spaeter sauber anzusprechen.

## Segmente

Erlebnisanbieter:
- Wattwanderung und Naturfuehrung
- Kitesurfen, Wingfoilen, SUP, Segeln
- Reiten am Strand
- Fahrradverleih und gefuehrte Routen
- Wellness, Yoga, Thalasso
- Kulinarik, Hoflaeden, Tastings
- Fotografie, Kultur, saisonale Events

Ferienimmobilien:
- Ferienwohnungsvermittlung
- Ferienhausverwaltung
- Co-Hosting-nahe Agenturen
- lokale Buchungsplattformen
- Hausverwaltungen mit Ferienobjekten
- Premium-Objektanbieter

## Quellenprioritaet

1. Offizielle Anbieterwebsite
2. Tourismusportal St. Peter-Ording / Eiderstedt
3. Gastgeberverzeichnisse und PDFs
4. Branchenverzeichnisse als Discovery, danach Website-Verifikation
5. Google Maps nur als Discovery, nicht als alleinige Quelle

## Rechtliche Leitplanken

- Keine privaten E-Mails oder privaten Telefonnummern speichern.
- Keine Login-Bereiche, keine aggressiven Scrapes.
- Impressum und Kontaktseiten nur als oeffentliche B2B-Basis dokumentieren.
- Kaltakquise per E-Mail in Deutschland ist riskant. Bevorzugt: Kontaktformular, Telefonzentrale, Warm Intro, lokale Events.
- Jede Ansprache individuell begruenden.
- Opt-out sofort respektieren.

## Scoring

Fit-Score 0-100:
- 20 Zielgruppen-Fit
- 15 lokale Relevanz
- 20 Partnerpotenzial
- 15 Professionalisierung
- 15 Markenpassung
- 10 rechtssicherer Kontaktkanal
- 5 Aktualitaet der Quelle

Prioritaet:
- 80-100: A
- 60-79: B
- 40-59: C
- unter 40: Hold

## Scraping-Workflow

1. Seed-URLs sammeln.
2. Domaenen normalisieren und Dubletten entfernen.
3. Robots/Terms pruefen.
4. Basisdaten extrahieren: Name, Segment, Kategorie, Ort, Website, Quelle, Beleg.
5. Keine privaten Kontaktfelder automatisch ziehen.
6. Score vorbereiten.
7. A-Leads manuell qualifizieren.
8. In `partner_leads` importieren.
9. Outreach in `interactions` loggen.

## Beispielqueries

```text
"Sankt Peter-Ording" +"Ferienwohnung vermieten" +"Eigentümer"
"Sankt Peter-Ording" +"Ferienwohnungsvermittlung"
"Eiderstedt" +"Ferienhausverwaltung"
"Sankt Peter-Ording" +"Kiteschule"
"Sankt Peter-Ording" +"Wattwanderung"
"Sankt Peter-Ording" +"Reiten am Meer"
"Sankt Peter-Ording" +"Fahrradverleih"
"Sankt Peter-Ording" +"Yoga" +"Nordsee"
```

## Outreach-Winkel

Erlebnisanbieter:

> Wir bauen kuratierte Aufenthalte in SPO und suchen lokale Erlebnisse, die Gaesten eine ruhigere, hochwertigere Zeit am Ort ermoeglichen. Ihr Angebot passt, weil [konkreter Grund]. Koennen wir pruefen, ob eine Empfehlung, ein Voucher oder ein kleines Paketmodell sinnvoll waere?

Ferienimmobilien-Agenturen:

> Wir pruefen Partnerschaften mit lokalen Ferienimmobilien-Anbietern, bei denen Gaesteerlebnis, regionale Empfehlungen und Eigentuemernutzen zusammenkommen. Uns interessiert, ob Morrow als Experience- und Marketing-Layer zusaetzlichen Wert fuer Ihre Gaeste oder Eigentuemer schaffen kann.
