# Morrow Master Frame

Dieses Dokument ist die zentrale Arbeitsgrundlage fuer Morrow. Vor groesseren Produkt-, Design- oder Codeentscheidungen zuerst hier lesen und die Checkliste aktualisieren.

Verbindliche Markenregel:
Vor jeder sichtbaren Website-, Produkt-, Content- oder UI-Aenderung muessen der Morrow Styleguide und `docs/STYLEGUIDE_OPERATING_RULES.md` gelesen werden. Der Styleguide ist kein Moodboard, sondern ein Abnahmekriterium.

Zusatzquellen:
- `docs/TIDE_BRAINSTORM_SYNTHESIS.md` enthaelt die Auswertung des fruehen TIDE-Brand-Sprint-Brainstormings.
- `docs/BRAND_ASSET_REGISTRY.md` enthaelt Styleguide-, Logo-, Font- und Farbregeln.
- `docs/STYLEGUIDE_OPERATING_RULES.md` übersetzt den Styleguide in verbindliche Abnahmeregeln.
- `docs/IMAGE_PERSONAS.md` definiert wiederkehrende Bild-Personas, damit neue Motive konsistent bleiben und keine Seite doppelte Bildmotive nutzt.
- `docs/PACKAGE_CONTENT_MODEL.md` definiert, wie Auszeiten spaeter admin-faehig als feste Morrow-Templates mit editierbaren Sections gepflegt werden.
- `docs/SEO_GEO_KEYWORD_PLAN.md` definiert Keyword-, Suchintention- und GEO-Regeln fuer Ratgeberartikel.
- `docs/PHASE1_INFORMATION_ARCHITECTURE.md` enthaelt die Seitenstruktur fuer Phase 1.
- `docs/PLATFORM_MODEL_PHASE2.md` enthaelt das spaetere Plattformmodell mit Rollen, Modulen, Admin, Partnern und Portalen.
- `docs/WIREFRAMES_PHASE1.md` enthaelt die strukturellen Wireframes vor UI-Design.
- `docs/COMPETITOR_ANALYSIS_SPO.md` enthaelt die Konkurrenzanalyse zu Golde SPO und Koch + Co.
- `docs/IMPLEMENTATION_BLUEPRINT.md` enthaelt Routen, Komponenten, Datenmodelle und QA fuer die Umsetzung.
- `docs/ADMIN_FUNCTION_ROADMAP.md` definiert, welche CRM-Aktionen je Adminbereich sinnvoll sind und welche Funktionen V1, V1.5 oder V2 sind.
- `docs/DAILY_OPERATIONS_SCENARIO_AUDIT.md` prueft den realen Morrow-Tagesbetrieb von Anfrage bis Nachbereitung und markiert, welche Szenarien der aktuelle Admin bereits abdeckt.
- `docs/AGENT_OPERATING_SYSTEM.md` enthaelt CEO-, Marketing- und Product-Agentenlogik fuer interne Arbeit.
- `docs/WEB_PRODUCTION_AGENTS.md` enthaelt den Pflichtablauf fuer Struktur, Umsetzung und Detail-QA bei Website-Arbeit.

Wichtig: TIDE war ein frueher Working Title. Der aktuelle Markenname ist Morrow. Ideen aus dem TIDE-Brainstorming sind Orientierung, aber nicht automatisch Phase-1-Scope.

## 1. Kernidee

Morrow ist eine kuratierte Hospitality-Plattform fuer hochwertige Ferienaufenthalte.

Aktueller One-Liner:
Morrow kuratiert Auszeiten in besonderen Kuestenorten: ausgewaehlte Unterkuenfte, lokale Erlebnisse und persoenliche Betreuung in einem Aufenthalt.

Wording-Regel:
- Oeffentlich sprechen wir von `Auszeit` und `Auszeiten`, nicht von `Paket` oder `Pakete`.
- `Paket` darf intern als Datenmodell, Admin-/Ops-Begriff oder technische Struktur weiter existieren.
- Oeffentliche Beispiele: `Auszeiten`, `Auszeit ansehen`, `Auszeit planen`, `kuratierten Auszeiten fuer Familien und Paare`.

Expansionsprinzip:
- Morrow fokussiert Orte direkt am Wasser.
- Start: Sankt Peter-Ording.
- Plausible naechste Orte: Scharbeutz, Timmendorfer Strand, Sylt.
- Spaeter denkbar: Mallorca oder weitere internationale Wasserorte.
- Es geht nicht um beliebige Urlaubsregionen, sondern um besondere Orte am Wasser.

Morrow verkauft nicht primaer Ferienwohnungen, sondern stimmige Auszeiten:
- ausgewaehlte Unterkunft
- lokales Erlebnis
- kuratierte Empfehlungen
- persoenliche Betreuung
- weniger Planungsstress

Das emotionale Ergebnis ist wichtiger als das Objekt allein: gemeinsame Zeit, Sicherheit, Ruhe, Erinnerungen und ein Gefuehl von guter Vorbereitung.

