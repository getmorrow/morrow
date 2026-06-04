# Morrow Phase 1 Implementation Blueprint

Zentrale Orientierung:
- `docs/MORROW_MASTER_FRAME.md`
- `docs/STYLEGUIDE_OPERATING_RULES.md`
- `docs/BRAND_ASSET_REGISTRY.md`
- `docs/PHASE1_INFORMATION_ARCHITECTURE.md`
- `docs/PLATFORM_MODEL_PHASE2.md`
- `docs/WIREFRAMES_PHASE1.md`
- `docs/COMPETITOR_ANALYSIS_SPO.md`

Status: Bauanleitung vor Umsetzung.

## Grundprinzipien

- Mobile first.
- Keine generische Buchungsplattform.
- Pakete statt Unterkunftssuche.
- Datenmodelle so bauen, dass Phase-2-Plattformmodule anschliessbar bleiben.
- Keine interne Daten/Agenten/Briefing-Inhalte oeffentlich zeigen.
- Morrow verkauft umfassende Aufenthalte, nicht reine Uebernachtungen.
- Styleguide vor UI-Entscheidungen prüfen und als Abnahmekriterium nutzen.
- Jede sichtbare Seite muss Local Connection, Human Warmth, Simplicity & Mindfulness und Quality & Care spürbar machen.
- Experience- und Unterkunftsbilder werden getrennt gedacht.
- UI-Icons kommen aus MingCute; Illustrationen folgen dem organischen Morrow-Stil.

## Routen

Phase 1 bauen:
- `/`
- `/pakete/family-escape`
- `/pakete/couple-reset`
- `/ratgeber`
- `/ratgeber/[slug]`
- `/eigentuemer`
- `/partner/erlebnisanbieter`
- internes Admin/Leadbereich

Nicht Phase 1:
- `/pakete`
- `/sankt-peter-ording`
- Login/Portal
- App
- Kalender
- Direktbuchung

## Hauptkomponenten

### Layout

- `SiteShell`
- `Header`
- `Footer`
- `MobileNav`
- `PageIntro`

Header:
- Wordmark
- Navigation: Pakete, Ratgeber, Fuer Eigentuemer
- CTA: Auszeit planen
- Kein Login

Footer:
- Wordmark/Icon
- Links: Pakete, Ratgeber, Fuer Eigentuemer, Erlebnis anbieten
- Kontakt
- Keine interne Admin-/Agentenlogik

### Paket-Komponenten

- `PackageCard`
- `PackageHero`
- `IncludedItems`
- `StaySection`
- `ExperienceSection`
- `LocalRecommendations`
- `DatePriceSection`
- `InquiryForm`
- `MobileInquiryDrawer`
- `TrustSteps`

### Content-Komponenten

- `ArticleCard`
- `ArticleHero`
- `ArticleBody`
- `ArticleFaq`
- `RelatedPackageCta`

### B2B-Komponenten

- `OwnerValueSection`
- `OwnerProcess`
- `OwnerForm`
- `ExperiencePartnerForm`

### Admin-Komponenten

- `AdminShell`
- `LeadTable`
- `LeadStatusSelect`
- `PartnerInquiryTable`
- `PackageTable`
- `PackageEditor`
- `PackageStatusToggle`
- `PackagePreviewLink`

## Datenmodelle

### Package

```ts
type Package = {
  id: string
  slug: string
  name: string
  audience: 'families' | 'couples'
  location: string
  headline: string
  shortPromise: string
  priceFrom: string
  concretePrice?: string
  dates: string[]
  status: 'draft' | 'published' | 'paused'
  maxGuests?: number
  fixedGuests?: number
  dogOptional: boolean
  propertyId?: string
  images: string[]
  stay: Stay
  included: string[]
  experienceDirections: string[]
  experienceItems: ExperienceItem[]
  recommendations: Recommendation[]
  createdAt: string
  updatedAt: string
}
```

### ExperienceItem

