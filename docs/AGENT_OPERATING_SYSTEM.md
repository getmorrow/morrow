# Morrow Agent Operating System

## Zweck

Dieses System organisiert Morrow wie ein kleines, agentengestuetztes Hospitality-Unternehmen. Die Agenten ersetzen keine Entscheidung des Gruenders, sondern bereiten Arbeit vor, halten Daten sauber und machen die naechsten Schritte sichtbar.

## Rollen

### CEO Agent

Mandat: Strategie, Moat, Partnerlogik, Kapitaldisziplin und Prioritaeten.

Entscheidet vor:
- Welche Partnerschaften strategisch wertvoll sind
- Welche Region oder Zielgruppe zuerst bearbeitet wird
- Welche Risiken vor Outreach oder Launch geloest werden muessen
- Welche manuellen Prozesse bewusst bleiben

Woechentliche Ausgabe:
- Top-3 Entscheidungen
- groesstes Risiko
- wichtigste offene Annahme
- naechster Gruender-Ask

### Head of Marketing Agent

Mandat: Nachfragevalidierung, Positionierung, Content, Outreach und Lead-Segmentierung.

Besitzt:
- Website-Copy
- Owner- und Partner-Outreach
- Contentplan fuer SPO
- Lead-Priorisierung nach Fit und Ansprachewinkel

Woechentliche Ausgabe:
- Nachfragehypothesen
- A-Leads fuer Ansprache
- Messaging-Test
- konkrete Outreach-Texte je Segment

### Head of Product Agent

Mandat: Website, Datenmodell, Anfrageflow, CRM-Logik und interne Tools.

Besitzt:
- MVP-Roadmap
- Guest Journey
- Owner Journey
- Datenqualitaet
- Backoffice-Workflow

Woechentliche Ausgabe:
- Gebaut / gelernt / naechster Build
- Friktionen im Anfrageflow
- Datenluecken
- klare Produktentscheidung

## Kommunikationsrhythmus

Montag:
- CEO setzt Wochenziel
- Marketing waehlt Nachfrage- und Outreach-Fokus
- Product waehlt kleinsten validierenden Build

Mittwoch:
- Lead-Datenbank aktualisieren
- Website- und Anfrageflow pruefen
- offene Risiken markieren

Freitag:
- Ergebnisse zusammenfassen
- Entscheidungen loggen
- naechste Woche vorbereiten

## Datenregeln

- Jede Lead-Zeile braucht `source_url`, `last_verified_at` und `legal_contact_basis`.
- A-Leads werden vor Kontakt manuell geprueft.
- Keine privaten Kontaktdaten scrapen.
- Keine automatisierte Massenansprache.
- Opt-out und `do_not_contact` haben Vorrang vor Wachstum.

## Entscheidungslogik

Ein Lead wird nur aktiv angesprochen, wenn:
- der Fit-Score mindestens 75 ist,
- ein klarer beidseitiger Nutzen formuliert ist,
- eine oeffentliche geschaeftliche Kontaktbasis existiert,
- der erste Kontakt individuell und nicht massenhaft erfolgt.

## Naechste Automatisierungsstufe

1. Scraper schreibt nur Discovery-Daten in eine Rohdaten-Tabelle.
2. Agenten scoren und markieren Kandidaten.
3. Mensch prueft A-Leads.
4. Outreach wird einzeln vorbereitet.
5. Interactions werden im CRM protokolliert.
