# Morrow Phase 1 MVP Architecture

Zentrale Orientierung: zuerst `docs/MORROW_MASTER_FRAME.md` lesen. Dieses Dokument beschreibt den Phase-1-MVP-Funnel fuer die zwei Startpakete `Family Escape` und `Couple Reset`.

Aktueller Morrow-One-Liner:
Morrow kuratiert Urlaubspakete in besonderen Kuestenorten: ausgewaehlte Unterkuenfte, lokale Erlebnisse und persoenliche Betreuung in einem Aufenthalt.

## Ziel

Proof of Demand fuer kuratierte Urlaubspakete in Sankt Peter-Ording.

Validiert wird:
- Ads zu Landingpage
- Landingpage zu Anfrage
- Telefonische Qualifizierung
- echte Buchungsbereitschaft fuer stressfreie Aufenthalte fuer Familien und Paare

## MVP-Schnitt

Gebaut wird:
- Landingpage
- Leadformular
- simples internes Admin-Dashboard
- persönlicher Aufenthaltsbereich nach verbindlicher Buchung und Zahlung

Grundregel:
- Mobile first.
- Anfrageformulare auf Paketdetailseiten oeffnen mobil als Bottom Drawer.
- Desktop nutzt ein eingebettetes Anfrage-Modul oder Scrollziel.
- Der Gästebereich ist kein öffentlicher Haupt-CTA. Er wird erst nach bestätigter/bezahlter Buchung freigeschaltet.

Nicht im MVP:
- User Accounts
- Direkt-Checkout
- Kalender-Sync
- komplexe Plattform
- App
- Erlebnis-Auswahl

Gästebereich `Deine Auszeit` im MVP:
- nach verbindlicher Buchung und Zahlung
- bewusst schlank: persönlicher Zugangscode/private Buchungsseite statt vollem Nutzerkonto
- muss sich wie ein eigener App-Bereich anfühlen, nicht wie eine normale Website-Unterseite
- eigene Gästebereich-Hülle ohne öffentliche Website-Navigation
- App-Navigation: `Start`, `Meine Buchung`, `Vor Ort`, `Hilfe`
- `Start`: persönlicher Überblick und nächste wichtige Schritte
- `Meine Buchung`: Termin, Unterkunft, Check-in, enthaltenes Erlebnis, Anreiseinformationen
- `Vor Ort`: lokale Orientierung, Empfehlungen und OpenStreetMap-Link/Kartenansicht
- `Hilfe`: direkter Kontakt-/Supportbereich und spätere Ticketlogik
- WhatsApp-Freigabe optional, E-Mail bleibt Standard

Spätere Erweiterung des Gästebereichs:
- Wetterbericht und Ebbe/Flut
- ortsgebundene Infos wie Veranstaltungen, Wochenmarkt, Strände, Entdeckungen
- interaktive OpenStreetMap-Karte mit Filtern und Routenstart über Kartendienst
- Zusatzservices wie Private Cooking, Yoga oder Wellness
- Chat mit Morrow-Support
- Eskalations-/Ticketsystem für Objektprobleme, Weiterleitung an Ferienvermietungsanbieter oder später Morrow-Operations

## Phase-1-Produkte

Phase 1 startet mit zwei kuratierten Paketen:
- 1 Paket fuer Familien
- 1 Paket fuer Paare ab 28/30
- Paketnamen duerfen nicht an eine feste Dauer gebunden sein, also kein `Weekend` oder `Week`
- Paketnamen enthalten nicht `Morrow`; Morrow bleibt die Dachmarke
- Einstieg erfolgt ueber Pakete + Ort: `Family Escape` und `Couple Reset` in Sankt Peter-Ording
- Plattform zeigt `ab`-Preise; Paketdetail-/Landingpages zeigen konkrete Preise
- Primaerer Gaeste-CTA: `Auszeit planen`
- Spaetere CTA-Testvariante: `Aufenthalt anfragen`
- Primaerer Eigentuemer-CTA: `Immobilie vorstellen`
- Startseite priorisiert Gaeste; Eigentuemer erscheinen sekundaer, aber sichtbar
- Login/Portal erscheint erst nach Anfrage oder Buchung, nicht als oeffentlicher Haupt-CTA
- Ratgeber/Blog wird als eigene Plattformseite fuer SEO/GEO vorgesehen
- Pakete enthalten eigene Empfehlungen vor Ort, zugeschnitten auf Zielgruppe und Anlass
- Pakete zeigen konkrete Objekte, wenn Objektinfos/Fotos nutzbar sind und die Agentur freie Termine nennt
- Morrow kuratiert die Objekte selbst
- Morrow baut das Paket selbst aus Objekt, Erlebnis, Empfehlungen und Betreuung
- Die einzige operative Abstimmung mit der Agentur fuer das Paket sind die freien Termine und Nutzbarkeit der Objektinfos/Fotos
- Fremdagenturen sind Phase-1-Bruecke fuer Markteintritt und Positionierung
- Langfristig arbeitet Morrow direkt mit Eigentuemern und ersetzt im Hintergrund die klassische Agenturrolle

