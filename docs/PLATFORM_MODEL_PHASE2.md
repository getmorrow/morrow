# Morrow Platform Model Phase 2

Dieses Dokument beschreibt die spaetere Plattformlogik von Morrow. Es ist kein Phase-1-Scope, sondern ein Rahmen, damit Phase 1 technisch und konzeptionell nicht in eine Sackgasse laeuft.

## Leitgedanke

Morrow wird langfristig nicht nur eine Website, sondern ein kuratiertes Hospitality-Betriebssystem:
- Gaeste entdecken und buchen kuratierte Aufenthalte.
- Morrow kuratiert Pakete, Objekte, Erlebnisse und Empfehlungen.
- Eigentuemer stellen Objekte bereit und erhalten Transparenz.
- Erlebnispartner stellen kuratierte Leistungen bereit.
- Interne Morrow-Mitarbeitende steuern Leads, Buchungen, Qualitaet und Operations.

Phase 1 muss davon nur den kleinsten Kern vorbereiten:
- datengetriebene Pakete
- saubere Lead-Struktur
- interne Admin-Struktur
- Rollen/Permissions als spaetere Erweiterung mitdenken

## Plattform-Akteure

### 1. Gast

Oeffentlich:
- sieht Startseite, Pakete, Ratgeber, Eigentuemer-/Partnerseiten
- fragt ein Paket an
- stimmt optional WhatsApp-Kommunikation zu

Spaeter eingeloggt:
- sieht eigene Anfrage/Buchung
- sieht Unterkunft, Erlebnis, Termin, Personen, Check-in, Empfehlungen
- nutzt Karte, Wetter, Ebbe/Flut, lokale Infos
- sieht spaeter kuratierte Veranstaltungen, die zum Aufenthaltszeitraum und zur Zielgruppe passen
- kann Morrow kontaktieren
- kann ein Problem/Ticket melden
- kann Zusatzservices anfragen

### 2. Morrow Admin / Founder

Kann:
- Pakete anlegen, bearbeiten, duplizieren, pausieren, veroeffentlichen
- Objekte anlegen und Paketen zuordnen
- Erlebnisanbieter anlegen und Paketen zuordnen
- Termine, Preise, Leistungen und Empfehlungen pflegen
- Leads verwalten
- Buchungsstatus pflegen
- Partnerkontakte verwalten
- interne Notizen und Aufgaben pflegen
- spaeter Nutzer, Rollen und Rechte verwalten

### 3. Morrow Mitarbeitende

Spaetere Rollen:
- Admin
- Operations
- Guest Support
- Partner Management
- Content/Marketing
- Finance/Revenue

Brauchen Login:
- ja

Grundsatz:
- Mitarbeitende sehen nur die Bereiche, die sie brauchen.
- Aktionen muessen nachvollziehbar sein: wer hat was wann geaendert?

### 4. Erlebnispartner

Beispiele:
- Wattwandern
- Reiten
- Yoga
- Wellness
- Private Cooking
- Gastronomie
- lokale Touren

Phase 1:
- oeffentliches Formular fuer Kooperationsanfrage
- interne Partnerdatenbank
- kein Partnerlogin

Phase 2:
- Erlebnispartner koennen Login bekommen
- Partner koennen Profil, Angebot, Verfuegbarkeit und Kontaktinfos pflegen
- Partner koennen Buchungs-/Anfrageinformationen zu ihren Leistungen sehen
- Partner koennen Status rueckmelden, z. B. bestaetigt, ausgebucht, Rueckfrage

Wichtig:
- Erlebnispartner sind kuratiert, nicht frei offen wie ein Marketplace.
- Partnerlogin ist ein Operations-Werkzeug, keine offene Anbieterregistrierung.

### 5. Eigentuemer

Phase 1:
- Landingpage + Formular `Immobilie vorstellen`
- interne Eigentuemer-Leads

Phase 2:
- Eigentuemerlogin optional
- Objektprofil pflegen oder pruefen
- Verfuegbarkeiten/gesperrte Zeitraeume melden
- Performance einsehen
- Buchungen/Anfragen sehen
- Dokumente/Absprachen speichern
- operative Status sehen

Wichtig:
- Eigentuemerbereich darf nicht wie kaltes SaaS wirken.
- Zielgefuehl: Transparenz, Entlastung, professionelle Betreuung.

### 6. Externe Agentur / Ferienvermietungsanbieter

Phase 1:
- liefert Objektinfos/Fotos und freie Termine
- kein Login noetig

Phase 2 optional:
- Agenturkontakt kann Verfuegbarkeiten bestaetigen
- Morrow kann operative Tickets weiterleiten
- eventuell eigenes Partnerprofil, wenn Agentur als Startbruecke relevant bleibt

