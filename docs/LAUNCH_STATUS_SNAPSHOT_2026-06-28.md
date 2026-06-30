# Morrow Launch Status Snapshot

Stand: 2026-06-28

Dieser Snapshot hält den aktuellen Go-/No-Go-Stand aus den bestehenden QA-Gates fest. Er ersetzt nicht `docs/ADMIN_PARITY_QA_RUNBOOK.md`, sondern zeigt, welche Blocker vor dem nächsten echten Abnahmelauf noch offen sind.

## Kurzfazit

Morrow ist öffentlich erreichbar und technisch weit, aber noch nicht für einen voll freigegebenen MVP-Start mit zahlenden Gästen bereit.

Aktueller Status:

- Öffentliche Website: technisch erreichbar und Production-Basischeck grün.
- Admin-/Guest-/Owner-App: App-QA noch nicht aussagekräftig, weil Production-Base-URLs fehlen.
- Launch-Gates: rot durch 11 Blocker.
- Paid Ads: noch nicht freigeben.
- Zahlende Gäste: noch nicht freigeben.
- Kontrollierte echte Leads: erst nach mindestens gelbem Admin-Paritätslauf und rechtlicher/env-seitiger Mindestbereinigung.

## Ausgeführte Checks

### `npm run qa:launch-gates`

Ergebnis: rot.

```text
ok: false
blockers: 11
warnings: 3
passed: 35
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

Ergebnis zum Zeitpunkt des Snapshots: ohne Aussagekraft für die App-Welten, weil keine App-URLs gesetzt waren.

```text
ok: true
checkedApps: 0
reason: No app base URLs set. Provide ADMIN_BASE_URL, OWNER_BASE_URL and/or GUEST_BASE_URL.
```

Nachfolgende Konsolidierungsregel: `qa:apps` darf bei `checkedApps: 0` nicht mehr als grün gelten. Fehlende App-URLs sind ein rotes App-QA-Ergebnis, bis mindestens eine App-Base-URL geprüft wird.

## Bewertung Nach Startstufe

| Startstufe | Status | Begründung |
| --- | --- | --- |
| Interne Tests | Grün | Lokale und technische Checks laufen; Runbook ist vorbereitet. |
| Öffentliche Website live sichtbar | Grün/Gelb | Website ist erreichbar, aber Rechtstexte und finale Freigaben sind offen. |
| Kontrollierte echte Leads | Gelb/Rot | Erst nach rechtlicher Mindestbereinigung, Env-App-URLs und Admin-Paritätslauf mindestens gelb. |
| Zahlende Gäste | Rot | Admin-Paritätsrun muss grün sein; Recht, Secrets, Angebotsdaten und App-QA müssen abgeschlossen sein. |
| Paid Ads | Rot | Tracking/Consent, Recht und Conversion-Messung sind nicht final. |

## Nächste Konsolidierungsschritte

1. Rechtstexte und Impressum aus Arbeitsfassung/Platzhalterstatus bringen.
2. App-Projekt-URLs für Admin, Gäste und Owner final in Vercel setzen.
3. Supabase Public Env im Launch-Gate-Kontext setzen.
4. Geteilte Secrets rotieren und `MORROW_SECRETS_ROTATED_AT` erst danach setzen.
5. Finale Angebotsdaten freigeben und `MORROW_OFFER_DATA_APPROVED_AT` setzen.
6. Tracking-/Consent-Entscheidung treffen und bei Bedarf GA/Meta-IDs testen.
7. `docs/ADMIN_PARITY_QA_RUNBOOK.md` mit echten Testdaten durchlaufen.
8. Danach `npm run qa:launch-gates`, `npm run qa:production` und `npm run qa:apps` erneut mit allen URLs und Testzugängen ausführen.
