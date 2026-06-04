# Morrow MVP Readiness Audit - 2026-06-03

Ziel dieses Dokuments: ein klarer Stand, ob Morrow fuer Phase 1 bereit ist, welche Teile bereits belastbar sind und welche Punkte vor echtem Markttraffic noch umgesetzt werden muessen.

## Ergebnis

Status: technisch deutlich naeher an production-ready, aber noch nicht live-ready.

Morrow ist aktuell stark genug, um intern, mit Testdaten und im direkten Gespraech gezeigt zu werden. Datenbank, Admin-Schutz, E-Mail-Automation und Kommunikationshistorie sind inzwischen als V1 umgesetzt. Fuer echte Ads, echte Leads und zahlende Gaeste fehlen weiterhin Rechtstexte, finale Partner-/Objektdaten, Vercel/Domain-Setup, Secret-Rotation und Production-Rehearsal.

Empfohlene Einordnung:
- Interne Demo: bereit
- Gefuehrte Partner-/Konzeptpraesentation: weitgehend bereit
- Kleine private Testgruppe mit manueller Kontrolle: fast bereit, wenn lokale Daten bewusst akzeptiert werden
- Ads auf echte Zielgruppe: noch nicht bereit
- Verbindliche Buchungen mit echten Gaesten: noch nicht bereit

## Gepruefte Grundlage

Geprueft wurden:
- Master Frame und Phase-1-MVP-Architektur
- zentrale Routen und Seitenstruktur im Code
- oeffentliche Website-Seiten
- Auszeitdetailseiten
- Ratgeberstruktur
- Eigentuemer- und Erlebnisanbieter-Funnel
- Admin-CRM
- Gaestebereich nach Buchung
- Vor-Ort-Bereich mit Karte, Filtern, Drawern und lokalen Kandidaten
- bestehende Smoke Tests

Screenshot-Evidenz:
- `/Users/gerwins/Documents/New project/tmp/qa/mvp-readiness-2026-06-03/home.png`
- `/Users/gerwins/Documents/New project/tmp/qa/mvp-readiness-2026-06-03/family.png`
- `/Users/gerwins/Documents/New project/tmp/qa/mvp-readiness-2026-06-03/couple.png`
- `/Users/gerwins/Documents/New project/tmp/qa/mvp-readiness-2026-06-03/guide.png`
- `/Users/gerwins/Documents/New project/tmp/qa/mvp-readiness-2026-06-03/owner.png`
- `/Users/gerwins/Documents/New project/tmp/qa/mvp-readiness-2026-06-03/experience-partner.png`
- `/Users/gerwins/Documents/New project/tmp/qa/mvp-readiness-2026-06-03/guest-area.png`
- `/Users/gerwins/Documents/New project/tmp/qa/mvp-readiness-2026-06-03/admin.png`

## Ampel

| Bereich | Status | Bewertung |
| --- | --- | --- |
| Startseite | Gruen/Gelb | Markenauftritt und Angebot sind klar. Vor Livegang braucht es finale Bild-/Text-QA mit echten Angeboten. |
| Auszeiten | Gruen/Gelb | Family Escape und Couple Reset sind als Funnel angelegt. Finale Objekt-, Termin-, Preis- und Erlebnisfreigabe fehlt. |
| Anfrageformulare | Gruen/Gelb | Struktur ist richtig: auszeitspezifisch, feste Termine, kein Kalender, WhatsApp optional. Automatisierte QA prueft Leadflow. |
| Admin CRM | Gelb | Fuer V1 schon nuetzlich: Anfragen, Kunden, Buchungen, Aufgaben, Auszeiten, Anbieter, Eigentuemer, Agenturen. Noch ohne echte Datenbank/Auth/Audit. |
| Gaestebereich | Gruen/Gelb | Strategisch richtig und differenzierend. Fuer echte Gaeste braucht er echte Buchungsdaten und geschuetzte Zugriffe. |
| Vor-Ort-Bereich | Gelb | Starker Mehrwert mit Karte, Filtern, Details und lokalen Kandidaten. Live-Daten, dauerhafte Pflege und finale Kuratierung fehlen. |
| Ratgeber | Gelb | SEO/GEO-Struktur ist vorbereitet. Fuer echte Rankings braucht es mehr Artikel, Keywordpflege, interne Verlinkung und redaktionelle Tiefe. |
| Backend / Datenhaltung | Gruen/Gelb | Supabase ist angebunden. Leads, Aufgaben, Buchungen, Auszeiten, Termine, Objekte, E-Mail-Events und Kommunikationshistorie sind V1-faehig. Einige Admin-Bereiche wie lokale Orte/Partnerdaten brauchen noch vollstaendige Remote-Persistenz. |
| Admin-Schutz | Gruen/Gelb | Admin-Login mit E-Mail + Passwort, `admin_users` und RLS ueber `is_morrow_admin()` sind aktiv. Vor Livegang oeffentliche Registrierung deaktivieren und Secrets rotieren. |
| E-Mail-Automation | Gruen/Gelb | Resend + Supabase Edge Function sind aktiv und getestet. Vor Livegang API-Key rotieren und Production-ENV setzen. |
| Rechtliches | Rot | Impressum, Datenschutz, WhatsApp-Einwilligungstext und ggf. Tracking-/Cookie-Hinweise fehlen als Live-Voraussetzung. |
| Deployment / Tracking | Rot/Gelb | Vercel, Domain, Umgebungen, Analytics und Conversion-Tracking muessen noch sauber eingerichtet werden. |

