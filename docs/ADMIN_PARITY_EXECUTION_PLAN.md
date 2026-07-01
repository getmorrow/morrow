# Admin Parity Execution Plan

Stand: 2026-06-30

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
- Test-Owner

5. Automatische Gates ausfuehren und im Protokoll abhaken.

6. Statusreport fuer den aktuellen Lauf anzeigen:

```bash
npm run qa:admin-parity:status
```

Der Statusreport ersetzt keine Abnahme. Er zeigt nur kompakt, welche automatischen Gates, manuellen Gates und Evidenzbereiche noch offen sind.
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
