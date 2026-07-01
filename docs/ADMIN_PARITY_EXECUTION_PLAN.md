# Admin Parity Execution Plan

Stand: 2026-07-01

Dieses Dokument ordnet die 24 Gates aus `docs/ADMIN_PARITY_QA_RUNBOOK.md` in eine praktische Testreihenfolge. Es ersetzt das Runbook nicht. Es ist die konkrete Durchfuehrungsreihenfolge fuer den naechsten echten Admin-Paritaetslauf unter `docs/qa/admin-parity/`.

## Ziel

Beweisen, dass `apps/admin` den alten Vite-Admin-CRM fuer die taegliche Arbeit ersetzen kann.

Nicht beweisen:

- dass jedes spaetere V2-Feature fertig ist,
- dass Paid Ads gestartet werden koennen,
- dass die Rechtstexte juristisch freigegeben sind.

## Vor Dem Lauf

1. Fehlende Testlauf-Werte anhand der Vorlage setzen:

```bash
docs/qa/admin-parity/env.template
```

2. Preflight ausführen:

```bash
npm run qa:admin-parity:preflight
```

Der Preflight gibt keine Secret-Werte aus. Er prüft nur, ob die für den Paritätslauf nötigen URLs und Testzugänge vorhanden sind.

Wenn der Preflight rot ist, zuerst `docs/ADMIN_PARITY_PREFLIGHT_FIXLIST_2026-06-30.md` abarbeiten.

Wichtig: Historisch vorbereitete Testdaten reichen nicht. Admin-, Gäste- und Owner-Testwerte muessen im aktuellen QA-Kontext als `.env.local`-Werte oder Shell-Exports gesetzt sein und im aktuellen Lauf erneut gruen geprueft werden. Erst dann duerfen die zugehoerigen manuellen Gates Evidenz bekommen.

3. Aktuelles Protokoll anlegen:

```bash
QA_TESTER="Gerwin / Codex" \
QA_ENVIRONMENT="Production oder Staging" \
npm run qa:admin-parity:new
```

4. Testdaten im Protokoll eintragen:

- Website-URL
- Admin-URL
- Gaeste-App-URL
- Owner-App-URL
- Testlead
- Testbuchung
- Testkunde
- Test-Auszeit
- Test-Unterkunft
- Test-Erlebnisbaustein
- Test-Vor-Ort-Ort
- Test-Veranstaltung
- Test-Owner
- Test-Owner-Dokument
- Test-Owner-Abrechnung
- Test-Owner-Operation

5. Automatische Gates ausfuehren und im Protokoll abhaken.

6. Statusreport fuer den aktuellen Lauf anzeigen:

```bash
npm run qa:admin-parity:status
```

Der Statusreport ersetzt keine Abnahme. Er zeigt nur kompakt, welche automatischen Gates, manuellen Gates und Evidenzbereiche noch offen sind.
Er zeigt ausserdem unter `preflightInputs`, welche App-URLs und Testwerte im aktuellen QA-Kontext fehlen. Diese Anzeige ist eine lokale Vorbereitungshilfe; die echte Erreichbarkeit der App-URLs prueft weiterhin `npm run qa:admin-parity:preflight`.
Er zeigt zusätzlich den nächsten offenen Abnahmeblock. Der Lauf soll blockweise abgearbeitet werden, damit Kernrisiken früh stoppen:

1. Zugang und Baseline
2. Anfrage zu Kunde und Buchung
3. Gäste-App und Kommunikation
4. Bestand und Operationsdaten
5. Owner-App
6. Finale Bewertung

## Laufreihenfolge

### Block 1: Zugang Und Baseline

Ziel: Sicherstellen, dass die Testumgebung und Rollen sauber sind.

Vor dem manuellen Block-1-Test:

```bash
npm run qa:admin-parity:block1
```

Dieser Check buendelt `npm run supabase:verify-admin` und `npm run qa:admin-audit`. Er ersetzt nicht die manuelle Evidenz, sondern zeigt, ob Admin-Login/Rolle/Tabellenzugriff und statische Audit-Abdeckung als Grundlage pruefbar sind.

Wenn `ADMIN_EMAIL` oder `ADMIN_PASSWORD` fehlen, bleibt Block 1 offen. Der statische Audit-Check kann trotzdem gruen sein, zaehlt aber ohne aktuellen Admin-Login nicht als vollstaendige Block-1-Evidenz.

Der Block-1-Check gibt `nextActions` aus. Wenn die technische Pruefung gruen ist, fuehren diese Aktionen nicht automatisch zur Freigabe, sondern erinnern an die manuelle Evidenz fuer Gate 1 und Gate 23.

