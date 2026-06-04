# Morrow UI-Rhythmus und Typografie

Diese Datei ist die zentrale Referenz für Schriftgrößen, Abstände, Bildformate und UI-Rhythmus der Website.

Vor jeder Seitenüberarbeitung lesen:
- `docs/MORROW_MASTER_FRAME.md`
- `docs/STYLEGUIDE_OPERATING_RULES.md`
- `docs/BRAND_ASSET_REGISTRY.md`
- diese Datei

Ziel: Jede Seite soll ruhig, hochwertig, editorial und mobil-first wirken. Keine Seite darf wie eine generische Buchungsplattform, ein SaaS-Dashboard oder eine zusammengedrückte Landingpage aussehen.

## Grundprinzip

Morrow braucht großzügige, aber kontrollierte Flächen.

Richtig:
- große erste Markenwirkung
- klare Abschnitte
- wenige, starke Inhalte pro Viewport
- ausreichend Abstand zwischen thematischen Bereichen
- kompakte Cards, aber keine Enge
- ruhige Typografie mit hoher Lesbarkeit

Falsch:
- zu viele Inhalte in eine Fläche drücken
- Textblöcke ohne visuelle Pausen
- riesige Schrift in kleinen Cards
- Abschnitte, die optisch ineinanderlaufen
- Hero-Logik auf jeder Sektion wiederholen
- mobile App-Mockups als Desktop-Website verwenden
- harte vertikale oder horizontale Trennlinien als wiederkehrendes Gestaltungsmittel in Erlebnis-, Trust- oder Story-Sections

## Trennlinien-Regel

Morrow nutzt keine sichtbaren vertikalen Trennlinien und keine harten Absatz-Trennlinien als Standard-Designmuster in öffentlichen Erlebnis-, Trust-, Auszeit- oder Story-Sections.

Erlaubt:
- großzügiger Weißraum
- Bild/Text-Rhythmus
- weiche Cards mit 8px Radius
- dezente Hintergrundflächen
- klare typografische Hierarchie

Nur mit bewusstem Grund:
- sehr subtile Linien in Tabellen, Formularen, Admin-Oberflächen oder kompakten technischen Listen

Nicht verwenden:
- Linien zwischen emotionalen Textabsätzen
- vertikale Divider zwischen Cards
- harte Section-Trenner, die die Seite modular oder SaaS-artig wirken lassen

## Layout-Breite

Standard-Content:
- `width: min(1240px, calc(100% - 40px))`
- Desktop: maximal 1240px
- Mobile: 20px Außenabstand je Seite

Admin-Bereich:
- `width: min(1180px, 100%)`

Wichtig:
- Keine Inhalte direkt an den Viewportrand setzen, außer bewusste Full-Bleed-Flächen wie dunkle Editorial-Bänder.
- Desktop-Seiten sollen mit 1280px Breite sauber funktionieren.

## Grundabstände

Standard-Section:
- `padding: clamp(78px, 10vw, 140px) 0`

Startseite Section-Übergänge:
- Hero -> Warum Morrow: `clamp(44px, 5vw, 72px)`
- Warum Morrow -> Auszeiten: `clamp(44px, 5vw, 72px)`
- Auszeiten -> Ablauf: `clamp(44px, 5vw, 72px)`
- Ablauf -> Editorial-Bildfläche: `clamp(44px, 5vw, 72px)`
- Editorial-Bildfläche -> Ratgeber: `clamp(52px, 6vw, 88px)`
- Ratgeber -> Eigentümer: ca. `52px` mobile, ca. `96px` desktop
- Eigentümer -> Footer: ca. `60px` mobile, ca. `110px` desktop
- Diese Werte sind der Referenzrhythmus für weitere Seiten: mobil nicht unter 44px zwischen großen Themenblöcken, Desktop nicht unter 72px, außer innerhalb einer bewusst kompakten Komponente.

Normale Section-Headings:
- `max-width: 780px`
- `margin-bottom: 46px`

Hero / Package-Hero:
- `padding: clamp(34px, 4vw, 56px) 0 clamp(48px, 6vw, 78px)`
- Grid-Gap: `clamp(28px, 5vw, 64px)`