Langfristig:
- direkte Eigentuemerbeziehungen sind strategisch wertvoller.

## Kernmodule Der Plattform

### A. Paket-CMS

Muss koennen:
- Paket erstellen
- Paket bearbeiten
- Paket duplizieren
- Paket pausieren/veroeffentlichen
- Zielgruppe festlegen
- Ort festlegen
- Objekt zuordnen
- Erlebnis zuordnen
- Empfehlungen zuordnen
- Veranstaltungen zuordnen oder fuer den Aufenthaltszeitraum empfehlen
- Termine pflegen
- Preise pflegen
- Bilder und Texte pflegen
- Vorschau ansehen

Phase-1-Implikation:
- Pakete nicht hart in UI-Komponenten verdrahten.
- `Package` als zentrale Datenstruktur bauen.

#### Paketfelder

Ein Paket braucht Felder auf vier Ebenen: Website, Buchbarkeit, Bausteine und interne Steuerung.

Website-/Verkaufsfelder:
- Paketname, z. B. `Family Escape`
- Slug/URL, z. B. `family-escape`
- Zielgruppe: Familie, Paar, spaeter weitere
- Ort/Region, z. B. Sankt Peter-Ording
- Kurzversprechen
- Hero-Headline
- Hero-Subline
- emotionaler Beschreibungstext
- fuer-wen-Liste
- enthaltene Leistungen
- nicht enthaltene Leistungen, optional
- Trust-/Servicepunkte
- FAQ
- SEO-Titel
- SEO-Beschreibung
- Ratgeber-/Artikelverknuepfungen

Buchbarkeits-/Preisfelder:
- Status: Entwurf, Veroeffentlicht, Pausiert, Archiviert
- feste Termine
- Preis ab
- konkreter Paketpreis
- Preisnotiz, z. B. pro Aufenthalt, bis 4 Personen
- maximale Personenanzahl
- feste Personenanzahl, z. B. Couple Reset immer 2
- Kinder erlaubt/mitgedacht
- Hund optional
- Anfrage-CTA
- Formularvariante: Family, Couple, spaeter weitere
- Storno-/Reservierungsnotiz, optional

Baustein-Felder:
- zugeordnetes Objekt
- Objektfotos
- Objektbeschreibung
- Bildrechte bestaetigt
- zugeordnetes Erlebnis
- Erlebnisanbieter
- Erlebnisbeschreibung
- paketbezogene Empfehlungen vor Ort
- Gastronomieempfehlungen
- optionale Zusatzservices

Interne Felder:
- interne Notizen
- Quelle des Objekts: Agentur, Eigentuemer, Morrow
- Agentur-/Eigentuemer-Kontakt
- Verfuegbarkeit bestaetigt ja/nein
- Foto-/Textrechte bestaetigt ja/nein
- Erlebnispartner bestaetigt ja/nein
- interne Marge/Kalkulation, spaeter
- Prioritaet
- Launch-Checkliste
- letzte Aktualisierung
- erstellt von / geaendert von

Pflichtfelder fuer Phase 1:
- Paketname
- Slug
- Zielgruppe
- Ort
- Kurzversprechen
- Hero-Headline
- Hero-Subline
- Status
- mindestens ein fester Termin
- Preisangabe
- Personenlogik
- Objektname oder Objekt-Platzhalterstatus
- Bild-/Rechtestatus
- enthaltene Leistungen
- Erlebnisrichtung oder konkretes Erlebnis
- Anfrageformular-Typ
- CTA

### B. Objektverwaltung

Daten:
- Objektname
- Ort
- Adresse/ungefaehre Lage
- Schlafplaetze
- Ausstattung
- Beschreibung
- Bilder
- Bildrechte bestaetigt
- Quelle: Agentur, Eigentuemer, Morrow
- Verfuegbarkeiten
- Check-in-Art
- Schluesseluebergabe
- Schluesselsafe-Code, falls vorhanden
- Schluesselabholung bei Agentur, falls noetig
- frueheste Anreisezeit
- spaeteste Anreisezeit
- Check-out-Zeit
- interne Notizen
- Qualitaetsstatus

Spaeter:
- Objekt kann mehreren Paketen oder Terminen zugeordnet werden.
- Objektstatus: `draft`, `in_pruefung`, `aktiv`, `pausiert`, `archiviert`.

#### Beziehung Zwischen Paket Und Unterkunft

Grundsatz:
- Unterkunft und Paket sind getrennte Datenobjekte.
- Ein Paket verweist auf mindestens eine konkrete Unterkunft.
- Die Paketdetailseite zeigt dadurch eindeutig, welche Unterkunft Teil des Pakets ist.
- Gaeste duerfen nicht das Gefuehl haben, ein abstraktes Paket ohne reales Objekt anzufragen.