Zentraler Markt-Insight:
- Menschen wollen zunehmend an die Hand genommen werden.
- Sie wollen nicht nur Uebernachtung buchen und danach allein planen.
- Das klassische Agentur-/Vermietungsmodell wirkt fuer viele nicht mehr ausreichend.
- Gesucht wird ein umfassender Aufenthalt: Unterkunft, Erlebnis, Empfehlungen, Betreuung und das Gefuehl, dass jemand mitgedacht hat.
- Morrow verkauft eine schoene Zeit, nicht nur Naechte.

## 2. Positionierung

Morrow ist:
- kuratierte Urlaubserlebnis-Marke
- Hospitality-Operator
- Plattform fuer Unterkunft + Experience-Pakete
- lokaler Experience-Layer
- Tourismusguide fuer kuratierte Regionen
- Digitalisierungspartner fuer lokale Anbieter
- spaeter Operating-System fuer hochwertige Ferienaufenthalte

Morrow ist nicht:
- kein neues Airbnb
- keine generische Such- oder Buchungsmaschine
- keine klassische Ferienvermietungsagentur
- kein SaaS-first-Tool
- kein reines Dashboard-Produkt

## 3. Zielgruppen

### Gaeste

Gaeste wollen nicht primaer:
- hunderte Optionen
- eine weitere Buchungsplattform
- Quadratmeter und Betten vergleichen

Gaeste wollen:
- eine besondere Zeit mit Familie oder Freunden
- Sicherheit, dass der Urlaub gut wird
- weniger Planung
- vertrauenswuerdige Qualitaet
- lokale Erlebnisse
- reibungslose Kommunikation

Primaere Gaeste fuer Phase 1:
- Familien
- Paare ab 28/30

Sekundaer / spaeter:
- Familien in Gruendung

### Eigentuemer

Eigentuemer wollen nicht primaer:
- noch ein Tool
- ein leeres Dashboard
- eine Blackbox-Agentur

Eigentuemer wollen:
- mehr Umsatz
- bessere Auslastung
- weniger operativen Aufwand
- professionelle Positionierung
- Transparenz
- lokale Betreuung
- klare naechste Schritte

Strategischer Zielzustand:
- Morrow arbeitet direkt mit Eigentuemern zusammen.
- Wenn Eigentuemer mit Morrow arbeiten, ersetzt Morrow im Hintergrund die klassische Agenturrolle.
- Morrow uebernimmt dann Positionierung, Gaestekommunikation, Paketlogik, lokale Betreuung und operative Steuerung.
- Fremdagenturen sind nur eine Phase-1-Bruecke, um das Angebot frueh am Markt zu positionieren.

## 4. Produktwelten

Diese Welten muessen getrennt gedacht und gestaltet werden.

### Oeffentliche Plattform

Zweck: Morrow als Plattform verstaendlich machen und Nachfrage auf kuratierte Auszeiten lenken.

Muss zeigen:
- Morrow kombiniert Unterkunft + Erlebnis + Betreuung
- es gibt kuratierte Auszeiten statt endloser Suche
- Startregion ist Sankt Peter-Ording
- Einstieg in Phase 1 erfolgt ueber Auszeiten + Ort
- Gaeste und Eigentuemer haben unterschiedliche Einstiege
- Startseite priorisiert Gaeste, Eigentuemer sind sekundaer aber sichtbar
- lokale Partner und Erlebnisse werden durch Morrow nahbar und buchbar
- eigener Ratgeber/Blog fuer SEO/GEO und regionale Autoritaet
- paketbezogene Empfehlungen vor Ort
- Marke wirkt hochwertig, ruhig und menschlich

### Auszeitdetail- Und MVP-Landingpages

Zweck: einzelne Angebote mit Ads testen.

Beispiel:
- `/auszeiten/family-escape`
- Family Escape
- 12.-16. August oder 19.-23. August
- 1.190 EUR
- bis 4 Personen
- Leadformular statt Checkout

Auszeitdetailseiten funktionieren zugleich als Ads-Landingpages. Sie sind Teil der Plattform und ersetzen nicht die Startseite.

### Login / Portal / App-Welt

Zweck: nach Anfrage oder Buchung persoenliche Informationen anzeigen.

Wichtig:
- Web-Plattform ist responsive Website.
- App-Welt darf app-artiger aussehen, aber nicht als Handy-Mockup auf Desktop eingebaut werden.
- Login kommt erst, wenn User gebucht oder angefragt hat.
- Kein User-Account als Kern des MVPs.
- Kein sichtbarer Login als primaerer Startseitenbestandteil in Phase 1.

