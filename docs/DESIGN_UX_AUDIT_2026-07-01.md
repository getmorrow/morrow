# Morrow Design-/UX-Audit

Stand: 2026-07-01  
Scope: Website, Guest App, Owner App, Admin App  
Art: Audit gegen bestehende Designgrundlage, kein freies Redesign

## Bewertungsmaßstab

Gelesene verbindliche Grundlagen:
- `docs/MORROW_MASTER_FRAME.md`
- `docs/STRATEGIC_FOUNDATION_MORROW.md`
- `docs/PLATFORM_ARCHITECTURE.md`
- `docs/STYLEGUIDE_OPERATING_RULES.md`
- `docs/BRAND_ASSET_REGISTRY.md`
- `docs/VISUAL_ASSET_GUIDELINES.md`
- `docs/UI_RHYTHM_TYPOGRAPHY.md`
- `docs/DESIGN_REFERENCE_HOME_DESIGNER_DRAFT.md`
- `docs/PHASE1_INFORMATION_ARCHITECTURE.md`
- `docs/IMAGE_PERSONAS.md`

Zentrale Prüfregeln:
- Morrow muss warm, ruhig, menschlich, editorial und hochwertig wirken.
- Keine generische Booking-, SaaS- oder Dashboard-Optik auf öffentlichen und Gästeflächen.
- Mobile-first ist verbindlich.
- Website, Guest App, Owner App und Admin App sind unterschiedliche Produktwelten.
- Admin ist Quelle der Wahrheit; Website, Guest und Owner zeigen kuratierte Ausschnitte.
- Keine sichtbare interne MVP-, Admin-, Agenten- oder Datenbanksprache in Gäste-/Owner-Flows.
- UI-Icons sollen aus MingCute kommen, keine Emoji-/Textsymbol-Navigation.
- Keine harten vertikalen Divider als wiederkehrendes Gestaltungsmuster.
- Cards kompakt, klar und mit 8px-Radius-Logik; keine Cards-in-Cards.

## Screenshot-Evidenz

Screenshots liegen unter:

`docs/qa/design-ux-audit-2026-07-01/`

Fix-Evidence nach Umsetzung:

`docs/qa/design-ux-fixes-2026-07-01/`

Neu geprüfte Fix-Ansichten:
- Website Startseite Desktop: `web-home-desktop-1440x900.png`
- Website Family Escape Anfrage Mobile: `web-family-request-drawer-mobile-390x844.png`
- Guest App Buchung Mobile/Desktop: `guest-booking-active-mobile-390x844.png`, `guest-booking-active-desktop-1440x900.png`
- Owner App Dashboard Mobile/Desktop: `owner-dashboard-mobile-390x844.png`, `owner-dashboard-desktop-1440x900.png`
- Admin Dashboard Desktop/Mobile: `admin-dashboard-desktop-hiddenfix-1440x900.png`, `admin-dashboard-mobile-final-390x844.png`

Geprüfte Ansichten:
- Website: Startseite, Family Escape, Ratgeber, Eigentümerseite jeweils Desktop und Mobile.
- Guest App: Einstieg, abgeschlossener Testaufenthalt, Buchung, Feedback, Auszeiten-Navigation Mobile/Desktop.
- Owner App: Login/Einstieg Mobile/Desktop sowie Dashboard Mobile/Desktop mit temporärem QA-Owner.
- Admin App: Login Mobile/Desktop und eingeloggtes Dashboard Mobile/Desktop.

Technische Sichtprüfung:
- Keine horizontale Überlaufprobleme in den geprüften Screens.
- Website-Bilder laden grundsätzlich.
- Admin-Dashboard-Höhe: ca. 27.500px Desktop, ca. 36.400px Mobile. Das ist für tägliche Arbeit zu lang.
- Fix-Messung Admin nach Umsetzung: ca. 1.953px Desktop, ca. 1.913px Mobile; nur eine aktive Admin-Arbeitsansicht sichtbar.
- Guest-App abgeschlossener Aufenthalt: Mobile-Seitenhöhe ca. 1.800px, aber aktive Inhalte liegen nach Navigation unter dem dominanten Hero.
- Fix-Update Guest App: Nach Tabwechsel scrollt die App zum aktiven Inhalt; Unterviews nutzen einen kompakteren Hero.

## Gesamtampel