Beziehungslogik:
- `Package` hat eine `propertyId` oder spaeter mehrere `propertyOptions`.
- Phase 1: ein Paket = eine konkrete Unterkunft pro Termin.
- Spaeter moeglich: ein Paketkonzept kann mehrere Unterkunftsoptionen haben, wenn Erlebnis, Ort, Zielgruppe und Preislogik gleich bleiben.
- Wenn mehrere Unterkuenfte moeglich sind, muss dem Gast vor verbindlicher Buchung klar bestaetigt werden, welches Objekt gebucht wird.

Admin-Anforderung:
- Im Paket-Editor muss eine Unterkunft ausgewaehlt oder neu angelegt werden koennen.
- Das Admin muss sichtbar zeigen: Dieses Paket ist mit dieser Unterkunft verbunden.
- Objektstatus und Rechte muessen vor Veroeffentlichung geprueft werden.
- Ein Paket darf nicht veroeffentlicht werden, wenn keine Unterkunft zugeordnet oder der Bild-/Rechtestatus unklar ist.

Pflichtpruefung vor Livegang:
- Unterkunft zugeordnet
- Objektbeschreibung vorhanden
- Bilder vorhanden
- Bild-/Textrechte bestaetigt
- Schlafplaetze passen zur Personenlogik des Pakets
- Verfuegbarkeit fuer Pakettermine bestaetigt
- Check-in- und Schluessellogik geklaert
- Anreisefenster geklaert

#### Check-in Und Schluessel

Diese Informationen sind operativ kritisch und muessen spaetestens vor Buchungsbestaetigung gepflegt sein.

Felder:
- Check-in-Art: Schluesselsafe, Agenturabholung, persoenliche Uebergabe, Smartlock, noch unklar
- Schluesselort: am Objekt, Agenturbuero, anderer Ort
- Schluesselsafe-Code, falls vorhanden
- Agenturadresse fuer Schluesselabholung
- Abholzeiten der Agentur
- frueheste Anreisezeit
- spaeteste Anreisezeit
- Check-out-Zeit
- Notfallkontakt bei spaeter Anreise
- Hinweis fuer Gast, z. B. "Code erhaltet ihr vor Anreise"

Sichtbarkeit:
- Oeffentliche Paketdetailseite: nur allgemeine, vertrauensbildende Info, z. B. "Check-in-Details erhaltet ihr vor Anreise".
- Guest Portal / Buchungsbereich: konkrete Schluessel- und Codeinformationen, sobald die Buchung bestaetigt und die Information freigegeben ist.
- Internes Admin: alle Details, inklusive Codes und Agenturhinweisen.

Sicherheitsregel:
- Schluesselsafe-Codes und genaue Zugangsdaten niemals oeffentlich auf Paketdetailseiten anzeigen.
- Codes nur nach Buchung/Reservierung und im passenden Gastbereich oder persoenlich kommunizieren.

Guest-Experience-Regel:
- Der Gastbereich soll diese Informationen besonders klar zeigen: Wann kann ich anreisen? Wo bekomme ich den Schluessel? Gibt es einen Code? Was mache ich bei spaeter Anreise?
- Ziel ist weniger Rueckfragen, weniger Stress und ein hochwertigeres Ankommen.

### C. Erlebnisanbieter- Und Erlebnisverwaltung

Unterscheidung:
- Erlebnisanbieter = Unternehmen/Person
- Erlebnis = konkretes Angebot

Anbieter-Daten:
- Name
- Ort
- Kategorie
- Website/Instagram
- Kontaktperson
- E-Mail/Telefon
- Adresse
- Treffpunkt, falls abweichend
- Zielgruppenfit
- Qualitaetsnotizen
- Kooperationsstatus
- Vertrags-/Absprachenstatus
- interne Notizen

Erlebnis-Daten:
- Titel
- Anbieter
- Beschreibung
- Dauer
- Saison
- Treffpunkt
- geeignet fuer Familien/Paare/beide
- Kapazitaet
- Preislogik intern
- Verfuegbarkeit
- Stornoregeln
- wetterabhaengig ja/nein
- Mindestalter
- geeignet fuer Kinder ja/nein
- Hund moeglich ja/nein
- was der Gast mitbringen muss
- was im Paket enthalten ist
- Paketzuordnung
- Status: Entwurf, aktiv, pausiert, archiviert

#### Beziehung Zwischen Paket Und Erlebnis