Plattform-First-Screen:
- Balance aus Hospitality-Marke und klarer Paket-Auswahl
- Headline: `Kuratierte Auszeiten in Sankt Peter-Ording.`
- Subline: `Morrow verbindet ausgewaehlte Unterkuenfte, lokale Erlebnisse und persoenliche Betreuung zu Urlaubspaketen fuer Familien und Paare.`
- Pakete direkt sichtbar: `Family Escape`, `Couple Reset`
- CTA: `Auszeit planen`

Expansionsprinzip:
- Phase 1 startet in Sankt Peter-Ording.
- Spaetere Orte muessen direkt am Wasser liegen.
- Plausible Kandidaten: Scharbeutz, Timmendorfer Strand, Sylt, spaeter Mallorca.
- Ob Morrow dort selbst als lokaler Operator/Ersatz-Agentur auftritt oder mit Partnerstrukturen arbeitet, ist spaeter strategisch zu klaeren.

Phase-1-Hauptnavigation:
- Pakete
- Sankt Peter-Ording
- Ratgeber
- Fuer Eigentuemer

Primary CTA:
- Auszeit planen

Nicht in der primaeren Navigation:
- Login
- Unterkuenfte
- Erlebnisse
- Ueber uns

Das bisher konkretisierte Paket:

Family Escape
- Ort: Sankt Peter-Ording
- Termine: 12.-16. August und 19.-23. August
- Preis: 1.190 EUR pro Aufenthalt
- Bis 4 Personen
- Enthalten: Unterkunft, 1 Erlebnis, kuratierter Aufenthalt, Ansprechpartner vor Ort
- Unterkunft wird konkret gezeigt, sobald Objektbeschreibung/Fotos nutzbar sind und die Agentur freie Termine nennt
- Personenanzahl variabel, aber durch Objekt/Schlafplaetze und Morrow-Maximum begrenzt
- Erlebnisrichtungen: Wattwandern, Reiten, Natur, kindertaugliche lokale Aktivitaeten
- Formular: Paket automatisch aus Seite, feste Termin-Auswahl, bei Familien getrennt Erwachsene/Kinder/Kinderalter, optional Hund, kein Kalender
- optionaler WhatsApp-Opt-in fuer wichtige Nachrichten zur Anfrage/Reise

Das Paar-Paket:
- Arbeitsname: `Couple Reset`
- fuer Paare ab 28/30
- raus aus Alltag, Arbeit oder privatem Stress
- ein paar Tage, die sich wie deutlich mehr Erholung anfuehlen
- Zweisamkeit, Wiederfinden, Ankommen
- Erlebnisse sind im Paket enthalten
- passend fuer Geburtstag, Jahrestag oder spontane Auszeit
- spaetere Namensvarianten: `Slow Escape`, `Coast Reset`
- immer fuer 2 Personen
- je nach Objekt optional mit Hund denkbar
- Erlebnisrichtungen: Wellness, Yoga, gemeinsames Kochen, Dinner, ruhige Zwei-Personen-Erlebnisse
- Formular: Paket automatisch aus Seite, feste Termin-Auswahl, optional Hund, optional Anlass-Select, kein Kalender
- optionaler WhatsApp-Opt-in fuer wichtige Nachrichten zur Anfrage/Reise

Erlebnisanbieter-Workflow:
- pro Ort interne Datenbank lokaler Erlebnisanbieter und Gastronomiepartner aufbauen
- Anbieter per Recherche/Scraping erfassen
- Anbieter kuratieren und persoenlich ansprechen
- Kooperationen fuer konkrete Pakete aufbauen
- Erlebnisse paketabhaengig integrieren, keine freie Erlebnis-Auswahl im MVP