Startseiten-Auszeitenbereich:
- `padding: clamp(64px, 7vw, 86px) 0 clamp(58px, 6vw, 78px)`
- Heading-Abstand unten: `34px`
- Zielhöhe Desktop bei 1280x720: ungefähr `740px` bis `790px`

Startseiten-Ratgeberteaser:
- `margin-top: clamp(52px, 6vw, 88px)`
- `margin-bottom: clamp(52px, 7vw, 96px)`
- `padding: clamp(50px, 6vw, 68px) clamp(50px, 7vw, 82px)`
- Heading-Abstand unten: `34px`

Editorial-Split:
- `padding: clamp(58px, 8vw, 96px) max(20px, calc((100vw - 1240px) / 2))`
- Grid-Gap: `clamp(28px, 6vw, 78px)`

Journey / Prozessbereich:
- `padding: clamp(50px, 6vw, 74px) 0`
- Grid-Gap: `clamp(28px, 6vw, 80px)`

Request-Section:
- `padding: clamp(84px, 11vw, 150px) max(20px, calc((100vw - 1240px) / 2))`

## Typografie

Font:
- Primär: `Hanken Grotesk`
- Webfont: `public/fonts/HankenGrotesk-VariableFont_wght.ttf`
- Italic: `public/fonts/HankenGrotesk-Italic-VariableFont_wght.ttf`
- Kein negativer Letter-Spacing-Einsatz.

H1:
- `font-size: clamp(42px, 5.45vw, 70px)`
- `font-weight: 900`
- `line-height: 0.98`
- `margin-bottom: 24px`

Mobile H1:
- `font-size: clamp(38px, 11vw, 48px)`
- `line-height: 0.96`

Globales H2 / große Markenbereiche:
- `font-size: clamp(32px, 4.2vw, 58px)`
- `font-weight: 880`
- `line-height: 0.98`
- `margin-bottom: 18px`

Auszeit-Detailsections und Ratgeber-Detailsections:
- `font-size: clamp(32px, 3.3vw, 44px)`
- `font-weight: 880`
- `line-height: 1.02`
- `margin-bottom: 18px`

Mobile H2:
- `font-size: clamp(30px, 9vw, 40px)`
- `line-height: 0.98`

Startseiten-Auszeitenbereich und Ratgeber-Übersichtsseite-H2:
- `font-size: clamp(33px, 4.1vw, 52px)`
- `line-height: 1`

Wichtig:
- Diese größere Skala gilt nicht für einzelne Ratgeberartikel.
- Ratgeberartikel folgen immer der Auszeit-Detailsection-Skala: `clamp(32px, 3.3vw, 44px)`.
- CTA-Headlines innerhalb von Ratgeberartikeln folgen ebenfalls dieser Detailsection-Skala, damit die Seite nicht springt.

H3:
- `font-size: 24px`
- `font-weight: 820`
- `line-height: 1.08`
- `margin-bottom: 10px`

Kompakte Ratgeber-Cards H3:
- `font-size: 19px`
- `line-height: 1.08`

Lead Copy / Intro Copy:
- `font-size: clamp(17px, 1.4vw, 19px)`
- `line-height: 1.58`
- Farbe: `rgba(24, 23, 21, 0.68)`

Hero Lead Copy:
- Referenz ist der Startseiten-Hero-Text: "Ausgewählte Unterkunft, lokales Erlebnis und persönliche Betreuung. Damit aus wenigen Tagen in Sankt Peter-Ording eine vorbereitete Auszeit wird."
- Dieser Stil gilt einheitlich für Startseite, Auszeiten, Ratgeber-Übersicht, Ratgeberartikel, Eigentümerseite und Erlebnisanbieter-Seite.
- Desktop gemessen: `19px`, `font-weight: 400`, `line-height: 30.02px`, Farbe `rgba(24, 23, 21, 0.68)`.
- Mobile gemessen: `16px`, `font-weight: 400`, `line-height: 24px`, Farbe `rgba(24, 23, 21, 0.68)`.
- Keine eigenen größeren Hero-Lead-Overrides mit `font-weight: 620` oder engerer Zeilenhöhe verwenden.