Grundsatz:
- Erlebnisanbieter und Erlebnis sind getrennte Datenobjekte.
- Ein Anbieter kann mehrere Erlebnisse anbieten.
- Ein Paket kann ein oder mehrere konkrete Erlebnisse enthalten.
- Das Paket verweist auf konkrete Erlebnisbausteine, nicht nur auf lose Kategorien.
- Jeder Erlebnisbaustein speichert zusaetzlich, ob er Pflichtbestandteil, optionaler Zusatz, Empfehlung oder nur als Richtung geplant ist.

Beispiele:
- Anbieter: Reitschule SPO
- Erlebnisse: Ponyreiten fuer Kinder, Strandritt fuer Erwachsene, Familien-Ausritt

- Anbieter: Yoga-Studio
- Erlebnisse: Private Couple Yoga, Morning Flow am Strand, Family Breath & Stretch

Paket-Verknuepfung:
- `Package` hat mehrere `experienceItems`.
- Jedes `experienceItem` verweist auf ein konkretes `experienceId`, wenn Anbieter und Erlebnis bestaetigt sind.
- Phase 1 kann mit Erlebnisrichtung starten, wenn noch kein Partner bestaetigt ist.
- Vor echter Buchung muss klar sein, welche Erlebnisse enthalten sind, welche optional sind und welche nur als Empfehlung dienen.

ExperienceItem-Felder im Paket:
- Erlebnis
- Anbieter
- Rolle im Paket: enthalten, optional, Empfehlung, geplant
- Zielgruppe
- Termin-/Zeitslot-Hinweis
- im Paketpreis enthalten ja/nein
- Bestaetigungsstatus
- Gast-Hinweise
- interne Notizen

Pflichtpruefung vor Livegang, wenn ein konkretes Erlebnis beworben wird:
- Erlebnisanbieter je Erlebnis angelegt
- Erlebnis je Erlebnisbaustein angelegt
- Zielgruppenfit bestaetigt
- Verfuegbarkeit fuer Pakettermin je enthaltenem Erlebnis geklaert
- Preis-/Kostenlogik intern je enthaltenem Erlebnis geklaert
- Storno-/Wetterlogik je Erlebnis geklaert
- Gast-Hinweise je enthaltenem Erlebnis vorhanden

### D. Lead- Und CRM-Modul

Leadtypen:
- Gastlead
- Eigentuemerlead
- Erlebnispartnerlead
- Agenturkontakt

Funktionen:
- Status pflegen
- Quelle/Kampagne speichern
- Notizen speichern
- naechste Aufgabe setzen
- Kontaktkanal speichern
- WhatsApp-Opt-in speichern
- Kommunikationshistorie speichern: E-Mail, WhatsApp, Telefon, Support, interne Notiz und spätere Template-Versände zentral pro Lead/Buchung/Kunde.

Kommunikationsregel:
- Standard-Kommunikationskanal ist immer E-Mail.
- Telefon dient fuer persoenliche Klaerung und Rueckfragen.
- WhatsApp ist nur ein optionaler Zusatzkanal, wenn der Gast aktiv zugestimmt hat.
- Wichtige Buchungs- und Vertragsinformationen muessen auch per E-Mail verfuegbar sein.

### E. Buchungs- Und Aufenthaltsmodul

Phase 2, nach Proof of Demand.

Daten:
- Buchung
- Paket
- Termin
- Gastdaten
- Zahlungsstatus
- Reservierungsstatus
- Objekt
- Erlebnis
- Ansprechpartner
- interne Aufgaben

Status:
- Anfrage
- In Klaerung
- Reserviert
- Bezahlt
- Vor Anreise
- Aktiv
- Abgeschlossen
- Storniert

#### Buchungs- Und Statusfluss

Der Ablauf wird in vier Ebenen getrennt: Lead, Reservierung, Buchung und Operations.

1. Lead

Noch unverbindlich. Der Gast hat Interesse gezeigt, aber nichts ist blockiert.

Status:
- Neu
- In Pruefung
- Kontaktiert
- Nicht passend
- Verloren

Typische Aktionen:
- automatische Danke-E-Mail senden
- Lead im Admin pruefen
- Gast kontaktieren
- Termin und Personen klaeren
- WhatsApp nur nutzen, wenn Opt-in vorhanden

2. Reservierung

Morrow prueft oder blockt Unterkunft und Erlebnisbestandteile.

Status:
- Reservierung angefragt
- Unterkunft in Pruefung
- Erlebnis in Pruefung
- Intern vollstaendig
- Angebot gesendet

Typische Aktionen:
- Unterkunft/Agentur/Eigentuemer anfragen
- Erlebnisanbieter anfragen
- Kosten und Verfuegbarkeit pruefen
- Paket intern finalisieren
- Angebot an Gast senden

