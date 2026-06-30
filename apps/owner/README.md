# Morrow Owner App

Geschuetzte Next-App fuer Eigentuemertransparenz.

Status: MVP-Light. Die App zeigt nur Ausschnitte, die Admin/Supabase bereits pflegen kann. Sie ist nicht fuehrend fuer operative Stammdaten.

## Rolle

`apps/owner` zeigt Eigentuemern:

- freigeschaltete Objekte.
- Buchungen und Auszeiten zu diesen Objekten.
- Luecken-/Vermarktungshinweise.
- freigegebene Dokumente.
- freigegebene Abrechnungen.
- freigegebene Operationsmeldungen.
- eigene Rueckfragen und sichtbare Admin-Antworten.

Admin bleibt Quelle der Wahrheit. Owner koennen im MVP Rueckfragen und Verfuegbarkeits-/Eigenbelegungswünsche einreichen, aber keine automatischen Kalender- oder Stammdatenentscheidungen treffen.

## Fuehrende Dokumente

- `docs/MIGRATION_CONSOLIDATION_AUDIT.md`
- `docs/PLATFORM_ARCHITECTURE.md`
- `docs/OWNER_PORTAL_SETUP.md`
- `docs/ADMIN_PARITY_QA_RUNBOOK.md`

## Vorhanden

- Login per Supabase Auth.
- Zugriff nur fuer freigeschaltete `owner_profiles`.
- Objektbegrenzung ueber `owner_property_access`.
- Dashboard liest `get_owner_dashboard()`.
- Freigegebene Eigentuemerdokumente aus `owner_documents`.
- Freigegebene Monatsabrechnungen aus `owner_statements`.
- Freigegebene Operationsmeldungen aus `owner_operations`.
- Strukturierte Rueckfragen zu Objekt, Buchung, Eigenbelegung/Verfuegbarkeit oder Abrechnung.
- Owner-Rueckfragen landen als `support_messages` im Admin.
- Sichtbare Admin-Antworten laufen ueber `get_owner_communication_events()`.
- Statushistorie zu Rueckfragen ueber `get_owner_support_status_events()`.

## Noch Nicht Als Final Bewiesen

- Production-App-QA mit echter `OWNER_BASE_URL` und freigeschaltetem Owner-Testzugang.
- Dokumenten-Upload und sichere Dateiablage statt URL-Pflege.
- Echte Kalenderwirkung fuer Verfuegbarkeits-/Eigenbelegungsfreigaben.
- Tiefere Performance- und Provisionsauswertungen.
- Partner-/Agentur-/Hotel-Logins; diese bleiben V2.

## Lokale Nutzung

Aus dem Repo-Root:

```bash
npm run owner:dev:port
npm run owner:build
```

App-intern:

```bash
npm run -w @morrow/owner dev -- --port 4320
npm run -w @morrow/owner build
npm run -w @morrow/owner typecheck
```

## QA

Mit bestehendem Owner-Testzugang:

```bash
SUPABASE_URL=https://haifftleyussrokyafqq.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
SUPABASE_ANON_KEY=<anon-key> \
OWNER_EMAIL=<owner-email> \
OWNER_PASSWORD=<owner-password> \
OWNER_VERIFY_SUPPORT_INSERT=1 \
OWNER_VERIFY_DOCUMENT_ACCESS=1 \
OWNER_VERIFY_STATEMENT_ACCESS=1 \
OWNER_VERIFY_OPERATION_ACCESS=1 \
npm run supabase:verify-owner
```

Mit temporaerem Owner:

```bash
OWNER_VERIFY_TEMP_OWNER=1 \
OWNER_VERIFY_SUPPORT_INSERT=1 \
OWNER_VERIFY_DOCUMENT_ACCESS=1 \
OWNER_VERIFY_STATEMENT_ACCESS=1 \
OWNER_VERIFY_OPERATION_ACCESS=1 \
npm run supabase:verify-owner
```

Production-App-QA:

```bash
ADMIN_BASE_URL=https://<admin-app-domain> \
GUEST_BASE_URL=https://<guest-app-domain> \
OWNER_BASE_URL=https://<owner-app-domain> \
npm run qa:apps
```

Ein isolierter Owner-App-Check ist nur bewusst als Teilpruefung erlaubt:

```bash
MORROW_QA_ALLOW_PARTIAL_APPS=1 OWNER_BASE_URL=https://<owner-app-domain> npm run qa:apps
```

## Env

Browserzugriff:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

QA-Skripte benoetigen je nach Modus:

```bash
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OWNER_EMAIL=...
OWNER_PASSWORD=...
```