Eigentuemerformular:
- Name
- E-Mail
- Telefonnummer
- Ort der Immobilie
- Art der Immobilie
- Anzahl Schlafplaetze
- aktuelle Vermietung
- optional Link zum Objekt / Expose / Inserat
- optional Nachricht
- keine Umsatz-/Auslastungsabfrage in Phase 1

Erlebnisanbieterformular:
- URL: `/partner/erlebnisanbieter`
- Footer-Link: `Erlebnis anbieten`
- Nicht in der Hauptnavigation
- Name
- E-Mail
- Telefonnummer
- Name des Angebots / Unternehmens
- Ort
- Art des Erlebnisses
- Website / Instagram / Link
- kurze Beschreibung
- geeignet fuer Familien, Paare oder beide
- Nachricht

Ratgeber-Startartikel:
- `Sankt Peter-Ording mit Kindern: entspannte Ideen fuer Familien`
- `Auszeit zu zweit in Sankt Peter-Ording: ruhige Orte und besondere Erlebnisse`
- `Was kann man in Sankt Peter-Ording machen? Erlebnisse fuer Familien und Paare`

## Aktuelle technische Umsetzung

Dieses Repo nutzt fuer den Prototyp:
- React/Vite
- Supabase fuer Leads, Admin Auth, E-Mail-Automation, Aufgaben, Auszeiten, Buchungsanlage und Gaestebereich-Zugriff
- `localStorage` nur noch als Demo-/Fallback-Schicht; siehe `docs/SUPABASE_STORAGE_AUDIT_2026-06-05.md`
- Plattform-Start unter `/`
- Paketdetail-/Ads-Landingpages unter `/pakete/family-escape` und `/pakete/couple-reset`
- Admin-CRM unter `/admin`

Wichtig: Paketdetailseiten sind zugleich Proof-of-Demand-Funnels. Sie ersetzen nicht die Morrow-Startseite.

Fuer echte Ads und echte Leads als naechster Schritt:
- Supabase Tabelle `leads`
- Supabase Tabelle `packages`
- Vercel Hosting
- Server-/Edge-Function fuer Bestaetigungsmail
- Statuswerte: Neu, Angerufen, Reserviert, Bezahlt, Abgeschlossen

## Supabase Lead Schema

```sql
create table leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  package_slug text not null,
  date text not null,
  guests integer not null,
  whatsapp_opt_in boolean not null default false,
  status text not null default 'Neu',
  created_at timestamptz not null default now()
);
```

## Supabase Package Schema

Pakete sollen langfristig im Admin gepflegt werden koennen. Der Code soll nicht dauerhaft fuer jede neue Auszeit angepasst werden muessen.

```sql
create table packages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  template text not null default 'family',
  audience text not null,
  location text not null,
  headline text not null,
  short_promise text not null,
  price_from text not null,
  concrete_price text,
  dates jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  max_guests integer,
  fixed_guests integer,
  dog_optional boolean not null default false,
  property_id uuid,
  images jsonb not null default '[]'::jsonb,
  stay jsonb not null default '{}'::jsonb,
  included jsonb not null default '[]'::jsonb,
  experience_directions jsonb not null default '[]'::jsonb,
  experience_items jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  content_sections jsonb not null default '[]'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Admin-Ziel:
- Pakete anlegen
- Pakete bearbeiten
- Pakete duplizieren
- Pakete pausieren oder veroeffentlichen
- Termine, Preise, Objektinfos, Bilder, Leistungen, Erlebnisse und Empfehlungen pflegen
- Section-Inhalte pro Auszeit pflegen, ohne fuer jede neue Auszeit Code zu aendern

Content-Modell:
- Verbindliche Detailstruktur siehe `docs/PACKAGE_CONTENT_MODEL.md`.
- Neue Auszeiten nutzen feste Templates wie `family` oder `couple`.
- Admins bearbeiten Inhalte pro Section, aber bauen keine beliebigen Landingpages.

## Automatische Mail

Nach Anfrage:

> Danke fuer eure Anfrage. Wir melden uns innerhalb von 24h persoenlich.

Im Prototyp wird diese Nachricht als Success-State angezeigt. Fuer Produktion wird sie per Supabase Edge Function, Resend oder Vercel Function versendet.