3. Buchung

Der Gast hat zugesagt oder verbindlich gebucht.

Status:
- Buchung bestaetigt
- Zahlung offen
- Bezahlt
- Vor Anreise
- Aktiv
- Abgeschlossen
- Storniert

Typische Aktionen:
- Buchungsbestaetigung per E-Mail senden
- Zahlung pruefen
- Gastbereich freischalten
- Check-in-Informationen vorbereiten
- Zugangsinformationen erst nach Freigabe anzeigen
- Partner/Agentur/Eigentuemer informieren

4. Operations-Aufgaben

Interne Aufgaben, die aus Lead, Reservierung oder Buchung entstehen.

Aufgabentypen:
- Unterkunft bestaetigen
- Erlebnisbestandteile bestaetigen
- Zahlungsstatus pruefen
- Gastbereich freischalten
- Check-in-Infos freigeben
- E-Mail senden
- optionale WhatsApp-Nachricht senden
- Agentur/Eigentuemer informieren
- Erlebnispartner informieren
- Ticket oder Sonderfall bearbeiten

Kommunikationsregel im Statusfluss:
- E-Mail ist der Standardkanal fuer alle Status- und Buchungsnachrichten.
- WhatsApp ist nur zusaetzlich erlaubt, wenn der Gast zugestimmt hat.
- Wichtige Informationen muessen auch dann funktionieren, wenn kein WhatsApp-Opt-in vorliegt.

### F. Guest Companion / Portal

Nach Anfrage oder Buchung.

Funktionen:
- Buchungsuebersicht
- Unterkunftsdetails
- Erlebnisdetails
- Check-in
- Schluesseluebergabe
- Anreisezeitfenster
- Check-out-Zeit
- Zugangsinformationen nach Freigabe
- Ansprechpartner
- lokale Empfehlungen
- Karte
- Wetter
- Ebbe/Flut
- Support
- Tickets
- Zusatzservices

Grundsatz:
- Kein generisches Konto.
- Der Gastbereich fuehlt sich wie ein persoenlicher Reisebegleiter an.

### G. Partner- Und Owner-Portale

Partnerportal:
- Profil
- Angebote
- Verfuegbarkeit
- Anfragen/Buchungen
- Rueckmeldungen

Eigentuemerportal:
- Objekt
- Kalender/Verfuegbarkeit
- Performance
- Anfragen/Buchungen
- Dokumente
- operative Meldungen

Beide Portale sind Phase 2+, nicht Phase 1.

### H. Mitarbeiter-Admin

Funktionen:
- Nutzer einladen
- Rollen vergeben
- Rechte steuern
- Aktivitaetslog ansehen
- interne Aufgaben zuweisen

Rollenmodell:
- `super_admin`
- `admin`
- `operations`
- `guest_support`
- `partner_manager`
- `content_manager`
- `finance`
- `viewer`

### I. Content / Ratgeber / SEO-GEO

Funktionen:
- Artikel erstellen
- Artikel bearbeiten
- Artikel Paketen/Orten/Zielgruppen zuordnen
- FAQ pflegen
- interne Links zu Paketen setzen
- spaeter Ortsseiten pflegen

Phase-1-Implikation:
- Ratgeberdaten nicht komplett unstrukturiert bauen.
- Artikel sollten Slug, Zielgruppe, Ort und Paketbezug haben.

### J. Operations / Tickets

Tickettypen:
- Objektproblem
- Gastfrage
- Erlebnisproblem
- Anreiseproblem
- Partner-Rueckfrage

Funktionen:
- Ticket erstellen
- Prioritaet setzen
- zustaendige Person/Partner zuweisen
- Status pflegen
- interne und externe Kommentare trennen
- Loesung dokumentieren

## Datenobjekte Im Zielmodell

Zentrale Entitaeten:
- `users`
- `roles`
- `organizations`
- `packages`
- `package_content_sections`
- `stays`
- `properties`
- `experiences`
- `experience_providers`
- `owners`
- `agency_partners`
- `leads`
- `bookings`
- `availability_blocks`
- `recommendations`
- `articles`
- `tickets`
- `messages`
- `tasks`
- `audit_logs`

## Rollen Und Rechte Grobmatrix