| App | Status | Kurzbegründung |
| --- | --- | --- |
| Website | Grün/Gelb | Hero-Collage und mobile Anfrage-UX wurden korrigiert; mobile Plattformnavigation bleibt späteres P2-Thema. |
| Guest App | Grün/Gelb | Navigation nutzt jetzt MingCute-Icons und führt bei Tabwechsel direkt in den aktiven Inhalt; tiefe Statusflows bleiben weiter QA-relevant. |
| Owner App | Gelb | Dashboard wurde mit temporärem QA-Owner visuell verifiziert; tiefe Owner-Flows bleiben später separat zu prüfen. |
| Admin App | Gelb | Dashboard-Überblick ist deutlich verdichtet; tiefere Modulflows bleiben separat visuell zu prüfen. |

## P0 Findings

### P0-1: Owner-Dashboard visuell verifiziert

App: Owner App  
Bereich: geschützter Eigentümerbereich  
Evidenz: Ursprünglich nur Login-Screenshots möglich; nach Fix mit temporärem QA-Owner visuell geprüft.

Warum kritisch:
- Die Owner App ist strategisch ein Kernbeweis für Transparenz, Ertrag und professionelle Betreuung.
- Ohne echte Dashboard-Sichtprüfung kann nicht belastbar bewertet werden, ob Objekt-, Buchungs-, Lücken-, Operations- und Abrechnungsinformationen verständlich und vertrauenswürdig wirken.

Empfehlung:
- Vor Launch/Owner-Demo einen dauerhaft gepflegten Owner-QA-Zugang bereitstellen.
- Owner Dashboard mobil und desktop screenshotbasiert gegen Plattformarchitektur prüfen.

Status:
- Erledigt für die Audit-Abnahme.
- Fix-Update 2026-07-01: `npm run supabase:verify-owner` mit `OWNER_VERIFY_TEMP_OWNER=1` erfolgreich. Tabellen, RPCs und temporärer Owner-Dashboard-Zugriff wurden geprüft.
- Zusätzlich wurde ein temporärer Owner-QA-Zugang auf `Nordlicht Lodge` angelegt, mobil/desktop eingeloggt, screenshotbasiert geprüft und anschließend wieder entfernt.
- Evidence: `docs/qa/design-ux-fixes-2026-07-01/owner-dashboard-mobile-390x844.png`, `docs/qa/design-ux-fixes-2026-07-01/owner-dashboard-desktop-1440x900.png`

## P1 Findings

### P1-1: Website-Startseite Desktop-Hero wirkt teilweise zu konstruiert und bildseitig leer

App: Website  
Screenshot: `01-web-home-desktop-1440x900.png`

Beobachtung:
- Linke Seite hat starke Typografie und klare CTA-Führung.
- Rechte Hero-Collage wirkt im Desktop-Screenshot nicht durchgehend wie eine emotionale Bildcollage aus der Designer-Referenz. Die kleinen weißen Karten wirken teilweise leer/abstrahiert und schwächen die warme, menschliche Markenwirkung.

Abweichung:
- Designer-Referenz fordert eine menschliche, warme Collage mit klar sichtbaren Momenten.
- Styleguide-Regel: erste Screens brauchen starke Markenruhe, aber nicht bildleere UI-Module.

Konkrete Verbesserung:
- Hero-Collage prüfen: Bildflächen müssen sofort als Bilder/Momente lesbar sein.
- Kleine Overlay-Cards nur verwenden, wenn Bild und Text zusammen sichtbar tragen.
- Keine zusätzliche neue Richtung entwickeln, sondern näher an `DESIGN_REFERENCE_HOME_DESIGNER_DRAFT.md`: Hauptbild + 1-2 echte Momentbilder + kompakte Auszeit-Einstiege.

Fix-Status 2026-07-01:
- Erledigt. Bestehende Hero-Collage wurde enger an die Designer-Referenz geführt: Nebenbilder wirken jetzt stärker als echte Momentbilder statt als leere UI-Karten.
- Evidence: `docs/qa/design-ux-fixes-2026-07-01/web-home-desktop-1440x900.png`

### P1-2: Mobile Anfrage-CTA springt tief zur Seite statt als Bottom-Drawer zu öffnen

App: Website  
Bereich: Auszeitdetailseite Family Escape  
Screenshot: `web-family-request-after-click-mobile-390x844.png`

Beobachtung:
- CTA `Auszeit anfragen` scrollt mobil zu `#anfrage`.
- Formular ist sichtbar und nutzbar, aber nicht als Bottom-Drawer umgesetzt.

