# Morrow Auszeiten Content Model

Dieses Dokument definiert, wie Morrow-Auszeiten langfristig aufgebaut werden. Es ist die Grundlage dafuer, dass neue Auszeiten spaeter im Admin angelegt und gepflegt werden koennen, ohne fuer jede neue Auszeit die Website im Code umzubauen.

Wichtig:
- Oeffentlich sprechen wir von `Auszeit` und `Auszeiten`.
- Intern darf das Datenmodell weiter `package` heissen.
- Der Admin soll kuratierte Inhalte pflegbar machen, aber keinen beliebigen Page Builder ersetzen.
- Die Website bleibt Morrow-gefuehrt: feste Qualitaetsstruktur, flexible Inhalte.

## Ziel

Eine neue Auszeit soll spaeter durch Admin-Eingaben entstehen:
- Name, Zielgruppe, Ort, Preis, Termine
- Unterkunft
- ein oder mehrere Erlebnisse
- Empfehlungen vor Ort
- Bilder
- Texte pro Section
- FAQ
- Anfrageformular-Logik

Der Code soll nur noch das Template rendern, nicht pro Auszeit eigene Texte hart enthalten.

## Grundentscheidung

Wir bauen kein komplett freies CMS mit beliebigen Sections.

Stattdessen:
- feste Morrow-Detailseiten-Struktur
- editierbare Inhalte pro Section
- optionale Sections
- Reihenfolge nur begrenzt steuerbar
- Templates fuer Zielgruppen und Auszeit-Typen

Warum:
- mehr Konsistenz
- bessere Conversion
- weniger Designbruch
- leichter admin-faehig
- weniger Risiko, dass neue Auszeiten nicht nach Morrow aussehen

## Template-Logik

Jede Auszeit nutzt ein Template.

Start-Templates:
- `family`: fuer Familien-Auszeiten
- `couple`: fuer Paarauszeiten

Spaeter moeglich:
- `friends`: fuer Freundesgruppen
- `active`: fuer bewegungsorientierte Auszeiten
- `wellness`: fuer ruhige Erholungs-Auszeiten
- `seasonal`: fuer saisonale Angebote

Ein Template definiert:
- Standard-Section-Reihenfolge
- Standard-Formularfelder
- Standard-Tonalitaet
- Bildprioritaeten
- Pflichtfelder

Die konkreten Inhalte kommen aus dem Auszeit-Datensatz.

## Auszeit Basisfelder

Pflicht:
- `id`
- `slug`
- `name`
- `template`
- `audience`
- `location`
- `status`
- `headline`
- `subline`
- `shortPromise`
- `cta`
- `priceFrom`
- `concretePrice`
- `priceNote`
- `dates`
- `maxGuests` oder `fixedGuests`
- `dogOptional`
- `propertyId`

Optional:
- `season`
- `durationLabel`
- `occasionTags`
- `internalNotes`
- `seoTitle`
- `seoDescription`
- `canonicalPath`

Statuswerte:
- `draft`
- `review`
- `published`
- `paused`
- `archived`

## Verknuepfungen

Jede Auszeit kann verknuepft sein mit:
- genau einer Hauptunterkunft pro Termin in Phase 1
- spaeter mehreren Unterkunftsoptionen pro Auszeit
- einem oder mehreren Erlebnisbestandteilen
- Empfehlungen vor Ort
- Erlebnisanbietern
- Agentur- oder Eigentuemerpartnern
- Ratgeberartikeln

Phase-1-Regel:
- Eine Auszeit zeigt eine konkrete Unterkunft.
- Ein Termin ist mit einer konkreten Unterkunft und den zugehoerigen Verfuegbarkeiten verbunden.

Spaeter:
- Eine Auszeit kann mehrere Termine mit unterschiedlichen Unterkuenften haben, wenn die Experience gleich bleibt.

## Section Model

Jede Auszeit besteht aus Sections. Eine Section hat:
- `type`
- `enabled`
- `order`
- `kicker`
- `headline`
- `body`
- `image`
- `imageAlt`
- optionale `items`
- optionale `caption`
- optionale `cta`