```ts
type ExperienceItem = {
  id: string
  experienceId?: string
  providerId?: string
  title: string
  role: 'included' | 'optional' | 'recommendation' | 'planned'
  includedInPrice: boolean
  confirmationStatus: 'planned' | 'requested' | 'confirmed'
  guestNotes?: string
  internalNotes?: string
}
```

### Stay

```ts
type Stay = {
  id?: string
  name: string
  description: string
  sleeps: number
  locationNote: string
  features: string[]
  imageRightsConfirmed: boolean
  checkInType?: 'key_safe' | 'agency_pickup' | 'personal_handover' | 'smartlock' | 'unknown'
  earliestArrival?: string
  latestArrival?: string
  checkOutTime?: string
}
```

### Recommendation

```ts
type Recommendation = {
  title: string
  category: 'food' | 'nature' | 'weather' | 'family' | 'couple' | 'service'
  description: string
}
```

### GuestLead

```ts
type GuestLead = {
  id: string
  packageSlug: string
  packageName: string
  name: string
  email: string
  phone: string
  preferredChannel: 'email'
  selectedDate: string
  guests?: number
  childrenAges?: string
  dog?: 'yes' | 'no' | 'unknown'
  occasion?: 'Jahrestag' | 'Geburtstag' | 'Einfach raus aus dem Alltag' | 'Ueberraschung' | 'Anderer Anlass'
  whatsappOptIn: boolean
  message?: string
  status: 'Neu' | 'Angerufen' | 'Reserviert' | 'Bezahlt' | 'Abgeschlossen'
  createdAt: string
}
```

### OwnerLead

```ts
type OwnerLead = {
  id: string
  name: string
  email: string
  phone: string
  propertyLocation: string
  propertyType: string
  sleeps: number
  currentRental: 'self' | 'agency' | 'platforms' | 'not-yet'
  listingUrl?: string
  message?: string
  status: 'Neu' | 'Kontakt aufgenommen' | 'In Pruefung' | 'Passend' | 'Nicht passend'
  createdAt: string
}
```

### ExperiencePartnerLead

```ts
type ExperiencePartnerLead = {
  id: string
  name: string
  email: string
  phone: string
  businessName: string
  location: string
  experienceType: string
  link?: string
  description: string
  audienceFit: 'Familien' | 'Paare' | 'Beide'
  message?: string
  status: 'Neu' | 'Kontakt aufgenommen' | 'In Pruefung' | 'Passend' | 'Nicht passend'
  createdAt: string
}
```

### Article

```ts
type Article = {
  slug: string
  title: string
  description: string
  audience: 'families' | 'couples' | 'both'
  relatedPackageSlugs: string[]
  sections: ArticleSection[]
  faqs: Faq[]
}
```

## Formularlogik

### Paket-Anfrage

Gemeinsam:
- Paket wird automatisch aus Seite gespeichert.
- Kein Paket-Dropdown.
- Termin als Select aus festen Paket-Terminen.
- Kein Kalender.
- Kein Login.
- E-Mail ist immer Standardkanal fuer Benachrichtigung und Kommunikation.
- WhatsApp-Kontakt nur als expliziter optionaler Opt-in fuer wichtige Nachrichten zur Anfrage/Reise.

Mobile:
- CTA `Auszeit anfragen` oeffnet Bottom Drawer.
- Drawer ist schliessbar.
- Success-State im Drawer.

Desktop:
- CTA scrollt zum eingebetteten Anfrage-Modul.

Family Escape:
- Name
- E-Mail
- Telefonnummer
- Termin
- Personenanzahl
- Kinderalter optional
- Hund optional
- WhatsApp-Opt-in optional
- Nachricht optional

Couple Reset:
- Name
- E-Mail
- Telefonnummer
- Termin
- Hund optional
- Anlass optional als Select
- WhatsApp-Opt-in optional
- Nachricht optional

### Eigentuemerseite

CTA:
- `Immobilie vorstellen`

Kein Umsatz/Auslastung im Formular.

### Erlebnisanbieter