Kicker:
- `font-size: 12px`
- `font-weight: 840`
- `letter-spacing: 0.08em`
- `text-transform: uppercase`
- `margin-bottom: 12px`

Card-Text:
- Richtwert: 15px bis 17px
- Line-height: 1.35 bis 1.58
- In Cards keine hero-artigen Headlines verwenden.

## Buttons und Controls

Primäre Buttons:
- `min-height: 46px`
- `border-radius: 999px`
- `padding: 0 24px`
- `font-weight: 840`
- Hintergrund: Offblack
- Text: Offwhite

Sekundäre Buttons:
- Transparenter oder Paper-Hintergrund
- dezente Border: `rgba(24, 23, 21, 0.18)`

Mobile Drawer:
- Bottom-Sheet statt Inline-Formular, wenn der CTA aus einer Auszeit oder dem Hero kommt.
- Max-Höhe: `92svh`
- Radius oben: `8px 8px 0 0`

## Cards

Standard-Card:
- Border: `1px solid var(--line)`
- Radius: `8px`
- Hintergrund: `rgba(255, 253, 248, 0.52)` oder ähnlich

Card-Padding:
- Standard: `28px`
- Kompakt: `20px`
- Formulare: `34px`

Grid-Gaps:
- Card-Grids: `24px`
- kompakte Listen: `12px` bis `14px`
- große Layout-Splits: `clamp(28px, 6vw, 80px)`

Keine Cards in Cards.

## Bilder

Allgemeine Bildbehandlung:
- `object-fit: cover`
- `border-radius: 8px`
- Filter: `saturate(0.82) sepia(0.08) contrast(0.96)`
- Bild muss nach Sankt Peter-Ording, Nordsee, Unterkunft, Familie, Paarzeit oder lokaler Erfahrung wirken.
- Keine generischen Stock-Bilder, keine kalten Luxusbilder, keine Stadt-/SaaS-Optik.
- Keine glatten KI-Renderings: Bilder brauchen menschliche, warme, leicht körnige und ortsnahe Wirkung.
- Bei generierten Bildern immer gegen `docs/VISUAL_ASSET_GUIDELINES.md` prüfen.

Hero-Bild:
- `min-height: 380px`
- `aspect-ratio: 4 / 5`
- Mobile: `min-height: 300px`, `aspect-ratio: 1 / 0.9`

Package-Card-Bilder Startseite:
- Desktop: `min-height: 300px`
- Mobile: `height: 280px`

Ratgeber-Card-Bilder:
- Standard: `height: 220px`
- Kompakt Startseite: `height: 142px`
- Mobile: `height: 210px`

Artikel-Hero-Bild:
- Desktop: `min-height: 400px`
- `aspect-ratio: 4 / 3`
- Mobile: `min-height: 260px`

