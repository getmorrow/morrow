# Morrow Visual Asset Guidelines

Diese Datei definiert die verbindlichen Regeln für Bilder, Illustrationen und Metabrand-Details der Website.

Verbindliche Referenz:
- `docs/STYLEGUIDE_OPERATING_RULES.md`
- `docs/IMAGE_PERSONAS.md`
- Styleguide-Seiten 18, 19, 20, 21, 22 und 23

## Metabrand

- Favicon: `public/favicon.svg`, Morrow-Icon auf Offwhite.
- Seitentitel: `Morrow | Kuratierte Auszeiten am Wasser`.
- Meta-Description erklärt Morrow als kuratierte Auszeiten in Sankt Peter-Ording.
- Open-Graph-Bild: solange noch kein finales Social-Sharing-Motiv vorliegt, wird `/brand/generated/morrow-spo-hero.png` genutzt.

## Bildstil

Morrow-Bilder müssen wirken wie:
- warm
- menschlich
- ruhig
- leicht editorial
- nordisch
- ehrlich vor Ort
- gern leicht körnig oder analog

Bilder sollen zeigen:
- echte Nähe zu Sankt Peter-Ording, Nordsee, Dünen, Strand, Pfahlbauten, Wind und Weite
- Menschen in natürlichen Momenten, nicht posierend
- Unterkunft als Rückzugsort, nicht als sterile Immobilienanzeige
- Erlebnisse als Stimmung und gemeinsamer Moment, nicht als Aktivitätskatalog

Bilder dürfen nicht wirken wie:
- glatte KI-Renderings
- generische Stockmotive
- Luxus-Hotelwerbung ohne Ort
- kalte Immobilienfotografie
- überinszenierte Influencer-Reisebilder
- SaaS-/Startup-Visuals
- dunkle, stark geblurrte Stimmungsbilder, bei denen man nichts erkennt

## KI-Bild-Prompt-Regel

Wenn neue Morrow-Bilder generiert werden, muss der Prompt diese Richtung enthalten:

`warm candid editorial travel photography in Sankt Peter-Ording, North Sea coast, natural light, human, calm, slightly grainy, soft muted earth tones, real coastal atmosphere, no glossy render, no luxury hotel stock look, no futuristic style, no heavy blur`

Zusätzlich muss bei Bildern mit wiederkehrenden Menschen eine Persona aus `docs/IMAGE_PERSONAS.md` verwendet werden.

Pflicht:
- Family Escape nutzt `Persona Family A`.
- Couple Reset nutzt `Persona Couple A`.
- Neue Menschenmotive bekommen vor der Nutzung eine Persona oder bleiben bewusst neutrale Morrow-Motive.
- Auf einer öffentlichen Seite darf kein Bildmotiv doppelt sichtbar verwendet werden.

Für Familien:
- natürliche Familienmomente
- Strand, Wind, Sand, ruhige Bewegung
- keine perfekte Werbefamilie, keine gestellten Studio-Szenen

Für Paare:
- Abstand vom Alltag
- ruhige Zweisamkeit
- Spaziergang, Dinner, Wellness, Ankommen
- keine kitschige Romantik, keine Hochzeitsoptik

Für Unterkünfte:
- echtes Objektgefühl
- helle, warme Räume
- natürliche Materialien
- klare Blickachsen
- kein steriler Neubau-Render

## Bildrollen auf der Startseite

Family- und Couple-Motive dürfen nicht als generische Seitenbilder verwendet werden.

Regel:
- `morrow-spo-family.png` gehört primär zu `Family Escape`.
- `morrow-spo-couple.png` gehört primär zu `Couple Reset`.
- Hero, Warum-Morrow, Ratgeber, lokale Empfehlungen und finaler CTA brauchen eigene Morrow-/SPO-Motive, damit die Seite nicht redundant wirkt und Zielgruppenbilder nicht beliebig werden.