Abweichung:
- `PHASE1_INFORMATION_ARCHITECTURE.md` und `UI_RHYTHM_TYPOGRAPHY.md` definieren mobile Anfrage als Bottom-Drawer.

Konkrete Verbesserung:
- Mobile Anfrage als Bottom-Sheet öffnen.
- Desktop kann weiterhin Scrollziel oder eingebettetes Formular bleiben.
- Erfolg/Error-Zustände im Drawer sichtbar halten, damit der Nutzer nach Absenden nicht Orientierung verliert.

Fix-Status 2026-07-01:
- Erledigt. Mobile CTA öffnet jetzt ein Bottom-Sheet mit derselben `LeadForm`; Desktop bleibt beim eingebetteten Formular/Anker.
- Evidence: `docs/qa/design-ux-fixes-2026-07-01/web-family-request-drawer-mobile-390x844.png`

### P1-3: Guest-App-Navigation nutzt Unicode-Symbole statt MingCute Icons

App: Guest App  
Bereich: Bottom Navigation  
Screenshots: `guest-click-booking-390x844.png`, `guest-click-feedback-390x844.png`

Beobachtung:
- Bottom Navigation nutzt `•`, `□`, `☆`, `↻` als sichtbare Symbole.

Abweichung:
- Styleguide-Regel: UI-Icons kommen aus MingCute; keine Emoji-/Textsymbol-UI.

Konkrete Verbesserung:
- Bottom Navigation auf MingCute-Icons umstellen.
- Labels enger und ruhiger ausrichten, aber nicht wieder gequetscht.
- Aktiver Zustand klar, aber weniger „Button im Button“-Wirkung.

Fix-Status 2026-07-01:
- Erledigt. Guest Navigation nutzt jetzt `@mingcute/react` Icons statt Unicode-Symbole.
- Evidence: `docs/qa/design-ux-fixes-2026-07-01/guest-booking-active-mobile-390x844.png`

### P1-4: Guest-App zeigt nach Tabwechsel den aktiven Inhalt zu tief unter dem Hero

App: Guest App  
Bereich: Buchung/Feedback/Auszeiten im abgeschlossenen Aufenthalt  
Screenshots: `guest-click-booking-390x844.png`, `guest-click-feedback-390x844.png`

Beobachtung:
- Nach Klick auf `Buchung` oder `Feedback` bleibt der große Hero oben dominant.
- Der relevante aktive Inhalt beginnt erst knapp über oder unterhalb der Bottom-Navigation.
- Mobile Nutzer sehen erst Bild und Headline, nicht direkt die ausgewählte Aufgabe.

Abweichung:
- Guest App soll app-artig und aufgabenorientiert sein.
- App-Navigation muss schnell zu `Buchung`, `Vor Ort`, `Hilfe`, `Feedback` führen.

Konkrete Verbesserung:
- Bei Tabwechsel entweder zum aktiven Bereich scrollen oder den Hero in Unterviews kompakter machen.
- Start darf emotional sein; Detailviews sollten stärker funktional führen.
- Nach abgeschlossener Buchung: Start/Wiederkommen emotional, Buchung/Feedback direkt und kompakt.

Fix-Status 2026-07-01:
- Erledigt. Tabwechsel scrollt zum aktiven Inhaltsbereich; Unterviews nutzen einen kompakteren Hero.
- Evidence: `docs/qa/design-ux-fixes-2026-07-01/guest-booking-active-mobile-390x844.png`, `docs/qa/design-ux-fixes-2026-07-01/guest-booking-active-desktop-1440x900.png`

### P1-5: Admin-Dashboard ist für tägliche Arbeit zu lang und zu kachelartig

App: Admin App  
Bereich: Dashboard/Übersicht  
Screenshots: `admin-dashboard-stable-desktop-1440x900.png`, `admin-dashboard-stable-mobile-390x844.png`

Beobachtung:
- Dashboard ist visuell ordentlich, aber sehr lang.
- Mobile Höhe ca. 36.400px, Desktop ca. 27.500px.
- Viele Cards und Bereiche stehen untereinander. Für ein tägliches CRM/Operations-System ist das zu viel Scrollarbeit.

Abweichung:
- Admin soll tägliche Steuerung ermöglichen: nächste Aktionen, fällige Aufgaben, kritische Fälle, neue Anfragen, Buchungen, Support.
- Ein Dashboard muss verdichten, nicht alles aus allen Modulen zeigen.