| Bereich | Gast | Erlebnispartner | Eigentuemer | Morrow MA | Morrow Admin |
| --- | --- | --- | --- | --- | --- |
| Oeffentliche Seiten | Lesen | Lesen | Lesen | Lesen | Lesen |
| Eigene Buchung | Lesen | Nein | Nein | Je Rolle | Voll |
| Paket-CMS | Nein | Nein | Nein | Content/Ops begrenzt | Voll |
| Erlebnisdaten | Nein | Eigene | Nein | Partner/Ops | Voll |
| Objektdaten | Nein | Nein | Eigene/begrenzt | Ops | Voll |
| Leads | Nein | Nein | Nein | Je Rolle | Voll |
| Tickets | Eigene | Zugewiesene | Zugewiesene | Je Rolle | Voll |
| Nutzer/Rollen | Nein | Nein | Nein | Nein | Voll |

## Login- Und Rollenmodell

### 1. Gastlogin

Zeitpunkt:
- nach Anfrage oder Buchung, nicht als Hauptfunktion auf der oeffentlichen Startseite

Sieht:
- eigene Anfrage/Buchung
- Paket
- Unterkunft
- Erlebnisbestandteile
- Termin
- Personen
- Check-in
- Schluessel-/Zugangsinformationen nach Freigabe
- Empfehlungen
- Support/Tickets
- optional Zusatzservices

Darf nicht sehen:
- interne Kalkulation
- Morrow-Marge
- Partnerkonditionen
- Agenturkommunikation
- interne Notizen
- interne Qualitaetsbewertungen
- fremde Buchungen

### 2. Morrow Admin

Nutzer:
- Gruender
- spaeter wenige Vollzugriffsrollen

Sieht und bearbeitet:
- Pakete
- Objekte
- Erlebnisse
- Erlebnisanbieter
- Leads
- Buchungen
- Eigentuemer
- Agenturen
- Tickets
- Ratgeber/Content
- Nutzer, Rollen und Rechte
- Aktivitaetslog

Besonderheit:
- Vollzugriff muss bewusst begrenzt bleiben.

### 3. Morrow Mitarbeitende

Rollen:
- `operations`
- `guest_support`
- `partner_manager`
- `content_manager`
- `finance`
- `viewer`

Grundsatz:
- Mitarbeitende bekommen nur Zugriff auf die Bereiche, die sie fuer ihre Aufgabe brauchen.
- Sensible Felder wie Marge, Konditionen oder interne Scores sind rollenabhaengig.

Beispiele:
- Guest Support sieht Buchung, Gastkommunikation, Check-in und Tickets, aber keine Marge.
- Partner Management sieht Anbieter, Erlebnisse und Partnerstatus, aber nicht zwingend Finanzdaten.
- Content sieht Pakettexte, Bilder, Ratgeber und SEO, aber keine Zahlungsdaten.
- Finance sieht Preise, Zahlung, Rechnungsstatus und Kalkulation, aber nicht zwingend Supportkommunikation.

### 4. Erlebnispartnerlogin

Zeitpunkt:
- spaeter, wenn manuelle Partnerpflege zu aufwendig wird

Sieht:
- eigenes Anbieterprofil
- eigene Erlebnisse
- relevante Termine/Anfragen
- Status und Rueckfragen zu eigenen Leistungen
- operative Hinweise, die fuer die Durchfuehrung noetig sind

Darf nicht sehen:
- andere Anbieter
- Morrow-Margen
- vollstaendige Gastdaten, wenn nicht notwendig
- interne Qualitaetsscores
- interne Partnervergleiche
- Paketkalkulation

### 5. Eigentuemerlogin

Zeitpunkt:
- spaeter, wenn direkte Eigentuemerbeziehungen wachsen

Sieht:
- eigene Objekte
- Kalender/Verfuegbarkeit
- relevante Anfragen/Buchungen
- Performance/Reporting
- operative Meldungen
- Dokumente/Absprachen

Darf nicht sehen:
- andere Eigentuemer
- fremde Buchungen
- interne Morrow-Marge
- Erlebnispartner-Konditionen
- interne Leadquellen oder Marketingkalkulation

### 6. Agenturzugang

Status:
- optional, solange Agenturen als Startbruecke relevant sind

Sieht:
- eigene Objekte
- angefragte Termine
- relevante operative Tickets
- Status zu Aufenthalten, die ihre Objekte betreffen

Darf nicht sehen:
- Morrow-Gesamtpipeline
- andere Agenturen/Eigentuemer
- interne Paketmarge
- strategische Morrow-Daten

### Sicherheits- Und Datenregeln

- Jeder Login ist rollenbasiert.
- Interne Notizen sind standardmaessig nur fuer Morrow sichtbar.
- Margen, Einkaufspreise und Partnerkonditionen sind besonders geschuetzt.
- Aktivitaeten im Admin muessen spaeter auditierbar sein.
- Externe Rollen sehen nur Daten, die fuer ihre Leistungserbringung noetig sind.
- Gastdaten werden nur an Partner weitergegeben, wenn es fuer die Durchfuehrung erforderlich ist.

