# Morrow Admin Parity QA Runbook

Stand: 2026-06-28

Dieses Runbook ist die operative Abnahme vor einem kontrollierten MVP-Start. Es ergänzt `docs/ADMIN_CRM_PARITY_CHECKLIST.md` und `docs/PRODUCTION_LAUNCH_CHECKLIST.md`.

Ziel: beweisen, dass `apps/admin` den alten Vite-Admin-CRM für die tägliche Arbeit ersetzen kann und dass Website, Gäste-App, Owner-App und Supabase denselben operativen Stand zeigen.

## Grundregel

Keine neue Produktfunktion wird als startklar bewertet, solange diese Abnahme nicht mit echten oder realitätsnahen Testdaten dokumentiert ist.

`apps/admin` ist erst dann alleinige Quelle der Wahrheit, wenn:

- die automatischen Gates grün sind,
- die manuellen End-to-End-Flows durchlaufen wurden,
- die Stop-Regeln nicht greifen,
- die Evidenz in diesem Runbook oder im QA-Protokoll abgelegt ist.

## Voraussetzungen

Vor dem Test vorbereiten:

- Admin-User mit freigeschalteter Rolle.
- Produktions- oder Staging-URLs für Website, Admin, Gäste-App und Owner-App.
- Supabase-Projekt mit aktuellen Migrationen.
- Test-Auszeit mit Unterkunft, Termin, Erlebnisbaustein und Vor-Ort-Daten.
- Test-Gastlead, der zu Buchung/Kunde umgewandelt werden darf.
- Test-Owner mit mindestens einem Objektzugriff.
- Resend/Email-Setup für Testempfänger.
- Keine echten Gäste versehentlich in Testkommunikation einbeziehen.

## Automatische Gates

Diese Checks laufen vor manueller Abnahme:

```bash
npm run typecheck
npx supabase db push --dry-run --linked
git diff --check
npm run lint
npm run qa:admin-audit
npm run admin:build
npm run guest:build
npm run owner:build
```

Zusätzlich für die öffentliche Website:

```bash
QA_BASE_URL=https://www.getmorrow.de npm run qa:production
```