Spaetere Portal-/Reisebereich-Vision:
- persoenlicher Reisebereich nach Anfrage/Buchung
- kein generisches Nutzerkonto, sondern ein Companion fuer den Aufenthalt
- Paketuebersicht, Termin, Personen, Status
- Unterkunftsdetails
- Erlebnisdetails
- Check-in-Informationen
- Ansprechpartner
- ortsgebundene Informationen
- oeffentliche Veranstaltungen
- Wochenmarkt
- Straende
- Entdeckungen im Ort
- Empfehlungen vor Ort
- Wetterbericht
- Ebbe-und-Flut-Anzeige
- spaetere Zusatzservices wie Private Cooking, Yoga oder aehnliches
- interaktive Karte mit Filtern
- Routenstart auf dem Smartphone ueber hinterlegten Kartendienst
- optionale Chatfunktion mit Morrow-Support
- Eskalations-/Ticketsystem, wenn am Objekt etwas kaputt ist oder nicht funktioniert
- Ticketweiterleitung an Ferienvermietungsanbieter oder spaeter interne Morrow-Operation

### Intern / Admin

Zweck: Leads und operative Arbeit verwalten.

Intern darf enthalten:
- Leadstatus
- Partnerlisten
- Angebotsdaten
- Paketverwaltung
- Objekt-, Termin-, Preis- und Erlebniszuordnung
- Rollen- und Rechteverwaltung fuer Morrow-Mitarbeitende
- spaetere Partner- und Eigentuemerportale
- Scraping-Daten
- Agenten-/Workflow-Dokumentation

Das darf nicht sichtbar auf der oeffentlichen Website stehen.

Wichtig fuer den Aufbau:
- Pakete duerfen nicht dauerhaft hart im Code gepflegt werden.
- Morrow muss im Admin spaeter selbst Pakete anlegen, bearbeiten, duplizieren, pausieren und veroeffentlichen koennen.
- Paketdaten werden als redaktionelle/operative Daten gedacht, nicht als statische Website-Texte.
- Der Code liefert Struktur, Validierung und Darstellung; Inhalte wie Termine, Preise, Objektinfos, Bilder, Empfehlungen und Erlebnisbestandteile kommen langfristig aus Admin/CMS/Datenbank.
- Erlebnisanbieter, Eigentuemer und Morrow-Mitarbeitende brauchen spaeter eigene Login-/Rollenlogiken, aber nicht im Phase-1-Funnel.
- Phase 1 muss so gebaut werden, dass diese Rollen spaeter anschliessbar sind.
- Admin-Aktionen werden bewusst nach Bereich getrennt: Leads brauchen Oeffnen, Notizen, Wiedervorlage und Archivieren; Auszeiten brauchen spaeter Bearbeiten, Pausieren und Duplizieren; Erlebnisse, Eigentuemer und Erlebnisanbieter brauchen eigene Profile und Zuordnungen.
- Loeschen ist keine Standardaktion. In Phase 1 nur fuer Testdaten oder Spam, spaeter mit Rollenrechten, Bestaetigung und Audit-Log.

## 5. MVP-Fokus

Das aktuelle MVP validiert Proof of Demand.

Phase-1-Angebotslogik:
- 1 Auszeit fuer Familien
- 1 Auszeit fuer Paare ab 28/30
- keine breite Auszeiten-Bibliothek
- keine freie Erlebnis-Auswahl
- jede Auszeit muss Zielgruppe, Gefuehl, Unterkunftsart, Erlebnis und Anfrage-CTA klar machen
- Auszeitnamen duerfen nicht an eine feste Dauer gebunden sein, also kein `Weekend` oder `Week`
- Auszeitnamen stehen unter der Dachmarke Morrow, enthalten aber nicht selbst `Morrow`
- Auszeiten koennen spaeter unterschiedliche Zielansprachen fuer denselben Reisezeitraum haben
- Plattform-Einstieg in Phase 1: `Auszeiten in Sankt Peter-Ording`
- Keine abstrakte Reisestil-Suche als erster Einstieg
- Preislogik Phase 1: Plattform zeigt `ab`-Preise, Paketdetail-/Landingpage zeigt konkrete Preise
- Spaeter kann eine andere Preislogik eingefuehrt werden
- Primaerer Gaeste-CTA in Phase 1: `Auszeit planen`
- Spaetere CTA-Testvariante: `Aufenthalt anfragen`
- Primaerer Eigentuemer-CTA in Phase 1: `Immobilie vorstellen`
- Startseitenprioritaet Phase 1: Gaeste zuerst, Eigentuemer als eigener sichtbarer Abschnitt weiter unten
- Login/Portal erscheint in Phase 1 erst nach Anfrage oder Buchung, nicht als oeffentlicher Haupt-CTA
- Ratgeber/Blog ist in Phase 1 als eigenstaendige Plattformseite sichtbar
- Ratgeber ist nicht nur Vor-Anfrage-Hilfe. Er ist ein SEO-/GEO-Baustein fuer Suchfragen rund um Auszeiten, Urlaub, Erlebnisse, Ort, Saison, Veranstaltungen und praktische Orientierung in Sankt Peter-Ording.
- Ratgeber beantwortet reale Suchintentionen und fuehrt weich zu passenden Auszeiten und Anfragen.
- Jeder Ratgeberartikel braucht vor dem Schreiben eine Keyword- und Suchintention-Analyse mit Hauptkeyword, Nebenkeywords, Longtail-Fragen, lokalen Entitaeten, FAQ und weichem Morrow-Bezug.
- Ziel ist nicht Keyword-Stuffing, sondern Seite-1-faehige, zitierfaehige Inhalte fuer Google und GEO-Systeme, die konkreter und hilfreicher sind als generische Ausflugslisten.
- Jede Auszeit enthaelt zugeschnittene Empfehlungen vor Ort
- Auszeiten werden mit echten Objekten, Beschreibungen und Fotos der Ferienagenturen veroeffentlicht
- Objekte werden von Morrow kuratiert
- Die Agentur nennt freie Termine; das ist die einzige operative Abstimmung fuer die Auszeit
- Morrow baut die Auszeit selbst aus Objekt, Erlebnis, Empfehlungen und Betreuung
- Gaeste sollen sehen, welches konkrete Objekt Teil der Auszeit ist
- Gastformulare sind auszeitspezifisch; die Auszeit wird aus der Detailseite gespeichert und nicht abgefragt
- Termine werden aus festen Auszeit-Terminen ausgewaehlt, kein Kalender in Phase 1
- Standard-Kommunikationskanal ist E-Mail
- Gaeste koennen optional zustimmen, dass Morrow sie per WhatsApp fuer wichtige Nachrichten zur Anfrage/Reise kontaktieren darf
- WhatsApp ist kein Pflichtfeld und darf ohne explizite Zustimmung nicht als Kontaktkanal genutzt werden
- Eigentuemerformular fragt nur grundlegende Qualifizierungsdaten ab, keine sensiblen Umsatz-/Auslastungsdaten