## Phase-Roadmap

### Phase 1: Demand MVP

Bauen:
- oeffentliche Plattform
- zwei Paketdetailseiten
- Leadformulare
- internes Lead-Admin
- Paketdaten als strukturierte Seed-Daten
- Erlebnisanbieter- und Eigentuemer-Anfrageformulare

Noch nicht bauen:
- Partnerlogin
- Eigentuemerlogin
- Mitarbeiter-Rollenverwaltung
- Buchungssystem
- Guest Portal

Aber vorbereiten:
- Datenmodelle
- Komponenten datengetrieben bauen
- klare Trennung von oeffentlich und intern

### Phase 2: Operatives Admin

Bauen:
- echtes Adminlogin
- Paket-CMS
- Objektverwaltung
- Erlebnisanbieter-/Erlebnisverwaltung
- Owner- und Partner-CRM
- Rollen fuer Morrow-Mitarbeitende
- Aktivitaetslog

### Phase 3: Buchung Und Companion

Bauen:
- Buchungsobjekt
- Guest Portal
- Support/Tickets
- lokale Infos, Karte, Wetter, Ebbe/Flut
- Zusatzservices

### Phase 4: Partner- Und Eigentuemerportale

Bauen:
- Erlebnispartnerlogin
- Eigentuemerlogin
- Verfuegbarkeit/Status/Performance
- operative Rueckmeldungen

## Admin-Roadmap

### Admin V1: Phase-1-Begleitung

Ziel:
- Nachfrage und Anfragen sauber verwalten.
- Plattformdaten noch schlank halten.

Bauen:
- einfacher interner Login oder geschuetzter Adminzugang
- Guest Leads ansehen
- Leadstatus aendern
- Paketbezug je Lead sehen
- Termin je Lead sehen
- Kontaktinformationen sehen
- WhatsApp-Opt-in sehen
- Eigentuemeranfragen sehen
- Erlebnisanbieteranfragen sehen
- Paketliste ansehen
- Paketstatus sehen
- Daten exportieren

Noch nicht noetig:
- vollstaendiger Paketeditor
- Rollen/Rechte
- Partnerlogin
- Buchungssystem

### Admin V1.5: Paket-CMS

Ziel:
- Morrow kann Pakete selbst pflegen, ohne Code-Aenderung.

Bauen:
- Pakete anlegen
- Pakete bearbeiten
- Pakete duplizieren
- Paket veroeffentlichen/pausieren
- Unterkunft einem Paket zuordnen
- Erlebnisbausteine einem Paket zuordnen
- Termine pflegen
- Preise pflegen
- Paketvorschau
- Launch-Checkliste je Paket

### Admin V2: Operative Datenverwaltung

Ziel:
- Objekte, Erlebnisanbieter und Partnerbeziehungen strukturiert verwalten.

Bauen:
- Objektverwaltung
- Erlebnisanbieter-Verwaltung
- Erlebnisverwaltung
- Owner-/Partner-CRM
- Agenturkontakte
- interne Aufgaben
- Notizen
- Bild-/Rechtepruefung
- Verfuegbarkeitspruefung

### Admin V3: Buchung Und Operations

Ziel:
- Aus Anfragen werden steuerbare Buchungen und Aufenthalte.

Bauen:
- Buchungsmodul
- Zahlungsstatus
- Reservierungsstatus
- Guest-Companion-Freigabe
- Check-in-Infos freigeben
- Zugangsinformationen verwalten
- Tickets
- Rollen/Rechte fuer Mitarbeitende
- Aktivitaetslog

### Portalphase Danach

Bauen:
- Gastlogin
- Erlebnispartnerlogin
- Eigentuemerlogin
- optional Agenturzugang

Grundsatz:
- Portale werden erst gebaut, wenn die internen Adminprozesse klar genug sind.
- Sonst digitalisiert Morrow unfertige Ablaufe zu frueh.

## Wichtige Architekturentscheidungen Vor Phase 1

1. Pakete werden als Datenmodell gebaut, nicht als feste Seitenlogik.
2. Package Pages rendern aus `Package`-Daten.
3. Leads speichern immer Paketbezug, Termin und Kontaktkanal; Standardkanal ist E-Mail.
4. Admin bleibt intern und wird nicht in die oeffentliche Navigation gehoben.
5. Auth/Rollen werden nicht in Phase 1 ausgebaut, aber die Datenstruktur darf sie nicht verhindern.
6. Erlebnisanbieter werden intern als Partnerobjekte gedacht, auch wenn Phase 1 nur ein Formular zeigt.
7. Objekte und Erlebnisse werden getrennt modelliert und erst im Paket zusammengefuehrt.
8. Jede spaetere Portalwelt hat eigene Rechte, Sprache und UX: Gast, Partner, Eigentuemer, Morrow-Team.