Konkrete Verbesserung:
- Dashboard als echte Arbeitsübersicht neu priorisieren, ohne freien Redesign-Stil:
  - oben: Heute fällig, neue Anfragen, offene Supportfälle, kritische Datenlücken.
  - danach: kommende Termine und Wiedervorlagen.
  - tiefe Bestandslisten in die jeweiligen Module verschieben.
- Mobile: weniger KPI-Cards, mehr priorisierte Liste.
- Desktop: zweispaltige Arbeitsfläche statt langer Ein-Spalten-Strom.

Fix-Status 2026-07-01:
- Erledigt im Dashboard-Überblick. KPI-Flut wurde auf vier tägliche Arbeitskennzahlen reduziert; inaktive Module werden nicht mehr durch CSS sichtbar gehalten.
- Messung: Desktop-Höhe ca. 1.953px, Mobile-Höhe ca. 1.913px statt ca. 27.500px/36.400px im Audit.
- Evidence: `docs/qa/design-ux-fixes-2026-07-01/admin-dashboard-desktop-hiddenfix-1440x900.png`, `docs/qa/design-ux-fixes-2026-07-01/admin-dashboard-mobile-final-390x844.png`

### P1-6: Admin-Mobile Navigation ist funktional, aber nicht effizient genug

App: Admin App  
Bereich: Mobile Dashboard Navigation  
Screenshot: `admin-dashboard-stable-mobile-390x844.png`

Beobachtung:
- Alle Module werden als Pill-Buttons oben angezeigt.
- Bei neun Modulen plus Abmelden nimmt Navigation viel vertikalen Raum ein.

Abweichung:
- Für Admin mobile ist Übersichtlichkeit wichtiger als Markenhero-Gefühl.

Konkrete Verbesserung:
- Mobile Admin-Navigation als kompakte Tabs/Segmentleiste oder Menü mit aktueller Ansicht.
- Häufige Arbeitsbereiche zuerst: Übersicht, CRM, Support, Aufgaben.
- Weniger wichtige Module in `Mehr`.

Fix-Status 2026-07-01:
- Teilweise erledigt ohne neue Menüarchitektur. Mobile Navigation ist jetzt eine horizontale, kompakte Arbeitsleiste; vertikale Mehrzeilen-Navigation entfällt.
- Kein neues `Mehr`-Menü gebaut, weil das eine neue Navigationsfunktion wäre.
- Evidence: `docs/qa/design-ux-fixes-2026-07-01/admin-dashboard-mobile-final-390x844.png`

### P1-7: Website-Hero-Navigation auf Mobile zeigt nur Logo und CTA, keine Menüführung

App: Website  
Bereich: Mobile Header  
Screenshots: `02-web-home-mobile-390x844.png`, `06-web-guide-mobile-390x844.png`

Beobachtung:
- Mobile Header zeigt Logo und `Auszeit planen`.
- Direkt sichtbare Navigation zu Ratgeber/Eigentümer fehlt.

Einordnung:
- Das kann bewusst conversion-orientiert sein.
- Für Plattformtauglichkeit und Eigentümerpfad kann es aber zu eng sein, weil Morrow nicht nur eine Landingpage ist.

Konkrete Verbesserung:
- Prüfen, ob ein ruhiges Menü-Icon im Morrow-Stil sinnvoll ist.
- Alternativ: Footer/untere Page-Navigation stärker machen.
- Nicht sofort als P0/P1-Launchblocker, aber für Plattformausbau relevant.

## P2 Findings

### P2-1: Website insgesamt markenkonsistent, aber an mehreren Stellen sehr typolastig

App: Website  
Bereiche: Ratgeber, Eigentümerseite, Auszeitdetails

Beobachtung:
- Typografie ist konsistent und hochwertig.
- Einige Einstiege hängen stark an großer Schrift und weniger an visueller Story.

Konkrete Verbesserung:
- Mehr gezielte Bild-/Text-Rhythmik nach Designer-Referenz.
- Keine neuen Experimente; vorhandene Collage-/Editorial-Muster konsequenter anwenden.

### P2-2: Owner-Login wirkt solide, aber sehr text-/card-lastig

App: Owner App  
Screenshots: `13-owner-entry-desktop-1440x900.png`, `14-owner-entry-mobile-390x844.png`

Beobachtung:
- Farbwelt, Logo und Typografie passen.
- Login wirkt seriös und vertrauenswürdig.
- Ohne Dashboard-Kontext fehlt auf Mobile noch ein emotionaler oder objektbezogener Vertrauensanker.