First-Screen-Richtung fuer die Plattform:
- Balance aus Hospitality-Marke und klarer Plattformfunktion
- Kein reiner Editorial-Hero ohne Handlung
- Keine kalte Suchmaschine / kein Booking-Look
- Sofort sichtbar: Ort `Sankt Peter-Ording`
- Sofort sichtbar: die zwei Auszeiten `Family Escape` und `Couple Reset`
- Primaerer CTA: `Auszeit planen`

Arbeitsheadline:
`Kuratierte Auszeiten in Sankt Peter-Ording.`

Arbeits-Subline:
`Morrow verbindet ausgewaehlte Unterkuenfte, lokale Erlebnisse und persoenliche Betreuung zu kuratierten Auszeiten fuer Familien und Paare.`

Phase-1-Hauptnavigation:
- `Auszeiten`
- `Ratgeber`
- `Fuer Eigentuemer`

Primary CTA:
- `Auszeit planen`

Nicht in der primaeren Navigation:
- Login
- Unterkuenfte
- Erlebnisse
- Ueber uns
- Erlebnisanbieter
- Sankt Peter-Ording als eigener Menuepunkt

Footer-/sekundaere Links:
- `Erlebnis anbieten` fuehrt zu `/partner/erlebnisanbieter`

Zu validieren:
- Klicken Familien auf Ads?
- Fuehrt die Landingpage zu Anfragen?
- Zahlen Menschen fuer stressfreien Urlaub?
- Gibt es echte Buchungen nach persoenlichem Call?

Nicht Ziel des MVPs:
- perfekte Plattform
- Direktbuchung
- Kalender-Sync
- komplexe Accounts
- App
- Erlebnis-Auswahl
- vollautomatisierter Betrieb
- vollstaendiger Tourismusguide
- Community/Club
- Franchise-System
- Lehrplattform
- umfangreiche Partner-Digitalisierung

Phase 1 soll nicht alle langfristigen Ideen abdecken. Phase 1 soll den kleinsten glaubwuerdigen Morrow-Kern testen: ein kuratiertes Aufenthaltspaket, klare Nachfrage, persoenliche Anfrage, echte Buchungsbereitschaft.

Praezisierung: Phase 1 testet zwei kuratierte Aufenthaltspakete, je eines pro Startzielgruppe.

### Paket Fuer Paare

Arbeitsname fuer Phase 1:
- `Couple Reset`

Gespraecht fuer spaeter:
- `Slow Escape`
- `Coast Reset`

Kernversprechen:
- raus aus dem Alltag
- Abstand von Arbeitsstress oder privatem Stress
- ein paar Tage, die sich laenger und erholsamer anfuehlen
- sich als Paar wiederfinden
- Zweisamkeit geniessen
- schoene Zeit ohne Planungsaufwand

Typische Anlaesse:
- Geburtstag
- Jahrestag
- spontane Auszeit
- bewusste gemeinsame Zeit