## Pre-Phase-1 Plattform-Checkliste

Diese Punkte muessen vor oder waehrend des Phase-1-Baus beruecksichtigt werden, ohne Phase 2 schon voll zu bauen.

### Muss In Phase 1 Bereits Richtig Angelegt Werden

- [ ] `Package` als zentrale Datenstruktur, nicht als feste UI-Seite.
- [ ] `Property`/Objekt gedanklich vom Paket trennen, auch wenn im MVP nur ein Objekt je Paket gezeigt wird.
- [ ] `ExperienceProvider` und `Experience` gedanklich trennen.
- [ ] Gastleads speichern Paket, Termin, Kontaktkanal, WhatsApp-Opt-in und Status.
- [ ] Eigentuemer- und Erlebnisanbieter-Leads als eigene Leadtypen behandeln.
- [ ] Adminbereich nicht oeffentlich verlinken.
- [ ] Interne Inhalte, Scores, Scraping-Daten und Agentenlogik nie ins oeffentliche UI rendern.
- [ ] Ratgeberartikel strukturiert mit Slug, Zielgruppe, Ort und Paketbezug anlegen.
- [ ] Komponenten so bauen, dass sie spaeter aus Supabase/Admin-Daten gespeist werden koennen.

### Darf In Phase 1 Noch Einfach Bleiben

- [ ] Pakete duerfen als lokale Seed-Daten starten.
- [ ] Admin darf zuerst Lead-Admin plus vorbereitete Paketliste sein.
- [ ] Kein echtes Rollen-/Rechtesystem noetig.
- [ ] Kein Partnerlogin.
- [ ] Kein Eigentuemerlogin.
- [ ] Kein Guest Portal.
- [ ] Keine echte Buchung/Payment.
- [ ] Keine freie Erlebnis-Auswahl.

### Sollte Nicht Verfrueht Gebaut Werden

- [ ] Komplexer Kalender.
- [ ] Offener Marketplace fuer Erlebnisanbieter.
- [ ] Vollstaendiges Owner-Dashboard.
- [ ] App-Welt vor Nachfragevalidierung.
- [ ] Automatisierte Partnerprozesse vor persoenlicher Kuratierung.
- [ ] Franchise-/Multi-Ort-Logik vor validiertem SPO-Modell.

## Plattform-Produktentscheidungen Fuer Den Naechsten Gespraechsschritt

1. Admin V1 startet mit Leads, Paketliste, Paketstatus, Eigentuemeranfragen, Erlebnisanbieteranfragen und Export.
2. Paketfelder sind fuer Phase 1 definiert; der vollstaendige Editor folgt in Admin V1.5.
3. Objekt-Pflichtfelder vor Livegang sind definiert, inklusive Bildrechte, Verfuegbarkeit, Check-in und Schluessel.
4. Erlebnisanbieter- und Erlebnisfelder sind definiert; Pakete koennen mehrere Erlebnisbausteine enthalten.
5. Lead-, Reservierungs-, Buchungs- und Operationsstatus sind definiert.
6. Standardkommunikation ist E-Mail; WhatsApp ist optionaler Zusatzkanal mit Opt-in.
7. Rollenmodell ist als Phase-2-Rahmen definiert, wird aber nicht in Phase 1 gebaut.
8. Externe Rollen duerfen keine Margen, Konditionen, internen Scores oder fremden Daten sehen.
9. Kritisch fuer Phase 1 ist datengetriebener Aufbau; Portale und Rollen koennen warten.
10. Naechster Schritt ist der saubere Neubau der Phase-1-Plattform auf Basis dieser Regeln.

## Offene Entscheidungen

- Welche Rollen braucht Morrow wirklich zuerst, wenn erste Mitarbeitende dazukommen?
- Soll das Paket-CMS zuerst nur intern sein oder spaeter auch Content-Freigaben haben?
- Wann lohnt sich ein Erlebnispartnerlogin wirklich, statt alles intern zu pflegen?
- Wann lohnt sich ein Eigentuemerlogin wirklich, statt persoenlich/reportingbasiert zu arbeiten?
- Welche Daten duerfen Partner/Eigentuemer sehen, ohne Morrows Kurations- und Margenlogik offenzulegen?
- Wird Supabase Auth die erste Auth-Loesung oder soll spaeter ein anderes Auth-System genutzt werden?
- Wie werden Bildrechte, Vertragsstatus und Partnerfreigaben sauber dokumentiert?