Konkrete Verbesserung:
- Sobald echte Owner-Daten sichtbar sind, Login nicht überladen, aber klarer auf `Transparenz`, `Kontrolle`, `Morrow macht sichtbar, was passiert` zuspitzen.

### P2-3: Guest-App Einstieg ohne Code wirkt schön, aber sehr generisch

App: Guest App  
Screenshot: `10-guest-entry-mobile-390x844.png`

Beobachtung:
- Ruhig, markennah, gut lesbar.
- Für Nutzer ohne Link ist klar, dass ein persönlicher Link nötig ist.
- Bild/Markenmoment fehlt im Entry-State fast vollständig.

Konkrete Verbesserung:
- Optional ein kleinerer App-Moment im Styleguide-Stil, aber nicht zwingend vor Launch.

### P2-4: Public Owner Page ist visuell stark, aber stärker Website als Plattform-Proof

App: Website  
Bereich: `/eigentuemer`

Beobachtung:
- Hero ist ruhig, klar und passend.
- Der strategische Unterschied `Morrow steigert Ertrag statt nur verwalten` kommt an.
- Plattformtauglichkeit hängt aber stark am späteren Owner-Dashboard.

Konkrete Verbesserung:
- Vor Owner-Akquise stärker zeigen, welche Daten/Transparenz Eigentümer nach Freischaltung wirklich sehen.
- Keine internen Screenshots zeigen, solange nicht reif, aber Prinzipien klarer darstellen.

## Bewertung Nach Kriterien

### Website

Nutzerführung: gut  
Professionalität: gut bis mittel  
Übersichtlichkeit: gut  
Markenkonsistenz: gut  
Plattformtauglichkeit: mittel bis gut  
Mobile UX: mittel bis gut  
Desktop UX: gut, Hero teilweise P1  
Navigation: gut, mobile Plattformnavigation P2  
Formulare: funktional, mobile Drawer-Abweichung P1  
Tabellen/Listen/Karten: Karten meist ruhig und markennah  
Empty/Error/Success States: LeadForm hat Success/Error technisch vorhanden  
Hauptflows: Auszeit ansehen und anfragen funktionieren, aber mobile Anfrage nicht optimal

Ampel: Gelb

### Guest App

Nutzerführung: mittel  
Professionalität: mittel bis gut  
Übersichtlichkeit: mittel  
Markenkonsistenz: mittel bis gut  
Plattformtauglichkeit: gut als Richtung, P1 bei Navigation  
Mobile UX: mittel  
Desktop UX: gut als ruhige Web-App, aber App-Navigation wirkt oben etwas webartig  
Navigation: P1 wegen Unicode-Icons und aktiver Inhalt zu tief  
Formulare: Feedback/Support vorhanden, nicht vollständig im Flow getestet  
Tabellen/Listen/Karten: Karten warm, teilweise zu groß für Aufgabenmodus  
Empty/Error/Success States: Code enthält Loading/Error/Empty-States  
Hauptflows: Start, Buchung, Feedback, Wiederkommen erreichbar; Vor-Ort-Flow im abgeschlossenen Testzustand nicht sinnvoll prüfbar

Ampel: Gelb

### Owner App

Nutzerführung: Login gut, Dashboard jetzt sichtbar und verständlich
Professionalität: gut
Übersichtlichkeit: gut im Dashboard-Einstieg, tiefe Owner-Flows separat prüfen
Markenkonsistenz: gut
Plattformtauglichkeit: belegbar als Eigentümer-Einstieg, tiefe Flows offen
Mobile UX: solide, Navigation noch mehrzeilig aber nutzbar
Desktop UX: solide
Navigation: Dashboard-Navigation geprüft, tiefe Bereiche nicht vollständig abgenommen
Formulare: Login sichtbar und klar
Tabellen/Listen/Karten: Dashboard-Karten visuell geprüft, tiefe Detailbereiche offen
Empty/Error/Success States: Code enthält Loading/Empty/Error-States
Hauptflows: Login und Dashboard geprüft; Rückfragen, Abrechnung, Operations und Dokumente separat offen

Ampel: Gelb

### Admin App