Zusätzlich vor echtem Traffic:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://haifftleyussrokyafqq.supabase.co \
NEXT_PUBLIC_SUPABASE_ANON_KEY=<public-anon-key> \
MORROW_ADMIN_APP_URL=https://<admin-app-domain> \
MORROW_GUEST_APP_URL=https://<guest-app-domain> \
MORROW_OWNER_APP_URL=https://<owner-app-domain> \
MORROW_LEGAL_APPROVED_AT=2026-..-.. \
MORROW_SECRETS_ROTATED_AT=2026-..-.. \
MORROW_OFFER_DATA_APPROVED_AT=2026-..-.. \
MORROW_TRACKING_APPROVED_AT=2026-..-.. \
npm run qa:launch-gates
```

## Manuelle End-to-End-Abnahme

Jeder Punkt braucht Ergebnis und Evidenz, zum Beispiel Screenshot, Supabase-Datensatz, Admin-Historie oder E-Mail-Event.

| Nr. | Flow | Erwartung | Status/Evidenz |
| --- | --- | --- | --- |
| 1 | Admin-Login | Nur freigeschaltete Admin-User kommen in `apps/admin`. | Offen |
| 2 | Neuer Gastlead | Anfrage aus Website landet in Supabase und im Admin. | Offen |
| 3 | Leadstatus ändern | Statuswechsel ist sichtbar und auditierbar. | Offen |
| 4 | Wiedervorlage setzen | Lead erscheint im passenden Arbeitskontext. | Offen |
| 5 | Lead archivieren/reaktivieren | Archivierte Leads verschwinden aus Tagesarbeit und bleiben auffindbar. | Offen |
| 6 | Lead reservieren | Aus Gastlead entsteht Buchung mit Kunde. | Offen |
| 7 | Kunde prüfen | Anfrage, Buchung, Kontakt und Historie sind beim Kunden sichtbar. | Offen |
| 8 | Aufgabe erstellen | Aufgabe mit Bezug entsteht, kann erledigt und wieder geöffnet werden. | Offen |
| 9 | Aufgabenbezug öffnen | Klick führt zum richtigen Lead, zur Buchung oder zum passenden Bereich. | Offen |
| 10 | Buchung bearbeiten | Status, Zahlung, Reisegruppe, Check-in und nächste Aufgabe speichern korrekt. | Offen |
| 11 | Gästebereich öffnen | Codegeschützter Zugang zeigt die richtige Auszeit und Buchung. | Offen |
| 12 | Support senden | Nachricht aus Gäste-App landet im Admin-Support. | Offen |
| 13 | Support beantworten | Antwort ist im Gästeverlauf sichtbar und in Kommunikation/Audit nachvollziehbar. | Offen |
| 14 | Feedback senden | Feedback wird gespeichert und im Admin sichtbar. | Offen |
| 15 | Auszeit pflegen | Auszeit kann ohne Code geändert und mit Termin verbunden werden. | Offen |
| 16 | Unterkunft pflegen | Check-in, Regeln, Ausstattung, Medienrechte und Verantwortlichkeit sind gepflegt. | Offen |
| 17 | Erlebnisbaustein pflegen | Erlebnis ist Anbieter, Auszeit, Preis/Kapazität und Verfügbarkeit zugeordnet. | Offen |
| 18 | Vor-Ort-Ort freigeben | Kandidat wird nach Freigabe in der Gäste-App passend angezeigt. | Offen |
| 19 | Veranstaltung prüfen | Veranstaltung ist nicht mit buchbarem Erlebnis vermischt. | Offen |
| 20 | Owner-Dokument | Dokument kann freigegeben und im Owner-Bereich gesehen werden. | Offen |
| 21 | Owner-Abrechnung | Abrechnung kann freigegeben und im Owner-Bereich gesehen werden. | Offen |
| 22 | Owner-Operation | Operationsmeldung ist in Admin und Owner-App konsistent. | Offen |
| 23 | Audit-Log | Kritische Admin-Aktionen erscheinen nachvollziehbar. | Offen |
| 24 | Kommunikationshistorie | E-Mail, Notiz, Support und Feedback sind zentral auffindbar. | Offen |

## Stop-Regeln

Kein Start mit echten Leads, wenn:

- Leadformular, Supabase-Insert oder interne Lead-Mail fehlschlagen.
- Admin-Login nicht zuverlässig auf freigeschaltete User begrenzt ist.
- Lead nicht zu Kunde/Buchung überführt werden kann.
- Buchung keinen funktionierenden Gästebereich erzeugt.
- Supportnachrichten nicht im Admin ankommen.
- Rechtstexte noch Platzhalter oder Arbeitsfassungen enthalten.
- Secrets nach geteilten Tokens nicht rotiert wurden.

Kein Start mit bezahlten Gästen, wenn:

- Buchungsstatus, Zahlungsstatus, Reisegruppe oder Check-in-Daten nicht zuverlässig gespeichert werden.
- Gäste-App falsche Buchungsdaten zeigt.
- Verantwortlichkeit bei Objektproblemen nicht je Auszeit geklärt ist.
- Feedback-/Supporthistorie nicht nachvollziehbar ist.

Kein Paid-Ads-Start, wenn:

- Tracking/Consent nicht final entschieden ist.
- Conversion-Ziele nicht getestet sind.
- Angebotsdaten, Preise, Termine, Bildrechte und enthaltene Leistungen nicht final freigegeben sind.

## Ergebnisbewertung

| Ergebnis | Bedeutung | Nächster Schritt |
| --- | --- | --- |
| Grün | Kontrollierter MVP-Softlaunch möglich. | Kleine Zielgruppe, echte Leads eng begleiten. |
| Gelb | Öffentliche Website okay, aber kein bezahlter Flow. | Nur interne Tests oder sehr begrenzte manuelle Leads. |
| Rot | Nicht starten. | Blocker beheben und Runbook erneut ausführen. |

## Evidenzablage

Für jeden Testlauf festhalten:

- Datum und Tester.
- Genutzte URLs.
- Testlead oder Testbuchung.
- Betroffene Supabase-Datensätze.
- Screenshots oder kurze Notizen.
- Ergebnis: Grün, Gelb oder Rot.
- Offene Folgeaufgaben.

Empfohlener Ablageort: `docs/PAGE_REVIEW_LOG.md` für visuelle/UX-Evidenz und `docs/ADMIN_CRM_PARITY_CHECKLIST.md` für fachliche Parität.