Ratgeberartikel:
- Einstieg: Hero mit Text plus einem ortsnahen Bild, kein reiner Textkopf.
- Artikelseiten nutzen oben weniger Abstand als generische Seiten: `padding-top: clamp(44px, 6vw, 84px)`, mobil ca. `34px`.
- Im Artikel-Hero darf die generische `page-intro`-Innenluft nicht zusätzlich wirken; der Hero kontrolliert seine Abstände selbst.
- Artikelkopf enthält Autor, Veröffentlichungsdatum und Lesezeit.
- Nach dem Hero dürfen Ratgeberartikel auf Desktop ein linksbündiges Inhaltsverzeichnis als Orientierungsspalte nutzen. Wichtig: Der Hauptinhalt daneben bleibt danach konsequent in einer einzigen Breite und Achse (`minmax(0, 944px)`), damit nicht einzelne Sections unterschiedlich eingerückt wirken.
- Kurze Antwort: ein hervorgehobener, ruhiger Antwortblock; Schrift stärker als Fließtext, aber nicht hero-artig.
- Kurze Antwort mobil maximal `21px`, damit sie nicht wie ein zweiter Hero wirkt.
- Inhaltsverzeichnis auf Desktop linksbündig sichtbar als Orientierungsspalte. Mobil wird die Spalte ausgeblendet; dort sollte die Orientierung bei Bedarf als kompakter Block im Flow gelöst werden, aber nicht als dauerhaft raumgreifende Sidebar.
- Mobile Ratgeber dürfen ein sichtbares Inhaltsverzeichnis im Flow nutzen, wenn der Artikel lang ist. Es steht nach der kurzen Antwort, nutzt dieselbe Typografie wie Desktop und darf nicht als verstecktes Element verschwinden.
- Auf Mobile steht die kurze Antwort vor dem Inhaltsverzeichnis; die doppelte Artikelinfo aus der Sidebar wird dort ausgeblendet, weil Autor, Datum und Lesezeit bereits im Hero stehen.
- Mobile Inhaltsverzeichnisse dürfen die Seite nicht blockieren: lange Listen werden kompakt gehalten und intern scrollbar.
- Auf Mobile darf das Inhaltsverzeichnis als kompaktes `In diesem Ratgeber`-Details-Element erscheinen.
- Bei längeren Artikeln kommt der erste CTA nicht direkt nach dem Inhaltsverzeichnis. Erst müssen Kontext und erste Nutzinformation Vertrauen aufbauen; der CTA folgt danach als natürlicher nächster Schritt.
- Längere Artikel dürfen nicht als Stapel gleicher Textkarten erscheinen.
- Editorialer Kontextblock als erste visuelle Pause zwischen Suchantwort und vertiefendem Text.
- Danach ein einziger klarer Artikel-Flow. Keine Aufteilung in mehrere Artikelkörper und keine zufällige Reverse-Logik.
- Bild/Text-Sections nutzen im Ratgeber zuerst Überschrift und Text, danach das Bild in der DOM-Reihenfolge. Auf Desktop darf das visuell side-by-side stehen, wenn dadurch weniger verlorene Einzelbilder und ein ruhigerer Seitenfluss entstehen.
- Lange Ratgeber brauchen mindestens eine breite Querbild-Pause als Editorial-Atemstelle.
- Kein alleinstehendes Bild ohne Aussage im Artikel-Flow. Bilder brauchen Kontext durch Section, Caption/Copy oder klare emotionale Funktion.
- Checklisten werden nicht mit dem normalen Fließtext-Renderer ausgegeben. Sie brauchen eine eigene visuelle Struktur mit nummerierten Prüfpunkten und kurzen Orientierungstexten.
- FAQ-/`Gut zu wissen`-Sections werden nicht mit dem normalen Fließtext-Renderer ausgegeben. Sie brauchen einzelne Frage/Antwort-Items, damit Fragen scannbar bleiben und nicht als langer Textblock wirken.
- `Kuratierte Auszeit`/Morrow-Brücken werden nicht als generische Special-Section gerendert. Sie brauchen eine eigene Abschlussstruktur mit lesbarer Copy, Nutzenpunkten und CTA.
- Listen innerhalb normaler Artikel-Sections müssen als echte Listen gerendert werden, auch wenn sie nach einem einleitenden Satz wie `Diese Fragen helfen` beginnen. Keine Bindestrich-Listen als Inline-Fließtext.
- Listen innerhalb normaler Artikel-Sections nutzen dieselbe Fließtextgröße wie Absätze. Keine kleineren Bullet-Listen für erklärenden Ratgebertext.
- Ratgeber brauchen mindestens einen frühen CTA zur passenden Auszeit und einen Abschluss-CTA.
- Auszeiten sind die visuelle und typografische Referenz für Ratgeberseiten. Ratgeber dürfen editorialer sein, aber normale Artikel-Sections folgen ebenfalls dem Morrow-Grundmuster: kleine Orientierung/Kicker, klare Headline, kurzer erklärender Text.
- Ausnahmen vom Kicker sind nur bewusst funktionale Elemente wie einzelne Karten, Navigation, Formularfelder oder sehr kompakte Meta-Informationen. Große Artikelbereiche ohne Kicker gelten als Inkonsistenz und müssen begründet oder korrigiert werden.
- Ratgeber haben eine eigene ruhigere Editorial-Skala, weil sie textlastiger sind als Auszeiten-Detailseiten:
  - Ratgeber-Hero-H1 nutzt dieselbe Skala wie die Auszeiten-Hero-H1: `clamp(42px, 4.7vw, 58px)`
  - Ratgeber-Hero-Lead nutzt dieselbe Skala wie die Auszeiten-Hero-Copy: `clamp(19px, 1.55vw, 23px)`, `font-weight: 620`
  - Artikel-H2: `clamp(30px, 2.7vw, 38px)`
  - Artikel-Fließtext: `clamp(17px, 1.35vw, 19px)`, `line-height: 1.58`
  - Mobile Ratgeber-Hero-H1: `clamp(34px, 9.4vw, 42px)`
  - Mobile Ratgeber-Hero-Lead: `19px`, `font-weight: 620`
  - Mobile Artikel-H2: `clamp(28px, 7.6vw, 34px)`
  - Mobile Artikel-Fließtext: `17px`