Wichtig:
- Erlebnisse sind schon im Paket enthalten
- Paare muessen sich um nichts kuemmern
- Anreisen, wohlfuehlen, Zeit zusammen geniessen
- Spaeter koennen daraus weitere Paarpakete entstehen, z. B. Geburtstag, Jahrestag oder Reset, auch wenn Reisezeitraum/Unterkunft aehnlich bleiben
- Couple-Pakete sind grundsaetzlich fuer 2 Personen
- Je nach Objekt kann Hund optional mitgedacht werden
- Bildwelt: ruhige Unterkunft, hochwertige Details, Abendstimmung am Wasser, Dinner, Wellness, Spaziergang, Zweisamkeit
- Erlebnisrichtungen: Wellness, Yoga, gemeinsames Kochen, ruhige private oder halbprivate Experiences, Gastronomie
- Optionaler Anlass im Formular als Select: Jahrestag, Geburtstag, einfach raus aus dem Alltag, Ueberraschung, anderer Anlass

### Paket Fuer Familien

Arbeitsname fuer Phase 1:
- `Family Escape`

Kernversprechen:
- gemeinsame Familienzeit ohne Planungsstress
- Eltern werden entlastet
- Kinder sind mitgedacht
- Unterkunft, Erlebnis und Empfehlungen passen zusammen
- Ankommen, wohlfuehlen, als Familie eine gute Zeit haben

Wichtig:
- Der Fokus liegt auf Familie und Kindern
- Nicht nur Kinderbeschaeftigung, sondern ein stimmiger Aufenthalt fuer Eltern und Kinder
- Erlebnisse sind schon im Paket enthalten
- Personenanzahl ist variabel, aber durch Objekt und Schlafplaetze begrenzt
- Morrow definiert pro Paket eine maximale Personenanzahl
- Je nach Objekt kann Hund optional mitgedacht werden
- Bildwelt: helle Unterkunft, kinderfreundliche Details, Familie am Strand, gemeinsames Essen/Spielen, Natur, Bewegung, Leichtigkeit
- Erlebnisrichtungen: Wattwandern, Reiten, Naturerlebnisse, kindertaugliche lokale Aktivitaeten

## 5.1 Inventar- Und Agenturlogik

Phase 1 basiert auf Objekt- und Terminzugang ueber Ferienagenturen.

Einordnung:
- Zusammenarbeit mit Fremdagenturen ist eine Startloesung.
- Sie dient dazu, frueh echte Objekte, freie Termine und Marktnachfrage testen zu koennen.
- Langfristig baut Morrow exklusive/direkte Eigentuemerbeziehungen auf.
- Im direkten Eigentuemer-Modell faellt die Fremdagentur weg und Morrow agiert als Hospitality-Operator im Hintergrund.

Ablauf:
1. Morrow waehlt und kuratiert ein geeignetes Objekt.
2. Die Agentur stellt oder erlaubt die Nutzung von Objektbeschreibung und Fotos.
3. Die Agentur nennt die freien Termine.
4. Morrow baut das Paket selbst: Objekt, Erlebnis, Empfehlungen und Betreuung.
5. Paket wird online gestellt.
6. Gaeste sehen das konkrete Objekt und fragen das Paket an.

Wichtig:
- Keine anonymen oder rein beispielhaften Objekte als verkaufbares Paket darstellen.
- Wenn ein Objekt gezeigt wird, muss Nutzungsrecht fuer Fotos/Beschreibung geklaert sein.
- Verfuegbarkeit muss vor Veroeffentlichung von der Agentur genannt oder bestaetigt sein.
- Die Agentur baut nicht das Paket; Morrow baut und verantwortet die Paketlogik.
- Morrow bleibt Kurator und Experience-Layer, nicht nur Weiterleitung zur Agentur.

## 5.3 Erlebnis- Und Anbieterlogik

Morrow baut fuer jeden Ort eine interne Datenbank lokaler Erlebnisanbieter und Gastronomiepartner auf.

Quellen:
- Internetrecherche / Scraping
- lokale Anbieter-Websites
- Tourismusinformationen
- Google Maps / Branchenlisten
- spaeter direkte Empfehlungen und Partnernetzwerk

Workflow:
1. Anbieter je Ort erfassen.
2. Anbieter nach Zielgruppe, Qualitaet, Saisonalitaet und Paketfit bewerten.
3. Geeignete Anbieter persoenlich ansprechen.
4. Kooperationen fuer konkrete Pakete aufbauen.
5. Erlebnis in Paket integrieren.
6. Gastronomiepartner als Empfehlungen oder Paketbestandteil ergaenzen.

Erlebnisanbieter koennen sich in Phase 1 ueber eine eigene sekundäre Seite melden:
- URL: `/partner/erlebnisanbieter`
- Link im Footer: `Erlebnis anbieten`
- Nicht in der Hauptnavigation, damit der Gaeste-Funnel klar bleibt.
- Ziel ist keine offene Marketplace-Registrierung, sondern eine kuratierte Partneranfrage.