CTA:
- `Erlebnis anbieten`

Kuratierte Partneranfrage, keine offene Marketplace-Registrierung.

## Admin Phase 1

Mindestens:
- Guest Leads
- Status wechseln
- Paket anzeigen
- Termin anzeigen
- Kontakt anzeigen
- Paketliste anzeigen
- Paketstatus `draft`, `published`, `paused` vorbereiten
- Eigentuemeranfragen anzeigen
- Erlebnisanbieteranfragen anzeigen
- Export vorbereiten

Spaeter:
- Owner Leads
- Experience Partner Leads
- Pakete anlegen, bearbeiten, duplizieren und archivieren
- Objektinfos, Bilder, Preise, feste Termine, Leistungen, Erlebnisse und Empfehlungen pflegen
- Vorschau-Link pro Paket
- Notizen
- Quelle / Kampagne

Architekturregel:
- Paketdaten nicht tief in UI-Komponenten hart verdrahten.
- In Phase 1 duerfen Startpakete als Seed-/Mockdaten existieren.
- Komponenten muessen aber gegen das `Package`-Datenmodell rendern, damit spaeter Supabase/Admin die Quelle werden kann.
- Neue Pakete sollen langfristig ohne Code-Aenderung oeffentlich geschaltet werden koennen.
- Phase 1 baut noch keinen vollstaendigen Paketeditor; sie bereitet die Datenstruktur dafuer vor.

## Content Startdaten

Pakete:
- `Family Escape`
- `Couple Reset`

Ratgeberartikel:
- `Sankt Peter-Ording mit Kindern: entspannte Ideen fuer Familien`
- `Auszeit zu zweit in Sankt Peter-Ording: ruhige Orte und besondere Erlebnisse`
- `Was kann man in Sankt Peter-Ording machen? Erlebnisse fuer Familien und Paare`

## QA Pro Seite

### Global

- [ ] Mobile-first Layout zuerst pruefen
- [ ] Desktop danach pruefen
- [ ] Header ist nicht ueberladen
- [ ] Kein Login in Hauptnavigation
- [ ] Keine internen Begriffe sichtbar
- [ ] Wordmark korrekt und mit Clear Space
- [ ] Farben aus Brand Registry
- [ ] Hanken Grotesk geladen

### Startseite

- [ ] In 5 Sekunden klar: Morrow, SPO, Pakete, CTA
- [ ] Family Escape und Couple Reset sichtbar
- [ ] Eigentuemer sekundär sichtbar
- [ ] Ratgeber-Teaser sichtbar

### Paketdetail

- [ ] Paket wirkt wie Aufenthalt, nicht Objektinserat
- [ ] Konkretes Objekt sichtbar
- [ ] Erlebnis integriert
- [ ] Empfehlungen vor Ort sichtbar
- [ ] feste Termine und Preis klar
- [ ] Mobile Bottom Drawer funktioniert
- [ ] Desktop Formular erreichbar
- [ ] WhatsApp-Opt-in ist optional, nicht vorausgewaehlt und klar als Servicekontakt formuliert

### Ratgeber

- [ ] Artikel beantworten Suchintention
- [ ] Paket-CTA passend
- [ ] FAQ vorbereitet

### B2B

- [ ] Eigentuemerformular fragt keine sensiblen Daten
- [ ] Erlebnisanbieter wirkt kuratiert

## Offene Umsetzungsschritte

- [x] Bestehende App-Struktur bereinigen oder neu aufsetzen
- [x] Routing einbauen
- [x] Datenmodelle in Code anlegen
- [x] Dummy-Daten fuer zwei Pakete anlegen
- [x] Paketdaten als austauschbare Datenquelle statt fest in Komponenten bauen
- [ ] Formulare lokal speichern oder Supabase anbinden
- [x] Mobile Drawer bauen
- [x] Admin fuer alle Leadtypen erweitern
- [x] Admin-Paketverwaltung vorbereiten
- [ ] Screenshots mobile/desktop je Seite