| Runbook-Gate | Flow | Evidenz |
| --- | --- | --- |
| 1 | Admin-Login | Screenshot Admin-Dashboard, Admin-User/Rolle, keine Demo-Bypass-Nutzung. |
| 23 | Audit-Log Baseline | Screenshot oder Datensatzliste mit aktuellen Audit-Eintraegen vor Teststart. |

Stop, wenn:

- Login nicht funktioniert.
- Nicht freigeschaltete Nutzer Zugriff bekommen.
- Audit-Log nicht lesbar ist.

### Block 2: Anfrage Zu Kunde Und Buchung

Ziel: Den Kernprozess Gastanfrage → CRM-Bearbeitung → Buchung → Kundensatz beweisen.

Vor dem manuellen Block-2-Test:

```bash
npm run qa:admin-parity:block2
```

Dieser Check liest mit Admin-Zugang den aktuellen CRM-Zustand und sucht einen zusammenhaengenden Testfluss aus Gastlead, Kundensatz, Buchung, Aufgabe und Audit-Log. Er veraendert keine Daten und ersetzt keine Screenshots. Wenn `QA_BLOCK2_LEAD_ID` oder `QA_BLOCK2_BOOKING_ID` gesetzt sind, prueft er gezielt diesen Flow; sonst nutzt er den neuesten geeigneten Gastlead.

Wenn der Check rot ist, zuerst die ausgegebenen `nextActions` abarbeiten und danach erneut ausfuehren. Erst wenn der Check gruen ist, sollten die manuellen Gates 2 bis 10 im aktuellen QA-Protokoll mit Evidenz markiert werden.

| Runbook-Gate | Flow | Evidenz |
| --- | --- | --- |
| 2 | Neuer Gastlead | Lead-ID, Website-Formular, Admin-Lead, E-Mail-/Communication-Event. |
| 3 | Leadstatus ändern | Screenshot Statuswechsel, Audit-Eintrag. |
| 4 | Wiedervorlage setzen | Lead mit Follow-up, Filter-/Arbeitskontext. |
| 5 | Lead archivieren/reaktivieren | Archivansicht, Reaktivierung, Audit. |
| 6 | Lead reservieren | Booking-ID, Customer-ID, Buchungsdrawer. |
| 7 | Kunde prüfen | Kundendetail mit Kontakt, Anfrage, Buchung und Historie. |
| 10 | Buchung bearbeiten | Buchungsstatus, Zahlung, Reisegruppe, Check-in, naechste Aufgabe. |
| 8 | Aufgabe erstellen | Aufgaben-ID, Bezug zur Buchung, Statuswechsel. |
| 9 | Aufgabenbezug öffnen | Screenshot vom Sprung in den richtigen Datensatz/Bereich. |

Stop, wenn:

- Lead nicht in Supabase/Admin landet.
- Reservierung keine Buchung oder keinen Kundensatz erzeugt.
- Buchungsdaten nicht gespeichert werden.
- Aufgabenbezug ins Leere fuehrt.

### Block 3: Gaeste-App Und Kommunikation

Ziel: Beweisen, dass aus der Buchung der richtige Gaestebereich entsteht und Support/Feedback im Admin ankommen.

Vor dem manuellen Block-3-Test:

```bash
npm run qa:admin-parity:block3
```

Dieser Check verbindet den Gaeste-Zugang mit dem Admin-Blick: `get_guest_stay()`, `get_guest_support_events()`, `support_messages`, `guest_feedback` und `communication_events`. Er veraendert keine Daten. Wenn der Check rot ist, zuerst die ausgegebenen `nextActions` abarbeiten: aktuelle Testbuchung setzen, Support aus der Gaeste-App senden, im Admin beantworten, Feedback senden und Kommunikationshistorie belegen.

| Runbook-Gate | Flow | Evidenz |
| --- | --- | --- |
| 11 | Gästebereich öffnen | Booking-ID, Access-Code, Screenshot Start/Buchung/Hilfe. |
| 12 | Support senden | Support-Message-ID, Nachricht in Admin-Support. |
| 13 | Support beantworten | Antwort in Gaesteverlauf, Communication Event, Audit. |
| 14 | Feedback senden | Feedback-ID, Admin-Feedback, Communication Event. |
| 24 | Kommunikationshistorie | Zentrale Historie mit E-Mail, Notiz, Support und Feedback. |

Stop, wenn:

- Gaeste-App falsche Buchungsdaten zeigt.
- Support nicht im Admin ankommt.
- Antwort nicht im Gaesteverlauf sichtbar ist.
- Kommunikation nicht zentral nachvollziehbar bleibt.

### Block 4: Bestand Und Operationsdaten

Ziel: Beweisen, dass Admin die Inhalte pflegen kann, die Website/Gaeste-App/Owner-App spaeter gezielt anzeigen.