Nicht jede Section braucht jedes Feld.

### 1. Hero

Zweck:
- sofort klarmachen, fuer wen die Auszeit ist
- emotionales Versprechen
- Ort und Kernangebot
- CTA zur Anfrage

Pflichtfelder:
- `kicker`
- `headline`
- `lead`
- `primaryImage`
- `supportingImageStay`
- `supportingImageExperience`
- `ctaLabel`
- `audienceLabel`

Regeln:
- Bilder muessen Menschen und Gefuehl zeigen, nicht nur Landschaft.
- Mobile-first: zentrale Personen duerfen mobil nicht abgeschnitten werden.
- Keine internen Begriffe wie `Paket`, `Phase 1`, `MVP`.

### 2. Summary

Zweck:
- schneller Ueberblick fuer Preis, Termine, Unterkunft, Erlebnis

Pflichtfelder:
- `price`
- `dates`
- `stayName`
- `includedExperience`

Quelle:
- moeglichst automatisch aus Preis-, Termin-, Unterkunfts- und Erlebnisdaten.

### 3. Feeling / Story

Zweck:
- das emotionale Ergebnis der Auszeit beschreiben

Pflichtfelder:
- `kicker`
- `headline`
- `lead`
- `image`
- `cues`

Regeln:
- wenig Text, viel Atmosphaere.
- Nicht erklaeren, was Morrow intern macht.
- Aus Sicht der Gaeste schreiben.

### 4. Region

Zweck:
- erklaeren, warum der Ort zur Auszeit passt

Pflichtfelder:
- `headline`
- `lead`
- `image`
- `points`

Point-Felder:
- `title`
- `body`

Regeln:
- Ort nicht touristisch generisch beschreiben.
- Immer mit der Zielgruppe verbinden.
- SPO: Weite, Nordsee, Wind, Duene, Strand, Pfahlbauten, kurze Entscheidungen.

### 5. Rhythm / Ablaufgefuehl

Zweck:
- nicht Tagesplan, sondern Aufenthaltsgefuehl zeigen

Pflichtfelder:
- `headline`
- `lead`
- `image`
- `captionTitle`
- `caption`
- `steps`

Step-Felder:
- `title`
- `body`

Regeln:
- Kein durchgetakteter Reiseplan.
- Wenige gute Anker statt vollem Programm.

### 6. Unterkunft

Zweck:
- konkrete Unterkunft zeigen und Vertrauen schaffen

Quelle:
- Unterkunftsdatensatz

Pflichtfelder im Unterkunftsdatensatz:
- `name`
- `description`
- `sleeps`
- `bedrooms`
- `bathrooms`
- `locationNote`
- `features`
- `images`
- `imageRightsConfirmed`
- `checkInType`
- `earliestArrival`
- `latestArrival`
- `checkOutTime`

Zusaetzliche oeffentliche Felder:
- `guestStayLead`
- `whatHelpsLabel`

Regeln:
- Gaeste muessen sehen, welches Objekt sie anfragen.
- Schluessel- und Check-in-Infos koennen im Detail gezeigt werden, aber sensible Codes erst nach Buchung/Login.

### 7. Erlebnis

Zweck:
- zeigen, welches Erlebnis in der Auszeit enthalten ist und welche weiteren Bausteine moeglich sind

Quelle:
- Erlebnisbestandteile

Pflichtfelder je Erlebnisbestandteil:
- `title`
- `role`
- `includedInPrice`
- `confirmationStatus`
- `guestNotes`

Optionale Felder:
- `providerId`
- `providerName`
- `image`
- `duration`
- `weatherDependency`
- `ageFit`
- `privateNotes`

Regeln:
- Eine Auszeit kann mehrere Erlebnisse enthalten.
- Mindestens ein Erlebnis kann als `included` markiert sein.
- Optionales und Geplantes muss oeffentlich vorsichtig formuliert werden.

### 8. Empfehlungen Vor Ort

Zweck:
- den vorbereiteten Charakter zeigen, ohne die ganze Reise vorwegzunehmen