Beispiele:
- Couple Reset: Wellness, Yoga, gemeinsames Kochen, Dinner, ruhige Zwei-Personen-Erlebnisse.
- Family Escape: Wattwandern, Reiten, Natur, kindertaugliche Aktivitaeten, familienfreundliche Gastronomie.

Wichtig:
- Erlebnisse sind paketabhaengig und werden kuratiert, nicht frei beliebig ausgewaehlt.
- Erlebnisanbieter sind Teil des Morrow-Qualitaetsversprechens.
- Gastronomie kann als Empfehlung, Reservierungshilfe oder spaeter als Paketbestandteil integriert werden.

Spaetere Zusatzservices:
- Private Cooking
- Yoga
- Wellness
- weitere kuratierte Services je Ort und Zielgruppe

Spaetere Support- und Eskalationslogik:
- Chat mit Morrow-Support fuer Gaeste
- strukturiertes Ticket, wenn etwas am Objekt defekt ist oder nicht funktioniert
- Weiterleitung an Ferienvermietungsanbieter in Phase 1/Agenturmodell
- spaeter Weiterleitung an interne Morrow-Operations oder lokale Dienstleister
- Ziel: Gaeste haben einen klaren Ansprechpartner, Morrow behaelt Transparenz ueber operative Qualitaet

## 5.2 Eigentuemerstrategie

Phase 1:
- Morrow nutzt Agenturen als Zugang zu Objekten und Terminen.
- Ziel ist Marktpositionierung, Proof of Demand und erste Paketverkaeufe.

Phase 2:
- Morrow spricht Eigentuemer direkt an.
- Ziel sind direkte Vereinbarungen, Co-Hosting oder exklusive Verwaltungsmodelle.

Langfristig:
- Morrow ist kein Vermittler zwischen Gast und Agentur.
- Morrow ist der Hospitality-Operator fuer ausgewaehlte Ferienimmobilien.
- Eigentuemer bekommen bessere Positionierung, mehr Auslastung, weniger operative Last und transparente Betreuung.

Offene Skalierungsfrage:
- Noch nicht entschieden ist, ob Morrow in jedem neuen Ort selbst Eigentuemer anspricht und als lokale Agentur/Operator fungiert.
- Eigene Operator-Struktur pro Ort kann schwer skalierbar sein, weil Bueros, Mitarbeitende und lokale Betreuung benoetigt werden.
- Spaeter gemeinsam klaeren: direkte Morrow-Standorte, lokale Partnerstruktur, Franchise-/Lizenzmodell oder hybrides Modell.

## 6. Brand- und Designrahmen

Primäre Styleguide-Referenz:
- Original: `/Users/gerwins/Desktop/Morrow/Morrow Brand/morrow-styleguide.pdf`
- Projektseiten: `data/styleguide_pages/page-01.png` bis `page-23.png`
- Operative Regeln: `docs/STYLEGUIDE_OPERATING_RULES.md`

Morrow soll wirken:
- ruhig
- hochwertig
- warm
- nordisch
- menschlich
- bewusst kuratiert
- editorial
- familiaer
- zugeschnitten
- community-faehig

Morrow soll nicht wirken:
- laut
- billig
- ueberladen
- startup-techy
- SaaS-kalt
- wie eine generische Buchungsplattform

Styleguide-Prinzipien:
- viel Whitespace und klare Hierarchie
- starke Wortmarke mit Clear Space
- Icon als Authentizitätszeichen für kleine Markenmomente
- warme, familiäre Farben: Brown `#694722`, Olive `#6F6841`, Offwhite `#ECE6D6`, Offblack `#181715`
- reduzierte UI mit ruhigen Pill-Formen und 8px-Radien für Cards
- Hanken Grotesk für Information; Kobel/Kobe erst nach Webfont-Lizenz als Display-Schrift
- große, selbstbewusste Typografie nur dort, wo sie Markenwirkung trägt
- Experience-Bilder und Real-Estate-Bilder klar trennen
- Illustrationen organisch, handgezeichnet, warm und Morrow-eigen
- UI-Icons aus MingCute, keine Emojis als Interface-Elemente
- keine dekorative Überladung
- keine sichtbaren internen Begriffe auf öffentlichen Seiten

Styleguide-Abnahmeachsen:
- Local Connection
- Human Warmth
- Simplicity & Mindfulness
- Quality & Care
- confident, inspirational, approachable, knowledgeable

Jede neue Seite muss zeigen:
- meaningful moments
- personal guidance/hosts
- quiet places away from the rush

UX-Grundregel:
- Mobile first planen und bauen, weil der meiste Traffic mobil erwartet wird.
- Desktop ist die erweiterte Layout-Version, nicht die primaere Denkweise.
- Mobile Interaktionen duerfen app-naher sein, solange sie sauber responsive bleiben.

