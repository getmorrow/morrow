# Morrow Launch Approval Ledger

Stand: 2026-07-01

Dieses Dokument trennt technische Startbereitschaft von echter fachlicher Freigabe. Es ist die Arbeitsliste fuer die roten Launch-Gates. Freigabe-Env-Werte duerfen erst gesetzt werden, wenn der jeweilige Abschnitt belastbar abgeschlossen ist.

## Recht

Status: offen

Technisch erledigt:
- Oeffentliche Rechtseiten enthalten keine Arbeitsfassungs-/Platzhalterhinweise mehr.
- AGB, Buchungsbedingungen, Stornobedingungen und Zahlungsbedingungen sind als klare operative Bedingungen formuliert.

Vor Freigabe zu erledigen:
- Anbieterkennzeichnung im Impressum juristisch vollstaendig machen.
- Datenschutz inklusive Supabase, Resend, WhatsApp, Supportdaten, Feedback, Tracking und Aufbewahrung pruefen.
- AGB, Buchungsbedingungen, Storno- und Zahlungsbedingungen rechtlich/fachlich freigeben.

Fehlende Daten fuer finale Anbieterkennzeichnung:
- Rechtsform / vollstaendiger Anbietername
- ladungsfaehige Anschrift
- vertretungsberechtigte Person, falls anwendbar
- Registergericht und Registernummer, falls anwendbar
- Umsatzsteuer-ID oder Hinweis, falls anwendbar
- verantwortliche Person fuer Inhalte, falls erforderlich

Erst danach setzen:

```bash
MORROW_LEGAL_APPROVED_AT=2026-..-..
```

## Secret-Rotation

Status: offen

Zu rotieren, weil Werte im Arbeitsverlauf geteilt wurden:
- Supabase Service Role Key
- Supabase Personal Access Token
- Resend API Key
- GitHub Personal Access Token
- geteilte Admin-/Testpasswoerter

Nach Rotation:
- neue Werte nur in den jeweils richtigen Secret-Stores setzen,
- keine Server-Secrets in `NEXT_PUBLIC_` oder `VITE_` Variablen legen,
- Supabase Edge Function Secrets fuer E-Mail-Versand neu setzen,
- Admin-/Owner-/Testzugriffe mit neuen Passwoertern pruefen.

Rotationsreihenfolge:
1. GitHub PAT neu erstellen, alten Token widerrufen und Push/Deploy-Zugriff testen.
2. Supabase Personal Access Token neu erstellen, alten Token widerrufen und CLI-/Management-Zugriff testen.
3. Supabase Service Role Key rotieren oder neues Projekt-Secret setzen, danach alle Server-/QA-Umgebungen aktualisieren.
4. Resend API Key neu erstellen, alten Key widerrufen, Supabase Edge Function Secret `RESEND_API_KEY` aktualisieren und Testmail senden.
5. Geteilte Admin-/Owner-/Testpasswoerter zuruecksetzen, neue Werte nur im Passwortmanager ablegen und Login pruefen.
6. Vercel-Frontend-Projekte kontrollieren: keine Service Role Keys, PATs, Resend Keys oder Passwoerter in Public- oder Frontend-Env.

Erst danach setzen:

```bash
MORROW_SECRETS_ROTATED_AT=2026-..-..
```

## Angebotsdaten

Status: offen

Aktuell sichtbare Angebotsdaten aus `packages/domain/src/index.ts`:

| Auszeit | Termine | Preis | Personenlogik | Enthalten |
| --- | --- | --- | --- | --- |
| Family Escape | 12.-16. August, 19.-23. August | 1.190 EUR pro Aufenthalt | bis 4 Personen, Hund optional | 4 Naechte, 1 lokales Erlebnis, Empfehlungen, Ansprechpartner, Aufenthaltsinfos |
| Couple Reset | 12.-16. August, 19.-23. August | 890 EUR pro Aufenthalt | 2 Personen, Hund optional | Unterkunft fuer 2, 1 Erlebnisbaustein, Dinner-/Spaziergangsempfehlungen, Abstimmung, Check-in-Infos |

