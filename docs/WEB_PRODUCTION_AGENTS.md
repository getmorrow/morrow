# Morrow Web Production Agents

## Zweck

Jede neue Website-, App- oder Funnel-Arbeit laeuft durch drei Agentenrollen. Das verhindert, dass nur schnell gebaut wird, ohne Struktur, Detailqualitaet und Tests mitzunehmen.

## 1. Structure Agent

Mandat:
- Zielgruppe und Zweck klaeren
- Seitenstruktur und Nutzerflows entwerfen
- benoetigte Komponenten benennen
- interne Inhalte von oeffentlichen Inhalten trennen
- Styleguide-Anforderungen aus `docs/STYLEGUIDE_OPERATING_RULES.md` auslegen

Output:
- Navigation
- Screens/Sections
- wichtigste Komponenten
- Datenquellen
- Akzeptanzkriterien

Uebergabe an Implementation Agent:
- "Baue genau diese Screens und Flows. Keine internen Businessdaten im oeffentlichen UI."

## 2. Implementation Agent

Mandat:
- Komponenten und Flows bauen
- bestehende CI, Farben, Typografie und Assets verwenden
- Styleguide-Seiten passend zur Aufgabe aktiv anwenden
- keine unnoetigen Abstraktionen einfuehren
- responsive Umsetzung direkt mitdenken

Output:
- Code-Aenderungen
- neue Komponenten/Datenstrukturen
- Build-/Lint-Ergebnis
- bekannte offene Punkte

Uebergabe an Detail QA Agent:
- "Pruefe visuell, funktional und technisch. Suche gezielt nach Ueberlaeufen, unpassender CI, kaputten States und schwachen Texten."

## 3. Detail QA Agent

Mandat:
- Seite nach Produktion noch einmal im Detail ansehen
- Seite gegen `docs/STYLEGUIDE_OPERATING_RULES.md` abnehmen
- Desktop und Mobile Screenshots pruefen
- alle Kerninteraktionen testen
- Formulare, State-Wechsel und lokale Persistenz testen
- Codequalitaet und interne/oeffentliche Trennung pruefen

Pflichtchecks:
- `docs/STYLEGUIDE_OPERATING_RULES.md` gegenlesen
- `npm run lint`
- `npm run build`
- Desktop Screenshot
- Mobile Screenshot
- Suche nach internen Begriffen im Frontend
- Fokus auf Textueberlauf, Buttons, Formularzustand, Header, mobile Navigation
- Pruefen, dass WhatsApp-Opt-ins optional, nicht vorausgewaehlt und klar als Servicekontakt formuliert sind

Output:
- Findings nach Prioritaet
- konkrete Fixes oder "keine Findings"
- finaler Abnahmehinweis

## Standardablauf

1. Structure Agent plant.
2. Implementation Agent baut.
3. Detail QA Agent prueft.
4. Implementation Agent fixt Findings.
5. Detail QA Agent prueft erneut.
6. Erst danach gilt der Build als vorzeigbar.

## Morrow-spezifische Regeln

- Externes UI zeigt keine Lead-Datenbank, Agentenlogik, Scores oder interne Strategie.
- Oeffentliche Sprache bleibt ruhig, menschlich und einfach.
- Brandfarben: `#694722`, `#6F6841`, `#ECE6D6`, `#181715`.
- Mobile-first ist Pflicht; Desktop ist die erweiterte Layout-Version.
- Header, Login und App-Elemente orientieren sich an pillenfoermigen, warmen Morrow-Formen.
- Bildsprache trennt Aufenthalte/Real Estate und Experiences bewusst.
- UI-Icons kommen aus MingCute; keine Emojis als UI.
- Illustrationen folgen dem organischen Styleguide-Stil aus Seite 21.
- Wenn eine Umsetzung nicht klar nach Morrow aussieht, ist sie nicht fertig.
