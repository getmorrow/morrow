# Morrow Admin Function Roadmap

Ziel: Der Admin soll sich schrittweise von einem Lead-Viewer zu einem kleinen CRM und später zu einem internen Operating-System entwickeln. Funktionen werden nicht überall gleich eingebaut, sondern passend zum Arbeitsablauf je Bereich.

## Grundregel

- `Bearbeiten` öffnet eine Detailansicht oder einen Drawer.
- `Deaktivieren` pausiert öffentliche oder operative Nutzung, löscht aber keine Daten.
- `Archivieren` entfernt Datensätze aus der täglichen Ansicht, bleibt aber nachvollziehbar.
- `Löschen` ist selten, braucht Bestätigung und ist für Phase 1 nur bei Testdaten sinnvoll.
- Jede kritische Aktion braucht später Aktivitätsverlauf und Rollenrechte.

## Prioritäten

### Admin V1: Sofort sinnvoll

- Leadstatus ändern `[umgesetzt]`
- Lead öffnen `[umgesetzt]`
- Notiz hinzufügen `[umgesetzt]`
- Wiedervorlage setzen `[umgesetzt]`
- Lead archivieren `[umgesetzt]`
- Archivansicht nutzen `[umgesetzt]`
- Lead nach Typ und Status filtern `[umgesetzt]`
- Archivierten Lead reaktivieren `[umgesetzt]`
- Wiedervorlagen auf der Übersicht sehen `[umgesetzt]`
- Test-/Spam-Lead mit Bestätigung löschen `[umgesetzt]`
- Auszeitstatus anzeigen und später pausieren
- Erlebnisstatus anzeigen und später Partnerzuordnung vorbereiten

### Admin V1.5: CMS-Start

- Auszeit bearbeiten
- Termine hinzufügen, ändern, deaktivieren
- Unterkunft verbinden
- Erlebnisbausteine verbinden
- Eigentümerprofil anlegen
- Erlebnisanbieterprofil anlegen
- Anbieter einem Erlebnis zuordnen

### Admin V2: Operatives System

- echte Buchungen und Reservierungen
- Aufgaben und Verantwortliche
- Kommunikationsverlauf
- Dokumente, Bildrechte, Verträge
- Rollen und Rechte
- Audit-Log

## Bereich: Übersicht

Zweck:
- täglicher Einstieg
- neue und offene Arbeit erkennen
- keine Detailbearbeitung auf der Startseite

Aktionen V1:
- `Anfragen ansehen`
- `Auszeiten prüfen`
- `Eigentümer prüfen`
- `Erlebnisanbieter prüfen`
- `Heute fällig` priorisieren
- `Tagesfokus` als kompakte Navigation nutzen

Nicht auf der Übersicht:
- Löschen
- große Bearbeitungsformulare
- vollständige Datenmodelle
- Ausbau- oder Platzhalterkarten ohne Tagesnutzen

Umgesetzt am 2026-05-14:
- Übersicht auf echte tägliche Arbeit reduziert.
- Fällige Wiedervorlagen, neue Anfragen und Leads in Prüfung stehen in einem gemeinsamen Tagesboard.
- Aktive Anfragen sind auf die neuesten Leads begrenzt.
- Kommende Termine stehen als eigene Kurzliste unterhalb des Tagesboards.
- Der frühere Tagesfokus wurde entfernt, weil er nach der neuen Board-Struktur redundant war.

## Bereich: Anfragen

Zweck:
- alle Leads prüfen und in den nächsten Status bewegen

Datentypen:
- Gastanfrage
- Eigentümeranfrage
- Erlebnisanbieteranfrage

Aktionen V1:
- `Öffnen`
- `Status ändern`
- `Notiz hinzufügen`
- `Wiedervorlage setzen`
- `Archivieren`

Aktionen später:
- `E-Mail senden`
- `WhatsApp nur bei Zustimmung vorbereiten`
- `Reservierung anlegen`
- `Buchung anlegen`
- `Leadquelle speichern`

Löschen:
- nur für Test- oder Spam-Leads
- immer mit Bestätigung

## Bereich: Auszeiten

Zweck:
- Morrow-Angebote steuern
- später Inhalte selbst pflegen, ohne Code anzufassen

Aktionen V1:
- `Öffnen`
- `Status ansehen`
- `Pausieren` als Vorbereitung
- `Duplizieren` später sinnvoll für neue Auszeiten

Aktionen V1.5:
- `Bearbeiten`
- `Termin hinzufügen`
- `Termin deaktivieren`
- `Unterkunft verbinden`
- `Erlebnis hinzufügen`
- `FAQ bearbeiten`
- `Bilder prüfen`

Deaktivieren:
- Auszeit wird nicht mehr öffentlich oder nicht mehr anfragbar gezeigt.
- Daten bleiben erhalten.

Löschen:
- nicht für veröffentlichte Auszeiten.
- stattdessen archivieren.

## Bereich: Erlebnisse

Zweck:
- konkrete Erlebnisbausteine verwalten, die später mit Auszeiten und Anbietern verbunden werden

Aktionen V1:
- `Öffnen`
- `Status ansehen`
- `Partner offen` sichtbar machen

