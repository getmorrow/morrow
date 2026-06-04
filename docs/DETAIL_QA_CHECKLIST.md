# Detail QA Checklist

Vor jeder QA zuerst gegenlesen:
- `docs/MORROW_MASTER_FRAME.md`
- `docs/STYLEGUIDE_OPERATING_RULES.md`
- `docs/BRAND_ASSET_REGISTRY.md`
- `docs/UI_RHYTHM_TYPOGRAPHY.md`

## Vor Abnahme Immer Pruefen

- `npm run lint`
- `npm run build`
- `npm run qa:smoke`
- Desktop Screenshot bei 1440px Breite
- Mobile Screenshot bei 390px Breite
- Keine sichtbaren internen Begriffe auf oeffentlichen Seiten: Agent, Datenbank, Score, Pipeline, MVP, Lead
- Keine Console-Fehler

## Visuelle QA

- Styleguide wurde sichtbar angewendet, nicht nur grob referenziert.
- Die Seite erfüllt Local Connection, Human Warmth, Simplicity & Mindfulness und Quality & Care.
- Tonalität wirkt confident, inspirational, approachable und knowledgeable.
- Morrow-Farben werden korrekt genutzt.
- Logo ist lesbar und hat genug Abstand.
- Wortmarke/Icon sind nicht verzerrt, eingeengt oder dekorativ verfremdet.
- Header ueberdeckt keine Inhalte.
- Mobile Layout ist eigenstaendig nutzbar.
- Desktop zeigt keine Phone-Mockups oder App-Welt.
- Text laeuft nicht aus Buttons, Pills oder Cards.
- Bildmodule laden stabil und sind nicht leer.
- Experience-Bilder wirken offen, weit, menschlich und dynamisch.
- Unterkunftsbilder wirken näher, wärmer, ruhiger und objektbezogen.
- Bilder wirken nicht generisch, glatt oder künstlich.
- Illustrationen wirken organisch, handgezeichnet, warm und Morrow-eigen.
- Icons kommen aus MingCute; keine Emojis als UI-Elemente.
- Primaere und sekundaere Aktionen sind klar unterscheidbar.
- Die ersten Sekunden beantworten: fuer wen, was bekomme ich, warum besser, was soll ich tun.

## Funktions-QA

- `Auszeit planen` fuehrt zum passenden Anfrageflow.
- Feste Termine sind auf den Paketdetailseiten klar sichtbar.
- Beide Terminkarten uebernehmen den gewaehlen Termin ins Formular.
- Anfrageformular validiert Name, E-Mail, Telefon und speichert einen Lead.
- WhatsApp-Opt-in ist optional und nicht vorausgewaehlt.
- Danke-Hinweis erscheint nach Absenden.
- Admin-Ansicht unter `?admin=1` zeigt den Lead in der Tabelle.
- Statuswechsel im Admin aktualisiert Zaehler und Tabellenstatus.

## Code-QA

- Keine toten Imports.
- Keine Debug-Ausgaben.
- Interne Daten bleiben in `data/` und `docs/`, nicht in sichtbaren Website-Komponenten.
- Komponenten bleiben verstaendlich geschnitten.
- Formfelder haben Labels und passende Input-Typen.
- Prototype-Lead-Speicherung ist klar als `localStorage` markiert und spaeter durch Supabase ersetzbar.