Vor Freigabe je Auszeit zu pruefen:
- Termine sind real verfuegbar und mit Unterkunft/Partner bestaetigt.
- Preis ist final und deckt Unterkunft, Erlebnis, Service, Zahlungsabwicklung und Marge ab.
- enthaltene Leistungen sind exakt so lieferbar, wie sie oeffentlich kommuniziert werden.
- konkrete Unterkunft ist freigegeben, inklusive Bild-/Textnutzungsrechten.
- konkrete Erlebnispartner sind bestaetigt, inklusive Kapazitaet, Preis-/Inklusivlogik, Wetter-/Ausfallregeln und Verfuegbarkeit.
- Verantwortlichkeit fuer Support, Check-in, Schluessel, Objektprobleme und Eskalation ist je Unterkunft eindeutig geklaert.
- Gastkommunikation nach Buchung passt zu den realen Partnerbedingungen.

Erst danach setzen:

```bash
MORROW_OFFER_DATA_APPROVED_AT=2026-..-..
```

## Tracking Und Consent

Status: offen

Pflicht fuer jeden Lead:
- First-Party-Herkunftserfassung bleibt aktiv, auch wenn GA4/Meta deaktiviert sind.
- Oeffentliche Formulare speichern Quelle, Medium, Kampagne, Content, Suchbegriff, Referrer, Landing Path, aktuelle URL sowie Google-/Meta-Click-IDs (`gclid`, `fbclid`), sofern vorhanden.
- Admin zeigt Quelle, Kampagne, Kampagnenkontext, Click-ID und Einstieg im Anfrage-Drawer.

Entscheidung erforderlich:
- `MORROW_TRACKING_MODE=disabled`: keine GA4-/Meta-Messung, keine Paid Ads Freigabe
- `MORROW_TRACKING_MODE=enabled`: GA4 und Meta Pixel mit Consent-Gate aktivieren
- Paid Ads starten: ja/nein
- Consent-Gate final pruefen
- Test-Events fuer Formularabschluss und relevante CTAs pruefen, falls Tracking aktiv ist

Technisch vorhanden:
- Tracking-Komponente laedt GA/Meta nur nach Zustimmung.
- Ohne Public Tracking IDs werden keine Tracking-Skripte geladen.
- CTA-Klicks mit `data-conversion` werden nach Zustimmung an GA4 und Meta gemeldet, wenn IDs gesetzt sind.
- Live-Testlead vom 2026-07-02 ueber `https://www.getmorrow.de/auszeiten/family-escape` wurde in Supabase verifiziert: Quelle `qa`, Medium `rehearsal`, Kampagne `production-rehearsal-20260702073619`, Formular `Auszeit anfragen`. Der QA-Lead `50dfe27d-0649-4d70-82cd-674208001f0e` wurde danach archiviert.

Empfohlene Launch-Entscheidung:
- Kontrollierte echte Leads koennen ohne GA4/Meta starten, wenn Recht, Secrets und Angebotsdaten freigegeben sind.
- Paid Ads sollten erst starten, wenn GA4 und Meta Pixel bewusst aktiviert, Consent-Gate geprueft und Test-Events dokumentiert sind.
- Wenn Tracking bewusst deaktiviert bleibt, bleibt Paid Ads rot.

Erst nach finaler Entscheidung und, falls aktiv, getesteten IDs setzen:

```bash
MORROW_TRACKING_MODE=disabled
MORROW_TRACKING_APPROVED_AT=2026-..-..
```

Oder bei aktivem Tracking:

```bash
MORROW_TRACKING_MODE=enabled
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...
NEXT_PUBLIC_META_PIXEL_ID=...
MORROW_TRACKING_APPROVED_AT=2026-..-..
```

## Aktueller Go-/No-Go

- Kontrollierte echte Leads: nicht freigegeben
- Zahlende Gaeste: nicht freigegeben
- Paid Ads: nicht freigegeben

Naechster Beleglauf:

```bash
npm run qa:launch-gates
npm run qa:readiness
npm run qa:admin-parity:status
npm run qa:migration-consolidation
npm run typecheck
```
