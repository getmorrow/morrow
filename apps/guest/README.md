# Morrow Guest App

Geschuetzte Next-App fuer `Deine Auszeit`.

Status: fuehrend fuer den codegeschuetzten Gaestebereich, aber vor zahlenden Gaesten muss der End-to-End-Flow ueber `docs/ADMIN_PARITY_QA_RUNBOOK.md` abgenommen werden.

## Rolle

`apps/guest` begleitet gebuchte oder angefragte Auszeiten:

- Start und Aufenthaltsueberblick.
- Meine Auszeit und Buchung.
- Anreise, Check-in, Schluessel und Unterkunftsregeln aus Admin-/Supabase-Daten.
- Vor-Ort-Karte mit kuratierten Orten.
- Hilfe-/Supportverlauf.
- Feedback und Nach-Aufenthalt-Modus.
- Wiederkommen-/neue-Auszeit-Impuls nach Abschluss.

Admin bleibt Quelle der Wahrheit; diese App zeigt nur gaesterelevante Ausschnitte.

## Fuehrende Dokumente

- `docs/MIGRATION_CONSOLIDATION_AUDIT.md`
- `docs/ADMIN_PARITY_QA_RUNBOOK.md`
- `docs/PLATFORM_ARCHITECTURE.md`
- `docs/MORROW_MVP_COMPLETION_PLAN.md`

## Vorhanden

- Zugriff ueber Buchungs-ID plus persoenlichen Access-Code.
- Buchung und Auszeit werden ueber `get_guest_stay()` geladen.
- Start, Auszeit, Buchung, Vor Ort, Hilfe, Feedback und Wiederkommen.
- Supportnachrichten werden in `support_messages` gespeichert.
- Sichtbare Antworten aus Admin laufen ueber `get_guest_support_events()` zurueck in den Hilfe-Verlauf.
- Feedback wird in `guest_feedback` gespeichert.
- Vor-Ort-Karte mit Leaflet und kuratierten Orten.
- Lokaler Dev-Sichttest: `/deine-auszeit/dev-active?code=MORROWDEV` funktioniert nur ausserhalb von Production.

## Noch Nicht Als Final Bewiesen

- Production-App-QA mit echter `GUEST_BASE_URL`, Buchungs-ID und Access-Code.
- Voller End-to-End-Flow Anfrage -> Buchung -> Gaestebereich -> Support -> Antwort -> Feedback.
- Echte Live-/Amtsquelle fuer Gezeiten.
- Realtime-/WhatsApp-nahe Supportkommunikation.
- Weitere Statusvarianten fuer Sonderfaelle.

## Lokale Nutzung

Aus dem Repo-Root:

```bash
npm run guest:dev:port
npm run guest:build
```

App-intern:

```bash
npm run -w @morrow/guest dev -- --port 4310
npm run -w @morrow/guest build
npm run -w @morrow/guest typecheck
```

## Testdaten Und QA

Supabase-Testdatensatz:

```bash
npm run supabase:seed-active-guest-test
```

Der Seed benoetigt `SUPABASE_SERVICE_ROLE_KEY` und erzeugt:

```text
/deine-auszeit/11111111-1111-4111-8111-111111111111?code=MORROW1
```

Wiederholbarer Supabase-/Browser-Check:

```bash
npm run supabase:verify-guest
GUEST_VERIFY_SEED=1 npm run supabase:verify-guest
GUEST_VERIFY_SUPPORT_REPLY=1 npm run supabase:verify-guest
GUEST_BASE_URL=https://<guest-app-domain> npm run supabase:verify-guest
```

Screenshots entstehen unter `tmp/qa/guest-stay/`.

## Env

Browserzugriff:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Server-/QA-Skripte:

```bash
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Service Role nur lokal/CI/serverseitig nutzen, niemals im Browser.
