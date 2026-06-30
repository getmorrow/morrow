# Morrow Launch Status Snapshot

Stand: 2026-06-30

Dieser Snapshot hält den aktuellen Go-/No-Go-Stand nach der Verschärfung von `qa:apps` fest. Er ersetzt nicht `docs/ADMIN_PARITY_QA_RUNBOOK.md`, sondern zeigt, welche Gates heute noch blockieren.

## Kurzfazit

Morrow ist weiterhin öffentlich erreichbar und technisch weit, aber noch nicht für einen voll freigegebenen MVP-Start mit zahlenden Gästen bereit.

Aktueller Status:

- Öffentliche Website: Production-Basischeck grün.
- Launch-Gates: rot durch 11 Blocker.
- App-QA: rot, weil Admin-, Gäste- und Owner-App-URLs nicht gesetzt sind.
- Paid Ads: nicht freigeben.
- Zahlende Gäste: nicht freigeben.
- Kontrollierte echte Leads: erst nach rechtlicher/env-seitiger Mindestbereinigung und mindestens gelbem Admin-Paritätslauf.

## Ausgeführte Checks

### `npm run qa:readiness`

Ergebnis: rot.

```text
ok: false
latestAdminParityRun: null
adminParityResult: Missing
openRunbookManualGates: 24
uncheckedRunbookTemplateItems: 36
legalPlaceholderFiles: 3
blockerGroups: 7
```

Blockergruppen:

- Admin-Paritätslauf unter `docs/qa/admin-parity/` fehlt noch.
- Rechtstexte/Freigaben noch nicht sauber.
- Supabase Public Env im aktuellen Gate-Kontext nicht gesetzt.
- Admin-, Gäste- und Owner-App-URLs im aktuellen Gate-Kontext nicht gesetzt.
- Secret-Rotation nicht bestätigt.
- Angebotsdaten nicht freigegeben.
- Tracking/Consent nicht freigegeben oder nicht konfiguriert.

Dieser Check ist die kompakte Startstufen-Ampel für:

- interne Tests
- kontrollierte echte Leads
- zahlende Gäste
- Paid Ads

### `npm run qa:admin-parity:preflight`

Ergebnis: rot.

Vorhanden:

- Supabase Public URL lokal gesetzt.
- Supabase anon key lokal gesetzt.

Fehlend:

- Admin-App-URL.
- Gäste-App-URL.
- Owner-App-URL.
- Admin-Testlogin.
- Guest-Testbuchung mit Access-Code.
- Owner-Testlogin.

### `npm run qa:launch-gates`

Ergebnis: rot.

```text
ok: false
blockers: 11
warnings: 3
passed: 35
exit: 1
```

Blocker:

| Bereich | Blocker |
| --- | --- |
| Recht | Impressum enthält noch Arbeits-/Platzhalterhinweise. |
| Recht | AGB enthält noch `Arbeitsfassung`. |
| Recht | Stornobedingungen enthält noch `Arbeitsfassung`. |
| Freigabe | `MORROW_LEGAL_APPROVED_AT` fehlt. |
| Env | `NEXT_PUBLIC_SUPABASE_URL` oder `VITE_SUPABASE_URL` fehlt im aktuellen Gate-Kontext. |
| Env | `NEXT_PUBLIC_SUPABASE_ANON_KEY` oder `VITE_SUPABASE_ANON_KEY` fehlt im aktuellen Gate-Kontext. |
| Env | `MORROW_ADMIN_APP_URL` fehlt. |
| Env | `MORROW_GUEST_APP_URL` fehlt. |
| Env | `MORROW_OWNER_APP_URL` fehlt. |
| Sicherheit | `MORROW_SECRETS_ROTATED_AT` fehlt nach Secret-Rotation. |
| Angebot | `MORROW_OFFER_DATA_APPROVED_AT` fehlt nach finaler Angebotsfreigabe. |

Warnings:

| Bereich | Warning |
| --- | --- |
| Tracking | `NEXT_PUBLIC_GA_MEASUREMENT_ID` fehlt. |
| Tracking | `NEXT_PUBLIC_META_PIXEL_ID` fehlt. |
| Freigabe | `MORROW_TRACKING_APPROVED_AT` fehlt. |

### `QA_BASE_URL=https://www.getmorrow.de npm run qa:production`

Ergebnis: grün.

```text
ok: true
checkedPages: 12
checkedForms: 4
```

Nicht geprüft:

- App-Redirects, weil `MORROW_ADMIN_APP_URL`, `MORROW_GUEST_APP_URL` und `MORROW_OWNER_APP_URL` fehlen.
- Consent-Banner, weil keine GA-/Meta-IDs gesetzt sind.
- Echter Lead-Submit, weil `MORROW_QA_SUBMIT_LEAD` nicht aktiviert war.

Screenshot:

- `tmp/qa/production-rehearsal/family-form-mobile.png`

### `npm run qa:apps`

Ergebnis: rot.

```text
ok: false
checkedApps: 0
reason: No app base URLs set. Provide ADMIN_BASE_URL, OWNER_BASE_URL and/or GUEST_BASE_URL.
exit: 1
```

Aktuelle Regel:

- Ohne App-URLs ist `qa:apps` rot.
- Mit nur einem oder zwei App-URLs ist `qa:apps` ebenfalls rot.
- Vollständige App-QA verlangt Admin-, Gäste- und Owner-App.
- Teilprüfungen sind nur bewusst mit `MORROW_QA_ALLOW_PARTIAL_APPS=1` möglich und gelten nicht als Launch-Abnahme.

## Bewertung Nach Startstufe

| Startstufe | Status | Begründung |
| --- | --- | --- |
| Interne Tests | Grün | Lokale Checks und Doku-Gates laufen; Runbook ist vorbereitet. |
| Öffentliche Website live sichtbar | Grün/Gelb | Website ist erreichbar, aber Rechtstexte, Env und Freigaben sind offen. |
| Kontrollierte echte Leads | Gelb/Rot | Erst nach rechtlicher Mindestbereinigung, App-URLs und Admin-Paritätslauf mindestens gelb. |
| Zahlende Gäste | Rot | Admin-Paritätsrun muss grün sein; App-QA, Recht, Secrets und Angebotsdaten müssen abgeschlossen sein. |
| Paid Ads | Rot | Tracking/Consent, Recht, Conversion-Messung und Angebotsfreigabe sind nicht final. |

## Nächste Konsolidierungsschritte

1. Rechtstexte und Impressum aus Arbeitsfassung/Platzhalterstatus bringen.
2. App-Projekt-URLs für Admin, Gäste und Owner final in Vercel setzen.
3. Supabase Public Env im Launch-Gate-Kontext setzen.
4. Geteilte Secrets rotieren und `MORROW_SECRETS_ROTATED_AT` erst danach setzen.
5. Finale Angebotsdaten freigeben und `MORROW_OFFER_DATA_APPROVED_AT` setzen.
6. Tracking-/Consent-Entscheidung treffen und bei Bedarf GA/Meta-IDs testen.
7. `docs/ADMIN_PARITY_EXECUTION_PLAN.md` mit echten Testdaten abarbeiten und Protokoll unter `docs/qa/admin-parity/` ausfüllen.
8. `npm run qa:admin-parity:validate`, `npm run qa:readiness`, `npm run qa:launch-gates`, `npm run qa:production` und `npm run qa:apps` erneut mit allen URLs und Testzugängen ausführen.
