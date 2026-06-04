# Morrow Brand Asset Registry

Diese Datei ist die zentrale Referenz für Styleguide, Logos, Farben und Fonts.

Vor visueller Umsetzung immer zusammen mit `docs/MORROW_MASTER_FRAME.md` und `docs/UI_RHYTHM_TYPOGRAPHY.md` lesen.
Zusätzlich verpflichtend: `docs/STYLEGUIDE_OPERATING_RULES.md`.

## Quellen

Originale Brand-Dateien:
- Styleguide PDF: `/Users/gerwins/Desktop/Morrow/Morrow Brand/morrow-styleguide.pdf`
- Font ZIP: `/Users/gerwins/Desktop/Morrow/Morrow Brand/Font/Hanken_Grotesk.zip`
- Kobe Info: `/Users/gerwins/Desktop/Morrow/Morrow Brand/Font/Kobe Info_.docx`
- Logo-Ordner: `/Users/gerwins/Desktop/Morrow/Morrow Brand/Logo/`

Projektkopien:
- Styleguide-Seiten: `data/styleguide_pages/page-01.png` bis `page-23.png`
- Web-Fonts: `public/fonts/`
- Web-Logos: `public/brand/logos/`
- Web-Illustrationen: `public/brand/illustrations/`
- Aktuelle Web-Bildassets: `public/brand/`

## Logos

### Wordmark / Logomark

SVG-Varianten im Projekt:
- `public/brand/logos/wordmark/morrow-logomark-black.svg`
- `public/brand/logos/wordmark/morrow-logomark-offblack.svg`
- `public/brand/logos/wordmark/morrow-logomark-offwhite.svg`
- `public/brand/logos/wordmark/morrow-logomark-white.svg`

Legacy/Web-Aliase:
- `public/brand/morrow-wordmark-offblack.svg`
- `public/brand/morrow-wordmark-white.svg`

Regel:
- Auf hellen/offwhite Flaechen bevorzugt `offblack`.
- Auf dunklen/offblack oder clay/sage Flaechen bevorzugt `offwhite` oder `white`.
- Immer grosszuegigen Clear Space lassen.
- Nicht verzerren, nicht einfassen, nicht mit Effekten versehen.

### Icon

SVG-Varianten im Projekt:
- `public/brand/logos/icon/morrow-icon-black.svg`
- `public/brand/logos/icon/morrow-icon-offblack.svg`
- `public/brand/logos/icon/morrow-icon-offwhite.svg`
- `public/brand/logos/icon/morrow-icon-white.svg`

Legacy/Web-Aliase:
- `public/brand/morrow-icon-offblack.svg`
- `public/brand/morrow-icon-offwhite.svg`

Regel:
- Icon fuer kleine Markenmomente, Favicon, Footer, App/Portal-UI.
- Wordmark fuer oeffentliche Kommunikation und neue Besucher.

### UI-Iconography Und Illustrationen

Styleguide-Referenz:
- `data/styleguide_pages/page-22.png`: Iconography mit MingCute als UI-Icon-System.
- `data/styleguide_pages/page-21.png`: Illustrationsstil fuer organische Morrow-Motive.

Regel fuer digitale UI:
- UI-Icons kommen aus `@mingcute/react`.
- Keine Emoji-Nutzung als Interface-Element.
- Keine fremden Icon-Libraries fuer UI-Controls, Fakten, Navigation oder Formularstatus verwenden, solange MingCute ein passendes Symbol bietet.
- Icons als ruhige Line-Icons einsetzen, in `currentColor`, bevorzugt Offblack, Clay oder Sage.
- Icons bleiben funktional und klein; sie ersetzen keine redaktionelle Bildwelt.

Regel fuer illustrative Motive:
- Illustrationen sind eigene Morrow-Motive: locker, organisch, handgezeichnet, leicht unperfekt.
- Motive sitzen grosszuegig in weichen Rounded-Square-Tiles.
- Farbwelt: Offwhite mit deep muted olive-brown Linework oder umgekehrt.
- Keine realistischen, 3D-, Glow-, Neon-, Cartoon- oder Clipart-Illustrationen.