Farbanker:
- Offblack: `#181715`
- Offwhite: `#ece6d6`
- Sage/Oliv: aus Styleguide-Kombination
- Clay/Braun: aus Styleguide-Kombination
- Weiss/Paper nur als ruhiger Arbeitsraum

## 7. Plattform-Struktur, noch zu entscheiden

Diese Punkte muessen wir gemeinsam klaeren, bevor die Plattform final gebaut wird.

- [x] Phase-1-Hauptnavigation definiert: Pakete, Ratgeber, Fuer Eigentuemer
- [x] Erste oeffentliche Pakete definiert: Family Escape und Couple Reset
- [x] Plattform zeigt in Phase 1 nur `ab`-Preise, Details/Landingpages konkreter
- [x] Einstieg erfolgt ueber Pakete + Ort, nicht ueber abstrakte Reisestil-Suche
- [x] Primaerer Gaeste-CTA in Phase 1 ist `Auszeit planen`
- [x] Primaerer Eigentuemer-CTA in Phase 1 ist `Immobilie vorstellen`
- [x] Login/Portal erscheint erst nach Anfrage oder Buchung
- [x] Spaetere Portal-/Companion-Inhalte als Vision definiert
- [ ] Welche Inhalte gehoeren in einen Eigentuemerbereich?
- [ ] Welche Texte duerfen aus Conversion-Sicht direkt sein, ohne die Marke billig wirken zu lassen?
- [x] Morrow baut regionale Autoritaet ueber Ratgeber, Paketempfehlungen und spaetere Ortsinfos auf
- [x] Ratgeber/Blog ist als eigene Plattformseite fuer SEO/GEO geplant
- [x] Pakete enthalten zugeschnittene Empfehlungen vor Ort
- [x] Partner-Digitalisierung ist nicht erstes sichtbares Produkt; Erlebnisanbieter erhalten nur eine kuratierte Partneranfrage
- [x] Community/Club ist nicht Phase 1
- [x] TIDE ist nur historischer Working Title; aktueller Markenname ist Morrow
- [x] Phase 1 startet mit je einem Paket fuer Familien und Paare
- [x] Phase-1-Informationsarchitektur als Arbeitsstruktur angelegt
- [x] Keine eigene `/pakete`-Uebersicht in Phase 1; Paketauswahl erfolgt auf `/`
- [x] Keine eigene `/sankt-peter-ording`-Seite in Phase 1; Ort wird auf Startseite, Paketseiten und Ratgeber getragen
- [x] Drei Phase-1-Ratgeberartikel fuer SEO/GEO definiert
- [x] Phase-1-Sitemap final bestaetigt
- [x] Startseiten-Wireframe als Strukturentwurf angelegt
- [x] Paketdetail-Wireframes fuer Family Escape und Couple Reset angelegt
- [x] Eigentuemer-Wireframe angelegt
- [x] Erlebnisanbieter-Wireframe angelegt
- [x] Ratgeber-Wireframes angelegt
- [x] Implementation Blueprint angelegt
- [x] Konkurrenzanalyse SPO erstellt
- [x] Gastformularlogik definiert: paketspezifisch, feste Termine, kein Kalender
- [x] Eigentuemerformular definiert
- [x] Erlebnisanbieter-Partnerseite und Formular definiert
- [x] Paketverwaltung im Admin als Zielstruktur definiert
- [x] Phase-2-Plattformmodell mit Rollen, Modulen und Portalen angelegt

## 8. Aktueller Umsetzungsstand

- [x] Brand Assets lokal eingebunden
- [x] Hanken Grotesk lokal eingebunden
- [x] Styleguide-Seiten als PNG in `data/styleguide_pages/` vorhanden
- [x] Brand Asset Registry angelegt
- [x] Alter Family-Escape-Prototyp vorhanden; wird beim Neubau in die Plattformroute `/pakete/family-escape` ueberfuehrt
- [x] Leadformular-Prototyp mit `localStorage`
- [x] internes Admin-MVP fuer Leads
- [x] TIDE-Brainstorming intern ausgewertet
- [x] Phase-1-Scope von langfristigen TIDE-Ideen getrennt
- [x] Phase 1 startet mit je einem Paket fuer Familien und Paare
- [x] Plattform-Startseite konzeptionell final fuer Phase 1
- [ ] Plattform-Startseite visuell final nach CI und Detail-QA
- [x] Login-/Portal-Konzept als spaetere Companion-Welt final fuer Phase 1 abgegrenzt
- [x] Eigentuemer-Konzept fuer Phase 1 final
- [x] Phase-1-Routing technisch umgesetzt
- [x] Paketdetailseiten technisch umgesetzt
- [x] Ratgeber technisch umgesetzt
- [x] Eigentuemer- und Erlebnisanbieterformulare technisch umgesetzt
- [x] Admin V1 mit Leads, Status und Paketliste technisch umgesetzt
- [x] Admin-Funktionsroadmap fuer Bearbeiten, Deaktivieren, Archivieren und Loeschen dokumentiert
- [x] Paketdaten als Seed-Daten und austauschbare Datenquelle vorbereitet
- [ ] Supabase statt `localStorage` vollständig: Leads/Auth/E-Mail/Aufgaben/Auszeiten sind angebunden; Vor-Ort-Daten, Erlebnisanbieter, Agenturen, freie Objektprofile, Kunden und Buchungen als Admin-Quelle sind noch offen.
- [ ] echte E-Mail-Automation
- [ ] vollstaendige Admin-Paketverwaltung statt Seed-Datenpflege im Code
- [ ] Partner-/Anbieter-Datenbank produktionsnah