## Was bereits gut zum Konzept passt

- Morrow wird oeffentlich als kuratierte Auszeit-Plattform aufgebaut, nicht als klassische Ferienwohnungsseite.
- Der Einstieg ueber `Auszeiten` passt zur Phase-1-Strategie.
- Interne Daten wie Datenbank, Scraping, Anbieterlisten und operative Prozesse werden nicht oeffentlich ausgespielt.
- Eigentuemer und Erlebnisanbieter sind als separate B2B-Einstiege vorhanden, ohne die Gastseite zu ueberladen.
- Der Admin entwickelt sich in Richtung kleines CRM statt reiner Demo-Tabelle.
- Der Gaestebereich zahlt stark auf das Versprechen ein: nach der Buchung wird der Gast an die Hand genommen.
- Die Vor-Ort-Karte ist ein echter Morrow-Mehrwert, wenn sie konsequent kuratiert und gepflegt wird.

## Harte Live-Blocker

1. Rechtliche Basis
   - Impressum
   - Datenschutz
   - WhatsApp-Opt-in-Text
   - Tracking-/Cookie-Hinweise, falls Analytics/Ads eingebunden werden
   - klares Verstaendnis, welche Daten wofuer gespeichert werden

2. Finale Angebotsdaten
   - echte Objektbilder und -beschreibungen
   - finale freie Termine
   - finale Preise
   - final bestaetigte Erlebnisse
   - finale Restaurant-/Ortsempfehlungen
   - klare Verantwortlichkeit bei Objektproblemen: Morrow, Agentur, Hotel oder Eigentuemer

3. Produktions-Setup
   - Vercel-Projekt
   - Domain
   - Umgebungsvariablen
   - Backup-/Exportlogik fuer Leads
   - Fehler- und Conversion-Tracking

4. Secret-Rotation
   - Resend API Key rotieren.
   - Supabase Personal Access Token rotieren.
   - Supabase Service Role Key vor Livegang rotieren.

## Wichtige Naechste-Schritte

Empfohlene Reihenfolge:

1. Supabase-Datenmodell fuer Phase 1 aufbauen
   - Leads
   - Customers
   - Bookings
   - Packages
   - Package Dates
   - Properties
   - Experience Providers
   - Experience Blocks
   - Local Places
   - Tasks
   - Support Messages

2. Admin Auth und Route Guard bauen
   - zuerst einfacher Morrow-Admin-Login
   - danach Rollenmodell vorbereiten

3. Formulare an Backend anbinden
   - oeffentliche Gastanfrage
   - Eigentuemeranfrage
   - Erlebnisanbieteranfrage
   - Gaestebereich-Hilfe/Kontakt

4. E-Mail-Automation einbauen
   - Anfragebestaetigung an Gast
   - interne Morrow-Mail
   - optional Statusmails nach manueller Entscheidung

5. Rechtliche Seiten und Consent-Texte ergaenzen
   - Impressum
   - Datenschutz
   - WhatsApp-Opt-in sauber formulieren
   - Tracking erst danach aktivieren

6. Content- und Daten-QA
   - echte Objekt- und Erlebnisdaten einsetzen
   - lokale Orte kuratieren
   - Vor-Ort-Kategorien final pruefen
   - Ratgeberartikel redaktionell erweitern

7. Production Rehearsal
   - Testanfrage von oeffentlicher Seite
   - Admin-Bearbeitung
   - Anfrage zu Buchung
   - Gaestebereich oeffnen
   - Hilfe-Nachricht senden
   - E-Mail-Kette pruefen

## QA-Hinweise

Automatisierte Checks decken aktuell die wichtigsten Prototype-Flows ab:
- oeffentliche Gastanfrage
- Eigentuemeranfrage
- Erlebnisanbieteranfrage
- Admin-Sichtbarkeit der Leads
- Buchungs-/Gaestebereich

Beim manuellen Browser-Test war Texteingabe ueber das Browser-Tool durch die virtuelle Clipboard-Funktion blockiert. Das ist ein Tool-Limit, kein bekannter App-Fehler. Der Playwright-Smoke-Test validiert den Formularfluss automatisiert.

## Entscheidung

Wir sind nicht "fertig live", aber wir sind an einem guten Punkt fuer den naechsten technischen Fundament-Schritt.

Der naechste sinnvolle Schritt ist nicht noch mehr UI-Feinschliff, sondern Backend + Auth + E-Mail. Ohne diese drei Bausteine bleibt Morrow ein starker Prototyp. Mit ihnen wird es ein nutzbarer Phase-1-MVP.