Aktuelle Illustrationsassets:
- `public/brand/illustrations/morrow-illu-arrival.svg`
- `public/brand/illustrations/morrow-illu-family-nature.svg`
- `public/brand/illustrations/morrow-illu-open-time.svg`
- `public/brand/illustrations/morrow-illu-couple-reset.svg`
- `public/brand/illustrations/morrow-illu-dinner.svg`
- `public/brand/illustrations/morrow-illu-walk.svg`

## Farben

Styleguide-Farbanker:
- Offblack: `#181715`
- Offwhite: `#ece6d6`
- Sage/Oliv: warme gedeckte Gruen-/Olivflaeche aus dem Styleguide
- Clay/Braun: warme braune Flaeche aus dem Styleguide
- Weiss/Paper: ruhige Arbeitsflaeche, nicht dominant steril

Aktuelle CSS-Tokens:
- `--offblack: #181715`
- `--offwhite: #ece6d6`
- `--paper: #fffdf8`
- `--mist: #f7f4eb`
- `--sage: #706b3f`
- `--clay: #75491f`
- `--sand: #d8cfbc`

Regel:
- Keine kalten SaaS-Farben.
- Keine grellen Akzente.
- Keine einfarbige, langweilige Beige-Seite.
- Kontrast immer gegen Offblack/Offwhite pruefen.

## Typografie

Im Styleguide:
- Kobe: markante Brand-/Display-Schrift
- Hanken Grotesk: Text und Information

Im Projekt aktuell verfuegbar:
- `public/fonts/HankenGrotesk-VariableFont_wght.ttf`
- `public/fonts/HankenGrotesk-Italic-VariableFont_wght.ttf`

Kobe liegt aktuell nur als Info-Dokument vor, nicht als Webfont-Datei.
Die lokale Kobe-Info verweist auf den Kauf bei VJ Type und nennt als benötigte Schnitte `regular`, `bold`, `black`. Für eine echte Web-Nutzung müssen die passenden Kobe-Webfont-Dateien und eine gültige Lizenz vorliegen.

Regel:
- Bis Kobe als Webfont verfuegbar ist, Hanken Grotesk mit hohem Gewicht fuer Display nutzen.
- Headlines gross, ruhig, selbstbewusst.
- Information klar, nicht verspielt.
- Kein negativer Letter-Spacing-Einsatz.

## Styleguide-Seiten

Wichtige Referenzen:
- `data/styleguide_pages/page-01.png`: Cover, Markenwirkung
- `data/styleguide_pages/page-05.png`: About this brand
- `data/styleguide_pages/page-08.png`: Brand Values
- `data/styleguide_pages/page-11.png`: Logotype
- `data/styleguide_pages/page-12.png`: Clear Space
- `data/styleguide_pages/page-14.png`: Combinations / Farbwirkung
- `data/styleguide_pages/page-16.png`: Typography

## Design-Pruefung Vor Abnahme

- [ ] `docs/STYLEGUIDE_OPERATING_RULES.md` gelesen und angewendet
- [ ] Styleguide-Seiten passend zur Aufgabe geprüft
- [ ] Wordmark oder Icon korrekt eingesetzt
- [ ] Clear Space eingehalten
- [ ] Farben aus Brand-Tokens genutzt
- [ ] Hanken Grotesk geladen
- [ ] Kobel/Kobe nur genutzt, wenn lizenzierte Webfont-Dateien vorliegen
- [ ] Experience- und Real-Estate-Bildwelt nicht vermischt
- [ ] Illustrationen folgen Seite 21 des Styleguides
- [ ] UI-Icons kommen aus MingCute
- [ ] Keine kalte SaaS-Optik
- [ ] Keine generische Booking-Plattform-Aesthetik
- [ ] Plattformfunktion klar, aber Brand bleibt ruhig/editorial
- [ ] Interne Inhalte bleiben intern