Aktuelle neutrale Morrow-/SPO-Motive:
- `public/brand/generated/morrow-spo-hero-people-boardwalk.png`: Hero-Hauptbild, gemeinsamer Weg ans Meer, menschliche Bewegung in SPO.
- `public/brand/generated/morrow-spo-hero-people-table.png`: Hero-Collage, menschlicher Aufenthaltsmoment, Nähe und Emotion.
- `public/brand/generated/morrow-spo-local-orientation.png`: Lokal kuratiert, kuratierte Orientierung, SPO-Weite.
- `public/brand/generated/morrow-spo-arrival-detail.png`: Ankommen, Check-in, Vorbereitung, persönliche Betreuung.
- `public/brand/generated/morrow-spo-final-family.png`: finaler CTA, Familie in Sankt Peter-Ording, emotionaler Abschluss der Startseite. Nicht zusätzlich auf der Startseite verwenden.
- `public/brand/generated/morrow-spo-final-boardwalk.png`: Ratgeber-/Paarzeit-Motiv, nicht zusätzlich als finaler CTA verwenden, solange es auf der Startseite als Ratgeberbild aktiv ist.
- `public/brand/generated/morrow-spo-family-watt.png`: Familien-Ratgeberbild, nicht zusätzlich als Family-Card-Bild auf derselben Seite verwenden.
- `public/brand/generated/morrow-spo-image-set.png`: Ratgeberbild für allgemeine SPO-Orientierung, nicht zusätzlich als Hero- oder CTA-Bild verwenden.
- `public/brand/generated/morrow-spo-local-family-orientation.png`: Family-Escape-Ortsorientierung, Mutter/Kind mit Karte an Dünen und Pfahlbau, für `Vor Ort` auf der Family-Detailseite.
- `public/brand/generated/morrow-spo-local-market.png`: nicht mehr als SPO-Ortsmotiv verwenden; wirkt zu erfunden und nicht eindeutig ortstreu.

## Bildrollen Auf Ratgeberartikeln

Ratgeberartikel brauchen eigene Bildlogik, damit sie nicht wie eine Wiederverwertung der Auszeitseiten wirken.

Regeln:
- Hero-Bild, Kontextband und Feature-Sections dürfen auf derselben Artikelseite kein identisches Motiv wiederholen.
- Familienartikel nutzen nur Familien- oder neutrale SPO-Motive, keine Paarmotive.
- Paarartikel nutzen nur Paar- oder neutrale SPO-Motive, keine Familienmotive.
- Keine Motive verwenden, die nicht eindeutig nach Sankt Peter-Ording, Nordsee, Dünen, Strand, Unterkunft oder Ankommen wirken.
- `morrow-spo-local-market.png` ist für Ratgeberartikel gesperrt, weil es nicht ortstreu genug wirkt.
- Wenn KI-generierte Bilder sichtbar am Prompt vorbeigehen, werden sie nicht ins Projekt übernommen.

Aktuelle Ratgeber-Zuordnung:
- Familienartikel Feature-Motive: `morrow-article-family-arrival-dunes.png`, `morrow-article-family-watt-rest.png`, `morrow-article-family-stay-arrival.png`, `morrow-article-family-wide-beach.png`.
- Paarartikel Feature-Motive: `morrow-article-couple-beach-walk.png`, `morrow-article-couple-dunes-rest.png`, `morrow-article-couple-arrival-detail.png`, `morrow-article-couple-table-moment.png`, `morrow-article-couple-wide-boardwalk.png`.

## Bildrollen auf Auszeitdetailseiten

Auszeitdetailseiten trennen Bildrollen klar:
- `heroImage`: emotionales Einstiegsbild der Zielgruppe, nur im Hero verwenden.
- `planImage`: Ablauf/Ankommen, darf nicht das Hero-Motiv wiederholen.
- `experienceImage`: enthaltener Erlebnisbaustein, muss Erlebnis und Ort zeigen.
- `stayImages`: nur Unterkunft/Objekt, keine Erlebnis- oder generischen Zielgruppenbilder.