Aktionen V1.5:
- `Bearbeiten`
- `Anbieter zuordnen`
- `Als enthalten / optional / Empfehlung markieren`
- `Verfügbarkeit markieren`
- `Qualitätsnotiz speichern`

Deaktivieren:
- Erlebnis wird nicht mehr für neue Auszeiten genutzt.
- bestehende Auszeiten müssen Warnhinweis bekommen, falls sie dieses Erlebnis enthalten.

Löschen:
- nur wenn es nie verwendet wurde.
- sonst archivieren.

## Bereich: Eigentümer

Zweck:
- Objektpipeline und direkte Eigentümerbeziehungen aufbauen

Aktionen V1:
- `Öffnen`
- `Status ändern`
- `Notiz hinzufügen`
- `Wiedervorlage setzen`
- `Archivieren`

Aktionen V1.5:
- `Eigentümerprofil anlegen`
- `Objektprofil anlegen`
- `Bilder/Rechte prüfen`
- `Kooperationsstatus setzen`
- `Objekt einer Auszeit zuordnen`

Deaktivieren:
- Eigentümerkontakt oder Objekt wird pausiert, bleibt aber historisch sichtbar.

Löschen:
- nur doppelte oder falsche Testeinträge.

## Bereich: Erlebnisanbieter

Zweck:
- lokale Anbieter prüfen und daraus konkrete Erlebnisbausteine ableiten

Aktionen V1:
- `Öffnen`
- `Status ändern`
- `Notiz hinzufügen`
- `Wiedervorlage setzen`
- `Archivieren`

Aktionen V1.5:
- `Anbieterprofil anlegen`
- `Erlebnis aus Anbieter erstellen`
- `Zielgruppenfit markieren`
- `Konditionen speichern`
- `Wetterabhängigkeit speichern`
- `Anbieter einem Erlebnisbaustein zuordnen`

Deaktivieren:
- Anbieter wird nicht aktiv genutzt, bleibt aber als Kontakt sichtbar.

Löschen:
- nur bei Dubletten, Spam oder Testdaten.

## Empfohlene nächste Umsetzung

Als nächstes sollte nicht direkt ein vollständiger Editor gebaut werden, sondern ein sauberer Detail-Drawer für Leads.

Warum:
- Leads sind der erste echte Arbeitsfluss im MVP.
- Der Drawer kann später für Eigentümer und Erlebnisanbieter wiederverwendet werden.
- Notizen, Wiedervorlagen und Archivieren schaffen sofort echten CRM-Wert.

Nächste konkrete Funktionen:
- `Öffnen` pro Lead-Zeile `[umgesetzt]`
- Detail-Drawer mit Kontakt, Bezug, Status, Nachricht und Rohdaten je Leadtyp `[umgesetzt]`
- internes Notizfeld `[umgesetzt]`
- Wiedervorlage-Datum `[umgesetzt]`
- `Archivieren` `[umgesetzt]`
- `Löschen` nur für Testdaten mit Bestätigung `[umgesetzt]`

## Umgesetzt am 2026-05-14

Lead-Detail-Drawer:
- funktioniert für Gastanfragen, Eigentümeranfragen und Erlebnisanbieteranfragen
- speichert `internalNote`
- speichert `followUpAt`
- aktualisiert `status`
- archiviert Leads über `archivedAt`
- löscht Leads nur nach Browser-Bestätigung

Bewusste Grenze:
- Archivierte Leads werden aus den täglichen Listen herausgenommen, bleiben aber über die Archivansicht erreichbar.
- Archivierte Leads können reaktiviert werden.
- Es gibt noch keinen Audit-Log und keine Rollenrechte.
- Daten liegen weiterhin im lokalen Prototyp-Speicher und müssen später nach Supabase/Firebase wandern.

## Umgesetzt am 2026-05-14 — Archiv und Filter

Lead-Archiv:
- aktive und archivierte Leads sind über den Filter `Ansicht` getrennt.
- archivierte Leads bleiben im lokalen Speicher.
- archivierte Leads können geöffnet und reaktiviert werden.

Lead-Filter:
- Filter nach Ansicht: aktiv oder Archiv
- Filter nach Typ: alle, Gastanfragen, Eigentümer, Erlebnisanbieter
- Filter nach Status

Bewusste Grenze:
- Es gibt noch keine Volltextsuche.
- Es gibt noch keine verantwortliche Person.
- Es gibt noch keine vollständige Aufgabenliste mit Verantwortlichen und erledigt/offen-Status.

## Umgesetzt am 2026-05-14 — Wiedervorlagen auf Übersicht

Übersicht:
- Kennzahl `Heute fällig`
- eigene Section `Heute fällig` vor der allgemeinen Anfrageliste
- zeigt fällige und überfällige aktive Leads
- archivierte Leads werden nicht als fällig angezeigt
- öffnet den Lead-Drawer direkt aus der Wiedervorlage
- Startseite danach auf CRM-Tageslogik gestrafft: Tagesboard mit Wiedervorlagen, neuen Anfragen und Leads in Prüfung, aktuelle Anfragen darunter und kommende Termine als Kurzliste

Bewusste Grenze:
- Wiedervorlagen sind noch keine Aufgaben mit Besitzer, Priorität oder erledigt-Status.