## 9. Arbeitsregeln Fuer Codex

Vor jeder neuen Umsetzung:
- [ ] Dieses Dokument lesen.
- [ ] Bei Website-/Funnel-Arbeit `docs/WEB_PRODUCTION_AGENTS.md` anwenden.
- [ ] Pruefen, welche Produktwelt betroffen ist.
- [ ] Keine internen Inhalte auf oeffentliche Seiten setzen.
- [ ] Styleguide-Prinzipien gegenpruefen.
- [ ] Mobile-first UX gegenpruefen.
- [ ] Nur die vereinbarte Seite oder Funktion bearbeiten.
- [ ] Nach Umsetzung Build/Lint/Smoke-Test ausfuehren.
- [ ] Screenshot visuell pruefen.
- [ ] Diese Checkliste aktualisieren, wenn ein Punkt erledigt ist.

## 10. Offene Gespraechsfragen

Diese Fragen sind fuer unseren naechsten Konzeptschritt.

1. One-Liner aktuell gesetzt; spaeter gegen echte Nutzerreaktionen pruefen.
2. Pakete+Ort-Einstieg im ersten Screen ist gesetzt: `Kuratierte Auszeiten in Sankt Peter-Ording.`
3. Am Anfang werden zwei Pakete gezeigt: Family Escape und Couple Reset.
4. Konkrete Objekte werden gezeigt, wenn Objektinfos/Fotos nutzbar sind und die Agentur freie Termine nennt.
5. Sekundaerer Eigentuemerabschnitt ist fachlich gesetzt; finale Copy und visuelle Gewichtung erfolgen beim UI-Design.
6. First Screen: Balance aus Hospitality-Marke und klarer Paket-Auswahl ist gesetzt.
7. Expansion: Orte direkt am Wasser; naechste Kandidaten Scharbeutz, Timmendorfer Strand, Sylt, spaeter Mallorca.
8. Familien- und Paarpakete unterscheiden sich in Copy, Bildwelt, Personenlogik und Erlebnisrichtungen; finale konkrete Anbieter folgen nach Recherche.
9. Wie zeigen wir spaeter weitere Orte, ohne Phase 1 zu ueberladen?
10. `Family Escape` ist als Phase-1-Name gesetzt, bleibt aber vor Ads-Start noch testbar.
11. Paar-Anlaesse in Phase 1: Jahrestag, Geburtstag, Alltag raus, Ueberraschung, anderer Anlass.
12. Erste Ratgeberartikel sind definiert; naechster Schritt ist Outline und lokale Recherche.
13. Welche Empfehlungen vor Ort gehoeren zu Family Escape und Couple Reset?
14. Portal-/Companion-Vision ist definiert; Version 1 nach echter Buchung wird spaeter priorisiert.
15. WhatsApp-Opt-in ist aufgenommen; vor Livegang muessen Datenschutztext und WhatsApp-Business-Prozess sauber formuliert werden.

## 11. Pre-Build Review

Stand vor dem sauberen Neubau:
- Konzeptkern ist ausreichend definiert.
- Phase-1-Scope ist bewusst klein: Plattformstart, zwei Paketseiten, Ratgeber, Eigentuemer, Erlebnisanbieter, internes Lead-Admin.
- Langfristige Ideen sind dokumentiert, aber nicht Phase-1-Pflicht.
- Oeffentliche Seite darf keine internen Briefings, Scraping-Datenbanken oder Agentenlogik zeigen.
- Mobile-first ist verbindliche Bauweise.
- Styleguide und Brand Assets sind zentrale Gestaltungsquelle.
- Paketseiten sind zugleich Ads-Landingpages.
- Leads sind das Ziel, kein Checkout.
- WhatsApp ist optionaler Servicekanal mit expliziter Zustimmung.
- Admin muss perspektivisch Paket-CMS sein, damit Morrow Pakete selbst pflegen kann.

Noch vor echter Produktion zu klaeren:
- konkrete Objektfotos und Nutzungsrechte
- konkrete freie Termine pro Objekt
- konkrete Erlebnispartner pro Paket
- Datenschutz/Impressum und WhatsApp-Business-Text
- Supabase/Vercel/Email-Provider statt lokaler Prototyp-Speicherung