- Ratgeber-CTA-Module wie `Kuratierte Auszeit` dürfen kleiner sein als normale Artikel-H2s, damit sie nicht wie ein zweiter Hero wirken.
- Ratgeber dürfen nicht auf globale `.section-heading h2`-Werte bis `58px` fallen. Related-/CTA-Bereiche innerhalb eines Artikels nutzen ebenfalls die Ratgeber-H2-Skala.
- Feature-Bilder pro Artikel nicht unnötig doppeln; Bildwelt muss zur Zielgruppe passen.
- Hinweis-Kacheln nur bei kurzen Artikeln oder Übersichtsartikeln: drei kompakte H3-Kacheln mit 24px Desktop, mobil maximal 34px.
- Keine harten Linien zwischen Abschnitten; Gliederung entsteht durch Weißraum, Bildflächen und weiche Hintergründe.

Unterkunfts-Bildstack:
- kleine Bilder: `height: 240px`
- Hauptbild: `height: 492px`
- Mobile: alle `height: 240px`

## Responsive Regeln

Breakpoint:
- Hauptumbruch bei `max-width: 860px`

Mobile Regeln:
- Alle Hauptgrids werden einspaltig.
- Header wird kompakter: `padding: 14px 20px`
- Wordmark: `118px`
- Hero bleibt echte Website, kein Smartphone-Mockup.
- CTA-Formulare öffnen bevorzugt als Bottom Drawer.
- Inhalte werden nicht künstlich gekürzt, aber stärker sequenziert.

Desktop Regeln:
- Keine Sektion nach unten hin „ausbluten“ lassen, wenn sie als kompakter Landingpage-Block gedacht ist.
- Bei 1280x720 sollen wichtige Abschnittsinhalte möglichst in einer Desktop-Fläche erfassbar sein.
- Ausnahme: Hero und größere Story-/Detailseiten dürfen bewusst mehr Höhe haben.

## Startseiten-Rhythmus als Referenz

Aktuell geprüfte Section-Höhen bei 1280x720:
- Hero: ca. `802px`
- Warum Morrow / Intro: ca. `764px`
- Auszeiten: ca. `770px`
- Ablauf / Journey: ca. `636px`
- Editorial Split: ca. `665px`
- Ratgeberteaser: ca. `694px`
- Eigentümerteaser: ca. `421px`

Diese Werte sind keine starren Vorgaben, aber die Startseite ist der Referenz-Rhythmus für die weitere Überarbeitung.

## Prüfcheck Pro Seite

- [ ] Ist die Seite mobil-first gedacht?
- [ ] Sind Header, H1, Intro und CTA in den ersten Sekunden verständlich?
- [ ] Stimmen H1/H2/H3-Größen zum Kontext?
- [ ] Hat jede Section genug Abstand zur vorherigen und nächsten Section?
- [ ] Gibt es keine zu engen Übergänge wie beim früheren Ratgeber-Spacing?
- [ ] Sind Cards kompakt, aber nicht gequetscht?
- [ ] Sind Bilder regional und emotional passend?
- [ ] Gibt es keine weißen Bildränder oder sichtbare Asset-Artefakte?
- [ ] Werden MingCute Icons verwendet?
- [ ] Keine Emojis als UI-Elemente?
- [ ] Keine internen Inhalte auf öffentlichen Seiten?
- [ ] Texte mit ä, ö, ü statt ae, oe, ue?
- [ ] Seite fühlt sich nach kuratierter Hospitality-Plattform an, nicht nach Agentur-Website?
