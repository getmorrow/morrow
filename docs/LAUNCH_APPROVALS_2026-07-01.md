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

Erst danach setzen:

```bash
MORROW_SECRETS_ROTATED_AT=2026-..-..
```

## Angebotsdaten

Status: offen

Zu pruefen:
- reale Termine je Auszeit,
- reale Preise und Preislogik,
- enthaltene Leistungen,
- konkrete Unterkunft inklusive Nutzungsrechte an Bildern und Texten,
- konkretes Erlebnis inklusive Anbieter, Kapazitaet, Preis-/Inklusivlogik und Verfuegbarkeit,
- Verantwortlichkeit fuer Support, Check-in, Schluessel, Objektprobleme und Notfaelle.

Erst danach setzen:

```bash
MORROW_OFFER_DATA_APPROVED_AT=2026-..-..
```

## Tracking Und Consent

Status: offen

Entscheidung erforderlich:
- GA4 aktivieren: ja/nein
- Meta Pixel aktivieren: ja/nein
- Paid Ads starten: ja/nein
- Consent-Gate final pruefen
- Test-Events fuer Formularabschluss und relevante CTAs pruefen, falls Tracking aktiv ist

Technisch vorhanden:
- Tracking-Komponente laedt GA/Meta nur nach Zustimmung.
- Ohne Public Tracking IDs werden keine Tracking-Skripte geladen.

Erst nach finaler Entscheidung und, falls aktiv, getesteten IDs setzen:

```bash
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