Family Escape:
- `public/brand/generated/morrow-spo-family.png`: Hero der Auszeit.
- `public/brand/generated/morrow-spo-family-arrival.png`: Ankommen/Ablauf.
- `public/brand/generated/morrow-spo-family-watt.png`: finaler Anfrageanker auf der Family-Detailseite, zeigt den konkreten Naturmoment, auf den die Anfrage hinführt.
- `public/brand/generated/morrow-spo-family-final-moment.png`: großer emotionaler Abschlussmoment der Family-Detailseite, Familie in SPO-Weite nach/auf dem Weg vom Strand; nicht zusätzlich als Hero oder kleine Card verwenden.
- Unterkunftsgalerie: nur Objekt-/Innenraumbilder.

## Illustrationen

Illustrationen folgen `data/styleguide_pages/page-21.png`.

Masterprompt aus dem Styleguide:
```json
{
  "image_request": {
    "format": "square",
    "size": "1024x1024",
    "style": "morrow-organic-icon",
    "prompt": "A minimal, hand-drawn line icon of (Replace this with Motive), centered inside a soft rounded-square tile. The drawing style is loose, organic, and slightly imperfect — like a quick brush-pen or ink sketch. Lines should feel warm, human, and gestural (not geometric). Only one subject, no clutter. The icon sits in the center with generous negative space so it reads well at small sizes. No border around the tile. Use the MORROW color world: either (1) dark muted olive-brown background (#5E5345) with warm off-white linework (#FFF7E6) or (2) soft off-white background (#EDE6CB) with deep muted olive-brown linework (#2A261E). Absolutely no gradients, shadows, outlines, or 3D effects — only flat color and a single line color. The feeling should be calm, intimate, nostalgic, and premium, matching a family & couples travel brand.",
    "negative_prompt": "realism, photographic elements, shading, gradients, 3D rendering, glow, soft shadows, complex scenes, multiple subjects, text, typography, symbols, borders, neon colors, busy composition, high-detail illustration, cartoon style",
    "palette": {
      "background_colors": ["#5E5345", "#EDE6CB"],
      "line_colors": ["#FFF7E6", "#2A261E"]
    },
    "output_usage": "morrow_experience_category_icons",
    "requirements": {
      "subject_count": 1,
      "centered": true,
      "consistent_line_weight": true,
      "icon_readability_at_small_size": true,
      "no_text": true,
      "no_photography": true,
      "flat_colors_only": true
    }
  }
}
```

Regeln:
- handgezogene, organische Linework
- Rounded-Square-Tile
- Offwhite `#EDE6CB` und Olive-Brown `#5E5345`
- ein Motiv pro Illustration
- keine Texte, keine Schatten, keine Verläufe, keine 3D-Anmutung

Aktuelle Web-Illustrationen:
- `morrow-illu-prepared-arrival-styleguide-prompt-transparent.png`
- `morrow-illu-prepared-arrival-styleguide-prompt.png`
- `morrow-illu-prepared-arrival.svg`
- `morrow-illu-arrival.svg`
- `morrow-illu-family-nature.svg`
- `morrow-illu-open-time.svg`
- `morrow-illu-couple-reset.svg`
- `morrow-illu-dinner.svg`
- `morrow-illu-walk.svg`

## Typografie-Status Kobe/Kobel

Hanken Grotesk ist aktiv eingebunden und darf als Webfont genutzt werden.

Kobe/Kobel ist im Styleguide als Display-Schrift vorgesehen, liegt im Projekt aber nicht als Webfont-Datei vor. Die lokale Info-Datei verweist auf den Kauf über VJ Type und nennt die benötigten Schnitte `regular`, `bold`, `black`. Bis die Webfont-Dateien und Lizenz vorliegen, bleibt Hanken Grotesk die einzige aktive Webschrift.
