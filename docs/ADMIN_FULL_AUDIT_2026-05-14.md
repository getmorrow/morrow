# Admin Full Audit — 2026-05-14

Ziel: Prüfen, ob der aktuelle Admin die notwendigen V1-Arbeitsabläufe abdeckt und wo noch Lücken sind.

Testgrundlage:
- lokale Admin-Route `/admin`
- Beispiel-Leads für Gastanfrage, Eigentümer und Erlebnisanbieter
- ein archivierter Beispiel-Lead
- Desktop 1440px
- Mobile 390px

Screenshots:
- `tmp/qa/admin-full-audit/uebersicht-desktop.png`
- `tmp/qa/admin-full-audit/anfragen-desktop.png`
- `tmp/qa/admin-full-audit/auszeiten-desktop.png`
- `tmp/qa/admin-full-audit/erlebnisse-desktop.png`
- `tmp/qa/admin-full-audit/eigentuemer-desktop.png`
- `tmp/qa/admin-full-audit/erlebnisanbieter-desktop.png`
- `tmp/qa/admin-full-audit/*-mobile.png`

## Gesamtbewertung

Der Admin ist als kleines CRM-Grundgerüst nutzbar, aber noch kein vollständiges Operating-System und noch kein CMS.

Vorhanden:
- klare Admin-Navigation
- getrennte Bereiche für Anfragen, Auszeiten, Erlebnisse, Eigentümer und Erlebnisanbieter
- getrennte Kennzahlen
- Leadstatus je Lead
- Lead-Detail-Drawer
- interne Notiz
- Wiedervorlage
- Archivieren
- Archivansicht
- Filter nach Leadtyp und Status
- Reaktivieren archivierter Leads
- Wiedervorlagen auf der Übersicht als `Heute fällig`
- Löschen mit Bestätigung
- mobile Darstellung ohne horizontales Überlaufen

Noch nicht vorhanden:
- Volltextsuche
- Verantwortliche Person
- Leadquelle
- Kommunikationsverlauf
- echte Bearbeitung von Auszeiten
- Statusaktion für Auszeiten wie Pausieren
- Detailansicht für Auszeiten
- Detailansicht für Erlebnisbausteine
- Anbieterzuordnung für Erlebnisbausteine
- produktive Datenbank statt `localStorage`
- Rollenrechte und Audit-Log

## Übersicht

Status: strukturell bereinigt als täglicher CRM-Einstieg.

Vorhanden:
- neue Anfragen
- Anfragen im Status `In Prüfung`
- heute fällige Wiedervorlagen
- nächster Termin
- aktive Lead-Liste auf die neuesten Einträge begrenzt
- `Heute bearbeiten` als Board mit Wiedervorlagen, neuen Anfragen und Leads in Prüfung
- `Kommende Termine` als eigene Kurzliste mit mehreren Terminen
- keine Platzhalter- oder Ausbaukarten auf der Startfläche

Fehlt:
- Hinweis auf archivierte Leads
- Volltextsuche gehört in den Anfragenbereich, nicht auf die Übersicht

Empfehlung:
- als nächstes den Bereich `Anfragen` sectionweise prüfen: Filter, Tabelle, Detail-Drawer, Archiv, Abstände, Textgrößen und leere Zustände.

## Anfragen

Status: V1 arbeitsfähig.

Vorhanden:
- Gastanfragen, Eigentümer und Erlebnisanbieter in einer Gesamtansicht
- Statuswechsel
- Öffnen-Aktion
- Detail-Drawer
- Notiz
- Wiedervorlage
- Archivieren
- Löschen mit Bestätigung
- Archivzähler
- Archivansicht
- Filter nach Ansicht, Leadtyp und Status
- Reaktivieren archivierter Leads

Fehlt:
- Volltextsuche
- Datumsfilter
- Leadquelle
- verantwortliche Person
- Kommunikationsverlauf

Empfehlung:
- als nächstes Wiedervorlagen auf der Übersicht sichtbar machen.

## Auszeiten

Status: Kontrollliste, noch kein Arbeitsbereich.

Vorhanden:
- Name
- Zielgruppe
- Ort
- Preis
- Termine
- Unterkunft
- Statuslabel
- Kennzahlen für Auszeiten, Termine und Erlebnisse

Fehlt:
- Öffnen-Aktion
- Detailansicht
- Bearbeiten
- Pausieren/Deaktivieren
- Duplizieren
- Terminverwaltung
- Unterkunftszuordnung bearbeiten
- Erlebnisbausteine bearbeiten
- Launch-Checkliste

Empfehlung:
- nächster größerer Admin-Bauabschnitt nach Lead-Archiv/Filter sollte ein Auszeit-Detail-Drawer sein.

## Erlebnisse

Status: gute Übersicht, aber noch nicht operativ.

Vorhanden:
- Erlebnisname
- Zuordnung zur Auszeit
- Zielgruppe
- Rolle: enthalten, optional, Empfehlung
- Preislogik
- Partnerstatus
- Bestätigungsstatus

Fehlt:
- Öffnen-Aktion
- Detailansicht
- Anbieterzuordnung
- Status ändern
- Verfügbarkeit
- Kapazität
- Wetterabhängigkeit
- Qualitätsnotiz

Empfehlung:
- Erlebnis-Detail erst bauen, nachdem Anbieterprofile klarer modelliert sind.

## Eigentümer

Status: V1 arbeitsfähig als Lead-Pipeline.

Vorhanden:
- eigener Bereich
- eigene Kennzahlen
- Eigentümeranfragen
- Statuswechsel
- Öffnen-Aktion
- Detail-Drawer über Lead-System
- Notiz, Wiedervorlage, Archivieren

Fehlt:
- echtes Eigentümerprofil
- Objektprofil
- Kooperationsstatus
- Bild-/Textrechte
- Verfügbarkeiten und Konditionen
- Zuordnung zu Auszeiten

Empfehlung:
- erst dann Objektprofil bauen, wenn wir die ersten echten Eigentümergespräche operationalisieren.

## Erlebnisanbieter

Status: V1 arbeitsfähig als Anbieter-Lead-Pipeline.

Vorhanden:
- eigener Bereich
- eigene Kennzahlen
- Anbieteranfragen
- Statuswechsel
- Öffnen-Aktion
- Detail-Drawer über Lead-System
- Notiz, Wiedervorlage, Archivieren

Fehlt:
- echtes Anbieterprofil
- mehrere Erlebnisse je Anbieter
- Konditionen
- Kapazität
- Saison und Wetterabhängigkeit
- Qualitätsbewertung
- Zuordnung zu Erlebnisbausteinen

Empfehlung:
- Anbieterprofil erst bauen, wenn Erlebnis-Datenmodell und Partnerdatenbank gemeinsam entschieden sind.

## Nächste Schritte

Priorität 1:
- Volltextsuche für Leads
- Verantwortliche Person für Leads
- Anfragenbereich sectionweise prüfen und straffen

Priorität 2:
- Auszeit-Detail-Drawer mit Lesemodus und Statusaktion `Pausieren`
- Auszeiten nicht löschen, sondern archivieren oder pausieren

Priorität 3:
- Erlebnisanbieterprofil und Erlebnis-Detail gemeinsam modellieren
- Anbieter einem Erlebnisbaustein zuordnen