Nutzerführung: mittel bis gut im Überblick
Professionalität: mittel bis gut
Übersichtlichkeit: gut im Dashboard-Überblick, tiefe Module weiter separat prüfen
Markenkonsistenz: gut, Card-Fläche im Überblick reduziert
Plattformtauglichkeit: funktional stark, Dashboard-Überblick deutlich besser verdichtet
Mobile UX: mittel bis gut im Überblick; tiefe Module offen
Desktop UX: gut im Überblick; tiefe Module offen
Navigation: mobile Navigation kompakter als horizontale Arbeitsleiste
Formulare: viele Admin-Formulare im Code, nicht jedes Detail visuell geprüft
Tabellen/Listen/Karten: Dashboard-Überblick reduziert; tiefe Modulansichten weiter separat prüfen
Empty/Error/Success States: Code enthält Loading/Error; Detailprüfung je Modul offen
Hauptflows: Login und Dashboard geprüft; tiefe CRM-/Support-/Bestandsflows nicht vollständig visuell durchgeklickt

Ampel: Gelb

## Kritische Designabweichungen

1. Guest-App Icons entsprachen nicht dem Styleguide (`P1`) - erledigt.
2. Mobile Auszeit-Anfrage war nicht als Bottom-Drawer umgesetzt (`P1`) - erledigt.
3. Admin-Dashboard war zu lang und zu wenig verdichtet für tägliches Arbeiten (`P1`) - erledigt im Überblick.
4. Guest-App Tabwechsel führte nicht direkt genug zum aktiven Inhalt (`P1`) - erledigt.
5. Owner-Dashboard war ursprünglich nicht visuell abgenommen (`P0` für Owner-Freigabe) - erledigt mit temporärem QA-Owner.

## Muss Vor Launch Korrigiert Werden

Für kontrollierte Gäste-Leads:
- Mobile Anfrage-UX: erledigt als Bottom-Drawer.
- Website-Hero: erledigt, Desktop-Collage wirkt bildhafter.
- Guest-App Bottom Navigation: erledigt mit MingCute-Icons.
- Guest-App aktive Views: erledigt durch Scroll zum aktiven Bereich und kompakten Unterview-Hero.

Für zahlende Gäste mit aktivem Gästebereich:
- Guest-App Navigation und Aufgabenführung: erledigt für die geprüfte Buchungsansicht.
- Feedback/Buchung/Hilfe-Zustände je Status prüfen: vor Anreise, aktiv, abgeschlossen.
- Vor-Ort-Flow mit aktivem Aufenthalt erneut screenshotbasiert prüfen.

Für Eigentümer-Launch:
- Owner-Dashboard mit echtem Testzugang prüfen: erledigt mit temporärem QA-Owner.
- Tiefe Owner-Flows vor echter Eigentümerfreigabe weiter separat abnehmen.

Für internes Arbeiten:
- Admin-Dashboard verdichten: erledigt im Überblick.
- Mobile Admin-Navigation verbessern: teilweise erledigt ohne neue Menüarchitektur.
- Wichtigste CRM-/Support-/Buchungsflows je Modul separat visuell abnehmen.

## Kann Später Verbessert Werden

- Website mobile Hauptnavigation stärker plattformtauglich machen.
- Guest-App Entry-State stärker visuell/markennah machen.
- Owner-Login mit einem ruhigeren Objekt-/Transparenzmoment ergänzen.
- Website-Ratgeber und Owner-Seite mit mehr Bild-/Story-Rhythmus nach Designer-Referenz schärfen.
- Admin tiefere Module weiter vereinheitlichen, nachdem Dashboard priorisiert ist.

## Fazit

Die Plattform ist visuell nicht grundsätzlich falsch. Sie kommt sichtbar aus der Morrow-Farbwelt, nutzt Hanken, Offwhite/Offblack/Sage und eine ruhige Grundhaltung. Die im Audit festgestellten zentralen P1-Abweichungen für Website, Guest App und Admin-Übersicht wurden korrigiert.

Die wichtigste Unterscheidung:
- Website und Guest App sind nah an der Marke; die geprüften P1-Korrekturen sind umgesetzt.
- Admin ist funktional stark; die Übersicht ist jetzt deutlich kompakter, tiefe Module bleiben separat zu prüfen.
- Owner ist jetzt screenshotbasiert bewertbar; tiefe Owner-Flows bleiben separat zu prüfen.

Empfohlene Reihenfolge:
1. Tiefe Admin-Module CRM, Support, Buchungen, Bestand und Operations visuell abnehmen.
2. Guest-App Statusflows vor Anreise, aktiv und abgeschlossen erneut komplett durchklicken.
3. Tiefe Owner-Flows für Rückfragen, Abrechnung, Operations und Dokumente separat prüfen.
4. P2-Themen separat priorisieren, wenn die Launch-Flows stabil sind.