Pflichtfelder je Empfehlung:
- `title`
- `category`
- `description`

Optionale Felder:
- `address`
- `mapUrl`
- `season`
- `weatherFit`
- `audienceFit`
- `visibleBeforeBooking`
- `visibleAfterBooking`

Regeln:
- Auf der oeffentlichen Seite nur anteasern.
- Detaillierte Routen, Karten und sensible Partnerdetails spaeter im Gastbereich.

### 9. Closing Story

Zweck:
- emotionaler Uebergang vor Vertrauen und Anfrage

Pflichtfelder:
- `kicker`
- `headline`
- `lead`
- `backgroundImage`
- `imageAlt`

Regeln:
- darf grossflaechig mit Bild arbeiten.
- soll warm und ruhig wirken, nicht werblich.

### 10. Moments / Ergebnis

Zweck:
- konkretisieren, wie sich die Auszeit anfuehlen kann

Pflichtfelder:
- `headline`
- `image`
- `caption`
- `moments`

Moment-Felder:
- `title`
- `body`

Regeln:
- Keine vertikalen Trennlinien.
- Keine harten Prozessmodule.
- Eher editorial, ruhig, menschlich.

### 11. Trust / Stimmen

Zweck:
- Vertrauen, Wiedererkennung und emotionale Bestaetigung

Pflichtfelder:
- `kicker`
- `headline`
- `lead`
- `testimonials`

Testimonial-Felder:
- `name`
- `quote`
- `image`
- `imageAlt`
- `rating`
- `type`

Regeln:
- Wenn es noch keine echten Bewertungen gibt, nicht negativ formulieren.
- Keine Aussagen wie `bis echte Bewertungen vorliegen`.
- Besser: beschreiben, was Familien/Paare sich wuenschen.
- Bilder muessen zur jeweiligen Stimme passen.
- Keine Hero-Personas fuer Testimonials verwenden, wenn dadurch Dopplung entsteht.

### 12. Nach Der Anfrage

Zweck:
- Unsicherheit reduzieren
- erklaeren, dass Anfrage keine Buchung ist

Pflichtfelder:
- `headline`
- `lead`
- `pills`
- `steps`

Regeln:
- keine internen Prozessbegriffe.
- nicht `Phase 1`, `MVP`, `Lead`, `Admin`, `Checkout-Logik`.
- Aus Gaestesicht schreiben.

### 13. FAQ

Zweck:
- letzte Huerden vor Anfrage klaeren

Quelle:
- Auszeit-Datensatz

Pflicht:
- mindestens 3 FAQ

Regeln:
- Aus Gaestesicht.
- Keine internen Gruende.
- Keine technischen Roadmap-Begriffe.
- Keine falschen Versprechen.

### 14. Anfrage

Zweck:
- Conversion in Anfrage

Pflichtfelder:
- `headline`
- `lead`
- `assurancePills`
- Formularfelder nach Template

Formularfelder Family:
- Name
- E-Mail
- Telefon
- Termin
- Personenanzahl
- Kinderalter optional
- Hund optional
- WhatsApp-Opt-in optional
- Nachricht optional

Formularfelder Couple:
- Name
- E-Mail
- Telefon
- Termin
- Anlass optional
- Hund optional
- WhatsApp-Opt-in optional
- Nachricht optional

Regeln:
- Termin ist Select aus festen Terminen, kein Kalender in Phase 1.
- Standardkommunikation ist E-Mail.
- WhatsApp nur optional mit Zustimmung.

## Admin-Bearbeitbarkeit Nach Prioritaet

### Admin V1 Muss

- Auszeit anlegen, bearbeiten, duplizieren
- Status setzen: draft/published/paused
- Basisfelder
- Preise und Termine
- Unterkunft verknuepfen
- Erlebnisbestandteile verknuepfen
- Empfehlungen pflegen
- FAQ pflegen
- Bilder pro Section pflegen
- alle oeffentlichen Texte pro Section bearbeiten

### Admin V1 Sollte