Vor dem manuellen Block-4-Test:

```bash
npm run qa:admin-parity:block4
```

Dieser Check verbindet den Admin-Blick auf `packages`, `package_dates`, `properties`, `experience_blocks`, `local_places` und `admin_audit_logs`. Er veraendert keine Daten. Wenn der Check rot ist, zuerst die ausgegebenen `nextActions` abarbeiten: aktuelle Auszeit/Unterkunft/Erlebnis/Ort/Veranstaltung setzen oder pflegen und Audit-Evidenz erzeugen.

| Runbook-Gate | Flow | Evidenz |
| --- | --- | --- |
| 15 | Auszeit pflegen | Auszeit-ID, geaenderte Kernfelder, Terminbezug. |
| 16 | Unterkunft pflegen | Check-in, Regeln, Ausstattung, Medienrechte, Verantwortlichkeit. |
| 17 | Erlebnisbaustein pflegen | Erlebnis-ID, Anbieter, Auszeit, Preis/Kapazitaet, Verfuegbarkeit. |
| 18 | Vor-Ort-Ort freigeben | Local-Place-ID, Freigabe, Anzeige in Gaeste-App. |
| 19 | Veranstaltung prüfen | Event-ID, keine Vermischung mit buchbarem Erlebnis. |

Stop, wenn:

- Auszeit nicht ohne Code pflegbar ist.
- Unterkunftsdaten nicht strukturiert gespeichert werden.
- Erlebnisbaustein nicht eindeutig Anbieter/Auszeit zugeordnet ist.
- Vor-Ort-Freigabe nicht in der Gaeste-App wirkt.

### Block 5: Owner-App

Ziel: Beweisen, dass der Owner-Bereich nur Daten zeigt, die Admin/Supabase korrekt pflegen.

Vor dem manuellen Block-5-Test:

```bash
npm run qa:admin-parity:block5
```

Dieser Check verbindet den signierten Owner-Blick mit der Admin-/Supabase-Quelle: `get_owner_dashboard()`, `owner_profiles`, `owner_property_access`, `owner_documents`, `owner_statements`, `owner_operations` und `admin_audit_logs`. Er veraendert keine Daten. Wenn der Check rot ist, zuerst die ausgegebenen `nextActions` abarbeiten: aktives Owner-Profil, Objektzugriff, sichtbares Dokument, sichtbare/bezahlt markierte Abrechnung, owner-sichtbare Operation und Audit-Evidenz herstellen.

| Runbook-Gate | Flow | Evidenz |
| --- | --- | --- |
| 20 | Owner-Dokument | Dokument-ID, Freigabe, Sichtbarkeit in Owner-App. |
| 21 | Owner-Abrechnung | Statement-ID, Freigabe, Sichtbarkeit in Owner-App. |
| 22 | Owner-Operation | Operations-ID, Status in Admin und Owner-App. |

Stop, wenn:

- Owner sieht falsche Objekte.
- Freigaben nicht wirken.
- Operationsstatus zwischen Admin und Owner-App auseinanderlaeuft.

### Block 6: Finale Bewertung

Zum Schluss im Protokoll festhalten:

- alle automatischen Gates,
- alle manuelle Gate-Ergebnisse,
- Screenshots,
- Supabase-Datensaetze,
- E-Mail-/Communication-Events,
- Audit-Log-Eintraege,
- offene Blocker,
- Ergebnis: Gruen/Gelb/Rot.

Danach:

```bash
npm run qa:admin-parity:status
npm run qa:admin-parity:validate
npm run qa:readiness
npm run qa:migration-consolidation
```

## Bewertungsregel

Gruen:

- alle 24 Gates bestanden oder bewusst als ersetzt/nicht relevant dokumentiert,
- Validator ist gruen,
- keine Stop-Regel greift.

Gelb:

- oeffentliche Website und Leadannahme koennen kontrolliert getestet werden,
- kein bezahlter Buchungsfluss,
- alle gelben Punkte sind mit Folgeaufgaben dokumentiert.

Rot:

- jede Stop-Regel,
- fehlende Evidenz,
- falsche Daten in Gaeste- oder Owner-App,
- unklare Admin-Quelle der Wahrheit.

## Naechster Operativer Schritt

Der naechste reale Schritt ist nicht weiterer Featurebau, sondern:

1. App-URLs und Testzugänge setzen.
2. `npm run qa:admin-parity:preflight` ausführen.
3. Protokoll erzeugen.
4. Block 1 bis 6 in dieser Reihenfolge abarbeiten.
5. Validator laufen lassen.
6. Ergebnis in `docs/LAUNCH_STATUS_SNAPSHOT_*.md` aktualisieren.
