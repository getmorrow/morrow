# Morrow Admin App

Interne Next-App fuer das operative Morrow-System.

Status: Ziel-App fuer die Quelle der Wahrheit, aber noch nicht als vollstaendiger Ersatz fuer den alten Vite-Admin-CRM freigegeben. Die fachliche Freigabe erfolgt erst nach einem gruenen Lauf von `docs/ADMIN_PARITY_QA_RUNBOOK.md`.

## Rolle

`apps/admin` steuert die operative Plattform:

- Anfragen, Kunden, Buchungen und Aufgaben.
- Support, Feedback und Kommunikationshistorie.
- Auszeiten, Termine, Unterkuenfte, Erlebnisbausteine und lokale Orte.
- Agenturen, Erlebnisanbieter, Eigentuemerprofile und Objektzugriffe.
- Owner-Dokumente, Owner-Abrechnungen und Owner-Operationsmeldungen.
- Audit-Log und Monitoring.

Admin ist laut Plattformarchitektur die Ziel-Quelle der Wahrheit. Bis zur Paritaetsabnahme bleibt der alte Vite-Admin in `src/App.tsx` Referenz fuer fehlende oder noch nicht bewiesene CRM-Flows.

## Fuehrende Dokumente

- `docs/MIGRATION_CONSOLIDATION_AUDIT.md`
- `docs/ADMIN_CRM_PARITY_CHECKLIST.md`
- `docs/ADMIN_PARITY_QA_RUNBOOK.md`
- `docs/MIGRATION_COMPLETION_AUDIT_2026-06-28.md`
- `docs/PLATFORM_ARCHITECTURE.md`
- `docs/PAYLOAD_NORMALIZATION_INVENTORY.md`

## Vorhanden

- Supabase Auth Login.
- Admin-Rollencheck ueber `get_morrow_admin_profile()`.
- Arbeitsbereiche fuer Uebersicht, CRM, Aufgaben, Support, Operations, Bestand, Partner, Eigentuemer und Aktivitaet.
- Leads lesen, filtern, bearbeiten, archivieren, reaktivieren und als Reservierung anlegen.
- Kundenbereich mit echter `customers`-Quelle, Anfrage-/Buchungshistorie, Kontaktlinks und zentraler Kundennotiz.
- Aufgaben anlegen, bearbeiten, filtern, erledigen, wieder oeffnen, loeschen und per Bezug oeffnen.
- Buchungen lesen und Status, Zahlung, Reisegruppe, Fristen, Operationsstatus, naechste Aufgabe und Gaestebereich-Link bearbeiten.
- Supportfaelle lesen, priorisieren, beantworten und in Kommunikation/Audit nachvollziehen.
- Freie E-Mail-Antworten aus Anfrage, Buchung und Support ueber `admin-send-message`.
- Auszeiten, Unterkuenfte, Termine, Erlebnisbausteine und Vor-Ort-Orte pflegen.
- Agenturen, Eigentuemerprofile, Objektzugriffe und Erlebnisanbieter pflegen.
- Owner-Dokumente, Owner-Abrechnungen und Owner-Operationsmeldungen anlegen und statusaendern.
- Audit-Log fuer Admin-Mutationen; statischer Check ueber `npm run qa:admin-audit`.

## Noch Nicht Als Produktiv Bewiesen

- Der komplette Admin-Paritaetslauf aus `docs/ADMIN_PARITY_QA_RUNBOOK.md` mit echten oder realitaetsnahen Testdaten.
- `npm run qa:apps` gegen echte Admin-/Guest-/Owner-URLs.
- Harte Freigabe, dass `apps/admin` den alten Vite-Admin vollstaendig ersetzt.
- Archivierungsstrategie fuer Aufgaben statt hartem Loeschen.
- Medienbibliothek, Upload und Bildreihenfolge.
- Kommunikationsvorlagen und WhatsApp-Template-Flows.
- Statushistorien fuer Anbieter, Agenturen und einige Akquiseprozesse.
- Repository-/Service-Schicht fuer alle Admin-Mutationen; ein Teil schreibt noch direkt aus der Client-Komponente.
- Entscheidung, ob die clientseitigen Arbeitsbereiche fuer MVP reichen oder spaeter echte interne Admin-Routen entstehen.

## Lokale Nutzung

Aus dem Repo-Root:

```bash
npm run admin:dev:port
npm run admin:build
```

App-intern:

```bash
npm run -w @morrow/admin dev -- --port 4301
npm run -w @morrow/admin build
npm run -w @morrow/admin typecheck
```

## Env

Root-`.env.local` wird lokal ueber `next.config.ts` geladen.

Erforderlich fuer Browserzugriff:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Lokal werden alte `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` als Fallback weiter unterstuetzt.

Nicht in Browser-/Vercel-Frontend-Env setzen:

- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- GitHub Tokens
- Supabase Personal Access Tokens

## QA Vor Freigabe

Mindestens:

```bash
npm run typecheck
npx supabase db push --dry-run --linked
git diff --check
npm run lint
npm run qa:admin-audit
npm run admin:build
```

Admin-Login und Rollen-/RLS-Zugriff pruefen:

```bash
ADMIN_EMAIL=<admin-email> \
ADMIN_PASSWORD=<admin-password> \
npm run supabase:verify-admin
```

Vor produktiver Fuehrung:

```bash
ADMIN_BASE_URL=https://<admin-app-domain> \
GUEST_BASE_URL=https://<guest-app-domain> \
OWNER_BASE_URL=https://<owner-app-domain> \
npm run qa:apps
```

Ein isolierter Admin-App-Check ist nur bewusst als Teilpruefung erlaubt:

```bash
MORROW_QA_ALLOW_PARTIAL_APPS=1 ADMIN_BASE_URL=https://<admin-app-domain> npm run qa:apps
```

Danach den manuellen Lauf aus `docs/ADMIN_PARITY_QA_RUNBOOK.md` durchfuehren.

## Regel

Keine neuen Produktfeatures in `apps/admin`, solange die Plattformmigration nicht konsolidiert und die Admin-Paritaet nicht mit Evidenz abgenommen ist.