- Section aktivieren/deaktivieren
- Reihenfolge innerhalb enger Grenzen anpassen
- Vorschau vor Veroeffentlichung
- Pflichtfeld-Check
- Bildrechte-Check
- Styleguide-Checkliste vor Veroeffentlichung

### Admin Spaeter

- Versionierung
- Freigabeprozess
- mehrsprachige Inhalte
- A/B-Tests fuer CTA und Headlines
- SEO-/GEO-Felder pro Section
- KI-gestuetzte Textvorschlaege mit Styleguide-Pruefung

## Technische Zielstruktur

Aktueller Zustand:
- `src/data.ts` enthaelt Auszeit-Basisdaten.
- `src/App.tsx` enthaelt noch viele detailseitige Texte hart nach `family-escape` und `couple-reset`.

Ziel:
- `src/data.ts` oder spaeter Supabase enthaelt vollstaendige Auszeit-Contentdaten.
- `PackagePage` rendert generisch aus `item.contentSections`.
- Neue Auszeiten brauchen keinen neuen Codepfad.

Empfohlene Typen:

```ts
type PackageTemplate = 'family' | 'couple' | 'friends' | 'active' | 'wellness' | 'seasonal'

type PackageSectionType =
  | 'hero'
  | 'summary'
  | 'feeling'
  | 'region'
  | 'rhythm'
  | 'stay'
  | 'experience'
  | 'recommendations'
  | 'closingStory'
  | 'moments'
  | 'trust'
  | 'afterRequest'
  | 'faq'
  | 'request'

type PackageContentSection = {
  type: PackageSectionType
  enabled: boolean
  order: number
  kicker?: string
  headline?: string
  lead?: string
  image?: string
  imageAlt?: string
  captionTitle?: string
  caption?: string
  items?: Array<{
    title: string
    body: string
    image?: string
    imageAlt?: string
  }>
}
```

## Datenbank-Erweiterung

Die Tabelle `packages` braucht spaeter ein Feld:

```sql
content_sections jsonb not null default '[]'::jsonb
```

Optional:

```sql
template text not null default 'family'
seo jsonb not null default '{}'::jsonb
publishing_checklist jsonb not null default '{}'::jsonb
```

## Migration Vom Aktuellen Code

Schritt 1:
- `MorrowPackage.slug` von festem Union-Typ auf `string` erweitern.
- `template` einfuehren.
- Detail-Copy aus `App.tsx` nach `data.ts` verschieben.

Schritt 2:
- `PackagePage` nutzt keine harte `isFamily ? ... : ...`-Copy mehr.
- Zielgruppenunterschiede kommen aus `template` und `contentSections`.

Schritt 3:
- Admin-Formular zuerst intern/prototypisch fuer Basisdaten, Termine, FAQ, Empfehlungen.
- Danach Section-Editor.

Schritt 4:
- Supabase-Schema anpassen und Inhalte aus Datenbank laden.

## Abnahmekriterien Fuer Neue Auszeiten

Eine neue Auszeit darf oeffentlich gehen, wenn:
- alle Pflichtfelder ausgefuellt sind
- konkrete Unterkunft sichtbar ist
- mindestens ein Erlebnis klar erklaert ist
- feste Termine hinterlegt sind
- Anfrageformular korrekt zur Zielgruppe passt
- keine internen Begriffe sichtbar sind
- Bilder keine Dopplungen auf derselben Seite erzeugen
- Styleguide-Regeln erfuellt sind
- Mobile-Ansicht geprueft ist
- Desktop-Ansicht geprueft ist
- Anfrageflow getestet ist

## Offene Entscheidung

Vor Admin-Bau klaeren:
- Soll eine Auszeit immer genau eine Hauptunterkunft zeigen oder duerfen mehrere Unterkuenfte pro Auszeit sichtbar waehlen?
- Duerfen Admins Section-Reihenfolge frei aendern oder nur einzelne Sections aktivieren/deaktivieren?
- Wie streng soll der Styleguide-Check technisch werden?
- Wann wechseln wir von lokaler Seed-Datei zu Supabase als Quelle?
