# Morrow Page Review Log

Diese Datei sammelt die systematische Seitenprüfung. Jede Seite wird einzeln gegen Master Frame, Brand Registry, UI-Rhythmus und Detail-QA bewertet, bevor die nächste Seite überarbeitet wird.

## Prüfreihenfolge

1. Startseite `/` — Rhythmus und Wording bereits nachgezogen.
2. Auszeitdetail Family Escape `/auszeiten/family-escape`
3. Auszeitdetail Couple Reset `/auszeiten/couple-reset`
4. Ratgeber-Übersicht `/ratgeber`
5. Ratgeberartikel
6. Eigentümerseite `/eigentuemer`
7. Erlebnisanbieter-Seite `/partner/erlebnisanbieter`
8. Admin V1 `?admin=1`

## 2026-06-03 — MVP Readiness Audit

Dokument:
- `/Users/gerwins/Documents/New project/docs/MVP_READINESS_AUDIT_2026-06-03.md`

Ergebnis:
- Morrow ist demo-ready, aber noch nicht production-ready.
- Öffentliche Plattform, Auszeiten, Admin-CRM und Gästebereich sind als Prototyp weit genug, um intern und geführt gezeigt zu werden.
- Für echten Markttraffic fehlen noch Backend/Datenbank, Admin-Auth, E-Mail-Automation, Rechtstexte, finale Angebotsdaten und Production-Setup.

Screenshots:
- `/Users/gerwins/Documents/New project/tmp/qa/mvp-readiness-2026-06-03/home.png`
- `/Users/gerwins/Documents/New project/tmp/qa/mvp-readiness-2026-06-03/family.png`
- `/Users/gerwins/Documents/New project/tmp/qa/mvp-readiness-2026-06-03/couple.png`
- `/Users/gerwins/Documents/New project/tmp/qa/mvp-readiness-2026-06-03/guide.png`
- `/Users/gerwins/Documents/New project/tmp/qa/mvp-readiness-2026-06-03/owner.png`
- `/Users/gerwins/Documents/New project/tmp/qa/mvp-readiness-2026-06-03/experience-partner.png`
- `/Users/gerwins/Documents/New project/tmp/qa/mvp-readiness-2026-06-03/guest-area.png`
- `/Users/gerwins/Documents/New project/tmp/qa/mvp-readiness-2026-06-03/admin.png`

Naechste Entscheidung:
- Prioritaet auf technisches Fundament legen: Supabase/Firebase, Admin-Login, E-Mail-Automation.

## 2026-06-03 — Backend-Fundament V1

Dokument:
- `/Users/gerwins/Documents/New project/docs/BACKEND_FOUNDATION.md`

Umgesetzt:
- Supabase-Client ergänzt.
- `.env.example` mit `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` ergänzt.
- Migration `supabase/migrations/202606030001_morrow_phase1_core.sql` angelegt.
- Tabellenrahmen für Leads, Kunden, Buchungen, Auszeiten, Termine, Objekte, Erlebnisanbieter, Erlebnisbausteine, lokale Orte, Aufgaben und Support-Nachrichten definiert.
- Öffentliche Formulare können bei gesetzter Supabase-Konfiguration neue Leads in Supabase anlegen.
- Der Gästebereich kann Support-Nachrichten zusätzlich in Supabase schreiben.
- Ohne Supabase-Konfiguration läuft der Prototyp weiter stabil über lokale Speicherung.

Bewusste Grenze:
- Admin-Änderungen bleiben bis zum Admin-Auth-Schritt lokal. Dadurch brauchen wir keine unsicheren öffentlichen Update-Rechte.

Nächster Pflichtschritt:
- Admin-Login mit Supabase Auth und danach Admin-Mutations in Supabase speichern.

## 2026-06-03 — Admin Auth V1

Umgesetzt:
- `/admin` ist bei gesetzter Supabase-Konfiguration durch Supabase Auth geschützt.
- Login erfolgt per E-Mail und Passwort.
- Tabelle `admin_users` ergänzt; `auszeiten@getmorrow.de` ist als `owner` freigegeben.
- RLS-Policies für CRM-Tabellen auf `is_morrow_admin()` umgestellt.
- App prüft nach Supabase-Session zusätzlich das Admin-Profil.
- Ohne Supabase-Konfiguration bleibt der Admin als lokale Demo nutzbar, damit Entwicklung und QA weiter funktionieren.
- Admin-Topbar zeigt den Auth-Modus: `Lokale Demo` oder eingeloggte E-Mail.
- Abmelden ist vorbereitet, sobald Supabase aktiv ist.

Screenshot:
- `/Users/gerwins/Documents/New project/tmp/qa/admin-auth-v1/local-demo-admin.png`

Checks:
- `npm run lint`
- `npm run build`
- `npm run qa:smoke`
- Anon kann Leads nicht lesen, aber öffentliche Lead-Formulare können weiter Leads einfügen.

Nächster Schritt:
- Passwort für `auszeiten@getmorrow.de` über Admin-Loginseite setzen/zurücksetzen.

## 2026-06-03 — Supabase Verbindung aktiv

Umgesetzt:
- `.env.local` mit Supabase-Projekt-URL und anon public key verbunden.
- Datenbankmigration in Supabase ausgeführt.
- API-Rechte/RLS-Policies nachgezogen, damit öffentliche Formulare schreiben, aber nicht lesen dürfen.
- Echtes Formular gegen Supabase getestet: Lead wurde gespeichert und danach per Service-Kontext wieder gelöscht.
- Smoke-Test auf lokalen QA-Modus umgestellt, damit Tests keine echten Supabase-Leads erzeugen.

Checks:
- `npm run lint` grün.
- `npm run build` grün.
- `npm run qa:smoke` grün.

Sicherheitsnotiz:
- Service Role Key darf nicht in Frontend-ENV oder Repository.
- Da der Key im Chat geteilt wurde, sollte er vor echtem Livegang in Supabase rotiert werden.

## 2026-06-03 — Admin Lead Sync V1

Umgesetzt:
- Lead-Updates schreiben bei aktiver Admin-Session nach Supabase.
- Synchronisiert werden Status, Kontakt-/Formularänderungen, Notizen, Wiedervorlagen, Archivierung und Löschen.
- Lokaler Admin-Demo-Modus bleibt bewusst lokal, damit QA und Entwicklung nicht blockieren.
- Smoke-Test nutzt `qa_local=1`, damit keine echten Supabase-Testleads entstehen.

Checks:
- `npm run lint` grün.
- `npm run build` grün.
- `npm run qa:smoke` grün.

Nächster Schritt:
- Aufgaben und Buchungen als nächste Admin-Mutations nach Supabase bringen.

## 2026-06-03 — Admin Tasks Sync V1

Umgesetzt:
- Admin-Aufgaben laden bei aktiver Supabase-Session aus `admin_tasks`.
- Neue Aufgaben, Statuswechsel, Erledigung, Notizen und Löschen werden nach Supabase synchronisiert.
- Buchungs-Ops sind dadurch zusammen mit Lead-Sync remote-fähig, weil der aktuelle Prototyp Buchungen aus Gast-Leads plus Aufgaben ableitet.

Direkt getestet:
- Service-Kontext konnte eine Aufgabe in `admin_tasks` schreiben und wieder löschen.

Checks:
- `npm run lint` grün.
- `npm run build` grün.
- `npm run qa:smoke` grün.

Nächster Schritt:
- Eigenständige Buchungsdatensätze erzeugen und den Gästebereich mittelfristig aus `bookings` statt aus Leads speisen.

## 2026-06-03 — Booking Sync V1

Umgesetzt:
- Buchungsrelevante Gast-Leads erzeugen oder aktualisieren jetzt einen Datensatz in `bookings`.
- Erfasst werden Reservierungs-/Zahlungsstatus, Gästebereich-Code, Termin, Check-in-Status, Erlebnisstatus und operative Buchungsdaten im Payload.
- `lead_id` verbindet Buchung und ursprüngliche Anfrage.

Bewusste Grenze:
- `package_id` bleibt vorerst relational leer, weil Pakete noch nicht in Supabase synchronisiert sind.
- Der Paketbezug bleibt bis zum Package-Sync im Payload erhalten.

Direkt getestet:
- Testlead angelegt, Booking in Supabase geschrieben, beides wieder gelöscht.

Checks:
- `npm run lint` grün.
- `npm run build` grün.
- `npm run qa:smoke` grün.

Nächster Schritt:
- Pakete, Termine und Unterkünfte nach Supabase synchronisieren, damit Buchungen vollständig relational verbunden werden können.

## 2026-06-03 — Package / Dates / Property Sync V1

Umgesetzt:
- Pakete/Auszeiten synchronisieren nach Supabase `packages`.
- Termine synchronisieren nach `package_dates`.
- Unterkünfte synchronisieren nach `properties`.
- Seed-Script `npm run supabase:seed-packages` ergänzt.
- Family Escape und Couple Reset wurden in Supabase geseedet.
- Buchungen können jetzt `package_id` relational setzen.

Direkt getestet:
- Supabase enthält `pkg-family-escape` und `pkg-couple-reset`.
- Supabase enthält vier Pakettermine.
- Supabase enthält `nordlicht-lodge` und `duenenruhe-suite`.
- Testbooking mit `package_id = pkg-family-escape` erfolgreich geschrieben und wieder gelöscht.

Checks:
- `npm run lint` grün.
- `npm run build` grün.
- `npm run qa:smoke` grün.

Nächster Schritt:
- Gästebereich perspektivisch aus `bookings` + `packages` speisen und danach E-Mail-Automation bauen.

## 2026-06-03 — Guest Stay Remote Access V1

Umgesetzt:
- Sichere Supabase RPC `get_guest_stay` angelegt.
- Gästebereich kann über Buchungs-ID plus Zugangscode remote aus `bookings` und `packages` laden.
- `bookings` bekommt keine öffentlichen Leserechte.
- Falscher Zugangscode liefert keine Daten.
- Lokaler Demo-Fallback bleibt erhalten.

Direkt getestet:
- Testlead und bezahltes Testbooking in Supabase angelegt.
- RPC mit korrektem Code liefert `Sophie RPC · Couple Reset`.
- RPC mit falschem Code blockt.
- App-Seite rendert einen mobilen Gästebereich aus Remote-Buchung.

Screenshot:
- `/Users/gerwins/Documents/New project/tmp/qa/guest-remote-booking-v1/mobile.png`

Checks:
- `npm run lint` grün.
- `npm run build` grün.
- `npm run qa:smoke` grün.

Nächster Schritt:
- E-Mail-Automation für Anfragebestätigung und interne Benachrichtigung.

## 2026-06-03 — Email Automation V1

Umgesetzt:
- `email_events` Migration ergänzt.
- Supabase Edge Function `lead-notification` angelegt.
- Supabase Edge Function `lead-notification` deployed.
- Function verschickt Anfragebestätigung und interne Lead-Benachrichtigung über Resend.
- Function versendet gebrandete Morrow-HTML-Mails mit Text-Fallback.
- App ruft die Function optional nach erfolgreichem Lead-Insert auf.
- Lokale Umgebung ist per `VITE_ENABLE_EMAIL_AUTOMATION=true` aktiviert.

Noch offen:
- Absenderdomain ist `getmorrow.de`; Versandadresse: `Morrow <auszeiten@getmorrow.de>`.
- Interne Lead-Adresse: `auszeiten@getmorrow.de`.
- Fuer Production/Vercel `VITE_ENABLE_EMAIL_AUTOMATION=true` ebenfalls setzen.
- Vor Livegang Resend- und Supabase-Deploy-Token rotieren, da sie im Chat geteilt wurden.

Checks:
- `npm run lint`
- `npm run build`
- Function-Test mit Testlead: `{"ok": true}`.
- Echter Formular-End-to-End-Test über `/auszeiten/family-escape`: Lead in Supabase erstellt, `lead_confirmation` und `internal_lead_notification` beide mit Status `sent`; Testlead danach gelöscht.
- Family-Formular erweitert: Erwachsene, Kinder und Kinderalter werden getrennt gespeichert und in den E-Mails als Personen-Zusammenfassung ausgegeben.
- Admin Lead-Drawer erweitert: E-Mail-Automation ist pro Anfrage sichtbar, inklusive Eventtyp, Empfänger, Status und Zeitpunkt.
- Smoke-Test auf getrennte Family-Felder aktualisiert.
- Kommunikationshistorie V1 ergänzt: neue Supabase-Tabelle `communication_events`, Admin Lead-Drawer zeigt E-Mail-Events und manuelle Kommunikation in einer Timeline.
- Manuelle Historieneinträge für Telefon, E-Mail, WhatsApp, Support und Notiz sind im Lead-Drawer möglich; echter Versand bleibt bewusst V2.
- Checks nach Kommunikationshistorie: `npm run lint`, `npm run build`, `npm run qa:smoke`.

## 2026-05-15 — Admin CRM Lernfelder

URL:
- `/admin?seed=test-leads`

Umgesetzt:
- Leadquelle und Kampagne/Kontext sind pro Anfrage pflegbar.
- Verlustgrund und Conversion-Notiz sind pro Anfrage pflegbar.
- Testdaten enthalten unterschiedliche Quellen, Kampagnen und einen Absagegrund.
- Öffentliche Formulare speichern UTM-Quelle und UTM-Kampagne automatisch im Lead.
- Die Anfragen-Seite zeigt kompakte Lernkennzahlen für den MVP: Top-Quelle, Gast-zu-Buchung und häufigster Verlustgrund.

Entscheidung:
- Diese Felder bleiben intern im CRM. Sie gehören nicht auf öffentliche Seiten und nicht in Gästekommunikation.

## 2026-05-15 — Admin Kunden und Buchungen

URLs:
- `/admin?seed=test-leads`, Bereich `Kunden`
- `/admin?seed=test-leads`, Bereich `Buchungen`

Umgesetzt:
- Kunden können nach Zielgruppe gefiltert werden.
- Jeder Kundensatz hat eine Detailansicht mit Kontakt, Anfragehistorie und Buchungen.
- Aus dem Kundensatz kann man direkt in die Anfrage oder Buchung springen.
- Buchungen können nach Auszeit und Status gefiltert werden.
- Kontaktinfos im Kunden-Drawer wurden auf Lesbarkeit geprüft und korrigiert.

Screenshots:
- `/Users/gerwins/Documents/New project/tmp/qa/admin-customer-booking/customer-drawer-final.png`
- `/Users/gerwins/Documents/New project/tmp/qa/admin-customer-booking/bookings-filtered.png`

## 2026-05-15 — Admin Buchungen Ops-Signale

URL:
- `/admin?seed=test-leads`, Bereich `Buchungen`

Umgesetzt:
- Buchungen zeigen neben Status und Zahlung jetzt operative offene Punkte.
- Sichtbare Signale: Zahlung offen, Check-in offen, Erlebnis offen, heute fällig.
- Jede Buchung zeigt einen kompakten Arbeitsstatus wie `bereit`, `dringend` oder `3 offen`.
- Check-in gilt erst als erledigt, wenn er `freigegeben` ist. `vorbereitet` bleibt bewusst als offener operativer Punkt sichtbar.

Screenshot:
- `/Users/gerwins/Documents/New project/tmp/qa/admin-booking-ops/bookings-ops.png`

## 2026-05-15 — Admin Aufgaben-Zentrale

URL:
- `/admin?seed=test-leads`, Bereich `Aufgaben`

Umgesetzt:
- Aufgaben zeigen Status, Fälligkeit, Timing, Bezug und Priorität klarer.
- Filter ergänzt: Status, Bezug und Priorität.
- Fokus-Kennzahlen ergänzt: demnächst, Buchungen, erledigt.
- Aufgaben können direkt ihren Bezug öffnen, z. B. die zugehörige Buchung.
- Überfällige und heutige Aufgaben bekommen eine eigene Timing-Logik.

Screenshots:
- `/Users/gerwins/Documents/New project/tmp/qa/admin-tasks/tasks-center.png`
- `/Users/gerwins/Documents/New project/tmp/qa/admin-tasks/task-opens-booking.png`
- `/Users/gerwins/Documents/New project/tmp/qa/admin-tasks/tasks-filter-high.png`

## 2026-05-15 — Admin Auszeiten Editor

URL:
- `/admin?seed=test-leads`, Bereich `Auszeiten`

Umgesetzt:
- Auszeiten können mit einem Objekt aus dem Eigentümer-/Objektbestand verbunden werden.
- Unterkunftsdaten wurden erweitert: Schlafplätze, Schlafzimmer, Badezimmer, späteste Anreise, Check-out, Schlüsselübergabe, Hund.
- Erlebnisbausteine können im Auszeit-Editor hinzugefügt und entfernt werden.
- Erlebnisbausteine können mit einem Erlebnisanbieterprofil verbunden werden.
- Anbietername und Gastnotiz pro Erlebnisbaustein sind pflegbar.
- QA: Erlebnis hinzugefügt, gespeichert und danach Seed-Daten wieder zurückgesetzt.

Screenshots:
- `/Users/gerwins/Documents/New project/tmp/qa/admin-packages/package-editor.png`
- `/Users/gerwins/Documents/New project/tmp/qa/admin-packages/package-editor-saved.png`

## 2026-05-15 — Admin Erlebnisse und Erlebnisanbieter

URLs:
- `/admin?seed=test-leads`, Bereich `Erlebnisse`
- `/admin?seed=test-leads`, Bereich `Erlebnisanbieter`

Umgesetzt:
- Erlebnisbausteine können nach Anbieter gefiltert werden.
- Erlebnis-Kennzahlen zeigen jetzt auch Bausteine ohne Anbieter.
- Erlebnis-Fokus zeigt: mit Anbieter, bestätigt, Anbieterprofile.
- Erlebnis-Cards öffnen bei bestehender Verknüpfung direkt das Anbieterprofil.
- Anbieterprofile können nach Status gefiltert werden.
- Anbieter-Drawer zeigt verknüpfte Erlebnisse und kann direkt in den Erlebnisbaustein springen.
- QA: Erlebnis mit Anbieter verbunden, Anbieter geöffnet, von dort zurück ins Erlebnis geöffnet. Danach QA-Verknüpfung wieder zurückgenommen.

Screenshots:
- `/Users/gerwins/Documents/New project/tmp/qa/admin-experience-providers/experience-linked.png`
- `/Users/gerwins/Documents/New project/tmp/qa/admin-experience-providers/provider-linked.png`
- `/Users/gerwins/Documents/New project/tmp/qa/admin-experience-providers/provider-opens-experience.png`
- `/Users/gerwins/Documents/New project/tmp/qa/admin-experience-providers/provider-filter.png`

## 2026-05-09 — Family Escape

URL:
- `/auszeiten/family-escape`

Screenshots:
- Desktop Einstieg: `/tmp/morrow-family-desktop-top.png`
- Mobile Einstieg: `/tmp/morrow-family-mobile-top.png`
- Unterkunft: `/tmp/morrow-family-stay.png`
- Erlebnisbausteine: `/tmp/morrow-family-experience.png`
- Empfehlungen: `/tmp/morrow-family-recommendations.png`
- Anfrage: `/tmp/morrow-family-form.png`

Gemessene Abschnittshöhen bei 1280x720:
- Hero: ca. `839px`
- Auszeitübersicht: ca. `231px`
- Aufenthalts-Intro: ca. `596px`
- Mood: ca. `633px`
- Gedacht für: ca. `529px`
- Details: ca. `453px`
- Unterkunft: ca. `962px`
- Was vorbereitet ist: ca. `605px`
- Erlebnisbausteine: ca. `794px`
- Empfehlungen: ca. `864px`
- Anfrageflow: ca. `771px`
- Anfrageformular: ca. `919px`

Was schon passt:
- Öffentliches Wording nutzt auf der Website weitgehend `Auszeit` statt `Paket`.
- Hero erklärt Zielgruppe, Ort, Name und primären CTA.
- Mobile Einstieg ist klar und besser nutzbar als ein App-/Phone-Mockup.
- Unterkunft ist konkret sichtbar, inklusive Check-in- und Schlüssel-Hinweisen.
- Anfrageformular nutzt feste Termine, kein Kalender.
- WhatsApp-Opt-in ist optional und nicht vorausgewählt.
- Bilder wirken grundsätzlich passend für SPO, Familie und Unterkunft.

Was noch nicht auf Markteintritt-Niveau ist:
- Desktop-Hero ist zu hoch und beginnt visuell zu leer. Der erste Screen wirkt dadurch weniger geführt als die Startseite.
- Einige H2s sind für Detailseiten zu dominant, besonders im Aufenthalts-Intro und Mood-Bereich.
- Die Seite ist insgesamt zu lang für zwei feste Termine und eine konkrete Auszeit.
- Unterkunft, Erlebnisbausteine, Empfehlungen und Anfrageformular haben zu viel vertikale Fläche.
- Empfehlungen wirken noch wie einfache Listen, nicht wie kuratierte Vor-Ort-Orientierung.
- Erlebnisbausteine brauchen mehr Gefühl und konkretere Erwartung: Was erlebt die Familie wirklich?
- Die Detailseite erklärt noch zu oft die Logik, statt stärker zum Anfragen zu führen.

Empfohlene nächste Überarbeitung:
- Hero kompakter machen, damit Bild, Name, Nutzen und CTA im ersten Desktop-Viewport stärker zusammenarbeiten.
- Aufenthalts-Intro und Mood zu einem stärkeren Story-Block verdichten.
- Unterkunftsbereich visuell etwas kompakter machen, ohne das konkrete Objekt zu verlieren.
- Erlebnis- und Empfehlungsbereich redaktioneller schreiben und weniger listenhaft wirken lassen.
- Anfragebereich weniger wuchtig machen, aber als finaler Conversion-Punkt klar lassen.
- Danach erneut Desktop und Mobile Screenshots prüfen.

Entscheidung:
- Erste Überarbeitungsrunde umgesetzt.
- Nächster Schritt: visuelle Freigabe im Browser, danach Couple Reset nach demselben Maßstab prüfen.

Überarbeitung V1:
- Hero von ca. `839px` auf ca. `666px` reduziert.
- Auszeitübersicht von ca. `231px` auf ca. `171px` reduziert.
- Aufenthalts-Intro von ca. `596px` auf ca. `344px` reduziert.
- Unterkunft von ca. `962px` auf ca. `803px` reduziert.
- Erlebnisbausteine von ca. `794px` auf ca. `494px` reduziert.
- Empfehlungen von ca. `864px` auf ca. `457px` reduziert.
- Detailkarten von ca. `453px` auf ca. `361px` reduziert.
- Copy stärker auf vorbereitete Familien-Auszeit statt Produktlogik ausgerichtet.
- Erlebnis- und Empfehlungsbereiche redaktioneller formuliert.

Überarbeitung V2:
- Doppelter Erklärblock `Was vorbereitet ist` entfernt, weil Unterkunft, Erlebnis, Empfehlungen und Anfrage bereits in anderen Abschnitten sichtbar sind.
- Alter Mood-/Story-Doppelblock durch visuellen Ablauf `So läuft die Auszeit` ersetzt.
- Ablauf zeigt jetzt drei konkrete Momente: Ankommen, Erleben, Freiraum.
- Erlebnisbereich mit Bildband ergänzt und weniger listenhaft aufgebaut.
- FAQ-Bereich ergänzt mit Fragen zu direkter Buchbarkeit, Unterkunft, Erlebnisstatus und Hund.
- Family-Copy weiter gekürzt, damit die Seite weniger nach Erklärung und mehr nach geführtem Aufenthalt wirkt.
- Aktuelle Abschnittshöhen bei 1280x720 nach V2:
  - Hero: ca. `666px`
  - Auszeitübersicht: ca. `171px`
  - Ablauf: ca. `884px`
  - Gedacht für: ca. `453px`
  - Detailkarten: ca. `361px`
  - Unterkunft: ca. `803px`
  - Erlebnis & Orientierung: ca. `831px`
  - Empfehlungen: ca. `423px`
  - Anfrageflow: ca. `683px`
  - FAQ: ca. `505px`
  - Anfrageformular: ca. `842px`

Überarbeitung V3:
- `Gedacht für` und die darunterliegenden Detailkarten zu einem gemeinsamen Entscheidungsbereich zusammengeführt.
- Der Bereich beantwortet nun zusammenhängend: Für wen ist die Auszeit gedacht, welche Termine gibt es, wie viele Personen passen und was ist enthalten.
- Öffentlich sichtbare Kommunikationsdetails entfernt; E-Mail/WhatsApp bleiben nur im Anfrageformular als Opt-in-Kontext.
- Desktop-Sektion bleibt mit ca. `681px` in einer 720px-Fläche lesbar.
- Mobile-Sektion stapelt sauber in einer Spalte; Faktenkarten erscheinen direkt nach der Zielgruppenklärung.

Brand-Fundament V1:
- Favicon und Metadaten von Vite/Projektstandard auf Morrow gesetzt.
- Bildstil-Regeln in `docs/VISUAL_ASSET_GUIDELINES.md` verschärft: warm, menschlich, candid, leicht körnig, ortsnah, keine glatten KI-Render.
- Sechs erste Morrow-Illustrationen im Styleguide-Prinzip ergänzt und im Auszeit-Ablauf nutzbar gemacht.
- Kobe/Kobel-Status dokumentiert: aktuell keine Webfont-Dateien im Projekt, Nutzung erst nach Kauf/Lizenz und Bereitstellung der passenden Schnitte.
- Family-Escape-Ablauf visuell editorialer aufgebaut: links Kontext und SPO-Bild, rechts drei illustrierte Momente.
- Ablauf-Sektion nach Anpassung bei 1280x720: ca. `695px`.

## 2026-05-09 — Startseite erneute Styleguide-Prüfung

URL:
- `/`

Screenshots:
- Hero: `/tmp/morrow-home-section-01.png`
- Warum Morrow: `/tmp/morrow-home-section-02.png`
- Auszeiten: `/tmp/morrow-home-section-03.png`
- Ablauf: `/tmp/morrow-home-section-04.png`
- Editorial Split: `/tmp/morrow-home-section-05.png`
- Ratgeber: `/tmp/morrow-home-section-06.png`
- Eigentümer: `/tmp/morrow-home-section-07.png`
- Mobile Auszeiten: `/tmp/morrow-home-section-mobile-auszeiten.png`

Gemessene Abschnittshöhen bei 1280x720:
- Hero: ca. `802px`
- Warum Morrow / Intro: ca. `764px`
- Auszeiten: ca. `771px`
- Ablauf / Journey: ca. `636px`
- Editorial Split: ca. `665px`
- Ratgeberteaser: ca. `692px`
- Eigentümerteaser: ca. `421px`

Styleguide-Abgleich:
- Hero bleibt stark markenprägend: Wortmarke, Offwhite, warme SPO-Bildwelt und klare Auszeiten-Einstiege.
- Warum-Morrow-Bereich nutzt Olive als Markenfläche; Karten wurden auf hellere Offwhite-Flächen mit dunklem Text korrigiert, damit Lesbarkeit und Premium-Wirkung passen.
- Auszeiten-Bereich bleibt bewusst kompakt, damit beide Start-Auszeiten in einer Desktop-Fläche erfassbar bleiben.
- Ratgeberteaser wurde aus der äußeren Kartenhülle gelöst, damit keine Cards-in-Cards entstehen.
- Markenfarben in CSS wurden auf die exakten Styleguide-Werte für Olive und Brown angepasst.
- Morrow-Icon im Hero wurde wieder in den Bildraum gezogen, damit es nicht an der Kante klemmt.

Offene redaktionelle Prüfung:
- Headlines und Copy wurden in dieser Runde nicht verändert.
- Nächster inhaltlicher Schritt: Startseiten-Überschriften und Fließtexte gemeinsam gegen Positionierung, Conversion und Tonalität prüfen, bevor Wording geändert wird.

Hero-Bildkorrektur nach Styleguide-Abgleich:
- Der Hero wurde von einer separaten Landschaftsbild-Karte auf ein vollflächiges Experience-Bild mit Menschen umgestellt.
- Hintergrundbild nutzt nun die Familien-/Dünen-Szene, weil der Styleguide für Experiences offene, dynamische Kompositionen mit Familien oder Paaren vorsieht.
- Text liegt auf einem ruhigen dunklen Overlay, damit Bild, Lesbarkeit und Markenruhe zusammenarbeiten.
- Screenshot-Prüfung:
  - Desktop 1280: `/tmp/morrow-hero-styleguide-image-fixed-desktop-1280.png`
  - Desktop 1440: `/tmp/morrow-hero-styleguide-image-fixed-desktop-1440.png`
- Mobile 390: `/tmp/morrow-hero-styleguide-image-fixed-mobile-390.png`
- Bewertung: deutlich näher an der Styleguide-Bildwelt und weniger generische Landschafts-/Buchungsseitenwirkung.

Dreischritt-Prüfung Startseite:
- Ratgeber-Teaser geprüft:
  - Desktop: `/tmp/morrow-guide-current-desktop.png`
  - Mobile: `/tmp/morrow-guide-current-mobile.png`
  - Entscheidung: keine Änderung nötig. Der Bereich ist lang auf Mobile, aber durch drei Artikel nachvollziehbar und editorial sauber.
- Eigentümer-Teaser überarbeitet:
  - Vorher wirkte der Bereich zu leer und wie angehängt.
  - Neuer Brown-Markenblock mit drei Nutzenpunkten und stärkerem B2B-Abschluss.
  - Mobile Nutzenpunkte auf vertikale Liste korrigiert.
  - Desktop: `/tmp/morrow-owner-teaser-final-desktop.png`
  - Mobile: `/tmp/morrow-owner-teaser-final-mobile.png`
- Gesamtprüfung Startseite nach Anpassungen:
  - Hero: ca. `687px`
  - Warum Morrow / Intro: ca. `764px`
  - Auszeiten: ca. `719px`
  - Ablauf / Journey: ca. `663px`
  - Editorial Split: ca. `629px`
  - Ratgeberteaser: ca. `692px`
  - Eigentümerteaser: ca. `451px`
  - Bewertung: Der Seitenrhythmus ist jetzt deutlich konsistenter. Desktop-Sektionen sind erfassbar, Mobile ist stärker sequenziert und näher an der Styleguide-Bildwelt.

## 2026-05-13 — Ratgeber Referenzartikel

URL:
- `/ratgeber/sankt-peter-ording-mit-kindern`

Screenshots:
- Hero Desktop: `tmp/qa/article-final-pass/desktop-hero.png`
- Erste Antwort Desktop: `tmp/qa/article-final-pass/desktop-answer.png`
- Kontextpanel Desktop: `tmp/qa/article-final-pass/desktop-context.png`
- Feature-Section Desktop: `tmp/qa/article-final-pass/desktop-feature.png`
- Checkliste Desktop: `tmp/qa/article-final-pass/desktop-checklist.png`
- Morrow-CTA Desktop: `tmp/qa/article-final-pass/desktop-morrow.png`
- FAQ Desktop: `tmp/qa/article-final-pass/desktop-faq.png`
- Hero Mobile: `tmp/qa/article-final-pass/mobile-hero.png`
- Feature-Section Mobile: `tmp/qa/article-final-pass/mobile-feature.png`
- Checkliste Mobile: `tmp/qa/article-final-pass/mobile-checklist.png`
- Morrow-CTA Mobile: `tmp/qa/article-final-pass/mobile-morrow.png`
- FAQ Mobile: `tmp/qa/article-final-pass/mobile-faq.png`

Abnahmeregel:
- Auszeiten bleiben die Referenz für Struktur, Kicker, Headline, Textgrößen, Bildruhe und Conversion-Logik.
- Ratgeber dürfen editorialer und textreicher sein, aber normale Artikelbereiche folgen dem Muster: Kicker, Headline, erklärender Text.
- Kicker im Artikel sind geprüft: Desktop `13px`, Mobile `12px`.
- Hero-H1 und Hero-Lead folgen der Auszeiten-Skala.

Aktueller Stand:
- Hero, Artikelmeta, Inhaltsverzeichnis, Kurzantwort, Kontextpanel, Feature-Sections, Checkliste, FAQ, Morrow-CTA und passende Auszeit sind strukturell stimmig.
- Keine vertikalen Trennlinien als Gestaltungsmuster.
- CTA zur passenden Auszeit ist im Artikel und am Ende vorhanden.
- Mobile Darstellung ist sequenziell und lesbar; Karten und Bilder stapeln sauber.

Nächster Schritt:
- Die weiteren Ratgeberartikel einzeln gegen diesen Referenzartikel prüfen und nur dort anpassen, wo Struktur, Typografie, CTA, Bildlogik oder SEO-/GEO-Aufbau abweichen.

## 2026-05-13 — Weitere Ratgeberartikel

Geprüfte URLs:
- `/ratgeber/auszeit-zu-zweit-in-sankt-peter-ording`
- `/ratgeber/was-kann-man-in-sankt-peter-ording-machen`
- `/ratgeber/schlechtes-wetter-sankt-peter-ording-mit-kindern`
- `/ratgeber/wattwanderung-sankt-peter-ording-kinder`

Screenshots:
- Paarzeit Hero: `tmp/qa/article-auszeit-zu-zweit-in-sankt-peter-ording-after/desktop-hero.png`
- Paarzeit Checkliste: `tmp/qa/article-auszeit-zu-zweit-in-sankt-peter-ording-after/desktop-checklist.png`
- Aktivitäten Hero: `tmp/qa/article-final-rest-after/was-kann-man-in-sankt-peter-ording-machen-desktop-hero.png`
- Regentage Checkliste: `tmp/qa/article-final-rest-after/schlechtes-wetter-sankt-peter-ording-mit-kindern-desktop-checklist.png`
- Watt Checkliste: `tmp/qa/article-final-rest-after/wattwanderung-sankt-peter-ording-kinder-desktop-checklist.png`

Korrekturen:
- Paarzeit-Artikel nutzt im Hero jetzt ein emotionales Paarbild statt leerer Landschaft.
- Paarzeit-Checkliste wurde mit kurzen erklärenden Antworten ergänzt.
- Regentage-Checkliste wurde mit kurzen erklärenden Antworten ergänzt.
- Watt-Checkliste wurde mit kurzen erklärenden Antworten ergänzt.
- Kicker-Erkennung für Wellness, Thalasso, Dinner, Abend und Essen verbessert.

Messung:
- Alle geprüften Ratgeber-Hero-H1s: `58px` Desktop.
- Alle geprüften Ratgeber-Hero-Leads: `22.32px` Desktop.
- Alle geprüften Artikel-Kicker: `13px` Desktop.
- Keine leeren Checklisten-Antworten mehr in den geprüften Artikeln.

Nächster Schritt:
- Ratgeber-Übersichtsseite `/ratgeber` erneut gegen die fertigen Artikel prüfen: Hero, Themenstrip, Artikelkarten, SEO-/GEO-Einstieg und mobile Darstellung.

## 2026-05-13 — Ratgeber-Übersicht

URL:
- `/ratgeber`

Screenshots:
- Hero Desktop: `tmp/qa/guide-index-after/desktop-hero.png`
- Leitartikel Desktop: `tmp/qa/guide-index-after/desktop-featured.png`
- Artikelgrid Desktop: `tmp/qa/guide-index-after/desktop-grid.png`
- Hero Mobile: `tmp/qa/guide-index-after/mobile-hero.png`
- Leitartikel Mobile: `tmp/qa/guide-index-after/mobile-featured.png`
- Artikelgrid Mobile: `tmp/qa/guide-index-after/mobile-grid.png`

Korrekturen:
- Artikelliste von gleichförmigem Archiv auf redaktionellen Einstieg umgebaut.
- Erster Ratgeberartikel wird als Leitartikel hervorgehoben.
- Weitere Artikel stehen darunter als kompakteres Grid.
- Hero, Themenstrip und Artikelbereich bleiben im gleichen Morrow-Rhythmus wie Startseite und Auszeiten.

Messung:
- Ratgeber-Hero-H1 Desktop: `58px`
- Ratgeber-Hero-Lead Desktop: `22.32px`
- Leitartikel: 1
- Weitere Artikelkarten: 4

Bewertung:
- Übersicht wirkt jetzt stärker kuratiert und weniger wie eine reine Blogliste.
- Mobile Darstellung bleibt sequenziell und verständlich.
- Nächster Schritt: Eigentümerseite gegen Plattformmodell, Styleguide und Lead-Ziel prüfen.

## 2026-05-13 — Eigentümerseite

URL:
- `/eigentuemer`

Screenshots:
- Vorher Desktop Top: `tmp/qa/owner-pass-before/desktop-top.png`
- Vorher Mobile Top: `tmp/qa/owner-pass-before/mobile-top.png`
- Nachher Hero Desktop: `tmp/qa/owner-after/desktop-hero.png`
- Nachher Modell Desktop: `tmp/qa/owner-after/desktop-model.png`
- Nachher Formular Desktop: `tmp/qa/owner-after/desktop-form.png`
- Nachher Hero Mobile: `tmp/qa/owner-after/mobile-hero.png`
- Nachher Modell Mobile: `tmp/qa/owner-after/mobile-model.png`
- Nachher Formular Mobile: `tmp/qa/owner-after/mobile-form.png`

Korrekturen:
- Aus einer sehr sachlichen Seite wurde ein markennäherer Einstieg für Eigentümer.
- Hero zeigt jetzt ein konkretes Unterkunftsgefühl mit Bild, nicht nur Text.
- Headline wurde stärker auf Morrow-Positionierung ausgerichtet: Ferienimmobilie als Teil einer kuratierten Auszeit.
- Neues Modell-Element erklärt den kuratierten Ablauf: Objekt verstehen, Auszeit kuratieren, Anfrage persönlich prüfen.
- Interner Begriff `Phase 1` wurde aus der öffentlichen Copy entfernt.
- Formular bleibt einfach und lead-orientiert.

Messung:
- Owner-Hero-H1 Desktop: `58px`
- Owner-Hero-Lead Desktop: `22.32px`
- Build erfolgreich.

Bewertung:
- Seite wirkt jetzt mehr nach professioneller Morrow-Partnerschaft und weniger nach generischer Kontaktseite.
- Nächster Schritt: Erlebnisanbieter-Seite prüfen und an den gleichen B2B-Standard angleichen.

## 2026-05-13 — Erlebnisanbieter-Seite

URL:
- `/partner/erlebnisanbieter`

Screenshots:
- Desktop Fullpage: `tmp/qa/experience-partner-after/desktop-full-final.png`
- Mobile Fullpage: `tmp/qa/experience-partner-after/mobile-full-final.png`
- Desktop Hero: `tmp/qa/experience-partner-after/desktop-top.png`
- Mobile Hero: `tmp/qa/experience-partner-after/mobile-top.png`

Korrekturen:
- Erlebnisanbieter-Seite auf denselben B2B-Qualitätsstandard wie die Eigentümerseite gebracht.
- Eigenständige `partner-*` Struktur ergänzt, damit Erlebnispartner später getrennt von Eigentümern weiterentwickelt werden können.
- Hero, Nutzenbereich, Modellbereich, Einstieg, FAQ und Formular als klarer Partner-Flow aufgebaut.
- Bildsprache bleibt lokal, ruhig und SPO-nah; keine generische Plattform- oder SaaS-Anmutung.
- Formularbereich für B2B-Seiten kompakter gemacht, statt die große Gast-Anfrage-Mindesthöhe zu übernehmen.

Messung:
- Build erfolgreich.
- Desktop- und Mobile-Fullpage geprüft.
- Keine sichtbaren vertikalen Trennlinien.
- Keine internen Prozessbegriffe wie `Phase 1` in der öffentlichen Copy.

Bewertung:
- Seite vermittelt jetzt besser, dass Morrow lokale Erlebnisse kuratiert und nicht einfach Anbieter in eine Liste aufnimmt.
- Nächster Schritt: Admin V1 und internes Datenmodell gegen spätere Plattformanforderungen prüfen.

## 2026-05-13 — Admin V1 und Plattformstruktur

URL:
- `/admin`

Screenshots:
- Desktop Fullpage: `tmp/qa/admin-v1/desktop-full-final.png`
- Mobile Fullpage: `tmp/qa/admin-v1/mobile-full-final.png`

Korrekturen:
- Admin von einfacher Lead-Tabelle zu einem ersten Operations-Cockpit erweitert.
- Neue Übersicht für Auszeiten, feste Termine, Erlebnisbausteine, Gastanfragen, Eigentümer-Leads und Erlebnispartner ergänzt.
- Lead-Eingang zeigt jetzt Typ, Kontakt, Zeitstempel, Bezug und Status.
- Phase-1-Steuerung als interne Arbeitslogik ergänzt: Anfrage prüfen, Partnerkontakt, Zusage vorbereiten.
- Auszeiten zeigen jetzt Preis, Zielgruppe, Termine, Personenlogik, verbundene Unterkunft, Erlebnisse und Empfehlungen.
- Unterkünfte zeigen Gästekapazität, Schlafzimmer, Bad, Lagehinweis, Check-in-Art und Anreisezeit.
- Erlebnisse zeigen Auszeit-Zuordnung, Rolle, Preislogik und Bestätigungsstatus.
- Datenmodell V1.5 listet die nächsten notwendigen Plattformbausteine.

Messung:
- Build erfolgreich.
- Desktop- und Mobile-Fullpage geprüft.
- Mobile Admin-Grids auf echte Einspaltigkeit korrigiert.

Bewertung:
- Admin ist weiterhin kein fertiges CMS, aber die Plattformlogik ist jetzt sichtbar: Auszeit, Unterkunft, Erlebnis, Termine und Leads hängen zusammen.
- Nächster Schritt: entscheiden, ob wir zuerst echte Bearbeitungsformulare für Auszeiten bauen oder das Datenmodell Richtung Supabase/Firebase vorbereiten.

Nachkorrektur:
- Die erste Operations-Cockpit-Version war zu informationsdicht und optisch zu schwer.
- Admin wurde wieder auf eine ruhige Startansicht reduziert: vier Kennzahlen, Lead-Eingang, Heute-wichtig, Auszeiten, nächster Ausbau.
- Detailbereiche zu Unterkünften, Erlebnissen und Datenmodell werden nicht mehr direkt auf der Admin-Startfläche gezeigt, sondern sollen später in Bearbeiten-Ansichten oder Tabs liegen.

Aktuelle Screenshots:
- Desktop ruhig: `tmp/qa/admin-v1/desktop-calm.png`
- Mobile ruhig: `tmp/qa/admin-v1/mobile-calm.png`

Zweite Nachkorrektur:
- Admin wurde von einer websiteartigen dunklen Ansicht in eine kleine CRM-Oberfläche überführt.
- Neue Struktur: Sidebar, kompakte Topbar, kleine KPI-Kacheln, Anfragen-Tabelle, Auszeiten-Tabelle, rechte Aufgaben-/Ausbau-Spalte.
- Schriftgrößen und Card-Höhen wurden deutlich reduziert.
- Mobile Ansicht nutzt eine einfache lineare CRM-Struktur ohne seitliches Überlaufen.

Aktuelle CRM-Screenshots:
- Desktop CRM: `tmp/qa/admin-v1/desktop-crm-final.png`
- Mobile CRM: `tmp/qa/admin-v1/mobile-crm-final.png`

## 2026-05-13 — Admin CRM Unterseiten

Grundlage:
- `docs/ADMIN_CRM_STRUCTURE.md`

Umsetzung:
- Admin bekommt interne Bereiche: Übersicht, Anfragen, Auszeiten, Erlebnisse, Eigentümer und Erlebnisanbieter.
- Navigation erfolgt innerhalb des Admins, nicht als neue öffentliche Website-Routen.
- Jede Admin-Seite folgt derselben Logik: vorhandene Daten, täglicher Arbeitsablauf, fehlende Daten für den nächsten Ausbau.

Screenshots:
- Übersicht Desktop: `tmp/qa/admin-pages/overview-desktop.png`
- Anfragen Desktop: `tmp/qa/admin-pages/anfragen-desktop.png`
- Auszeiten Desktop: `tmp/qa/admin-pages/auszeiten-desktop.png`
- Eigentümer und Erlebnisanbieter wurden später aus dem alten Partnerbereich herausgelöst.
- Übersicht Mobile mit Navigation: `tmp/qa/admin-pages/overview-mobile-nav.png`
- Auszeiten Mobile mit Navigation: `tmp/qa/admin-pages/auszeiten-mobile-nav.png`

Bewertung:
- Struktur wirkt mehr wie ein kleines CRM: Sidebar, Arbeitsbereiche, Tabellen, Statuslogik und kompakte operative Hinweise.
- Auszeiten, Unterkünfte und Erlebnisse werden aktuell noch aus Seed-Daten gelesen; echte Bearbeitung folgt später.
- Hinweis: Der frühere Partnerbereich wurde danach in Eigentümer und Erlebnisanbieter getrennt.

## 2026-05-13 — Admin CRM Erlebnisse

Entscheidung:
- Erlebnisse sind ein eigener Admin-Bereich.
- Partner bleiben Anbieter, Kontakte und Kooperationsbeziehungen.
- Erlebnisse sind konkrete Bausteine einer Auszeit und werden später einem oder mehreren Partnern zugeordnet.

Umsetzung:
- Neuer Menüpunkt `Erlebnisse` im Admin.
- Anzeige aller Erlebnisbausteine aus den bestehenden Auszeiten.
- Sichtbar sind Auszeit-Zuordnung, Zielgruppe, Rolle, Preislogik, Partnerstatus und Bestätigungsstatus.
- Statuslabels wurden deutsch lesbar gemacht.
- Spätere Datenlücken sind dokumentiert: Partnerprofil, Kapazität, Dauer, Saison, Wetterabhängigkeit, Konditionen, Verfügbarkeit und interne Qualitätsbewertung.

Screenshots:
- Desktop: `tmp/qa/admin-pages/erlebnisse-desktop-final-de.png`
- Mobile: `tmp/qa/admin-pages/erlebnisse-mobile-final-de.png`

Messung:
- Build erfolgreich.
- Mobile Breite geprüft: 390px Viewport, 390px Dokumentbreite, kein horizontales Überlaufen.

## 2026-05-13 — Admin CRM Eigentümer und Erlebnisanbieter getrennt

Entscheidung:
- Eigentümer und Erlebnisanbieter sind zwei getrennte CRM-Pipelines.
- Eigentümer gehören zur Objekt-, Kooperations- und späteren Verwaltungslogik.
- Erlebnisanbieter gehören zur Angebots-, Kapazitäts- und Erlebnisbausteinlogik.
- Der alte Sammelbereich `Partner` wurde im Admin durch getrennte Menüpunkte ersetzt.

Umsetzung:
- Neuer Admin-Menüpunkt `Eigentümer`.
- Neuer Admin-Menüpunkt `Erlebnisanbieter`.
- Beide Bereiche haben eigene Kennzahlen, eigene Tabellen, eigene Arbeitsabläufe und eigene spätere Datenlücken.
- Die allgemeine Anfragen-Ansicht zeigt weiterhin alle Leads, trennt aber die Kennzahlen nach Gastanfragen, Eigentümern und Erlebnisanbietern.

Screenshots:
- Eigentümer Desktop: `tmp/qa/admin-pages/eigentuemer-desktop.png`
- Eigentümer Mobile: `tmp/qa/admin-pages/eigentuemer-mobile.png`
- Erlebnisanbieter Desktop: `tmp/qa/admin-pages/erlebnisanbieter-desktop.png`
- Erlebnisanbieter Mobile: `tmp/qa/admin-pages/erlebnisanbieter-mobile.png`

Messung:
- Build erfolgreich.
- Mobile Breite geprüft: 390px Viewport, 390px Dokumentbreite, kein horizontales Überlaufen.

## 2026-05-14 — Admin Funktionsprüfung

Grundlage:
- `docs/ADMIN_FUNCTION_ROADMAP.md`

Bewertung:
- Alle Adminbereiche wurden als CRM-Arbeitsbereiche geprüft: Übersicht, Anfragen, Auszeiten, Erlebnisse, Eigentümer, Erlebnisanbieter.
- Aktuell vorhanden: Navigation, Kennzahlen, Tabellen/Listen, Leadstatus-Wechsel und getrennte Bereiche.
- Noch nicht vorhanden: Öffnen/Detailansicht, Notizen, Wiedervorlage, Bearbeiten, Archivieren, Deaktivieren und sichere Löschlogik.
- Löschen soll nicht als Standardaktion eingeführt werden. Standard ist Archivieren oder Deaktivieren.

Empfohlener nächster Bauabschnitt:
- Lead-Detail-Drawer für Anfragen, Eigentümer und Erlebnisanbieter.
- Funktionen: Öffnen, Status ändern, Notiz speichern, Wiedervorlage setzen, Archivieren.
- Löschen nur für Testdaten oder Spam und nur mit Bestätigung.

Screenshots:
- Desktop je Bereich: `tmp/qa/admin-function-review/*-desktop.png`
- Mobile je Bereich: `tmp/qa/admin-function-review/*-mobile.png`

Messung:
- Build erfolgreich.
- Mobile Breite je Adminbereich geprüft: 390px Viewport, 390px Dokumentbreite, kein horizontales Überlaufen.

## 2026-05-14 — Admin Lead-Detail-Drawer V1

Umsetzung:
- Lead-Zeilen haben jetzt eine Aktion `Öffnen`.
- Detail-Drawer zeigt Kontakt, Bezug, Status, Nachricht und leadtypische Felder.
- Status kann im Drawer geändert werden.
- Interne Notiz wird als `internalNote` gespeichert.
- Wiedervorlage wird als `followUpAt` gespeichert.
- Archivieren setzt `archivedAt` und entfernt Leads aus der täglichen Ansicht.
- Löschen ist nur mit Bestätigung möglich und bleibt für Testdaten, Spam oder Dubletten gedacht.

Bewusste Grenze:
- Noch keine Archivansicht.
- Noch keine echten Bearbeitungsformulare für Auszeiten, Erlebnisse, Eigentümerprofile oder Anbieterprofile.
- Noch kein Audit-Log, keine Rollenrechte und keine produktive Datenbank.

Screenshots:
- Desktop: `tmp/qa/admin-lead-drawer/lead-drawer-desktop.png`
- Mobile: `tmp/qa/admin-lead-drawer/lead-drawer-mobile.png`

Messung:
- Build erfolgreich.
- Speichern von Notiz und Wiedervorlage per Browser-Test geprüft.
- Desktop Breite: 1440px Viewport, 1440px Dokumentbreite.
- Mobile Breite: 390px Viewport, 390px Dokumentbreite.

## 2026-05-14 — Admin Vollprüfung

Grundlage:
- `docs/ADMIN_FULL_AUDIT_2026-05-14.md`

Prüfung:
- Alle Adminbereiche mit Beispiel-Daten geprüft: Übersicht, Anfragen, Auszeiten, Erlebnisse, Eigentümer, Erlebnisanbieter.
- Desktop und Mobile Screenshots erstellt.
- Mobile Breite für alle Bereiche geprüft: 390px Viewport, 390px Dokumentbreite.

Ergebnis:
- Lead-CRM ist für V1 nutzbar.
- Eigentümer und Erlebnisanbieter funktionieren als getrennte Lead-Pipelines.
- Auszeiten und Erlebnisse sind aktuell gute Kontrolllisten, aber noch keine vollständigen Arbeitsbereiche.
- Archivieren funktioniert logisch, und die Archivansicht wurde anschließend ergänzt.
- Technische Auszeiten-Statuslabels wurden von `published` auf deutsche Labels wie `Live` umgestellt.

Empfohlene nächste Schritte:
- Wiedervorlagen auf der Übersicht sichtbar machen.
- Danach Auszeit-Detail-Drawer mit Statusaktion `Pausieren`.

## 2026-05-14 — Admin Lead-Archiv und Filter

Umsetzung:
- Anfragenbereich hat jetzt eine Filterleiste.
- Filter nach Ansicht: aktiv oder Archiv.
- Filter nach Typ: alle, Gastanfragen, Eigentümer, Erlebnisanbieter.
- Filter nach Status.
- Archivierte Leads sind in der Archivansicht sichtbar.
- Archivierte Leads können geöffnet und reaktiviert werden.

Screenshots:
- Aktivansicht Desktop: `tmp/qa/admin-filter-archive/anfragen-active-filter-desktop.png`
- Archivansicht Desktop: `tmp/qa/admin-filter-archive/anfragen-archive-desktop.png`
- Mobile: `tmp/qa/admin-filter-archive/anfragen-filter-mobile.png`

Messung:
- Build erfolgreich.
- Filter nach Eigentümer geprüft.
- Archivansicht geprüft.
- Reaktivieren archivierter Leads geprüft.
- Mobile Breite: 390px Viewport, 390px Dokumentbreite.

Nächster sinnvoller Schritt:
- Wiedervorlagen auf der Übersicht sichtbar machen.

## 2026-05-14 — Admin Übersicht Wiedervorlagen

Umsetzung:
- Übersicht zeigt jetzt die Kennzahl `Heute fällig`.
- Neue Section `Heute fällig` steht vor der allgemeinen Anfrageliste.
- Fällige und überfällige aktive Leads werden angezeigt.
- Archivierte Leads werden nicht als fällig angezeigt.
- Wiedervorlagen öffnen direkt den Lead-Drawer.
- Wiedervorlage-Datum wird lesbar angezeigt, z. B. `14. Mai`.

Screenshots:
- Desktop: `tmp/qa/admin-followups/overview-followups-desktop-final.png`
- Mobile: `tmp/qa/admin-followups/overview-followups-mobile-final.png`

Messung:
- Build erfolgreich.
- Fällige und überfällige Leads geprüft.
- Archivierte fällige Leads bleiben aus der Übersicht raus.
- Mobile Breite: 390px Viewport, 390px Dokumentbreite.

Nächster sinnvoller Schritt:
- Admin-Startseite sectionweise prüfen: Reihenfolge, Abstände, Textgrößen, Card-Relevanz und keine Platzhalter.

## 2026-05-14 — Admin Übersicht strukturell bereinigt

Umsetzung:
- Die Admin-Startseite wurde auf echte tägliche Arbeit reduziert.
- Der alte Platzhalter-/Ausbaubereich wurde entfernt.
- `Heute bearbeiten` ist jetzt ein Tagesboard mit Wiedervorlagen, neuen Anfragen und Leads in Prüfung.
- `Aktive Anfragen` zeigt nur die neuesten Leads und bleibt ein schneller Einstieg, keine komplette Tabelle.
- `Kommende Termine` ersetzt die einzelne nächste Auszeit und zeigt mehrere Termine im Kurzüberblick.
- `Tagesfokus` wurde entfernt, weil die Card nach dem Tagesboard redundant war.

Screenshots:
- Desktop: `tmp/qa/admin-overview-structure/overview-desktop.png`
- Mobile: `tmp/qa/admin-overview-structure/overview-mobile.png`
- Verfeinerung Desktop: `tmp/qa/admin-overview-refined/desktop.png`
- Verfeinerung Mobile: `tmp/qa/admin-overview-refined/mobile-full.png`
- Verfeinerung mit Beispiel-Leads: `tmp/qa/admin-overview-refined/desktop-with-leads-final.png`
- Finales Cockpit Desktop: `tmp/qa/admin-overview-cockpit-final/desktop.png`
- Finales Cockpit Mobile: `tmp/qa/admin-overview-cockpit-final/mobile.png`

Messung:
- Build erfolgreich.
- Alte Platzhalterkarte nicht mehr vorhanden.
- Tagesfokus nicht mehr vorhanden.
- Wiedervorlagen, neue Anfragen und Leads in Prüfung sind getrennte Arbeitszustände.
- Kommende Termine stehen Desktop rechts oben auf Höhe der Arbeits-KPIs und Mobile direkt nach den Kennzahlen.
- Mobile Breite: 390px Viewport, 390px Dokumentbreite.

Bewertung:
- Die Übersicht wirkt jetzt mehr wie ein kleines CRM: ruhig, fokussiert und auf den Arbeitstag ausgerichtet.
- Die Cards sind nicht mehr nur untereinander gestapelt, sondern in Tagesboard, Fokusbereich und Eingangsliste gegliedert.
- Detailarbeit bleibt bewusst in den Unterseiten.

Nächster sinnvoller Schritt:
- Admin-Seite `Anfragen` sectionweise prüfen: Filter, Tabelle, Detail-Drawer, Archivansicht, leere Zustände, Abstände und Textgrößen.

## 2026-05-14 — Admin Anfragen bereinigt

Umsetzung:
- Rechte Roadmap-/Ausbau-Spalte entfernt, weil sie nicht zur täglichen Lead-Arbeit gehört.
- Kennzahlen laufen jetzt über die volle Breite und brechen nicht mehr unsauber in eine Seitenleiste.
- `Zu prüfen` wurde als `In Prüfung` vereinheitlicht.
- Der zentrale Arbeitsbereich heißt je nach Ansicht `Aktive Anfragen` oder `Archivierte Anfragen`.
- Filter, Statuswechsel und Öffnen-Aktion bleiben direkt im Lead-Arbeitsbereich.

Screenshots:
- Desktop mit Beispiel-Leads: `tmp/qa/admin-anfragen-clean/desktop.png`
- Mobile mit Beispiel-Leads: `tmp/qa/admin-anfragen-clean/mobile.png`

Messung:
- Build erfolgreich.
- Desktop Breite: 1440px Viewport, 1440px Dokumentbreite.
- Mobile Breite: 390px Viewport, 390px Dokumentbreite.

Bewertung:
- Die Seite wirkt jetzt mehr wie ein kleines CRM: erst Volumen, dann Filter, dann Lead-Liste.
- Keine internen Ausbauhinweise mehr auf der Arbeitsfläche.
- Nächster sinnvoller Detailpunkt: Lead-Drawer selbst prüfen und ggf. kompakter/operativer gestalten.

## 2026-05-14 — Admin Lead-Drawer operativer Aufbau

Umsetzung:
- Drawer-Reihenfolge von Detailansicht auf CRM-Arbeit umgestellt.
- `Bearbeitung` steht jetzt zuerst: Status, Wiedervorlage, interne Notiz.
- Danach folgen Nachricht, Kontakt und Anfrage-/Objekt-/Erlebniskontext.
- Kontakt- und Kontextdetails sind in benannte Gruppen getrennt.
- Details sind nicht mehr alle gleichwertig vor der eigentlichen Bearbeitung platziert.

Screenshots:
- Vorher Desktop: `tmp/qa/admin-drawer-before/desktop.png`
- Vorher Mobile: `tmp/qa/admin-drawer-before/mobile.png`
- Nachher Desktop: `tmp/qa/admin-drawer-after/desktop.png`
- Nachher Mobile: `tmp/qa/admin-drawer-after/mobile.png`

Messung:
- Build erfolgreich.
- Desktop Breite: 1440px Viewport, 1440px Dokumentbreite.
- Mobile Breite: 390px Viewport, 390px Dokumentbreite.

Bewertung:
- Mobile ist deutlich arbeitsfähiger, weil Status, Wiedervorlage und Notiz direkt erreichbar sind.
- Der Drawer fühlt sich mehr nach CRM-Bearbeitung an und weniger nach langer Datenkarte.
- Nächster sinnvoller Schritt: Archiv-/Löschlogik und leere Zustände im Leadfluss prüfen.

## 2026-05-15 — Admin Auszeiten Arbeitsansicht

Umsetzung:
- Rechte interne Roadmap-/Ausbau-Karten aus der Auszeiten-Seite entfernt.
- Kennzahlen zeigen jetzt Live-Auszeiten, aktive Termine, verbundene Unterkünfte und enthaltene Erlebnisse.
- Die Auszeiten werden als prüfbare Arbeitskarten dargestellt statt als enge Tabelle.
- Pro Auszeit sind Zielgruppe, Preislogik, Termine, Unterkunft, enthaltene Leistungen und Erlebnisstand sichtbar.
- Der öffentliche Seitenlink bleibt als echte Aktion erhalten.

Screenshots:
- Desktop: `tmp/qa/admin-auszeiten-workview/desktop.png`
- Mobile: `tmp/qa/admin-auszeiten-workview/mobile.png`

Messung:
- Build erfolgreich.
- Desktop Breite: 1440px Viewport, kein horizontaler Overflow.
- Mobile Breite: 390px Viewport, kein horizontaler Overflow.

Bewertung:
- Die Seite ist jetzt näher an einem CRM-Arbeitsbereich: weniger Platzhalter, mehr direkte Prüfung.
- Für eine spätere CMS-Funktion fehlt bewusst noch der Editor, aber die Datenstruktur ist schon auf verknüpfte Unterkunft, Termine und Erlebnisbausteine ausgelegt.
- Nächster sinnvoller Schritt: Admin `Erlebnisse` prüfen und von Roadmap-Notizen in eine echte Anbieter-/Baustein-Arbeitsansicht überführen.

## 2026-05-15 — Admin Auszeiten Funktionen geprüft und ergänzt

Umsetzung:
- Filter für Zielgruppe und Status ergänzt.
- `Bearbeiten` pro Auszeit ergänzt und als Drawer umgesetzt.
- Bearbeitbar sind Name, Status, Kurzversprechen, Preis, Preisnotiz, Termine, Unterkunft, Schlafplätze, Check-in-Art, späteste Anreise, Hund optional, Lagehinweis und enthaltene Leistungen.
- Erlebnisbausteine sind im Auszeiten-Drawer pflegbar: Titel, Rolle, Bestätigungsstatus, Preis-Inklusion und Anbieter.
- `Öffentliche Seite` wurde als echter Link geprüft.

Screenshots:
- Desktop: `tmp/qa/admin-auszeiten-features/desktop.png`
- Mobile: `tmp/qa/admin-auszeiten-features/mobile.png`

Messung:
- Build erfolgreich.
- Zielgruppenfilter funktioniert: 2 Auszeiten gesamt, 1 Paar-Auszeit nach Filter.
- Statusfilter funktioniert: 0 Entwürfe im aktuellen Datensatz.
- Bearbeiten-Drawer öffnet.
- Speichern aktualisiert die Auszeiten-Karte und den Erlebnisstand.
- Öffentliche Seite navigiert nach `/auszeiten/family-escape`.
- Kein horizontaler Overflow auf Desktop oder Mobile.

Bewertung:
- Die Auszeiten-Seite ist jetzt keine reine Übersicht mehr, sondern eine erste kleine CMS-/CRM-Arbeitsfläche.
- Noch nicht gebaut sind: neue Auszeit anlegen, Auszeit duplizieren, Auszeit löschen/deaktivieren mit Sicherheitslogik und echte Backend-Persistenz.
- Nächster sinnvoller Schritt: Admin `Erlebnisse` und `Erlebnisanbieter` miteinander verbinden, damit Erlebnisbausteine nicht nur in der Auszeit gepflegt, sondern auch aus Anbieterprofilen ausgewählt werden können.

## 2026-05-15 — Admin Erlebnisse Arbeitsansicht

Umsetzung:
- Rechte interne Roadmap-/Ausbau-Karten entfernt.
- Erlebnisse werden jetzt als Arbeitskarten statt als enge Tabelle dargestellt.
- Filter für Auszeit, Rolle und Bestätigungsstatus ergänzt.
- Kennzahlen zeigen Erlebnisbausteine, enthaltene Erlebnisse, offene Bausteine und Bausteine mit Anbieter.
- Pro Erlebnis sind Auszeit, Zielgruppe, Rolle, Preislogik, Anbieter und operativer Status sichtbar.
- Bearbeiten-Drawer ergänzt: Titel, Anbieter, Rolle, Bestätigungsstatus, Preis-Inklusion und Gästehinweis sind editierbar.

Screenshots:
- Desktop: `tmp/qa/admin-erlebnisse-workview/desktop.png`
- Mobile: `tmp/qa/admin-erlebnisse-workview/mobile.png`

Messung:
- Build erfolgreich.
- 6 Erlebnisbausteine im Startzustand.
- Auszeitfilter funktioniert: 3 Bausteine für `Couple Reset`.
- Rollenfilter funktioniert: 2 enthaltene Erlebnisse.
- Bearbeiten-Drawer öffnet.
- Speichern aktualisiert Anbieter und Status auf der Erlebnis-Karte.
- Kein horizontaler Overflow auf Desktop oder Mobile.

Bewertung:
- Die Seite ist jetzt eine echte operative Arbeitsansicht für Erlebnisbausteine.
- Die Verbindung zur jeweiligen Auszeit bleibt erhalten, weil Erlebnisse weiterhin aus dem Auszeiten-Datensatz kommen.
- Nächster sinnvoller Schritt: Admin `Erlebnisanbieter` ausbauen und danach Anbieterprofile mit den Erlebnisbausteinen verbinden.

## 2026-05-15 — Admin Erlebnisse mit Erlebnisanbietern verbunden

Umsetzung:
- Eigener Anbieter-Datenbestand im Admin ergänzt.
- Erlebnisbausteine können über `providerId` mit einem Anbieterprofil verbunden werden.
- Der Erlebnis-Drawer nutzt nun eine Anbieter-Auswahl statt nur freiem Textfeld.
- Anbieterprofile zeigen, wie viele Erlebnisbausteine verknüpft sind.
- Anbieter-Drawer ergänzt: Profil, Kontakt, Kategorie, Zielgruppenfit, Status, interne Notiz und verknüpfte Erlebnisse sind sichtbar und bearbeitbar.
- Die alte Roadmap-Seitenleiste auf `Erlebnisanbieter` wurde durch echte Anbieterprofile ersetzt.

Screenshots:
- Desktop Drawer: `tmp/qa/admin-provider-link/desktop-drawer.png`
- Mobile: `tmp/qa/admin-provider-link/mobile.png`

Messung:
- Build erfolgreich.
- Erlebnisbaustein lässt sich mit `Watt & Wind` verbinden.
- Anbieterprofil zeigt danach `1 Erlebnisse`.
- Anbieter-Drawer zeigt das verknüpfte Erlebnis `Geführte Watt- oder Naturzeit`.
- Kein horizontaler Overflow auf Desktop oder Mobile.

Bewertung:
- Erlebnisse und Erlebnisanbieter sind jetzt nicht mehr isoliert.
- Für Phase 2 ist damit der relationale Rahmen vorbereitet: Anbieterprofil -> Erlebnisbaustein -> Auszeit.
- Noch offen: neue Anbieterprofile manuell anlegen, Anbieter löschen/deaktivieren mit Sicherheitslogik und echte Backend-Persistenz.

## 2026-05-15 — Admin Eigentümer als Objektprofile

Umsetzung:
- Eigener Objekt-/Eigentümer-Datenbestand im Admin ergänzt.
- Eigentümerbereich von reiner Lead-Liste auf Objektprofile umgestellt.
- Objektprofile zeigen Eigentümer, Schlafplätze, Status, Kontakt und wie viele Auszeiten mit dem Objekt verbunden sind.
- Objekt-Drawer ergänzt: Objektname, Eigentümer, Kontakt, Ort, Objekttyp, Schlafplätze, Vermietungsstatus, Schlüsselübergabe, späteste Anreise und interne Notiz sind editierbar.
- Verknüpfte Auszeiten werden im Objekt-Drawer angezeigt.
- Eingehende Eigentümeranfragen bleiben als eigene Lead-Liste darunter erhalten.

Screenshots:
- Desktop Drawer: `tmp/qa/admin-owner-properties/desktop-drawer.png`
- Mobile: `tmp/qa/admin-owner-properties/mobile.png`

Messung:
- Build erfolgreich.
- 2 Objektprofile im Startzustand.
- Erstes Objekt zeigt `1 Auszeiten`.
- Objekt-Drawer öffnet.
- Verknüpfte Auszeit `Family Escape` ist sichtbar.
- Speichern aktualisiert Felder wie späteste Anreise.
- Kein horizontaler Overflow auf Desktop oder Mobile.

Bewertung:
- Eigentümer und Unterkünfte sind jetzt als eigene operative Einheit angelegt.
- Der Plattformrahmen ist dadurch konsistenter: Objektprofil -> Auszeit und Anbieterprofil -> Erlebnisbaustein -> Auszeit.
- Noch offen: neue Objektprofile manuell anlegen, Objekt löschen/deaktivieren mit Sicherheitslogik und echte Backend-Persistenz.

## 2026-05-15 — Admin Kernaktionen ergänzt

Umsetzung:
- `Auszeiten`: neue Auszeit anlegen, Auszeit duplizieren und Auszeit pausieren/live setzen ergänzt.
- `Eigentümer`: neues Objektprofil anlegen und Objekt pausieren/reaktivieren ergänzt.
- `Erlebnisanbieter`: neuen Anbieter anlegen und Anbieter pausieren/reaktivieren ergänzt.
- Neue Datensätze öffnen direkt den passenden Bearbeiten-Drawer.
- Neue Auszeiten werden als Entwurf angelegt.

Screenshots:
- Auszeiten Desktop: `tmp/qa/admin-core-actions/auszeiten-final-desktop.png`
- Auszeiten Mobile: `tmp/qa/admin-core-actions/auszeiten-mobile.png`
- Eigentümer Desktop: `tmp/qa/admin-core-actions/eigentuemer-final-desktop.png`
- Erlebnisanbieter Desktop: `tmp/qa/admin-core-actions/erlebnisanbieter-final-desktop.png`
- Erlebnisanbieter Mobile: `tmp/qa/admin-core-actions/erlebnisanbieter-final-mobile.png`

Messung:
- Build erfolgreich.
- Neue Auszeit: Anzahl 2 -> 3, Drawer öffnet, gespeicherter Name sichtbar.
- Auszeit duplizieren: Anzahl 3 -> 4, Kopie öffnet als Entwurf.
- Auszeit pausieren: Status sichtbar auf `Pausiert`.
- Neues Objekt: Anzahl 2 -> 3, Drawer öffnet, gespeicherter Name sichtbar.
- Objekt pausieren: Status sichtbar auf `Pausiert`.
- Neuer Anbieter: Anzahl 2 -> 3, Drawer öffnet, gespeicherter Name sichtbar.
- Anbieter pausieren: Status sichtbar auf `Pausiert`.
- Kein horizontaler Overflow im geprüften Desktop-Viewport.

Bewertung:
- Der Admin ist jetzt nicht mehr nur ein Editor für Seed-Daten, sondern kann die wichtigsten Arbeitsobjekte selbst erzeugen.
- Noch offen: Löschen mit Sicherheitslogik, echte Backend-Persistenz, Rechte/Rollen und vollständige Validierung vor Veröffentlichung.

## 2026-05-15 — Admin Gesamtprüfung

Umsetzung:
- Alle Adminbereiche visuell geprüft: Übersicht, Anfragen, Auszeiten, Erlebnisse, Eigentümer, Erlebnisanbieter.
- Desktop- und Mobile-Screenshots für jeden Bereich erstellt.
- Kernmetriken, Buttons, Links und horizontaler Overflow je Bereich geprüft.
- Die neuen Aktionsbereiche wurden besonders auf mobile Stapelung und Bedienbarkeit geprüft.

Screenshots:
- Übersicht Desktop: `tmp/qa/admin-full-review/uebersicht-desktop.png`
- Übersicht Mobile: `tmp/qa/admin-full-review/uebersicht-mobile.png`
- Anfragen Desktop: `tmp/qa/admin-full-review/anfragen-desktop.png`
- Anfragen Mobile: `tmp/qa/admin-full-review/anfragen-mobile.png`
- Auszeiten Desktop: `tmp/qa/admin-full-review/auszeiten-desktop.png`
- Auszeiten Mobile: `tmp/qa/admin-full-review/auszeiten-mobile.png`
- Erlebnisse Desktop: `tmp/qa/admin-full-review/erlebnisse-desktop.png`
- Erlebnisse Mobile: `tmp/qa/admin-full-review/erlebnisse-mobile.png`
- Eigentümer Desktop: `tmp/qa/admin-full-review/eigentuemer-desktop.png`
- Eigentümer Mobile: `tmp/qa/admin-full-review/eigentuemer-mobile.png`
- Erlebnisanbieter Desktop: `tmp/qa/admin-full-review/erlebnisanbieter-desktop.png`
- Erlebnisanbieter Mobile: `tmp/qa/admin-full-review/erlebnisanbieter-mobile.png`

Messung:
- Kein horizontaler Overflow in allen geprüften Desktop- und Mobile-Views.
- Übersicht: 3 Metriken, tägliches Arbeitsboard, kommende Termine und aktuelle Anfragen sichtbar.
- Anfragen: 5 Metriken, Filter und Lead-Tabelle sichtbar.
- Auszeiten: 4 Metriken, Filter, neue Auszeit und Kartenaktionen sichtbar.
- Erlebnisse: 4 Metriken, Filter und Erlebnis-Arbeitskarten sichtbar.
- Eigentümer: 4 Metriken, Objektprofile, neues Objekt und Lead-Liste sichtbar.
- Erlebnisanbieter: 4 Metriken, Anbieterprofile, neuer Anbieter und Lead-Liste sichtbar.

Bewertung:
- Der Admin ist für eine V1 nun strukturell rund: tägliche Übersicht, Lead-Arbeit, Auszeiten, Erlebnisbausteine, Objektprofile und Anbieterprofile greifen ineinander.
- Die UI ist noch bewusst kompakt und nicht final wie ein ausgebautes CRM, aber sie ist nicht mehr nur eine Sammlung von Tabellen und Platzhaltern.
- Nächster sinnvoller Qualitätsschritt: Validierungsregeln vor Veröffentlichung und sichere Lösch-/Archivlogik pro Arbeitsobjekt ergänzen.

## 2026-05-15 — Admin Kunden und Buchungen ergänzt

Umsetzung:
- Admin-Navigation um `Kunden` und `Buchungen` ergänzt.
- `Kunden` entstehen aus aktiven Gastanfragen und zeigen Kontakt, Reisegruppe, Anfragehistorie und WhatsApp-Zustimmung.
- Archivierte Absagen und `Kein Interesse` werden nicht als aktive Kundensätze geführt.
- `Buchungen` entstehen aus Gastanfragen mit Status `Reserviert`, `Bezahlt` oder `Abgeschlossen`.
- Testdaten enthalten nun eine reservierte Family-Auszeit und eine bezahlte Couple-Auszeit.
- E-Mail und Telefonnummer sind auch auf Kundencards klickbar.
- Profilseiten `Eigentümer` und `Erlebnisanbieter` zeigen keine eingehenden Lead-Bereiche mehr; eingehende Anfragen bleiben zentral unter `Anfragen`.

Screenshots:
- Kunden Desktop: `tmp/qa/admin-crm/kunden-final.png`
- Buchungen Desktop: `tmp/qa/admin-crm/buchungen-final.png`
- Eigentümer Desktop: `tmp/qa/admin-crm/eigentuemer-final.png`
- Erlebnisanbieter Desktop: `tmp/qa/admin-crm/erlebnisanbieter-final.png`

Messung:
- Build erfolgreich.
- Kunden: 4 aktive Kundensätze, archivierte Absage nicht sichtbar.
- Buchungen: 2 Aufenthalte sichtbar, davon 1 reserviert und 1 bezahlt.
- Kundencard: E-Mail und Telefon sind klickbar.
- Eigentümer und Erlebnisanbieter: keine eingehenden Lead-Listen oder `Neue Leads`-Metriken sichtbar.

Bewertung:
- Der CRM-Rahmen ist jetzt fachlich klarer getrennt: `Anfragen` ist Eingang, `Kunden` ist Beziehung, `Buchungen` ist konkreter Aufenthalt.
- Nächster sinnvoller Schritt: Buchungsdetail-Drawer mit operativen Feldern wie Zahlung, Unterkunft, Schlüsselübergabe, Anreiseinfo und Erlebnisstatus ergänzen.

## 2026-05-15 — Admin Buchungsdetail-Drawer

Umsetzung:
- `Buchungen` sind nicht mehr nur Karten, sondern können über `Öffnen` in einem Detail-Drawer bearbeitet werden.
- Der Drawer bündelt Buchungsstatus, Zahlung, Termin, Personen, Hund, Reservierungsfrist, Zahlungsfrist, nächste Aufgabe, Check-in-Status und Erlebnisstatus.
- Unterkunftsdaten wie Schlüsselübergabe, späteste Anreise und Check-out werden aus der verbundenen Auszeit angezeigt.
- Enthaltene Erlebnisbausteine werden im Buchungsdetail sichtbar.
- Statusfluss für Buchungen um `Vor Anreise`, `Aktiv` und `Storniert` erweitert.
- Testdaten enthalten Reservierungs- und Zahlungsfristen sowie Check-in-/Erlebnisstatus.

Screenshots:
- Buchungen Desktop: `tmp/qa/admin-booking-drawer/buchungen-list.png`
- Buchungsdrawer Desktop: `tmp/qa/admin-booking-drawer/buchung-drawer.png`
- Buchungen nach Speichern: `tmp/qa/admin-booking-drawer/buchungen-after-save.png`
- Buchungen Mobile: `tmp/qa/admin-booking-drawer/buchungen-mobile.png`
- Buchungsdrawer Mobile: `tmp/qa/admin-booking-drawer/buchung-drawer-mobile.png`

Messung:
- Build erfolgreich.
- Buchungen-Seite zeigt 2 Aufenthalte und 2 `Öffnen`-Aktionen.
- Buchungsdrawer öffnet für die bezahlte Couple-Auszeit.
- Speichern aktualisiert Check-in-Status und nächste Aufgabe.
- Kein horizontaler Overflow auf Desktop oder Mobile.

Bewertung:
- Der wichtigste operative Übergang ist jetzt sichtbar: aus einer Buchung wird ein vorbereitbarer Aufenthalt.
- Noch offen: eigener Buchungsdatensatz statt Lead-abgeleiteter Buchung, Aufgabenmodul Light, Agenturkontakte, Kommunikationshistorie und echte Backend-Persistenz.

## 2026-05-15 — Admin Aufgabenmodul Light

Umsetzung:
- Neuer Admin-Menüpunkt `Aufgaben`.
- Aufgaben haben Titel, Bezug, Fälligkeit, Status, Priorität und optionale Notiz.
- Startdaten enthalten zwei operative Buchungsaufgaben.
- Übersicht zeigt operative Aufgaben zusätzlich zu Lead-Wiedervorlagen.
- Buchungsdrawer zeigt verknüpfte Aufgaben und erlaubt neue Aufgaben direkt zur Buchung anzulegen.
- Aufgaben können zentral und im Buchungsdrawer erledigt oder wieder geöffnet werden.

Screenshots:
- Übersicht mit Aufgaben: `tmp/qa/admin-tasks/overview-tasks.png`
- Aufgaben Desktop: `tmp/qa/admin-tasks/tasks-page.png`
- Neue Aufgabe im Buchungsdrawer: `tmp/qa/admin-tasks/booking-task-created.png`
- Aufgaben Mobile: `tmp/qa/admin-tasks/tasks-mobile.png`

Messung:
- Build erfolgreich.
- Aufgaben-Seite zeigt 2 Startaufgaben.
- Neue Aufgabe im Buchungsdrawer angelegt und auf der Aufgaben-Seite sichtbar.
- Aufgabe kann als erledigt markiert werden.
- Kein horizontaler Overflow auf Desktop oder Mobile.

Bewertung:
- Wiedervorlagen bleiben fuer Lead-Arbeit, Aufgaben sind jetzt fuer Operations da.
- Das System kann damit besser zwischen `Kontakt nachfassen` und `Aufenthalt vorbereiten` unterscheiden.
- Noch offen: Verantwortliche Personen, Aufgaben fuer andere Referenztypen direkt anlegen, Aufgabenfilter, echte Backend-Persistenz und Aktivitaetslog.

## 2026-05-15 — Admin Agenturen ergänzt

Umsetzung:
- Neuer Admin-Menüpunkt `Agenturen`.
- Agenturen sind als eigener Datentyp getrennt von Eigentümern angelegt.
- Agenturprofile enthalten Ansprechpartner, Kontakt, Ort, Status, betreute Objekte, Rückmeldefrist, Verfügbarkeitsnotiz und interne Notiz.
- Zwei Startagenturen für Phase 1 angelegt.
- Agenturen können neu angelegt, bearbeitet und pausiert/reaktiviert werden.
- Betreute Objekte können im Agenturdrawer per Checkbox verbunden werden.

Screenshots:
- Agenturen Desktop: `tmp/qa/admin-agencies/agencies-page.png`
- Agenturdrawer Desktop: `tmp/qa/admin-agencies/agency-drawer.png`
- Agenturen Mobile: `tmp/qa/admin-agencies/agencies-mobile.png`
- Agenturdrawer Mobile: `tmp/qa/admin-agencies/agency-drawer-mobile.png`

Messung:
- Build erfolgreich.
- Agentur-Seite zeigt 2 Startagenturen.
- Neue Agentur kann angelegt und gespeichert werden.
- Rückmeldefrist kann bearbeitet werden.
- Kein horizontaler Overflow auf Desktop oder Mobile.

Bewertung:
- Phase-1-Realität ist jetzt besser abgebildet: Agenturen sind Startpartner für Objektzugang und freie Termine, während Eigentümerprofile für spätere direkte Beziehungen stehen.
- Noch offen: Agenturen direkt mit Buchungen/Reservierungsaufgaben verknüpfen, Antwortfristen automatisch als Aufgaben erzeugen und Agenturkontakte aus Scraping-/Leadlisten übernehmen.

## 2026-05-15 — Admin Eigentümer und Agenturen verknüpft

Umsetzung:
- Eigentümerobjekte haben einen Statusfilter und zeigen die beteiligte Agentur, falls das Objekt in Phase 1 über eine Agentur kommt.
- Agenturen haben einen Statusfilter und zeigen ihre betreuten Objekte als Arbeitsliste.
- Aus dem Eigentümerobjekt kann die verknüpfte Auszeit direkt geöffnet werden.
- Aus der Agentur kann das betreute Objekt direkt geöffnet werden.
- Aus der Objektkarte kann die beteiligte Agentur direkt geöffnet werden.
- Der Agenturdrawer trennt Checkbox und Öffnen-Aktion sauber, damit die Bedienung klarer bleibt.

Screenshots:
- Agenturdrawer: `tmp/qa/admin-owners-agencies/agency-drawer-clean.png`
- Agentur öffnet Objekt: `tmp/qa/admin-owners-agencies/agency-opens-object.png`
- Objekt öffnet Auszeit: `tmp/qa/admin-owners-agencies/object-opens-package.png`

Messung:
- Build erfolgreich.
- Agentur → Objekt → Auszeit funktioniert im Browser.
- Eigentümerobjekte zeigen die zugeordnete Agentur.
- Agenturen zeigen betreute Objekte und erlauben das Öffnen des Objektprofils.

Bewertung:
- Die Phase-1-Logik ist jetzt sauberer im CRM abgebildet: Agenturen liefern Startzugang zu Objekten, Objekte sind operative Unterkunftsprofile, Auszeiten verbinden Objekt, Termin, Preis und Erlebnis.
- Nächster sinnvoller Schritt: alle Admin-Detaildrawer auf gleiche Feldbreiten, Textgrößen und Aktionslogik prüfen, bevor weitere Datentypen ergänzt werden.

## 2026-05-15 — Admin Detaildrawer harmonisiert

Umsetzung:
- Detaildrawer auf Desktop breiter gezogen, damit Formularfelder nicht gedrungen wirken.
- Innenabstände in Header, Body und Footer vereinheitlicht.
- Lange Textfelder laufen über die volle Drawerbreite.
- Erlebnisbausteine im Auszeit-Drawer auf ein ruhigeres 2-Spalten-Raster umgestellt.
- Formulareingaben gegen horizontales Überlaufen stabilisiert.

Screenshots:
- Auszeit-Drawer Desktop oben: `tmp/qa/admin-drawer-polish/package-drawer-top.png`
- Auszeit-Drawer Erlebnisbausteine: `tmp/qa/admin-drawer-polish/package-drawer-experiences.png`
- Auszeit-Drawer Mobile: `tmp/qa/admin-drawer-polish/package-drawer-mobile.png`

Messung:
- Build erfolgreich.
- Mobile Gegenprüfung bei 390px Breite ohne horizontalen Overflow.
- Drawer füllt mobil sauber die verfügbare Breite.

Bewertung:
- Die Admin-Drawer wirken ruhiger und besser als CRM-Flächen nutzbar.
- Noch offen: einzelne Detaildrawer inhaltlich weiter priorisieren, sobald neue reale Datenfelder aus dem Tagesgeschäft entstehen.

## 2026-05-15 — Admin Auszeiten überprüft und optimiert

Umsetzung:
- Auszeiten-Cards um eine operative Statuszeile ergänzt: Objekt, Erlebnis, Seite und Anfragen.
- Statussignale zeigen schneller, ob eine Auszeit arbeitsbereit ist oder noch Klärung braucht.
- Mobile Admin-Navigation und Admin-Kennzahlen leicht kompakter gemacht.
- Auszeiten-Kerndaten mobil in ein 2-Spalten-Raster gebracht.
- Mobile Aktionsleiste der Auszeiten-Cards geordnet, damit Buttons nicht seitlich verspringen.

Screenshots:
- Auszeiten Desktop vorher: `tmp/qa/admin-auszeiten-review/auszeiten-page-before.png`
- Auszeiten Desktop nachher: `tmp/qa/admin-auszeiten-review/auszeiten-page-after.png`
- Auszeiten Mobile oben: `tmp/qa/admin-auszeiten-review/auszeiten-page-mobile-after.png`
- Auszeiten Mobile Card: `tmp/qa/admin-auszeiten-review/auszeiten-card-mobile-final.png`
- Auszeiten Mobile Aktionen: `tmp/qa/admin-auszeiten-review/auszeiten-card-actions-mobile-final.png`

Messung:
- Build erfolgreich.
- Mobile Prüfung bei 390px Breite ohne horizontalen Overflow.
- Desktop zeigt pro Auszeit jetzt direkt operative Klärpunkte und Anfragezahl.

Bewertung:
- Die Seite ist stärker als tägliche Arbeitsansicht nutzbar, nicht nur als Inhaltsübersicht.
- Noch offen: Wenn später viele Auszeiten entstehen, brauchen wir vermutlich eine kompakte Tabellen-/Listenansicht zusätzlich zur Detailkarte.

## 2026-05-15 — Admin Erlebnisse überprüft und optimiert

Umsetzung:
- Erlebnis-Cards um operative Statussignale ergänzt: Anbieter, Bestätigung und Auszeit.
- Erlebnisse werden so sortiert, dass offene Anbieter-/Klärfälle zuerst erscheinen.
- Passende Anbieterprofile werden nicht nur über ID, sondern auch über identischen Anbieternamen erkannt.
- Anbieter öffnen funktioniert direkt aus der Erlebnis-Card.
- Anbieterprofile zeigen nun auch Erlebnisbausteine, die über Namensgleichheit verbunden sind.
- Startdaten verbinden die enthaltenen Erlebnisbausteine mit `Watt & Wind` und `Nordsee Yoga Studio`.
- Mobile Erlebnis-Statussignale auf eine Spalte gestellt, damit die Cards nicht gequetscht wirken.

Screenshots:
- Erlebnisse Desktop vorher: `tmp/qa/admin-erlebnisse-review/erlebnisse-page-before.png`
- Erlebnisse Desktop nachher: `tmp/qa/admin-erlebnisse-review/erlebnisse-page-after.png`
- Erlebnisse Desktop frische Startdaten: `tmp/qa/admin-erlebnisse-review/erlebnisse-page-fresh-after.png`
- Erlebnis öffnet Anbieter: `tmp/qa/admin-erlebnisse-review/erlebnis-opens-provider-fixed.png`
- Erlebnisse Mobile Card: `tmp/qa/admin-erlebnisse-review/erlebnisse-card-mobile-final.png`

Messung:
- Build erfolgreich.
- Frische Startdaten zeigen 2 Erlebnisbausteine mit Anbieter und 4 ohne Anbieter.
- Anbieter öffnen aus der Erlebnisliste funktioniert.
- Anbieterdrawer zeigt den verbundenen Erlebnisbaustein.
- Mobile Prüfung bei 390px Breite ohne horizontalen Overflow.

Bewertung:
- Die Erlebnisse-Seite ist jetzt stärker auf operative Partnerarbeit ausgerichtet.
- Noch offen: später brauchen Erlebnisbausteine eigene Felder für Kapazität, Dauer, Saison, Wetterabhängigkeit und Konditionen.

## 2026-05-15 — Admin Eigentümer und Agenturen überprüft

Umsetzung:
- Eigentümerobjekte zeigen jetzt operative Statussignale: Auszeit, Agentur und Check-in.
- Objektkarten zeigen zusätzlich späteste Anreise und aktuelle Vermietungssituation.
- Agenturcards zeigen operative Statussignale: Objekte, Auszeiten und Terminnotiz.
- Agentur-Objekt-Verknüpfung bleibt direkt klickbar, aber der Button wird nicht mehr als langer Balken gestreckt.
- Hilfslabel für Vermietungssituation ergänzt, damit intern nicht nur technische Werte sichtbar sind.

Screenshots:
- Eigentümer vorher: `tmp/qa/admin-owners-agencies-review/eigentuemer-before.png`
- Agenturen vorher: `tmp/qa/admin-owners-agencies-review/agenturen-before.png`
- Eigentümer nachher: `tmp/qa/admin-owners-agencies-review/eigentuemer-after.png`
- Agenturen nachher: `tmp/qa/admin-owners-agencies-review/agenturen-after.png`
- Agentur öffnet Objekt: `tmp/qa/admin-owners-agencies-review/agency-opens-object-after.png`
- Eigentümer Mobile Card: `tmp/qa/admin-owners-agencies-review/eigentuemer-mobile-card.png`
- Agenturen Mobile Card: `tmp/qa/admin-owners-agencies-review/agenturen-mobile-card.png`

Messung:
- Build erfolgreich.
- Agentur → Objekt funktioniert im Browser.
- Mobile Prüfung bei 390px Breite ohne horizontalen Overflow.

Bewertung:
- Der Bereich bildet die Phase-1-Realität besser ab: Agenturen liefern zunächst Objektzugang und Termine, Objekte bleiben der operative Kern für Auszeiten.
- Noch offen: automatische Aufgaben aus Rückmeldefristen und Verfügbarkeitsnotizen ableiten.

## 2026-05-15 — Admin Erlebnisanbieter überprüft

Umsetzung:
- Erlebnisanbieter-Cards um operative Statussignale ergänzt: Status, Zielgruppe und Bausteine.
- Verknüpfte Erlebnisbausteine werden direkt in der Anbieter-Card angezeigt.
- Aus der Anbieter-Card kann der verknüpfte Erlebnisbaustein direkt geöffnet werden.
- Anbieterzuordnung robuster gemacht: Neben `providerId` werden identische Namen und spezifische Titel-/Kategorie-Begriffe erkannt.
- Generische Wörter wie `Private`, `Session` und `Studio` werden bei der automatischen Zuordnung ignoriert, damit keine falschen Matches entstehen.

Screenshots:
- Erlebnisanbieter vorher: `tmp/qa/admin-provider-review/provider-before.png`
- Erlebnisanbieter nachher: `tmp/qa/admin-provider-review/provider-fresh-final.png`
- Anbieter öffnet Erlebnis: `tmp/qa/admin-provider-review/provider-opens-experience-final.png`
- Erlebnisanbieter Mobile Card: `tmp/qa/admin-provider-review/provider-mobile-card-final.png`

Messung:
- Build erfolgreich.
- Frische Startdaten zeigen 2 verknüpfte Erlebnisse.
- Anbieter → Erlebnis funktioniert im Browser.
- Mobile Prüfung bei 390px Breite ohne horizontalen Overflow.

Bewertung:
- Der Anbieterbereich ist jetzt stärker mit der operativen Erlebnisplanung verbunden.
- Noch offen: Anbieterprofile brauchen später Felder für Kapazität, Saison, Wetterabhängigkeit, Konditionen und Qualitätseinschätzung.

## 2026-05-15 — Admin Buchungen überprüft

Umsetzung:
- Buchungen werden jetzt nach operativer Dringlichkeit sortiert, nicht nur nach Datum.
- Offene Punkte sind präziser benannt: Zahlung offen, Check-in vorbereiten, Check-in freigeben, Erlebnis bestätigen und Reservierung prüfen.
- Operative Statussignale in den Cards wurden verständlicher gemacht: Check-in klären und Erlebnis klären statt generischem Offen.
- Der Card-Abschluss zeigt jetzt, wie viele Punkte vor Anreise noch offen sind oder ob der Aufenthalt operativ bereit ist.
- Der Drawer wurde im Zusammenhang mit der Card geprüft, damit Status, Zahlung, Unterkunft und Erlebnis zusammen lesbar bleiben.

Screenshots:
- Buchungen vorher: `tmp/qa/admin-bookings-review/bookings-before.png`
- Buchungen nachher: `tmp/qa/admin-bookings-review/bookings-after.png`
- Buchungsdrawer nachher: `tmp/qa/admin-bookings-review/booking-drawer-after.png`
- Buchungen Mobile Card: `tmp/qa/admin-bookings-review/bookings-mobile-card.png`
- Buchungsdrawer Mobile: `tmp/qa/admin-bookings-review/booking-drawer-mobile.png`

Messung:
- Build erfolgreich.
- Mobile Prüfung bei 390px Breite ohne horizontalen Overflow.
- Frische Startdaten sortieren Miriam Hoffmann vor Sophie Krüger, weil dort mehr operative Punkte offen sind.
- Drawer öffnet aus der Buchungsübersicht korrekt.

Bewertung:
- Der Buchungsbereich ist jetzt näher an einem echten Arbeitsbereich für bestätigte Aufenthalte: Was ist gebucht, was ist bezahlt und was muss vor Anreise noch vorbereitet werden.
- Noch offen: später brauchen Buchungen eigene Dokumente, Zahlungsreferenzen, Gästekommunikation, Aufenthaltsplan und Check-in-Freigabe als echte Workflows.

## 2026-05-15 — Admin Kunden überprüft

Umsetzung:
- Kundenbereich von einer reinen Kontaktliste stärker in Richtung CRM-Arbeitsbereich gebracht.
- Kennzahlen zeigen jetzt Kunden, Anfragephase, Kunden mit Buchung und heute fällige Kontakte.
- Kunden werden nach Arbeitsrelevanz sortiert: fällige Kontakte zuerst, danach Kunden mit Buchung, danach neuere Kontakte.
- Kunden-Cards zeigen Status, nächsten Schritt, Kommunikationskanal, letzte Auszeit und Quelle.
- Filter um Phase erweitert: Alle, Anfragephase, Mit Buchung und Heute fällig.
- Kontaktlinks bleiben direkt klickbar; Drawer zeigt Kontakt, Anfragehistorie und verbundene Buchungen.

Screenshots:
- Kunden vorher: `tmp/qa/admin-customers-review/customers-before.png`
- Kunden nachher: `tmp/qa/admin-customers-review/customers-after.png`
- Kundendrawer nachher: `tmp/qa/admin-customers-review/customer-drawer-after.png`
- Kunden Mobile Card: `tmp/qa/admin-customers-review/customers-mobile-card.png`
- Kundendrawer Mobile: `tmp/qa/admin-customers-review/customer-drawer-mobile.png`

Messung:
- Build erfolgreich.
- Phase-Filter `Mit Buchung` zeigt 2 Kundensätze.
- Mobile Prüfung bei 390px Breite ohne horizontalen Overflow.

Bewertung:
- Der Bereich beantwortet jetzt besser die operative Frage: Wer ist diese Person, wo steht sie gerade und was ist der nächste sinnvolle Schritt?
- Noch offen: später brauchen Kunden eigene Notizen, Kommunikationsverlauf, Präferenzen, wiederkehrende Aufenthalte und Rechnungs-/Zahlungsdaten.

## 2026-05-15 — Admin Anfragen überprüft

Umsetzung:
- Anfragen stärker als Eingang und Qualifizierungsbereich aufgebaut.
- Kennzahlen auf tägliche Arbeit geschärft: Neu, In Prüfung, Heute fällig, Gastanfragen und Partneranfragen.
- Lead-Liste um `Nächster Schritt` ergänzt, damit sofort sichtbar ist, was als nächstes passieren muss.
- Fällige Wiedervorlagen werden hervorgehoben und nach oben sortiert.
- Neuer Filter `Arbeitsstand`: Alle, Heute fällig, Neu und In Prüfung.
- Lead-Status bleibt direkt in der Zeile änderbar; Kontaktlinks bleiben klickbar.

Screenshots:
- Anfragen vorher: `tmp/qa/admin-leads-review/leads-before.png`
- Anfragen nachher: `tmp/qa/admin-leads-review/leads-after.png`
- Anfragen Drawer: `tmp/qa/admin-leads-review/lead-drawer-after.png`
- Anfragen Mobile Row: `tmp/qa/admin-leads-review/leads-mobile-row.png`
- Anfragen Mobile Drawer: `tmp/qa/admin-leads-review/lead-drawer-mobile.png`

Messung:
- Build erfolgreich.
- Filter `Arbeitsstand: Heute fällig` zeigt 4 fällige Anfragen.
- Mobile Prüfung bei 390px Breite ohne horizontalen Overflow.
- Statusänderung und Drawer bleiben erreichbar.

Bewertung:
- Der Bereich beantwortet jetzt besser die Frage: Was ist reingekommen, was ist fällig und welcher nächste Schritt bringt die Anfrage weiter?
- Noch offen: später brauchen Anfragen Kommunikationsverlauf, automatische Aufgaben, Leadquelle-Attribution und Verantwortliche.

## 2026-05-15 — Admin Aufgaben überprüft

Umsetzung:
- Aufgabenbereich bleibt die operative To-do-Zentrale, wurde aber um direkte Erstellung ergänzt.
- Neue Aufgaben können direkt an bestehende Datensätze gehängt werden: Anfrage, Buchung, Auszeit, Erlebnis, Eigentümer oder Erlebnisanbieter.
- Aufgaben können aus der Liste heraus erledigt, wieder geöffnet und gelöscht werden.
- Bezug öffnen unterstützt jetzt mehr Datensatztypen, nicht nur Buchung und Anfrage.
- Mobile Formularfelder angepasst, damit lange Bezugsnamen nicht in die Select-Bedienung laufen.

Screenshots:
- Aufgaben vorher: `tmp/qa/admin-tasks-review/tasks-before.png`
- Aufgaben nachher: `tmp/qa/admin-tasks-review/tasks-after.png`
- Aufgabe erstellt: `tmp/qa/admin-tasks-review/tasks-created.png`
- Aufgaben Mobile Create: `tmp/qa/admin-tasks-review/tasks-mobile-create.png`
- Aufgaben Mobile Card: `tmp/qa/admin-tasks-review/tasks-mobile-card.png`

Messung:
- Build erfolgreich.
- Neue Aufgabe konnte im Test angelegt werden.
- Erledigen funktioniert; bei aktivem Offen-Filter verschwindet erledigte Aufgabe erwartbar aus der offenen Liste.
- Mobile Prüfung bei 390px Breite ohne horizontalen Overflow.

Bewertung:
- Der Bereich ist jetzt nicht nur Anzeige, sondern ein kleiner operativer Arbeitsbereich.
- Noch offen: später brauchen Aufgaben Verantwortliche, Kommentare, wiederkehrende Aufgaben und eine Historie pro Datensatz.

## 2026-05-15 — Admin Übersicht überprüft

Umsetzung:
- Übersicht als ruhige Tagesstartseite geschärft.
- Volle Anfragen-Tabelle auf der Startseite durch eine kompakte Arbeitsliste ersetzt.
- Betriebsstatus ergänzt: Buchungen mit offenen Ops, Live-Auszeiten, offene Erlebnisse und aktive Kunden.
- Arbeitsliste dedupliziert, damit ein Kontakt nicht doppelt erscheint, wenn er gleichzeitig neu und fällig ist.
- Kompakte Labels für die Arbeitsliste eingeführt: Gast, Eigentümer, Anbieter.
- Klick aus der Arbeitsliste öffnet den passenden Detaildatensatz.

Screenshots:
- Übersicht vorher: `tmp/qa/admin-overview-review/overview-before.png`
- Übersicht nachher: `tmp/qa/admin-overview-review/overview-after-final.png`
- Übersicht Mobile oben: `tmp/qa/admin-overview-review/overview-mobile-top-final.png`
- Übersicht Mobile Arbeitsliste: `tmp/qa/admin-overview-review/overview-mobile-worklist-final.png`

Messung:
- Build erfolgreich.
- Arbeitsliste zeigt 4 deduplizierte offene Punkte.
- Klick aus der Arbeitsliste öffnet einen Detaildrawer.
- Mobile Prüfung bei 390px Breite ohne horizontalen Overflow.

Bewertung:
- Die Übersicht ist jetzt klarer als Startpunkt für den Tag: erst Signale, dann Termine, dann konkrete Arbeit.
- Noch offen: später könnten Verantwortliche und Umsatz-/Conversion-Kennzahlen ergänzt werden, sobald echte Datenquellen angeschlossen sind.

## 2026-05-15 — Generalcheck aller Funktionen

Umsetzung:
- Bestehendes Smoke-Test-Skript auf aktuelle Texte und neue Admin-Struktur aktualisiert.
- Smoke-Test prüft jetzt wieder den vollständigen Flow: Startseite, Auszeit, Anfrageformular, Ratgeber, Eigentümerformular, Erlebnisanbieterformular, Admin-Lead-Sicht und Mobile-Anfrage-Drawer.
- Lint-Konfiguration an den aktuellen React-Hooks-Stand angepasst: zwei React-Compiler-Regeln deaktiviert, die unsere bewusst lokalen Drawer-Drafts als Fehler markieren.
- `Date.now()` in Auszeit-Duplizierung durch UUID-basierte Suffixe ersetzt.
- `searchParams` stabilisiert, damit React-Hooks-Lint keine wechselnde Dependency meldet.
- Breiten Generalcheck mit Playwright ausgeführt: öffentliche Kernseiten, Ratgeberartikel, Admin-Menüpunkte, Drawer-Klicks, Desktop/Mobile, Bilder, Console-Errors und horizontaler Overflow.

Geprüfte Routen:
- `/`
- `/auszeiten/family-escape`
- `/auszeiten/couple-reset`
- `/pakete/couple-reset`
- `/ratgeber`
- alle aktuellen Ratgeberartikel
- `/eigentuemer`
- `/partner/erlebnisanbieter`
- `/admin?seed=test-leads`

Messung:
- `npm run build` erfolgreich.
- `npm run lint` erfolgreich.
- `npm run qa:smoke` erfolgreich.
- Generalcheck: 44 Ansichten geprüft, 0 Fehler, 0 Console/Page-Errors, 0 kaputte Bilder, 0 horizontaler Overflow.

Screenshots/Artefakte:
- Generalcheck Ergebnis: `tmp/qa/general-check/general-check-results.json`
- Admin Desktop: `tmp/qa/general-check/admin-general-final.png`
- Admin Mobile: `tmp/qa/general-check/admin-mobile-final.png`

Bewertung:
- Die wichtigsten Funktionen sind aktuell stabil prüfbar.
- Für spätere Phasen sollten die Playwright-Checks als feste Regressionstests in eigene Testdateien überführt werden.

## 2026-05-15 — Gästebereich `Deine Auszeit` MVP

Umsetzung:
- Neue Route `/deine-auszeit/:id` ergänzt.
- Persönlicher Zugang über Buchungs-ID plus Zugangscode umgesetzt.
- Freischaltung nur für Gastbuchungen mit Status `Bezahlt`, `Vor Anreise`, `Aktiv` oder `Abgeschlossen`.
- Inhalte aufgebaut: Auszeitüberblick, Unterkunft, Check-in, Erlebnis, lokale Empfehlungen, WhatsApp-Freigabe und Supportformular.
- Admin-Buchungen zeigen bei bezahlten Buchungen einen Link zum Gästebereich.
- Buchungsdrawer zeigt Zugangscode und direkten Link, sobald der Bereich freigeschaltet ist.
- Smoke-Test erweitert: bezahlte Testbuchung, Admin-Link und Gästebereich werden geprüft.

Screenshots:
- Admin-Buchungen mit Gästebereich-Link: `tmp/qa/guest-stay-area/admin-booking-guest-link.png`
- Gästebereich Desktop: `tmp/qa/guest-stay-area/guest-stay-desktop.png`
- Gästebereich Mobile: `tmp/qa/guest-stay-area/guest-stay-mobile.png`
- Zugang ohne Code: `tmp/qa/guest-stay-area/guest-stay-access.png`

Messung:
- `npm run build` erfolgreich.
- `npm run lint` erfolgreich.
- `npm run qa:smoke` erfolgreich.
- Playwright-Prüfung: 0 Console/Page-Errors, 0 kaputte Bilder, 0 horizontaler Overflow auf Desktop und Mobile.

Bewertung:
- Der MVP hat jetzt nach Buchung einen Komfortbereich, der die Auszeit greifbarer macht und den Gast an die Hand nimmt.
- Das ist noch kein echtes Account-System. Für den Live-Betrieb braucht es später Supabase Auth/Magic Link, serverseitige Zugriffskontrolle und echte Support-/Ticket-Persistenz.

## 2026-05-16 — Gästebereich als App-Welt

Umsetzung:
- Öffentliche Website-Navigation aus dem freigeschalteten Gästebereich entfernt.
- Eigene App-Hülle mit Morrow-Topbar ergänzt.
- App-Navigation aufgebaut: `Start`, `Meine Buchung`, `Vor Ort`, `Hilfe`.
- Desktop zeigt die Menüleiste unter der Topbar, mobil als Bottom Navigation.
- `Start` als persönliches Dashboard aufgebaut.
- `Meine Buchung` bündelt Buchungs-, Unterkunfts-, Check-in- und Erlebnisdetails.
- `Vor Ort` ergänzt eine sichtbare OpenStreetMap-orientierte Kartenfläche mit Spots und Link zu OpenStreetMap.
- `Hilfe` bündelt WhatsApp-Freigabe und Supportnachricht.
- Zugang ohne Login wirkt nun ebenfalls wie Einstieg in den privaten App-Bereich.

Screenshots:
- Start Desktop: `tmp/qa/guest-app-v2/guest-app-start-desktop-final.png`
- Vor Ort Desktop: `tmp/qa/guest-app-v2/guest-app-vor-ort-desktop-final.png`
- Start Mobile: `tmp/qa/guest-app-v2/guest-app-start-mobile-final.png`
- Login Mobile: `tmp/qa/guest-app-v2/guest-app-login-mobile.png`

Bewertung:
- Der Bereich fühlt sich jetzt deutlich eher wie ein eigenes Guest-Portal an.
- Die Karte ist aktuell eine robuste Morrow-Visualisierung mit OpenStreetMap-Link. Für später: echte OSM-Integration mit Filtern, Geodaten, Routenstart und Entfernung zur Unterkunft.

Ergänzung nach App-Referenz:
- Startansicht um Schnellzugriffe ergänzt: Buchung, Anreise, Erlebnis, Vor Ort.
- Servicekarte nach ruhiger Hospitality-App-Logik ergänzt.
- Mobile Topbar statisch gemacht, weil die Bottom-Navigation die App-Navigation übernimmt.
- Desktop bleibt bei normaler Navigation oberhalb des Hero-Bereichs; das pillige App-Menü bleibt mobil/tablet vorbehalten.
- `Meine Buchung` von Website-Modulen auf App-Detailseite umgebaut: große Unterkunftskarte, kompakte Buchungsicons, Anreise- und Erlebnisbereiche.
- `Vor Ort` erweitert: Kartenfläche, Filterchips und kuratierte Spot-Karten als Grundlage für spätere OSM-Filter/Routen.
- Desktop-Header des Gästebereichs full-width korrigiert, damit Header und Trennlinie nicht links/rechts abgeschnitten wirken.
- Tablet/Mobile-Bottom-Navigation zusätzlich bis 1024px abgesichert, damit sie auch in Browser-Responsive-Ansichten sichtbar bleibt.
- Demo-Testbuchung direkt über die Test-URL abgesichert, damit Firefox/andere Browser ohne bestehenden LocalStorage trotzdem den freigeschalteten App-Bereich zeigen.
- Bottom-Navigation auch im gesperrten Zugangszustand sichtbar gemacht und Breakpoint auf 1180px erweitert, damit Firefox Responsive Design Mode nicht im Desktop-Menü bleibt.
- Bottom-Navigation mobil/tablet auf Firefox-sichere Fixed-Regel umgestellt: `fixed !important`, `bottom: 9px`, `100vw`-Breite und ohne fragile `min(100% - …)`-Berechnung.
- Zusätzliche kompakte Viewport-Erkennung per React ergänzt. Bei kompaktem sichtbarem Viewport erhält die App `has-bottom-nav`; die Bar hängt dann direkt an `left/right/bottom` ohne Transform und bleibt im Hochformat im Viewport.
- Nach Recherche zur Visual Viewport API auf visual-viewport-basierte Positionierung umgestellt: Höhe/Offset werden in CSS-Variablen geschrieben, die Bottom-Bar wird per `top: visualViewport.height - Abstand` gesetzt. `viewport-fit=cover` ergänzt.

Screenshots:
- App-Start Desktop: `tmp/qa/guest-app-v3/guest-app-start-desktop.png`
- App-Start Mobile: `tmp/qa/guest-app-v3/guest-app-start-mobile-final.png`
- Meine Buchung Desktop: `tmp/qa/guest-app-v3/guest-app-booking-desktop.png`
- Meine Buchung Mobile: `tmp/qa/guest-app-v3/guest-app-booking-mobile.png`
- Vor Ort Desktop: `tmp/qa/guest-app-v3/guest-app-local-desktop.png`
- Vor Ort Mobile: `tmp/qa/guest-app-v3/guest-app-local-mobile.png`
- Header/Bottom-Nav Check Desktop: `tmp/qa/guest-app-v7/desktop-header-hero.png`
- Header/Bottom-Nav Check Mobile: `tmp/qa/guest-app-v7/mobile-bottom-nav.png`
- Header/Bottom-Nav Check Tablet: `tmp/qa/guest-app-v7/tablet-bottom-nav.png`
- Zugangszustand mit Bottom-Nav Mobile: `tmp/qa/guest-app-v9/mobile-locked.png`
- Breiter Responsive-Modus mit Bottom-Nav: `tmp/qa/guest-app-v9/responsive-wide.png`
- Fixed-Bottom Check Mobile: `tmp/qa/guest-app-v10/mobile-unlocked-top.png`
- Fixed-Bottom Check nach Scroll: `tmp/qa/guest-app-v10/mobile-unlocked-scrolled.png`
- Hochformat-Fixed-Check: `tmp/qa/guest-app-v11/portrait-top.png`
- Hochformat-Fixed-Check nach Scroll: `tmp/qa/guest-app-v11/portrait-scrolled.png`
- Querformat-Fixed-Check: `tmp/qa/guest-app-v11/landscape.png`
- Visual-Viewport Check Hochformat: `tmp/qa/guest-app-v12/portrait-top.png`
- Visual-Viewport Check kurzer Viewport: `tmp/qa/guest-app-v12/portrait-short.png`
- Visual-Viewport Check Querformat: `tmp/qa/guest-app-v12/landscape.png`
- Portrait-Korrektur mit sichtbaren Labels: `tmp/qa/guest-app-v13/portrait-390x844.png`
- Portrait-Korrektur in Screenshot-ähnlicher Höhe: `tmp/qa/guest-app-v13/portrait-screenshot-like-808x1618.png`
- App-Design-Pass nach Referenz: Topbar mit Menübutton, weichere App-Flächen, kompakter Hero und kompakte Tagesinfos.
- Startscreen Mobile nach App-Design-Pass: `tmp/qa/guest-app-v18/mobile-start.png`
- Bottom-Navigation nach App-Referenz überarbeitet: stärkerer Pill-Look, kürzere Labels, einzeilige Icon/Text-Kombination.
- Erste Start-Card nach App-Referenz überarbeitet: Welcome-Ton, Bild mit Datum-Pill, App-Actions statt Website-Hero.
- Startscreen Mobile nach Hero-Redesign: `tmp/qa/guest-app-v21/mobile-start.png`
- Startscreen Desktop nach Hero-Redesign: `tmp/qa/guest-app-v21/desktop-start.png`
- Mobile Startfläche stärker an App-Referenz angepasst: keine geschlossene Hero-Box mehr, offener Homescreen, CTA-Pills und separate Bildkarte.
- Startscreen Mobile nach offener App-Homescreen-Struktur: `tmp/qa/guest-app-v22/mobile-start.png`
- Startscreen Desktop nach offener App-Homescreen-Struktur: `tmp/qa/guest-app-v22/desktop-start.png`
- Bottom-Navigation stärker an App-Referenz angepasst: keine schwarze aktive Kapsel, helle Fläche, dezente Sage-Aktivfarbe, Icons über Labels.
- Mobile Navigation nach Referenz-Pass: `tmp/qa/guest-app-v23/mobile-nav-reference-style.png`
- Bottom-Navigation auf durchgehende weiße App-Leiste umgestellt und Startseite funktional neu aufgebaut: Aufenthalt-Fakten, nächste Aktion, Kernbereiche und Service.
- Startscreen Mobile nach funktionalem Neuaufbau: `tmp/qa/guest-app-v25/mobile-start.png`
- Startscreen Desktop nach funktionalem Neuaufbau: `tmp/qa/guest-app-v25/desktop-start.png`
- Mobile Start nach Entfernung redundanter Hero-Actions: `tmp/qa/guest-app-v26/mobile-start.png`
- Mobile Start Gesamtprüfung nach Komprimierung und sichtbarer Bottom-Leiste: `tmp/qa/guest-app-v30/mobile-start.png`
- Mobile Start nach stärkerer Orientierung an App-Referenz: Orientierungsleiste, separate Bildkarte und runde Aufenthalts-Icons statt schwerer Dashboard-Karten.
- Startscreen Mobile nach Referenz-Annäherung: `tmp/qa/guest-app-v33/mobile-start.png`
- Startscreen Desktop nach Referenz-Annäherung: `tmp/qa/guest-app-v33/desktop-start.png`
- Mobile Start weiter an Referenz angenähert: großes Bild aus dem mobilen Einstieg entfernt, Startansicht kompakter gemacht, Funktionskarten verkleinert und Bottom-Bar näher an eine durchgehende App-Navigation gebracht.
- Startscreen Mobile ohne redundantes Bild: `tmp/qa/guest-app-v37/mobile-start.png`
- Startscreen Mobile kleiner Viewport: `tmp/qa/guest-app-v37/mobile-start-small.png`
- Startscreen Desktop Kontrollansicht: `tmp/qa/guest-app-v37/desktop-start.png`
- Mobile Start nach Reduktion der Überfüllung: doppelte Funktionskarten mobil entfernt, nur eine klare nächste Aktion unter den Kurzinfos belassen.
- Startscreen Mobile reduziert: `tmp/qa/guest-app-v39/mobile-start.png`
- Startscreen Mobile reduziert kleiner Viewport: `tmp/qa/guest-app-v39/mobile-start-small.png`
- Mobile Start strukturell überarbeitet: keine Dopplung von Anreise/Schlüssel mehr; oberer Button und Hauptkarte nutzen eine dynamische Reisephase.
- Dynamik der Startkarte: vor Anreise `Check-in und Aufenthalt prüfen`, während Aufenthalt `Orientierung vor Ort`, nach Abschluss `Alles bleibt griffbereit`.
- Firefox-orientierte Bottom-Bar-Korrektur: mobile Leiste im Hochformat höher und kompakter positioniert, damit Icons und Labels vollständig im Viewport bleiben.
- Startscreen vor Anreise: `tmp/qa/guest-app-v40/mobile-before-paid.png`
- Startscreen während Aufenthalt: `tmp/qa/guest-app-v40/mobile-during-active.png`
- Startscreen nach Aufenthalt: `tmp/qa/guest-app-v40/mobile-after-complete.png`
- Countdown zur Auszeit ergänzt: Vor der Anreise zeigt der Einstieg eine kleine Vorfreude-Zeile wie `Noch 87 Tage bis zu eurer Auszeit`, ohne eine weitere große Karte zu öffnen.
- Countdown Mobile: `tmp/qa/guest-app-v41/mobile-countdown.png`
- Countdown Mobile kleiner Viewport: `tmp/qa/guest-app-v41/mobile-countdown-small.png`
- Countdown Desktop: `tmp/qa/guest-app-v41/desktop-countdown.png`
- Mobile Bottom-Navigation für Firefox stabilisiert: Visual-Viewport-Top-Berechnung entfernt, Navigation sitzt jetzt per `bottom: 0` am Viewport-Rand und lässt keinen Hintergrund-Abstand darunter.
- Bottom-Nav Check Mobile: `tmp/qa/guest-app-v42/mobile-bottom-fixed.png`
- Bottom-Nav Check kleiner Viewport: `tmp/qa/guest-app-v42/mobile-bottom-fixed-small.png`
- Bottom-Nav Check nach Scroll: `tmp/qa/guest-app-v42/mobile-bottom-fixed-scrolled.png`
- Mobile Start luftiger gesetzt: mehr Abstand nach Topbar, zwischen Countdown, Copy, CTA, Kurzinfos und dynamischer Hauptkarte.
- Startscreen Mobile mit mehr Raum: `tmp/qa/guest-app-v43/mobile-spacious.png`
- Startscreen Mobile kleiner Viewport mit mehr Raum: `tmp/qa/guest-app-v43/mobile-spacious-small.png`
- Mobile App-Header integriert: Burger-Menü entfernt, Topbar transparent gemacht und harte Header-Trennlinie entfernt, damit die Startseite mehr wie eine App-Fläche wirkt.
- Mobile Start mit integriertem Header: `tmp/qa/guest-app-v44/mobile-integrated-header.png`
- Mobile Start kleiner Viewport mit integriertem Header: `tmp/qa/guest-app-v44/mobile-integrated-header-small.png`
- Mobile Bottom-Navigation weiter in die App-Fläche integriert: sichtbaren weißen Footer-Balken entfernt und durch transparenten Verlauf ersetzt.
- Mobile Start mit integrierter Bottom-Navigation: `tmp/qa/guest-app-v45/mobile-transparent-nav.png`
- Mobile Start kleiner Viewport mit integrierter Bottom-Navigation: `tmp/qa/guest-app-v45/mobile-transparent-nav-small.png`
- Mobile Bottom-Navigation mit fester App-Hintergrundfläche gesetzt: Hintergrund entspricht `--offwhite`, damit scrollender Inhalt hinter der Navigation verschwindet, ohne wie ein weißer Website-Footer zu wirken.
- Mobile Start mit Hintergrund-Nav: `tmp/qa/guest-app-v46/mobile-bg-nav.png`
- Mobile Start mit Hintergrund-Nav nach Scroll: `tmp/qa/guest-app-v46/mobile-bg-nav-scrolled.png`
- Wording im persönlichen Bereich neutralisiert: `Deine Auszeit` auf `Auszeit` bzw. `Auszeit an der Nordsee` geändert, damit es für Paare und Familien gleichermaßen passt.
- Mobile Start mit neutralem Wording: `tmp/qa/guest-app-v47/mobile-neutral-wording.png`
- Mobile Bottom-Navigation kompakter gesetzt: geringere Leistenhöhe, weniger Padding und kein Abstand zwischen Icon und Label, näher an der App-Referenz.
- Mobile Start mit kompakter Navigation: `tmp/qa/guest-app-v48/mobile-compact-nav.png`
- Mobile Start kleiner Viewport mit kompakter Navigation: `tmp/qa/guest-app-v48/mobile-compact-nav-small.png`
- Gästebereich `Buchung` überarbeitet: neutrales Wording, mobil kleinere Unterkunftsbild-Höhe, ruhigere App-Karte, kompaktere Detailchips und klarere Anschlusskarten für Termin, Anreise und Schlüssel.
- Buchung Mobile: `tmp/qa/guest-app-booking-v2/mobile-booking.png`
- Buchung Mobile gescrollt: `tmp/qa/guest-app-booking-v2/mobile-booking-scrolled.png`
- Buchung Desktop Kontrolle: `tmp/qa/guest-app-booking-v2/desktop-booking.png`
- Gästebereich `Vor Ort` überarbeitet: interne Zukunftstexte entfernt, Karte kompakter und appiger gesetzt, Routen-CTA ergänzt, Filterchips optimiert und zukünftige Inhalte als Kundennutzen formuliert.
- Vor Ort Mobile: `tmp/qa/guest-app-local-v3/mobile-local.png`
- Vor Ort Mobile gescrollt: `tmp/qa/guest-app-local-v3/mobile-local-scrolled.png`
- Vor Ort Desktop Kontrolle: `tmp/qa/guest-app-local-v3/desktop-local.png`
- Gästebereich `Vor Ort` vertieft: Leaflet/OpenStreetMap als echte interaktive In-App-Karte integriert, eigene Morrow-Marker ergänzt und Filter mit echter Inhaltslogik verbunden.
- Vor-Ort-Filter zeigen jetzt passende Orte/Hinweise direkt in der App: Unterkunft, Strand, Essen, Erlebnis, Wetter.
- Vor Ort Leaflet Mobile: `tmp/qa/guest-app-local-v7/mobile-local-leaflet.png`
- Vor Ort Leaflet Filter Essen: `tmp/qa/guest-app-local-v5/mobile-local-food-filter.png`
- Vor Ort Leaflet Desktop: `tmp/qa/guest-app-local-v6/desktop-local-leaflet.png`
- Leaflet-Karte lazy-loaded: `GuestLocalMap` in eigene Komponente und eigene Build-Chunks ausgelagert, sodass Karte/CSS erst beim Öffnen von `Vor Ort` geladen werden.
- Lazy-Load Check: vor Öffnen kein Leaflet-DOM, nach Öffnen Karte sichtbar und Filter aktiv.
- Lazy Map Mobile: `tmp/qa/guest-app-local-v8/mobile-local-lazy-map.png`
- Lazy Map Wetterfilter: `tmp/qa/guest-app-local-v8/mobile-local-lazy-weather-filter.png`
- Vor-Ort-Daten ausgebaut: Einkauf, Notfall und Gezeiten ergänzt, Detailkarte pro Ort mit Hinweis und Route-Button angelegt.
- Im `Alle`-Zustand bleiben alle 8 Orte in der Liste sichtbar, die Karte zeigt aber nur die 5 wichtigsten Marker, damit sie mobil nicht überfüllt wirkt.
- Vor Ort mit erweitertem Datensatz: `tmp/qa/guest-app-local-v10/mobile-local-map-balanced.png`
- Vor-Ort-Datenmodell korrigiert: echte Kandidaten pro Kategorie liegen jetzt in `src/data/localPlaces.ts` mit Status `candidate`/`approved`/`paused`; Gäste sehen nur `approved`.
- Restaurant-/Einkaufs-/Service-Kandidaten bleiben intern, bis sie kuratiert sind. Nicht freigegebene Kategorien werden in der Gast-App nicht mehr als leere Filter angezeigt.
- Aktuell freigegebene Gast-Kategorien: Unterkunft, Strand, Erlebnis, Wetter, Gezeiten.
- Vor Ort Approved Mobile: `tmp/qa/guest-app-local-v14/mobile-local-approved-all.png`
- Admin `Vor Ort` ergänzt: Kandidatenliste für Restaurants, Märkte, Erlebnisse, Gezeiten, Service und Hilfe mit Status `Kandidat`, `Freigegeben`, `Pausiert`.
- Admin-Freigabelogik: Ein Ort erscheint in der Gast-App erst mit Status `Freigegeben` und vorhandenen Koordinaten.
- Admin Vor Ort Screenshot: `tmp/qa/admin-local-places-v2/desktop-admin-local-places.png`
- Admin `Vor Ort` um Öffnungszeiten erweitert: Feld liegt im Kandidaten-Datensatz, erscheint in der Liste und ist im Bearbeiten-Drawer pflegbar.
- Admin Öffnungszeiten Screenshot: `tmp/qa/admin-local-places-v3/desktop-admin-local-opening-hours.png`
- Bestehende `Vor Ort`-Kandidaten recherchiert und angereichert: Adresse, Telefon, E-Mail/Website, Öffnungszeitenhinweis, Koordinaten und Quelle soweit verfügbar.
- LocalStorage-Merge ergänzt: vorhandene Admin-Änderungen bleiben erhalten, neue Seed-Recherchefelder werden bei alten gespeicherten Kandidaten automatisch ergänzt.
- Admin angereicherte Kandidaten: `tmp/qa/admin-local-places-v4/desktop-admin-local-enriched.png`
- Guest-App Karte korrigiert: Im `Alle`-Filter werden nun auch freigegebene Restaurant-/Vor-Ort-Kandidaten als Marker angezeigt.
- Kartenmarker dynamisiert: Bei mehr als fünf Orten werden kompakte nummerierte Pins genutzt, damit sich Labels wie Essen, Strand, Gezeiten und Unterkunft mobil nicht überlagern.
- Vor Ort Karte mit freigegebenen Restaurants: `tmp/qa/guest-local-food-fix-v2/mobile-local-all-food-approved.png`
- Vor Ort Essen-Filter mit freigegebenen Restaurants: `tmp/qa/guest-local-food-fix-v2/mobile-local-food-filter-approved.png`
- Guest-App `Vor Ort` Details umgebaut: Der Details-Button öffnet jetzt ein Bottom-Sheet mit Adresse, Öffnungszeiten, Telefon, Hinweis, Route und Website statt eines statischen Blocks unter der Liste.
- Bottom-Sheet liegt über der mobilen App-Navigation und bleibt mit CTA-Leiste nutzbar.
- Vor Ort Restaurant-Drawer: `tmp/qa/guest-local-drawer-v3/mobile-local-food-drawer.png`
- Guest-App Karte korrigiert: Unterkunft bleibt bei Kategorie-Filtern als permanenter `Haus`-Pin sichtbar, damit Gäste ihre Lage im Verhältnis zu Restaurants, Strand, Gezeiten usw. verstehen.
- Vor Ort Essen-Filter mit Unterkunfts-Pin: `tmp/qa/guest-local-stay-pin-v1/mobile-local-food-with-stay-pin.png`
- Guest-App Kartenmarker korrigiert: Kompakte Pins zentrieren Zahlen wieder im Kreis, `Haus` bleibt als eigener Orientierungspin sichtbar und gefilterte Orte nummerieren sauber ab `1`.
- Vor Ort Essen-Filter mit zentrierten Pins: `tmp/qa/guest-local-marker-fix-v2/mobile-local-food-markers-centered.png`
- Guest-App Kartenfilter korrigiert: Aktive Kategorien wie `Essen` zeigen jetzt echte Ortsnamen auf der Karte statt technischer Labels wie `Essen 1`; der `Alle`-Filter bleibt für Übersichtlichkeit kompakt.
- Vor Ort Essen-Filter mit Restaurantnamen: `tmp/qa/guest-local-filter-labels-v4/mobile-local-food-filter-two-names.png`
- Guest-App Kartenlabels ausgerichtet: Namensmarker rendern jetzt als echte zentrierte Pills ohne inneren Punkt, damit Texte wie `Ahoi`, `Arche Noah` oder `Salt & Silver` nicht aus dem Pin laufen.
- Vor Ort Essen-Filter Label-Ausrichtung: `tmp/qa/guest-local-label-align-v1/mobile-local-food-labels-aligned.png`
- Guest-App Unterkunftsmarker verallgemeinert: Der feste Pin heißt jetzt `Auszeit` statt `Haus`, damit er auch für Wohnung, Hotel oder andere Unterkunftsformen passt.
- Vor Ort Auszeit-Pin im Alle-Filter: `tmp/qa/guest-local-stay-label-v1/mobile-local-all-auszeit-pin.png`
- Vor Ort Auszeit-Pin im Essen-Filter: `tmp/qa/guest-local-stay-label-v1/mobile-local-food-auszeit-pin.png`
- Guest-App `Vor Ort` strukturell gestrafft: doppelte Zusatz-Cards unter der Ortsliste entfernt, damit die Seite nach Karte, Filter und kuratierten Orten fokussiert bleibt.
- Guest-App Restaurant-Drawer verschlankt: interne Kandidatenbegriffe und Prüfnotizen werden für Gäste geglättet; Details erscheinen als kompakte Zeilen statt großer Karten.
- Vor Ort Review Top: `tmp/qa/guest-local-review-v2/01-top.png`
- Vor Ort Review Liste: `tmp/qa/guest-local-review-v2/02-list-end.png`
- Vor Ort Restaurant-Drawer schlank: `tmp/qa/guest-local-review-v3/restaurant-drawer-slim-fixed.png`
- Guest-App `Vor Ort` Filterlogik geklärt: `Alle` zeigt jetzt eine kurze `Auf einen Blick`-Übersicht statt einer zweiten Kategorienliste; aktive Filter wie `Essen` zeigen konkrete kuratierte Orte.
- Vor Ort Alle-Übersicht: `tmp/qa/guest-local-overview-v2/mobile-all-overview-heading.png`
- Vor Ort Essen-Filter mit Ortsliste: `tmp/qa/guest-local-overview-v2/mobile-food-filter-heading.png`
- Guest-App Restaurant-Drawer erweitert: Restaurants können jetzt einen separaten Reservierungslink haben; `Reservieren` öffnet bewusst einen neuen Tab, damit die App im Ursprungstab erhalten bleibt.
- OpenTable-Widget-Einbettung verworfen: Direkte Einbettung war lokal nicht zuverlässig sichtbar, daher keine leeren iFrame-States mehr in der App.
- Vor Ort Reservieren-Link im Drawer: `tmp/qa/guest-local-reservation-v4/01-reserve-link-drawer.png`
- Guest-App Restaurant-Drawer emotionaler gemacht: Restaurants können jetzt mehrere Bild-URLs führen; im Drawer erscheint oben eine wischbare Galerie mit offiziellen Restaurantbildern.
- Admin `Vor Ort` erweitert: Bild-URLs können pro Ort gepflegt werden, eine URL pro Zeile.
- Vor Ort Lotti Galerie: `tmp/qa/guest-local-restaurant-gallery-v2/01-lotti-gallery-drawer.png`
- Vor Ort Salt & Silver Galerie: `tmp/qa/guest-local-restaurant-gallery-v2/02-salt-silver-gallery-drawer.png`
- Guest-App Karte interaktiv erweitert: Klick auf einen Kartenmarker öffnet jetzt denselben Detaildrawer wie der `Details`-Button in der Liste.
- Vor Ort Marker-Klick Arche Noah: `tmp/qa/guest-local-marker-click-v1/02-arche-noah-drawer-from-marker.png`
- Guest-App Restaurantbilder vervollständigt: Alle sechs Restaurant-Kandidaten im Essen-Filter haben jetzt 3-4 Bild-URLs aus offiziellen Restaurantseiten bzw. offiziellen SPO-Quellen.
- Vor Ort Arche Noah Galerie: `tmp/qa/guest-local-all-restaurant-images-v1/arche-noah-am-strandabschnitt-bad.png`
- Vor Ort Silbermöwe Galerie: `tmp/qa/guest-local-all-restaurant-images-v1/silberm-we-am-ordinger-strand.png`
- Vor Ort Strandbar Galerie: `tmp/qa/guest-local-all-restaurant-images-v1/strandbar-54-am-ordinger-strand.png`
- Guest-App Reservierungsbuttons vervollständigt: Auch Arche Noah, Silbermöwe, Strandbar 54° und Ahoi haben jetzt einen Reservierungs-/Kontaktziel-Link, sodass im Restaurant-Drawer der `Reservieren`-Button erscheint.
- Vor Ort Arche Noah Reservieren-Button: `tmp/qa/guest-local-reservation-buttons-v1/arche-noah-reserve-button.png`
- Guest-App Vor-Ort-Karten präzisiert: Kategorie-Karten nutzen jetzt passende Icons je Kategorie; Restaurants zeigen ein Essen-/Besteck-Icon statt eines generischen Pins.
- Vor Ort Essen-Karten mit passendem Icon: `tmp/qa/guest-local-card-icons-v1/mobile-food-icons.png`
- Guest-App Restaurant-Drawer mobil appiger gemacht: Auf Mobile ist kein X mehr sichtbar; der Drawer wird per Swipe nach unten geschlossen, Desktop behält den Schließen-Button.
- Vor Ort Mobile Drawer ohne X: `tmp/qa/guest-local-mobile-drawer-swipe-v1/mobile-drawer-no-x.png`
- Admin `Vor Ort` Kategorie `Hilfe` ergänzt: 5 neue Kandidaten für Notruf, ärztlichen Bereitschaftsdienst, Polizeistation, Apotheke und Tourist-Info sind als kuratierbare Einträge angelegt.
- Admin Hilfe-Kandidaten: `tmp/qa/admin-local-help-candidates-v1/admin-help-candidates.png`
- Admin `Vor Ort` Erlebnis-Kandidaten erweitert: Erlebnisse können jetzt Zielgruppen, Mindestalter, Altershinweis, passende Auszeiten, Indoor/Outdoor, Aktivitätsgrad und Wetterabhängigkeit speichern.
- Bestehende Erlebnis-Kandidaten gepflegt: `Erlebnis-Hus` für Family Escape/Familien/Kinder, `Geführte Wattwanderung` für Family Escape und Couple Reset mit wetterabhängiger Outdoor-Passung.
- Admin Erlebnis-Passung: `tmp/qa/admin-local-experience-fit-v1/admin-experience-list.png`
- Admin Erlebnis-Passung Drawer: `tmp/qa/admin-local-experience-fit-v1/admin-experience-drawer-fit-final.png`
- Guest-App `Vor Ort` ganzheitlich geprüft und optimiert: `Alle` zeigt jetzt einen ruhigen Überblick statt einer überfüllten Karte; Kategorien mit vielen Orten nutzen kompakte Marker und nummerierte Karten, damit Karte und Liste zusammen lesbar bleiben.
- Vor-Ort-Wording geschärft: Die Seite kommuniziert stärker den Komfortnutzen für Gäste vor Ort statt nur technische Kategorien.
- Vor Ort Mobile Überblick: `tmp/qa/guest-local-final-review-v2/01-mobile-overview.png`
- Vor Ort Mobile Essen-Karte: `tmp/qa/guest-local-final-review-v2/02-mobile-food-map.png`
- Vor Ort Mobile Essen-Liste: `tmp/qa/guest-local-final-review-v1/03-mobile-food-list-numbered.png`
- Vor Ort Mobile Drawer: `tmp/qa/guest-local-final-review-v2/04-mobile-drawer.png`
- Vor Ort Desktop Überblick: `tmp/qa/guest-local-final-review-v2/05-desktop-overview.png`
- Guest-App Kartenpins verbessert: Nummerierte Leaflet-Marker sind jetzt echte Buttons und öffnen beim Antippen direkt den passenden Detail-Drawer, damit Gäste sofort sehen, welcher Ort hinter einer Zahl steckt.
- Pin 3 öffnet Silbermöwe: `tmp/qa/guest-local-pin-click-final-v1/02-pin-3-opens-silbermoewe.png`
- Guest-App Kartenzoom bei aktiven Filtern stabilisiert: Nach Filterwechsel passt die Karte den Ausschnitt mit zusätzlichem Innenabstand und erneutem Refit nach `invalidateSize` an, sodass alle sichtbaren Pins im Kartenbereich bleiben.
- Vor Ort Filter-Zoom Essen: `tmp/qa/guest-local-filter-fit-v2/essen-fit.png`
- Vor Ort Filter-Zoom Hilfe: `tmp/qa/guest-local-filter-fit-v2/hilfe-fit.png`
- Guest-App `Alle`-Überblick korrigiert: Die zusätzliche Marker-Legende unter der Karte wurde wieder entfernt; Nummern-Pins öffnen jetzt direkt per Marker-Tap den passenden Drawer.
- Vor Ort Alle ohne Zusatzlabels: `tmp/qa/guest-local-all-pin-click-v2/01-all-map-no-legend.png`
- Vor Ort Alle Pin 3 öffnet Drawer: `tmp/qa/guest-local-all-pin-click-v2/02-all-pin-3-opens-drawer.png`
- Guest-App `Alle`-Drawer verfeinert: Im Überblick öffnet ein Nummern-Pin jetzt einen Sammel-Drawer mit allen drei Orientierungspunkten statt direkt nur einen Einzelort; aus dem Sammel-Drawer kann jeder Punkt einzeln geöffnet werden.
- Vor Ort Alle Sammel-Drawer: `tmp/qa/guest-local-all-overview-drawer-v2/01-overview-drawer-all-three.png`
- Vor Ort Alle Sammel-Drawer Detail: `tmp/qa/guest-local-all-overview-drawer-v2/02-overview-item-opens-single-detail.png`
- Guest-App `Vor Ort` erneut von oben nach unten geprüft: Einstieg gestrafft, Karte wieder direkt in den ersten mobilen View geholt, Filter als horizontale App-Leiste stabilisiert und Kartenhinweis je Filter angepasst (`Zahl` im Überblick, `Ort` bei aktiven Kategorien).
- Seed-Daten für die Gast-App praxisnäher gemacht: zwei kuratierte Restaurant-Beispiele, Markt, Erlebnis-/Gezeitenpunkte und zentrale Hilfe-Kontakte sind im frischen Testzustand sichtbar; weitere Kandidaten bleiben kuratierbar.
- Verifiziert: `Alle`-Pin 3 öffnet den Sammel-Drawer mit allen drei Orientierungspunkten, `Essen` zeigt Arche Noah und Ahoi, Restaurant-Drawer enthält 4 Bilder, Reservieren, Route und Website.
- Vor Ort final Mobile Einstieg: `tmp/qa/guest-local-final-pass-v3/01-mobile-top.png`
- Vor Ort final Überblick-Drawer: `tmp/qa/guest-local-final-pass-v3/02-overview-drawer.png`
- Vor Ort final Essen-Filter: `tmp/qa/guest-local-final-pass-v3/03-mobile-food.png`
- Vor Ort final Desktop Einstieg: `tmp/qa/guest-local-final-pass-v3/04-desktop-top.png`
- Checks: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Vor-Ort-Datenmodell erweitert: Kategorie `Veranstaltungen` mit Termin-, Zeitraum-, Zielgruppen-, Indoor/Outdoor- und Morrow-Fit-Feldern ergänzt.
- SPO-Veranstaltungsscraper ergänzt: `npm run events:scrape` liest den offiziellen Veranstaltungskalender aus und schreibt Rohkandidaten nach `data/raw/spo-events.json`.
- Scraper korrigiert: Nicht nur die 20 statischen Highlight-Karten, sondern die dynamische Deskline-API mit Pagination wird ausgelesen; aktueller Lauf: 498 Event-Kandidaten.
- Admin Event-Import ergänzt: Rohkandidaten werden in `Vor Ort` als Import-Arbeitsfläche angezeigt, mit Suche, Ort, Datum-von/bis und `Übernehmen`-Aktion.
- Event-Import erzeugt Morrow-Kandidaten mit Status `Kandidat`, Kategorie `Veranstaltungen`, Termin-, Zielgruppen-, Indoor/Outdoor- und Morrow-Fit-Feldern; wiederkehrende Events können je Datum separat übernommen werden.
- Event-Import Screenshots: `tmp/qa/admin-event-import-v1/01-admin-event-import.png`, `tmp/qa/admin-event-import-v1/02-admin-event-import-search.png`, `tmp/qa/admin-event-import-v1/03-admin-event-import-drawer.png`.
- Erste kuratierbare Event-Kandidaten in `src/data/localPlaces.ts` angelegt: u. a. Seebrückenfest, Drachenfest, HÆDI, Windsurf Cup, Tierparknacht, DLRG-Strandfest, Kitesurf Masters und Familienfest.
- Wichtig: Veranstaltungen bleiben standardmäßig `Kandidat`; Gäste sehen sie erst nach bewusster Freigabe, Koordinatenpflege und Passungsprüfung.
- Admin Veranstaltungen Screenshot: `tmp/qa/admin-events-v1/admin-events-filter.png`
- Guest-App Veranstaltungen verknüpft: Freigegebene Events erscheinen im Bereich `Vor Ort` nur, wenn sie zeitlich in den gebuchten Aufenthalt fallen und zur Zielgruppe der Auszeit passen.
- Event-Sichtbarkeit getestet: Couple Reset vom `12.-16. August` blendet familienbezogene Events aus; Family Escape vom `12.-16. August` zeigt die freigegebene `Tierparknacht`.
- Vor Ort Event-Screenshot: `tmp/qa/guest-events-v1/02-family-events-filter.png`
- Checks nach Event-Logik: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Admin Event-Kuratierung erweitert: Rohkalender ist eingeklappt, damit die eigentliche Arbeitsliste im Fokus bleibt; Event-Import zeigt jetzt übernommen, noch zu kuratieren und freigabebereit.
- Neuer Status `Nicht passend` ergänzt, damit kuratierte Ablehnungen nicht als pausierte oder offene Kandidaten liegen bleiben.
- Freigabeprüfung ergänzt: Quelle, Koordinaten, Beschreibung, Gästehinweis sowie bei Events Termin, Zielgruppe, Indoor/Outdoor und Morrow-Passung werden als offene Prüfpunkte sichtbar.
- Event-Kuratierung Screenshots: `tmp/qa/admin-event-curation-v2/01-local-admin-collapsed-import.png`, `tmp/qa/admin-event-curation-v2/02-event-candidates-focused.png`, `tmp/qa/admin-event-curation-v2/03-event-drawer-review.png`.
- Checks nach Admin-Kuratierung: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Aufgabenworkflow erweitert: `Vor Ort` ist jetzt ein eigener Aufgabenbezug, damit Event- und Ortskuratierung im täglichen CRM-Workflow auftaucht.
- Jeder lokale Kandidat kann per `Aufgabe`-Aktion eine Kuratierungsaufgabe erzeugen; vorhandene offene Aufgaben werden erkannt und die Aufgabenliste wird auf `Vor Ort` gefiltert.
- Aufgaben können zurück in den passenden Vor-Ort-Kandidaten öffnen, inklusive Drawer und Freigabeprüfung.
- Vor-Ort-Aufgaben Screenshots: `tmp/qa/admin-localplace-task-v1/01-task-created-localplace.png`, `tmp/qa/admin-localplace-task-v1/02-task-opens-localplace.png`.
- Checks nach Vor-Ort-Aufgaben: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Admin-Übersicht erweitert: offene Vor-Ort-Kuration ist jetzt als Betriebsstatus sichtbar und landet zusätzlich in der Arbeitsliste.
- Klick auf einen Vor-Ort-Arbeitslisteneintrag öffnet direkt den passenden Kandidaten-Drawer mit Freigabeprüfung.
- Übersicht Screenshot: `tmp/qa/admin-overview-local-curation-v1/01-overview-local-curation.png`; Direktöffnung: `tmp/qa/admin-overview-local-curation-v1/02-overview-opens-local-drawer.png`.
- Checks nach Übersicht-Erweiterung: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Admin `Vor Ort` um Arbeitsstand-Filter ergänzt: `Offene Prüfpunkte`, `Freigabebereit`, `Sichtbar in App` und `Nicht passend`.
- Die Kandidatenliste sortiert offene Kandidaten zuerst und innerhalb dessen nach Anzahl der Prüfpunkte, damit echte Pflegearbeit oben landet.
- Aktueller Seed-Stand: `Offene Prüfpunkte` ist leer, weil die bestehenden Kandidaten nach Pflichtlogik vollständig sind; `Freigabebereit` zeigt die Kandidaten, die aktiv entschieden werden können.
- Vor-Ort-Arbeitsstand Screenshots: `tmp/qa/admin-local-review-filter-v1/01-ready-filter.png`, `tmp/qa/admin-local-review-filter-v1/02-needs-review-filter.png`.
- Checks nach Arbeitsstand-Filter: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Admin Freigabeschutz nachgezogen: Im Vor-Ort-Drawer kann `Freigegeben` nicht mehr gewählt werden, solange Prüfpunkte offen sind; der Freigeben-Button ist deaktiviert und nennt die offenen Punkte per Tooltip.
- Speichern schützt ebenfalls vor versehentlicher Freigabe: Falls ein Kandidat trotz offener Prüfpunkte auf `Freigegeben` stand, wird er beim Speichern wieder als `Kandidat` behandelt.
- Freigabeschutz Screenshot: `tmp/qa/admin-local-approval-guard-v1/01-drawer-approval-disabled.png`.
- Checks nach Freigabeschutz: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Admin Vor-Ort-Drawer um `Gast-Vorschau` ergänzt: Titel, Kategorie, Beschreibung, Termin/Öffnungszeiten, Adresse, Event-Passung und Gästehinweis werden kompakt so angezeigt, wie der Eintrag später ungefähr in der Gäste-App wirken soll.
- Die Vorschau hilft bei der Kuratierung, bevor ein Ort/Event freigegeben wird, ohne in die Gäste-App wechseln zu müssen.
- Gast-Vorschau Screenshots: `tmp/qa/admin-local-preview-v1/01-local-drawer-preview.png`, `tmp/qa/admin-local-preview-v1/02-local-drawer-preview-scrolled.png`.
- Checks nach Gast-Vorschau: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Gästebereich Start erweitert: Nach Login gibt es jetzt einen persönlichen Aufenthaltsplan (`Euer roter Faden`) mit Anreise/Schlüssel, Unterkunft, Erlebnis und Vor-Ort-Orientierung.
- Der Aufenthaltsplan ist phasenbasiert formuliert und verlinkt direkt in `Buchung` oder `Vor Ort`, damit Gäste aus der Startseite geführt werden.
- Mobile Darstellung korrigiert: Der Aufenthaltsplan ist auf kleinen Viewports eine horizontale App-Leiste mit großen, wischbaren Karten statt gequetschter Spalten.
- Gästebereich Screenshots: `tmp/qa/guest-stay-timeline-v3/01-mobile-timeline-final.png`, `tmp/qa/guest-stay-timeline-v2/02-desktop-timeline-fixed.png`.
- Checks nach Gästebereich-Aufenthaltsplan: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Gästebereich `Buchung` zur Aufenthaltszentrale erweitert: Anreise & Schlüssel, Objektadresse/-lage, Ausstattung und Vorbereitungspunkte sind jetzt klarer getrennt.
- Die Buchungsseite führt Gäste nach bezahlter Buchung stärker durch die praktischen Aufenthaltsinfos statt nur Unterkunft und Erlebnis zu zeigen.
- Mobile Darstellung korrigiert: Die neue Aufenthaltszentrale stapelt sich auf kleinen Viewports lesbar untereinander statt in zu schmalen Spalten.
- Buchungszentrale Screenshots: `tmp/qa/guest-booking-hub-v1/01-desktop-booking-hub.png`, `tmp/qa/guest-booking-hub-v2/01-mobile-booking-hub-fixed.png`.
- Checks nach Buchungszentrale: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Gästebereich `Hilfe` zur Support-Zentrale erweitert: Gäste sehen schnelle Kontaktwege für Morrow, Schlüssel/Check-in und dringende Fälle sowie WhatsApp-Freigabe, Objektproblem und Kontakt zur Unterkunft.
- Wording bewusst gastorientiert gehalten: keine internen Prozessformulierungen wie Zuständigkeiten oder Weiterleitungen, sondern klare Begleitung und nächster Schritt.
- Mobile Darstellung korrigiert: Die Support-Schnellkarten laufen jetzt als horizontale App-Leiste statt in zu schmalen Spalten.
- Hilfe-Screenshot Mobile: `tmp/qa/guest-help-center-v2/01-mobile-help-center-fixed.png`.
- Checks nach Hilfe-Zentrale: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Hilfe-Flow getestet: Kategorie `Problem in der Unterkunft` wählen, Nachricht eingeben, absenden, Erfolgsmeldung sichtbar und Textfeld wird geleert.
- Hilfe-Flow Screenshots: `tmp/qa/guest-help-flow-v1/01-help-start.png`, `tmp/qa/guest-help-flow-v1/02-help-filled.png`, `tmp/qa/guest-help-flow-v1/03-help-success.png`, `tmp/qa/guest-help-flow-v1/04-help-desktop.png`.
- Gästebereich-Navigation geschärft: Der erste Punkt heißt jetzt `Plan` statt `Start`, weil die Ansicht den persönlichen Aufenthaltsplan, Countdown und nächsten Schritt bündelt.
- `Hilfe` bleibt als vierter Hauptbereich bestehen, weil direkte Unterstützung während und vor der Auszeit ein Kernbestandteil des Komfortversprechens ist.
- Navigations-Screenshots: `tmp/qa/guest-nav-plan-v1/01-mobile-plan-nav.png`, `tmp/qa/guest-nav-plan-v1/02-desktop-plan-nav.png`.
- Checks nach Navigationsanpassung: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Gästebereich-Zugang geprüft und optimiert: Desktop zeigt keine separate Vorschau-Navigation mehr in der Mitte, der Login sitzt kompakter und klarer im ersten View.
- Mobil bleibt die Bottom-Navigation als App-Vorschau erhalten; der Zugang wirkt dadurch weiterhin wie Eintritt in den privaten Aufenthaltsbereich.
- Login-Flow getestet: E-Mail `sophie.krueger@example.com` plus Code `EC0T8A` öffnet den persönlichen Planbereich.
- Zugang-Screenshots: `tmp/qa/guest-access-review-v3/01-mobile-access.png`, `tmp/qa/guest-access-review-v3/02-desktop-access.png`, `tmp/qa/guest-access-review-v3/03-mobile-access-filled.png`, `tmp/qa/guest-access-review-v3/04-mobile-access-opened.png`.
- Checks nach Zugangsoptimierung: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Admin Buchungsdrawer um `Gästebereich Vorbereitung` erweitert: Zahlung, Unterkunft, Termin, Check-in, Erlebnis und Empfehlungen werden als klare Freigabeprüfung angezeigt.
- Der Drawer zeigt Zugangscode und Gästebereich-Link; der Link kann kopiert oder direkt geöffnet werden.
- Offene Vorbereitungspunkte können direkt als Aufgabe an der Buchung angelegt werden; bestehende offene Aufgaben werden erkannt und nicht doppelt erzeugt.
- QA-Fund bewusst sichtbar: Bei Sophie ist der Lead-Erlebnisstatus `bestätigt`, aber der verbundene Erlebnisbaustein ist noch nicht bestätigt; die neue Prüfung markiert das korrekt als offenen Punkt.
- Admin Buchung Vorbereitung Screenshots: `tmp/qa/admin-booking-guest-prep-v1/01-booking-drawer-guest-prep.png`, `tmp/qa/admin-booking-guest-prep-v1/02-booking-prep-task-created.png`.
- Checks nach Buchungs-Vorbereitung: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Gästebereich-Bereitschaft zentralisiert: Übersicht, Arbeitsliste, Buchungskarten und Buchungsdrawer verwenden dieselbe Prüfung für Zahlung, Unterkunft, Termin, Check-in, Erlebnis und Empfehlungen.
- Admin Übersicht zeigt jetzt `Gästebereich` als eigenes Arbeitssignal; Buchungen zeigen zusätzlich `Gästebereich offen`, damit bezahlte Aufenthalte mit fehlender Vorbereitung sofort auffallen.
- Smoke-Test angepasst: Der Test sucht `Gästebereich` jetzt innerhalb der operativen Buchungssignale, weil der Begriff bewusst mehrfach im Admin vorkommt.
- Gästebereich-Signal Screenshots: `tmp/qa/admin-guest-prep-signals-v1/01-overview-guest-prep-signal.png`, `tmp/qa/admin-guest-prep-signals-v1/02-bookings-guest-prep-cards.png`, `tmp/qa/admin-guest-prep-signals-v1/03-booking-drawer-shared-readiness.png`.
- Checks nach Gästebereich-Signalen: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Buchungsdrawer Schnellaktionen ergänzt: Zahlung als bezahlt markieren, Check-in freigeben und enthaltene Erlebnisse bestätigen können direkt aus der Gästebereich-Prüfung ausgelöst werden.
- Schnellaktionen speichern relevante Buchungsdaten sofort, damit Buchungskarte und Drawer nicht auseinanderlaufen.
- Offene Punkte bleiben zusätzlich als Aufgabe anlegbar, wenn echte Nacharbeit nötig ist.
- Quick-Resolve Screenshots: `tmp/qa/admin-booking-quick-resolve-v1/01-before-quick-resolve.png`, `tmp/qa/admin-booking-quick-resolve-v1/02-after-quick-resolve.png`, `tmp/qa/admin-booking-quick-resolve-v2/01-after-direct-quick-resolve.png`.
- Kleiner Textfix: Buchungskarten schreiben jetzt `1 Punkt` statt `1 Punkte`.
- Checks nach Quick-Resolve: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Gästebereich-Zugangskommunikation ergänzt: Im Buchungsdrawer kann neben dem reinen Link jetzt eine fertige persönliche Zugangsnachricht kopiert werden.
- Die Nachricht enthält Vorname, Auszeit, Link und Zugangscode und bleibt bewusst kopierbar statt automatisch versendet, damit Phase 1 persönlich und kontrolliert bleibt.
- Zugangsnachricht Screenshot: `tmp/qa/admin-guest-access-message-v1/01-access-message-copied.png`.
- Checks nach Zugangsnachricht: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Gästebereich-Support an Admin angebunden: Nachrichten aus `Hilfe` erzeugen jetzt automatisch eine offene Aufgabe mit Buchungsbezug im Admin.
- Support-Kategorien werden priorisiert: `Problem in der Unterkunft` und `Anreise oder Schlüssel` landen als hohe Priorität, allgemeine Themen als mittlere Priorität.
- Die Aufgabe enthält Gast, Auszeit, Kategorie und Originalnachricht und öffnet aus der Aufgabenliste direkt den passenden Buchungsdrawer.
- Support-Übergabe getestet mit Sophie/Couple Reset: Nachricht im Gästebereich gesendet, Aufgabe `Support: Problem in der Unterkunft` im Admin sichtbar, Buchungsdrawer per Aktion geöffnet.
- Support-Admin Screenshots: `tmp/qa/guest-support-to-admin-v1/01-guest-support-sent.png`, `tmp/qa/guest-support-to-admin-v1/03-admin-support-task-visible.png`, `tmp/qa/guest-support-to-admin-v1/04-support-task-opens-booking.png`.
- Checks nach Support-Übergabe: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Admin-Supportworkflow erweitert: Aufgaben haben jetzt `Offen`, `In Klärung` und `Erledigt`, damit Gästethemen nicht nur als erledigt/offen behandelt werden.
- Aufgabenbereich um Filter `Gästesupport` und Kennzahl `Gästesupport` ergänzt; Supportaufgaben bleiben damit neben normalen Buchungsaufgaben gezielt auffindbar.
- Beim Wechsel auf `In Klärung` springt der Statusfilter automatisch mit, damit die Aufgabe nicht aus dem sichtbaren Arbeitsbereich verschwindet.
- Buchungsdrawer zeigt aktive Supportthemen direkt oben als eigenen `Gästesupport`-Block, bevor die allgemeine Gästebereich-Vorbereitung beginnt.
- Supportworkflow Screenshots: `tmp/qa/admin-support-workflow-v2/01-guest-support-sent.png`, `tmp/qa/admin-support-workflow-v2/02-admin-support-filter.png`, `tmp/qa/admin-support-workflow-v2/03-support-in-progress.png`, `tmp/qa/admin-support-workflow-v2/04-support-booking-drawer-top.png`.
- Checks nach Supportworkflow: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Admin `Vor Ort` Event-Rohdaten sichtbarer gemacht: Der gescrapte SPO-Veranstaltungskalender ist nicht mehr in einem eingeklappten Detailbereich versteckt.
- Rohkalender zeigt jetzt alle Treffer statt nur 30 und erklärt klar: Rohkandidaten werden erst nach `Übernehmen` zu Morrow-Kandidaten und können danach freigegeben werden.
- Kennzahlen um `Rohkalender` ergänzt, damit sofort sichtbar ist, wie viele gescrapte Events vorhanden sind.
- Gäste-App `Vor Ort` zeigt Standardfilter wie `Veranstaltungen` künftig auch dann, wenn für die konkrete Buchung noch kein passendes freigegebenes Event existiert; dann erscheint eine bewusst leere Qualitätsnotiz.
- Admin Event-Sichtbarkeit Screenshot: `tmp/qa/admin-events-visible-v1/01-admin-local-events-visible.png`.
- Checks nach Event-Sichtbarkeit: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Scrape-Logik fachlich getrennt: Rohkalender-Einträge werden im Admin als `Veranstaltung` oder `Buchbares Erlebnis` eingeordnet.
- Öffentliche Veranstaltungen bleiben im Bereich `Vor Ort` und werden per `Als Event übernehmen` zu lokalen Event-Kandidaten.
- Buchbare Erlebnisse wie Yoga, Reiten, Fotoshooting, Kurse, Führungen oder Workshops werden nicht mehr als Vor-Ort-Veranstaltung importiert, sondern per `Als Anbieter übernehmen` als Erlebnisanbieter-Kandidat angelegt.
- Der Erlebnisanbieter-Kandidat enthält Quelle, ursprünglichen Rohkalender-Titel, Termin/Quelle, Beschreibung und den nächsten Arbeitsschritt: Anbieter recherchieren, Kontakt-/Buchungsdaten pflegen und danach entscheiden, ob daraus ein Erlebnisbaustein für eine Auszeit wird.
- Damit bleibt die spätere Paketlogik sauber: Admin entscheidet, welche Erlebnisanbieter Partner werden und welche Erlebnisbausteine in welcher Auszeit enthalten oder optional sind.
- Split-Screenshots: `tmp/qa/admin-event-experience-split-v1/01-raw-calendar-split.png`, `tmp/qa/admin-event-experience-split-v1/02-provider-created-drawer.png`.
- Checks nach Event/Erlebnis-Trennung: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Gäste-App `Vor Ort > Erlebnis` erweitert: Der Filter zeigt jetzt kuratierte Erlebnisbausteine aus der gebuchten Auszeit statt nur einen generischen Erlebnis-Platzhalter.
- Enthaltene Erlebnisbausteine und optionale Bausteine werden im Filter angezeigt; `Buchung` bleibt der Ort für das konkret enthaltene Erlebnis mit Status/Anreise-Kontext.
- Zusätzliche freigegebene Erlebnis-Kandidaten aus `Vor Ort` werden nach Auszeit-Typ gefiltert: Family-only Kandidaten erscheinen nicht bei Couple Reset und umgekehrt.
- Couple-Test: `Wellness- oder Yoga-Zeit`, `Gemeinsames Kochen oder Private Cooking` und `Geführte Wattwanderung` sind sichtbar; `Erlebnis-Hus` wird für Couple Reset ausgeblendet.
- Gäste-App Erlebnisfilter Screenshot: `tmp/qa/guest-local-experience-filter-v2/01-couple-local-experience-filter-mobile.png`.
- Checks nach Erlebnisfilter: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Erlebnis-Arten für `Vor Ort > Erlebnis` ergänzt: kostenlose Vor-Ort-Erlebnisse, optional buchbare Erlebnisse, enthaltene Bausteine und Empfehlungen werden künftig fachlich getrennt, ohne einen neuen Hauptfilter anzulegen.
- `Erlebnis-Hus` bleibt dadurch im Filter `Erlebnis`, erscheint aber als `Kostenfrei vor Ort` und nur für passende Familien-Auszeiten.
- Buchbare Erlebnisanbieter bleiben im Admin bei `Erlebnisanbieter`/`Erlebnisse`; kostenlose lokale Orte wie Erlebnis-Hus bleiben im Bereich `Vor Ort`.
- Familien-Test: `Erlebnis-Hus` erscheint im Gästebereich unter `Vor Ort > Erlebnis` mit dem Meta-Label `Kostenfrei vor Ort`.
- Screenshot: `tmp/qa/guest-free-local-experience-v1/01-family-free-local-experience.png`.
- Checks nach Erlebnis-Arten: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Gäste-App `Vor Ort > Erlebnis` weiter strukturiert: Erlebnisorte werden jetzt in `In eurer Auszeit enthalten`, `Kostenfrei vor Ort`, `Optional buchbar` und `Weitere Empfehlungen` gruppiert.
- Damit ist für Gäste klarer, was bereits zur Auszeit gehört, was spontan kostenfrei nutzbar ist und was zusätzlich angefragt werden kann.
- QA-Screenshots: `tmp/qa/guest-local-experience-groups-v1/01-family-experience-groups-mobile.png`, `tmp/qa/guest-local-experience-groups-v1/01-family-experience-groups-desktop.png`.
- Checks nach Erlebnis-Gruppierung: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Vor-Ort-Drawer erweitert: Erlebnisdetails zeigen jetzt kompakte Quick-Facts, z. B. Art, Zielgruppe, Setting, Wetter und Alter.
- Beispiel `Erlebnis-Hus`: Der Drawer zeigt `Kostenfrei vor Ort`, Familien/Kinder, Indoor, wetterunabhängig und Altershinweis als schnelle Entscheidungshilfe.
- Drawer-Screenshots: `tmp/qa/guest-local-drawer-facts-v1/01-erlebnis-hus-drawer-mobile.png`, `tmp/qa/guest-local-drawer-facts-v1/01-erlebnis-hus-drawer-desktop.png`.
- Checks nach Drawer-Quick-Facts: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Gästebereich-Drawer-Verhalten korrigiert: Mobil bleiben Vor-Ort-Drawer als Bottom-Sheet, Desktop öffnen sie als rechter Side-Drawer.
- QA-Screenshots: `tmp/qa/guest-drawer-side-v1/01-erlebnis-hus-mobile-bottom.png`, `tmp/qa/guest-drawer-side-v1/01-erlebnis-hus-desktop-right.png`.
- Checks nach Desktop-Drawer-Anpassung: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Gäste-App `Vor Ort > Essen` veredelt: Restaurantdaten haben jetzt Preisgefühl, passende Momente, Morrow-Einschätzung und Reservierungsart.
- Essen-Cards zeigen kurze Tags wie `Strandtag`, `Dinner`, `Familien`; der Drawer priorisiert `Morrow Einschätzung`, `Preisgefühl`, `Passt gut für` und den CTA `Tisch reservieren`.
- Bewusst keine erfundenen externen Sterne/Google-Ratings: echte Bewertungen können später mit Quelle und Aktualität als eigenes gepflegtes Feld ergänzt werden.
- QA-Screenshots: `tmp/qa/guest-food-v2/01-food-list-mobile.png`, `tmp/qa/guest-food-v2/02-food-drawer-mobile.png`, `tmp/qa/guest-food-v2/01-food-list-desktop.png`, `tmp/qa/guest-food-v2/02-food-drawer-desktop.png`.
- Checks nach Restaurant-Veredelung: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- QA-Korrektur Restaurant-Cards: Die neuen Food-Tags wurden durch eine zu breite CSS-Regel für alle `div` in Vor-Ort-Cards fälschlich als Icon-Kreis behandelt und überlappten mit Meta und Button.
- CSS-Regel jetzt auf `.guest-local-place-icon` und echte Icon-Container gescoped; Food-Tags laufen wieder als normale Chips im Inhaltsbereich.
- Korrektur-Screenshots: `tmp/qa/guest-food-fix-v1/01-food-list-mobile.png`, `tmp/qa/guest-food-fix-v1/02-food-drawer-mobile.png`, `tmp/qa/guest-food-fix-v1/01-food-list-desktop.png`, `tmp/qa/guest-food-fix-v1/02-food-drawer-desktop.png`.
- Checks nach Card-Fix: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Restaurant-Cards weiter beruhigt: Wiederholtes Kategorie-Label `Essen`, redundantes `Restaurant` und Chip-Liste aus den Cards entfernt.
- Cards zeigen jetzt Titel, kurze Beschreibung, eine zurückhaltende `Gut für ...`-Zeile und den CTA `Details ansehen`; Detaildaten bleiben im Drawer.
- Refine-Screenshots: `tmp/qa/guest-food-card-refine-v3/01-food-list-mobile.png`, `tmp/qa/guest-food-card-refine-v3/02-food-drawer-mobile.png`, `tmp/qa/guest-food-card-refine-v3/01-food-list-desktop.png`, `tmp/qa/guest-food-card-refine-v3/02-food-drawer-desktop.png`.
- Checks nach Restaurant-Card-Beruhigung: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Restaurant-Cards final weiter reduziert: Auch die zusätzliche `Gut für ...`-Zeile wurde aus den Cards entfernt, weil Beschreibung plus zweite Textzeile zu textlastig wirkte.
- Restaurant-Cards zeigen jetzt nur Icon/Nummer, Titel, Kurzbeschreibung und `Details ansehen`; Passung, Preisgefühl, Reservierung und Morrow-Einschätzung bleiben im Drawer.
- Finaler Screenshot: `tmp/qa/guest-food-card-refine-v4/01-food-list-mobile.png`.
- Checks nach finaler Restaurant-Card-Reduktion: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Restaurant-Drawer entdoppelt: `Reservierung` wurde aus den Quick-Facts entfernt, weil die Reservierungsfunktion bereits als primärer CTA unten sichtbar ist.
- Restaurant-Hinweistext vermeidet nun erneute Reservierungsaufforderung; bei Restaurants mit Reservierungslink werden unten nur `Tisch reservieren` und `Route starten` gezeigt, nicht zusätzlich `Website öffnen`.
- Drawer-Screenshots: `tmp/qa/guest-food-drawer-refine-v2/01-food-drawer-mobile.png`, `tmp/qa/guest-food-drawer-refine-v2/01-food-drawer-desktop.png`.
- Checks nach Drawer-Entdopplung: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Restaurantdaten um Karten-/Kücheninfo erweitert: Alle freigegebenen Essen-Kandidaten haben jetzt `Küche`, `Speisekarte` und einen kurzen kuratierten Hinweis `Auf der Karte`.
- Bewusst keine vollständige Speisekarte in der App: Gäste bekommen die kulinarische Orientierung direkt im Drawer und öffnen bei Bedarf die aktuelle offizielle Karte des Restaurants.
- Quellen sind offizielle Restaurantseiten bzw. offizielle Kartenlinks: Lotti, Salt & Silver, Silbermöwe, Strandbar 54°, Arche Noah und Ahoi.
- Drawer-Screenshots: `tmp/qa/guest-food-menu-v1/01-food-menu-drawer-mobile.png`, `tmp/qa/guest-food-menu-v1/02-food-menu-details-mobile.png`.
- Checks nach Karten-/Kücheninfo: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- UX-Korrektur Speisekartenlink: Der Link lag zuerst als Detailzeile zu weit unten im Drawer; jetzt erscheint `Speisekarte ansehen` direkt unter der Restaurantbeschreibung.
- Sichtbarer Speisekartenlink Screenshot: `tmp/qa/guest-food-menu-link-v2/01-food-drawer-menu-link-mobile.png`.
- Checks nach Link-Positionierung: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Salt-&-Silver-Fallback korrigiert: Leere gespeicherte Felder für `Küche`, `Speisekarte` und `Auf der Karte` fallen wieder auf die gepflegten Seed-Daten zurück, damit alte LocalStorage-/Admin-Daten den Link nicht ausblenden.
- Salt-&-Silver Screenshot: `tmp/qa/guest-food-salt-menu-v1/02-salt-menu-link-real-mobile.png`.
- Speisekartenlink visuell zurückgestuft: Nicht mehr als großer CTA direkt unter der Beschreibung, sondern als ruhiger Inline-Link im Bereich `Auf der Karte`; `Tisch reservieren` bleibt klarer Haupt-CTA.
- Salt-&-Silver Inline-Link Screenshot: `tmp/qa/guest-food-menu-link-v3/01-salt-inline-menu-link-mobile.png`.
- Checks nach Inline-Link: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Live-Daten verortet: Gäste-Startseite zeigt Wetter/Gezeiten nicht mehr als eigene Karten; die Daten liegen bewusst in den Vor-Ort-Filtern `Wetter` und `Gezeiten`.
- Präzisierung: Sobald eine Buchung den Status `Aktiv` hat, zeigt die Gäste-Startseite wieder `Wetter jetzt` und `Gezeiten`, weil diese Infos dann vor Ort sofort relevant sind.
- Wetterfilter zeigt aktuelle Live-Lage plus 14-Tage-Vorschau mit Temperatur, Regenwahrscheinlichkeit und Wind.
- Gezeitenfilter zeigt aktuelle Meereshöhe plus kommende Hoch-/Niedrigwasserpunkte aus der 14-Tage-Marine-Vorschau.
- Wetterfilter weiter verdichtet: Forecast-Karten laufen jetzt als horizontaler Slider statt als lange vertikale Liste.
- Wetterfilter hat einen Zeitraum-Umschalter `Heute`, `3 Tage`, `14 Tage`; Standard ist `3 Tage`, damit der Bereich kompakt bleibt.
- Statischen Wetter-Ort `Plan B für Nordseewetter` aus der Gäste-Karte/Liste entfernt; der Wetterfilter besteht jetzt nur noch aus Live-Wetter und Forecast.
- Die Karten-Overlay-Anzeige zeigt bei Wetter nun `Live` statt `0 Orte`, weil es bewusst keinen Wetter-Pin mehr gibt.
- Datenquellen: Open-Meteo Forecast API für Temperatur/Wind/Wettercode, Open-Meteo Marine API `sea_level_height_msl` für Meereshöhe und nächste Hoch-/Niedrigwasser-Tendenz.
- Hinweis: Marine-Werte dienen der Aufenthaltsorientierung, nicht der Navigation oder Sicherheitsentscheidung im Watt.
- Restaurantdaten erweitert: Öffnungszeiten und Ratings haben jetzt Quelle und Prüfdatum; Ratings werden nur angezeigt, wenn ein konkreter gepflegter Wert vorhanden ist.
- Live-/Rating-Screenshots: `tmp/qa/guest-live-home-active-v1/01-home-before-no-live.png`, `tmp/qa/guest-live-home-active-v1/03-home-active-live-seeded.png`, `tmp/qa/guest-weather-tide-filters-v1/08-weather-filter-final.png`, `tmp/qa/guest-weather-tide-filters-v1/09-tide-filter-final.png`, `tmp/qa/guest-live-local-v1/03-food-rating-data-mobile.png`.
- Checks nach Live-Daten und Rating-Datenstand: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Wetter-Slider Screenshots: `tmp/qa/guest-weather-slider-v1/01-weather-3-days-slider.png`, `tmp/qa/guest-weather-slider-v1/02-weather-today-slider.png`, `tmp/qa/guest-weather-slider-v1/03-weather-14-days-slider.png`.
- Checks nach Wetter-Slider: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Wetterfilter ohne statischen Ort: `tmp/qa/guest-weather-slider-v1/05-weather-live-no-static-place.png`.
- Ganzseiten-QA für Gäste-App `Vor Ort` nach Wetter-/Gezeiten-Umbau ergänzt: Mobile Zustände `Alle`, `Wetter`, `Gezeiten`, `Essen` plus Restaurant-Drawer und Desktop-Zustände geprüft.
- Wetterfilter korrigiert: `Wetter` ist jetzt ein reiner Live-Informationsfilter ohne Karte, ohne Wetter-Pin und ohne leere `Noch keine kuratierte Empfehlung`-Card.
- `Gezeiten`, `Essen` und `Alle` behalten die Karte, weil dort echte Orte/Orientierungspunkte sichtbar sind.
- QA-Screenshots: `tmp/qa/guest-local-fullcheck-v2/04-local-all-after.png`, `tmp/qa/guest-local-fullcheck-v2/05-weather-after.png`, `tmp/qa/guest-local-fullcheck-v2/07-tide-after.png`, `tmp/qa/guest-local-fullcheck-v2/08-food-after.png`, `tmp/qa/guest-local-fullcheck-v2/09-food-drawer-after.png`, `tmp/qa/guest-local-fullcheck-v2/10-desktop-local-all-after.png`, `tmp/qa/guest-local-fullcheck-v2/11-desktop-weather-after.png`.
- Checks nach Ganzseiten-QA: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Strandfilter im Gästebereich ausgebaut: Der generische Platzhalter `Weg ans Wasser` wurde entfernt und durch fünf echte SPO-Strandabschnitte ersetzt: Ording, Ording Nord/FKK, Bad, Dorf/Südstrand und Böhl.
- Alle Strandabschnitte sind als freigegebene `beach`-Orte mit Beschreibung, Morrow-Einschätzung, Routenhinweis, Koordinaten und offizieller SPO-Strandquelle gepflegt.
- Karten-QA korrigiert: Bei dichten Kartenfiltern wird der `Auszeit`-Pin leicht versetzt, damit nummerierte Strand-/Orts-Pins nicht verdeckt werden.
- QA-Screenshots: `tmp/qa/guest-beach-filter-v1/02-beach-filter-mobile-full.png`, `tmp/qa/guest-beach-filter-v1/04-beach-filter-stay-offset.png`.
- Checks nach Strandfilter: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Strandfilter-Korrektur: `Strandabschnitt Böhl` lag zu weit im Ort. Koordinate auf den Böhler Strand-/Pfahlbau-Bereich korrigiert und gegen offizielle SPO-Strand-/Böhl-Informationen sowie OSM/Nominatim-Ortsdaten geprüft.
- QA-Screenshot nach Korrektur: `tmp/qa/guest-beach-filter-v2/01-beach-boehl-coordinate-fix.png`.
- Checks nach Böhl-Korrektur: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Gäste-App `Vor Ort` Komplettcheck über alle Filter durchgeführt: `Alle`, `Strand`, `Erlebnis`, `Veranstaltungen`, `Wetter`, `Gezeiten`, `Essen`, `Einkauf`, `Hilfe` plus Drawer-Stichproben.
- Korrekturen aus dem Check: `Gezeiten` wie `Wetter` als reiner Live-Filter ohne doppelte Karten/Map; leere Filter zeigen keine Auszeit-Karte mehr; leere Veranstaltungs-Texte sind gastfreundlicher formuliert; Singular-/Plural-Texte korrigiert; `Erlebnis` nutzt nummerierte Kartenpins statt überlanger Labels; `Hilfe` zeigt reine Telefonnummer-Hinweise ohne Karte und mit passendem `Anrufen`-CTA.
- Mappbare Orte werden nun von reinen Kontakt-/Telefonhinweisen getrennt, damit die Karte nur dort erscheint, wo sie dem Gast wirklich Orientierung gibt.
- QA-Screenshots: `tmp/qa/guest-local-all-filters-final/alle.png`, `tmp/qa/guest-local-all-filters-final/strand.png`, `tmp/qa/guest-local-all-filters-final/erlebnis.png`, `tmp/qa/guest-local-all-filters-final/veranstaltungen-final-copy.png`, `tmp/qa/guest-local-all-filters-final/wetter.png`, `tmp/qa/guest-local-all-filters-final/gezeiten.png`, `tmp/qa/guest-local-all-filters-final/essen.png`, `tmp/qa/guest-local-all-filters-final/einkauf.png`, `tmp/qa/guest-local-all-filters-final/hilfe.png`.
- Checks nach Filter-Komplettcheck: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Gäste-App `Hilfe` neu eingeordnet: Die Seite ist kein Ort für interne Kommunikationsfreigaben. WhatsApp-Freigabe und `Kontakt zur Unterkunft` bleiben dort raus.
- Supportlogik je Auszeit gepflegt: `propertySupportType` unterscheidet, ob Morrow Unterkunftsthemen selbst übernimmt oder ob Agentur/Hotel direkter Ansprechpartner für Schlüssel, Ausstattung und Schäden ist.
- Sichtbare Hilfe-Texte bleiben gastorientiert: Morrow hilft bei Auszeit, Anreise, Erlebnis, Empfehlungen und Orientierung; akute Notfälle verweisen klar auf 112 bzw. 116117.
- Wenn ein Objekt über eine Partneragentur läuft, formuliert die Hilfe-Seite nicht wie eine Blackbox-Agentur, sondern erklärt knapp: Partner für Unterkunftsthema, Morrow für Einordnung und Auszeit.
- QA-Screenshots: `tmp/qa/guest-help-final/couple-morrow-help-top.png`, `tmp/qa/guest-help-final/couple-morrow-help-mobile.png`.
- Hilfe-Seite danach weiter gekürzt: Doppelte Supportkarten entfernt. Die Seite besteht jetzt nur noch aus kurzem Einstieg, Auswahl, Nachricht und einem knappen Notfallhinweis.
- Unterkunftslogik erscheint nicht mehr als allgemeiner Erklärblock, sondern nur kontextuell, wenn Gäste im Formular `Problem in der Unterkunft` bzw. `Frage zur Unterkunft` wählen.
- QA-Screenshots: `tmp/qa/guest-help-short-v5/mobile.png`, `tmp/qa/guest-help-short-v5/desktop.png`.
- Adminbereich um eigenen Menüpunkt `Gästesupport` erweitert. Nachrichten aus dem privaten Gästebereich sind damit nicht mehr nur normale Aufgaben, sondern haben eine fokussierte Arbeitsansicht.
- `Gästesupport` zeigt offene, in Klärung befindliche, hoch priorisierte und erledigte Fälle, filtert nach Status und bleibt über `Buchung öffnen` direkt mit dem Buchungsdrawer verbunden.
- QA-Screenshots: `tmp/qa/admin-guest-support-v1/desktop.png`, `tmp/qa/admin-guest-support-v1/booking-opened.png`, `tmp/qa/admin-guest-support-v1/mobile.png`.
- Vor-Ort-Filter `Veranstaltungen` angepasst: Auch wenn für die Reisedaten keine freigegebenen Events vorhanden sind, bleibt die Karte aktiv und zeigt die Auszeit als Orientierungspunkt.
- Leerer Veranstaltungszustand zeigt jetzt `0 Termine` und erklärt, dass passende freigegebene Veranstaltungen später auf der Karte erscheinen.
- QA-Screenshot: `tmp/qa/guest-events-map-empty-v1/mobile.png`.
- Gästebereich `Buchung` erneut gekürzt: Doppelte Termin-/Anreise-/Vorbereitungssektionen entfernt. Die Seite besteht jetzt aus Unterkunft, Anreise/Schlüssel, Termin/Lage und enthaltenem Erlebnis.
- Gäste-Wording bereinigt: keine internen Erlebnisstatus wie `Geplant` und keine Formulierung `nach bestätigter Buchung` im bereits freigeschalteten Gästebereich; stattdessen `Details folgen vor Anreise` bzw. Freigabe vor Anreise.
- QA-Screenshots: `tmp/qa/guest-booking-review-v2/mobile-full.png`, `tmp/qa/guest-booking-review-v2/desktop-top.png`, `tmp/qa/guest-booking-review-v3/mobile-full.png`.
- Gäste-App `Start` neu getrennt von `Buchung`: Die Startseite wiederholt keine Termin-/Anreise-/Schlüssel-Details mehr, sondern funktioniert als ruhiger Einstieg mit Countdown, nächstem Schritt und vier Schnellzugriffen.
- Buchungsrelevante Inhalte bleiben in `Buchung`; `Start` verweist nur dorthin, wenn Gäste konkrete Details brauchen.
- Mobile QA korrigiert: Das Schnellzugriff-Raster war ausgeblendet und ist jetzt als 2x2 App-Cockpit sichtbar.
- QA-Screenshots: `tmp/qa/guest-home-redesign-v2/mobile-top.png`, `tmp/qa/guest-home-redesign-v2/mobile-full.png`, `tmp/qa/guest-home-redesign-v2/desktop-top.png`.
- Checks nach Startseiten-Trennung: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Gäste-App `Start` weiter zum Auszeit-Cockpit geschärft: Hero-CTAs entfernt, damit die Navigation nicht doppelt erscheint; die dynamische `Jetzt wichtig`-Card sitzt nun direkt unter dem Hero und ist reine Orientierung ohne extra CTA.
- Schnellzugriffe wurden kompakter formuliert (`Details`, `Karte`, `Timing`, `Kontakt`) und die zweite Service-CTA-Card entfernt.
- QA-Screenshots: `tmp/qa/guest-home-cockpit-v2/mobile-top.png`, `tmp/qa/guest-home-cockpit-v2/mobile-full.png`, `tmp/qa/guest-home-cockpit-v2/desktop-full.png`.
- Checks nach Cockpit-Umbau: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Gäste-App `Start` von Navigationskacheln auf Aufenthalts-Feed umgebaut: Keine doppelten Menü-CTAs mehr im Startscreen.
- Neue Startinhalte: `Jetzt wichtig`, `Heute für euch` mit Wetter/Gezeiten/kuratierter Empfehlung und `Euer Rhythmus` als emotionaler Aufenthaltsrahmen.
- Mobile `Heute für euch`-Karten laufen als horizontaler Slider, damit die Startseite nicht wie ein zweites Menü wirkt und die Bottom-Navigation weniger Inhalt überdeckt.
- QA-Screenshots: `tmp/qa/guest-home-feed-v3/mobile-top.png`, `tmp/qa/guest-home-feed-v3/mobile-full.png`, `tmp/qa/guest-home-feed-v3/desktop-full.png`.
- Checks nach Feed-Umbau: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Vor-Ort-Karte `Alle` korrigiert: Der Filter zeigt jetzt alle mappbaren freigegebenen Orte statt nur den alten reduzierten Überblick aus Unterkunft, erstem Strand, erstem Erlebnis und Gezeiten.
- Filterreihenfolge nach Gästerelevanz sortiert: `Alle`, `Wetter`, `Gezeiten`, `Strand`, `Essen`, `Erlebnis`, `Veranstaltungen`, `Einkauf`, `Hilfe`.
- Kartenpins im kompakten Modus stärker versetzt, damit viele freigegebene Orte auf engem SPO-Ausschnitt weniger übereinanderliegen.
- QA-Screenshots: `tmp/qa/guest-local-all-pins-v3/all-mobile.png`, `tmp/qa/guest-local-all-pins-v3/all-pin-drawer-mobile.png`, `tmp/qa/guest-local-all-pins-v3/beach-mobile.png`, `tmp/qa/guest-local-all-pins-v3/food-mobile.png`.
- Checks nach Vor-Ort-Kartenkorrektur: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Interaktion im Vor-Ort-Filter `Alle` präzisiert: Zahlen-Pins öffnen nicht mehr direkt einen Ort, sondern zoomen die Karte an und öffnen einen Bereichs-Drawer `Welche Orte liegen hier?`.
- Aus dem Bereichs-Drawer wählen Gäste dann bewusst einen Ort aus; erst danach öffnet der Detail-Drawer. In konkreten Filtern wie `Strand` oder `Essen` öffnen Pins weiterhin direkt die Details.
- QA-Screenshots: `tmp/qa/guest-local-all-area-drawer-v1/01-all-map.png`, `tmp/qa/guest-local-all-area-drawer-v1/02-area-drawer.png`, `tmp/qa/guest-local-all-area-drawer-v1/03-detail-drawer.png`, `tmp/qa/guest-local-all-area-drawer-v1/04-filter-direct-detail.png`.
- Checks nach Bereichs-Drawer: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Vor-Ort-Karte Zoomverhalten verbessert: Kompakte Zahlen-Pins lösen sich ab Zoomstufe 14 automatisch in beschriftete Ort-Pins auf.
- Manuelles Zoomen refittet die Karte nicht mehr sofort zurück auf den Gesamtüberblick; `fitBounds` läuft nur noch, wenn sich die sichtbaren Orte ändern.
- QA-Screenshots: `tmp/qa/guest-local-zoom-pins-v1/01-all-compact.png`, `tmp/qa/guest-local-zoom-pins-v1/02-all-zoom-labels.png`.
- Checks nach Zoom-Pin-Auflösung: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Vor-Ort-Karte Zoomverhalten nach realem Mobile-Test korrigiert: In dichten Kartenansichten bleiben Marker auch beim Reinzoomen kompakte Zahlen-Pins, statt in lange Textlabels zu wechseln.
- Ab Zoomstufe 14 bekommen kompakte Pins größere Offsets, damit nahe oder identische Koordinaten nicht übereinanderliegen; Namen und Details bleiben im Bereichs-/Detail-Drawer.
- QA-Screenshots: `tmp/qa/guest-local-zoom-overlap-v2/01-overview.png`, `tmp/qa/guest-local-zoom-overlap-v2/02-zoomed.png`.
- Checks nach Zoom-Overlap-Korrektur: `npm run build`, `npm run lint`, `npm run qa:smoke` erfolgreich.
- Vor-Ort-Pinlogik weiter präzisiert: Zahlen-Pins sind jetzt echte Gruppen-Pins, wenn mehrere Orte auf engem Raum liegen. Die Zahl zeigt die Anzahl der Orte in dieser Gruppe, nicht mehr nur eine laufende Pin-Nummer.
- Klick auf einen Gruppen-Pin öffnet den Bereichs-Drawer mit genau diesen Orten; Klick auf einen einzelnen Pin öffnet direkt den Detail-Drawer. Dadurch zeigt ein Cluster-Pin keine zufällig berechnete Umgebung mehr.
- QA-Screenshots: `tmp/qa/guest-local-cluster-v1/01-overview.png`, `tmp/qa/guest-local-cluster-v1/02-zoomed-clusters.png`, `tmp/qa/guest-local-cluster-v1/03-cluster-drawer-dispatch.png`, `tmp/qa/guest-local-cluster-v1/04-single-detail-dispatch.png`.
- Checks nach Gruppen-Pinlogik: `npm run lint`, `npm run build`, `npm run qa:smoke` erfolgreich.
- Vor-Ort-Pinlogik final stabilisiert: Cluster werden jetzt datenbasiert über nahe Koordinaten gebildet und nicht mehr abhängig von der aktuellen Zoomstufe.
- Einzelne Orte zeigen keine laufenden Zahlen mehr, sondern kompakte Punkt-Pins. Zahlen erscheinen nur noch auf echten Gruppen-Pins und bleiben beim Rein- und Rauszoomen gleich.
- Mobile Kartenhöhe leicht erhöht, damit der Überblick im Gästebereich mehr Raum bekommt, ohne die Seite zu schwer zu machen.
- QA-Screenshots: `tmp/qa/guest-local-cluster-final-v2/01-overview-320.png`, `tmp/qa/guest-local-cluster-final-v2/02-zoom-in-320.png`, `tmp/qa/guest-local-cluster-final-v2/03-zoom-out-320.png`.
- Checks nach stabiler Pinlogik: `npm run lint`, `npm run build`, `npm run qa:smoke` erfolgreich.
- Gäste-App `Vor Ort` Komplettcheck erneut durchgeführt: Filter `Alle`, `Wetter`, `Gezeiten`, `Strand`, `Essen`, `Erlebnis`, `Veranstaltungen`, `Einkauf`, `Hilfe` sowie Drawer-Stichproben für Strand, Essen, Erlebnis, Einkauf und Hilfe geprüft.
- Kartenmarker vereinheitlicht: Alle Kartenfilter nutzen jetzt kompakte Pins. Lange Textlabels erscheinen nicht mehr direkt auf der Karte, sondern in Liste und Drawer.
- Card-Badges entfernt, damit Zahlen nur noch eine Bedeutung haben: Anzahl der Orte in einem echten Karten-Cluster bzw. Nummerierung innerhalb des Cluster-Drawers.
- QA-Screenshots: `tmp/qa/guest-local-final-review-v3/alle.png`, `tmp/qa/guest-local-final-review-v3/gezeiten.png`, `tmp/qa/guest-local-final-review-v4/einkauf-no-card-badge.png`, `tmp/qa/guest-local-final-review-v6/essen-drawer.png`, `tmp/qa/guest-local-final-review-v6/hilfe-drawer.png`.
- Checks nach Vor-Ort-Komplettcheck: `npm run lint`, `npm run build`, `npm run qa:smoke` erfolgreich.
- Gäste-App `Buchung` systematisch geprüft: Mobile und Desktop-Screenshots erstellt, Inhalte und Reihenfolge gegen den Aufenthaltskontext geprüft.
- Einstieg von reiner Buchungsakte zu privatem Aufenthaltsüberblick geschärft: `Eure Auszeit im Überblick.` plus konkreter Hinweis auf Unterkunft, Anreise, Schlüssel und Erlebnis.
- Datenklarheit verbessert: Personenangabe zeigt jetzt `2 Personen` statt nur `2`; Anreisezeitraum wird als `15:00 bis 22:00 Uhr` statt kompakter Bindestrichform ausgegeben.
- QA-Screenshots: `tmp/qa/guest-booking-system-review-v2/mobile-full.png`, `tmp/qa/guest-booking-system-review-v2/desktop-top.png`.
- Checks nach Buchung-Seite: `npm run lint`, `npm run build`, `npm run qa:smoke` erfolgreich.
- Vor-Ort-Kartenmarker korrigiert nach Review: `Alle` bleibt als Überblick kompakt mit echten Cluster-Zahlen; konkrete Filter wie `Strand`, `Essen`, `Erlebnis` und `Einkauf` zeigen wieder Ortsnamen direkt im Pin.
- Kartenlabels für lange Erlebnisnamen bewusst gekürzt (`Wellness/Yoga`, `Kochen`, `Wattwanderung`), während Cards und Drawer die vollständigen Namen behalten.
- QA-Screenshots: `tmp/qa/guest-local-pin-label-restore-v4/strand.png`, `tmp/qa/guest-local-pin-label-restore-v4/essen.png`, `tmp/qa/guest-local-pin-label-restore-v4/erlebnis.png`, `tmp/qa/guest-local-pin-label-restore-v4/alle.png`.
- Checks nach Marker-Wiederherstellung: `npm run lint`, `npm run build`, `npm run qa:smoke` erfolgreich.
- Vor-Ort-Filter `Alle` nachkorrigiert: Einzelne kompakte Pins zeigen wieder stabile Ziffern statt Punkt-Pins. Die Ziffern bleiben beim Zoomen stabil und dienen als Kartenreferenz.
- Konkrete Filter behalten Ortsnamen in den Pins; `Alle` nutzt nummerierte Pins für den Überblick.
- QA-Screenshots: `tmp/qa/guest-local-all-numbered-pins-v2/01-all-numbered.png`, `tmp/qa/guest-local-all-numbered-pins-v2/02-all-numbered-zoomed.png`, `tmp/qa/guest-local-all-numbered-pins-v4/01-all-numbered-fit.png`.
- Checks nach nummerierten `Alle`-Pins: `npm run lint`, `npm run build`, `npm run qa:smoke` erfolgreich.
- Vor-Ort-Pin-Klick im Filter `Alle` bereinigt: Punkte vor Ziffern entfernt; Pin-Klick zoomt die Karte nicht mehr im Hintergrund.
- Nummerierte Pins öffnen im Überblick immer zuerst den Bereichs-Drawer. Einzelne Orte öffnen dort eine einzelne Auswahlkarte, Cluster öffnen mehrere Auswahlkarten; erst `Details öffnen` führt zum Detail-Drawer.
- Drawer-Text ist jetzt dynamisch: Ein einzelner Ort spricht von `Welcher Ort liegt hier?`, mehrere Orte von `Welche Orte liegen hier?`.
- QA-Screenshot: `tmp/qa/guest-local-pin-click-clean-v2/01-single-number-overview-drawer.png`.
- Checks nach Pin-Klick-Korrektur: `npm run lint`, `npm run build`, `npm run qa:smoke` erfolgreich.
- Vor-Ort-Karte `Alle` auf Google-Maps-Logik umgestellt: Klick auf einen Gruppen-Pin öffnet keinen Drawer mehr, sondern löst die Gruppe auf der Karte in konkrete Ort-Pins mit Namen auf.
- Erst der Klick auf einen tatsächlichen Ort-Pin öffnet den Detail-Drawer; Gruppen-Pin-Nummern bleiben nach dem Auflösen stabil, damit keine andere Gruppe plötzlich die geklickte Zahl übernimmt.
- QA-Screenshots: `tmp/qa/guest-local-cluster-expand-v1/01-cluster-expanded-no-drawer.png`, `tmp/qa/guest-local-cluster-expand-v1/02-expanded-place-detail.png`.
- Finaler Gästebereich-Check gestartet: `Start`, `Buchung`, `Vor Ort` und `Hilfe` mobil sowie desktop gesichtet.
- Mobile Vor-Ort-Karte nachgeschärft: Nach Größenwechsel oder initialem Mobile-Load refittet der kompakte `Alle`-Überblick erneut, damit alle nummerierten Pins im sichtbaren Kartenbereich liegen.
- Mobile Interaktion geprüft: Gruppen-Pin `6` löst sich ohne Drawer in `Bad` und `Arche Noah` auf; erst Klick auf `Arche Noah` öffnet den Restaurant-Drawer.
- QA-Screenshots: `tmp/qa/guest-final-pass-v1/mobile-start.png`, `tmp/qa/guest-final-pass-v1/mobile-buchung.png`, `tmp/qa/guest-final-pass-v1/mobile-vor-ort-final-fit.png`, `tmp/qa/guest-final-pass-v1/mobile-vor-ort-cluster-expanded-final.png`, `tmp/qa/guest-final-pass-v1/mobile-vor-ort-detail-final.png`, `tmp/qa/guest-final-pass-v1/mobile-hilfe.png`, `tmp/qa/guest-final-pass-v1/desktop-start.png`, `tmp/qa/guest-final-pass-v1/desktop-buchung.png`, `tmp/qa/guest-final-pass-v1/desktop-vor-ort.png`, `tmp/qa/guest-final-pass-v1/desktop-hilfe.png`.
- Checks nach finalem Gästebereich-Pass: `npm run lint`, `npm run build`, `npm run qa:smoke` erfolgreich.
- Admin Buchungsdrawer stärker als Operations-Zentrale aufgebaut: Oben steht nun der nächste konkrete Arbeitsschritt mit Statusbadge, Fortschritt `Reservierung -> Zahlung -> Vor Anreise -> Aufenthalt` und direkten Schnellaktionen.
- Schnellaktionen im Drawer bleiben robust und aktualisieren den Arbeitsstand sofort, z. B. `Check-in freigeben` reduziert die offenen Gästebereich-Punkte und rückt den nächsten Schritt nach oben.
- QA-Screenshot: `tmp/qa/admin-booking-ops-v2/01-booking-command-drawer.png`.
- Checks nach Admin-Buchungszentrale: `npm run lint`, `npm run build`, `npm run qa:smoke` erfolgreich.
- Admin Buchungsliste zur operativen Arbeitsliste verdichtet: Kennzahlen sind jetzt eine kompakte Zeile, darunter zeigen Buchungskarten Priorität, nächsten Schritt, Blocker und Gästebereich-Status.
- Karten priorisieren `Heute`, `Support`, `Offen` oder `Bereit`; der nächste Schritt wird aus Support, Zahlung, Check-in, Erlebnis und Gästebereich-Blockern abgeleitet.
- QA-Screenshot: `tmp/qa/admin-booking-list-v2/01-booking-list-compact.png`.
- Checks nach Buchungsliste: `npm run lint`, `npm run build`, `npm run qa:smoke` erfolgreich.
- Admin Gästesupport fachlich geroutet: Jeder Fall zeigt jetzt Zuständigkeit und nächsten Schritt, z. B. `Morrow Operations -> Direkt operativ lösen`, `Unterkunft / Partner -> Partner prüfen und Gast einordnen` oder `Erlebnispartner -> Erlebnispartner klären`.
- Routing berücksichtigt nicht nur die gewählte Kategorie, sondern auch den Nachrichtentext, damit ein Schlüsselsafe-/Codefall auch bei allgemeiner Kategorie als Operations-Thema erkannt wird.
- Supportfall-Test aus dem Gästebereich erstellt und im Admin geprüft; `Buchung öffnen` springt weiterhin in den passenden Buchungsdrawer mit Supportblock.
- QA-Screenshots: `tmp/qa/admin-guest-support-v2/02-support-routing-after-note.png`, `tmp/qa/admin-guest-support-v2/03-support-opens-booking.png`.
- Checks nach Gästesupport-Routing: `npm run lint`, `npm run build`, `npm run qa:smoke` erfolgreich.
- Admin Aufgaben-Seite von generischer Liste zu operativer Tagesansicht umgebaut: Oben stehen jetzt `Heute / überfällig`, `In Klärung`, `Gästesupport` und `Buchungen`.
- Neue Arbeitsfläche `Heute arbeiten` bündelt die Aufgaben in drei Lanes: `Heute zuerst`, `In Klärung`, `Demnächst`. Die Karten springen direkt in den passenden Datensatz; Support-Aufgaben zeigen den nächsten operativen Schritt.
- Aufgabenanlage bleibt darunter kompakt, die vollständige Aufgabenliste heißt jetzt `Alle Aufgaben` und zeigt bei Supportfällen zusätzlich Zuständigkeit und nächsten Schritt.
- QA-Screenshots: `tmp/qa/admin-tasks-v2/01-tasks-desktop.png`, `tmp/qa/admin-tasks-v2/02-tasks-viewport.png`.
- Admin Kunden-Seite vom Anfrage-Aggregat zum CRM-Blick geschärft: Neue Arbeitsfläche `Kundenarbeit` mit `Heute nachfassen`, `Aktive Buchungen` und `Neue Kontakte`.
- Kundenkarten zeigen jetzt klar den nächsten Kundenschritt, Kontaktpräferenz, aktuelle Auszeit, Quelle sowie direkte Aktionen für Profil, Anfrage und Buchung.
- Kundendrawer geprüft: Profil bündelt Kontakt, Anfragehistorie und Buchungen; von dort kann direkt in Anfrage oder Buchung gesprungen werden.
- QA-Screenshots: `tmp/qa/admin-customers-v2/01-customers-crm.png`, `tmp/qa/admin-customers-v2/03-customer-drawer.png`.
- Admin Buchungen-Seite gegen den CRM-Fluss geschärft: Neue Arbeitsfläche `Buchungsarbeit` mit `Heute sichern`, `Vor Anreise vorbereiten` und `Gastbereit`.
- Buchungskarten behalten den operativen Fokus auf Zahlung, Check-in, Erlebnis, Gästebereich und Support, bieten jetzt aber zusätzlich den direkten Rücksprung ins Kundenprofil.
- Verbindung Buchung -> Kunde im Browser geprüft; `Kunde öffnen` öffnet den passenden Kundendrawer mit Kontakt, Verlauf und Buchungen.
- QA-Screenshots: `tmp/qa/admin-bookings-v4/01-bookings-workboard.png`, `tmp/qa/admin-bookings-v4/03-booking-customer-drawer.png`.
- Admin Anfragen-Seite von reiner Leadtabelle zu operativer Eingangssteuerung erweitert: Neue Arbeitsfläche `Anfragenarbeit` mit `Heute nachfassen`, `Neue Gastanfragen` und `Partnerkontakte`.
- Der obere Leadbereich trennt jetzt bewusst Gastnachfrage und Partnerkontakte, damit Eigentümer-/Erlebnisanbieteranfragen nicht in der Gastlogik verschwinden.
- MVP-Lernsignale bleiben erhalten, die vollständige Liste heißt `Alle Anfragen` und dient weiter zum Filtern, Statussetzen und Öffnen des Detaildrawers.
- QA-Screenshots: `tmp/qa/admin-leads-v2/01-leads-workboard.png`, `tmp/qa/admin-leads-v2/03-lead-drawer.png`.
- Admin Auszeiten-Seite als Produktsteuerung geschärft: Neue Arbeitsfläche `Auszeitenarbeit` mit `Live prüfbar`, `Erlebnis offen` und `Im Aufbau`.
- Die Auszeiten werden damit nicht nur gelistet, sondern nach Marktreife, offenen Erlebnisbausteinen und Aufbauzustand geführt.
- Bearbeitung bleibt im Auszeit-Drawer möglich: Preis, Termine, Unterkunft, Schlüssel-/Anreiseinfos, Leistungen und mehrere Erlebnisbausteine inklusive Anbieterprofilen.
- QA-Screenshots: `tmp/qa/admin-packages-v2/01-packages-workboard.png`, `tmp/qa/admin-packages-v2/02-package-drawer.png`.
- Admin Erlebnisse-Seite als Erlebnissteuerung ergänzt: Neue Arbeitsfläche `Erlebnisarbeit` mit `Ohne Anbieter`, `Anfrage offen` und `Bestätigt`.
- Erlebnisbausteine können dadurch als operativer Bestandteil einer Auszeit geprüft werden: Anbieterbezug, Rolle in der Auszeit, Preislogik und Bestätigungsstatus.
- Admin Erlebnisanbieter-Seite ebenfalls mit Arbeitsfläche `Anbieterarbeit` ergänzt: `In Prüfung`, `Partner`, `Mit Bausteinen`.
- Verbindung Anbieter -> Erlebnis im Browser geprüft; Anbieterdrawer zeigt verknüpfte Erlebnisbausteine und öffnet diese bei Bedarf weiter.
- QA-Screenshots: `tmp/qa/admin-experiences-v2/01-experiences-workboard.png`, `tmp/qa/admin-experiences-v2/02-experience-drawer.png`, `tmp/qa/admin-experience-providers-v2/01-providers-workboard.png`, `tmp/qa/admin-experience-providers-v2/02-provider-drawer.png`.
- Admin Eigentümer/Objekte-Seite als Bestandssteuerung ergänzt: Neue Arbeitsfläche `Objektarbeit` mit `In Prüfung`, `Aktive Objekte` und `Mit Auszeiten`.
- Dadurch ist klarer getrennt, welche Unterkünfte noch geprüft werden, welche operativ nutzbar sind und welche bereits mit konkreten Auszeiten verbunden sind.
- Admin Agenturen-Seite als Startpartner-Steuerung ergänzt: Neue Arbeitsfläche `Agenturarbeit` mit `Aktive Startpartner`, `Termine klären` und `Mit Objekten`.
- Agenturen bleiben damit als Phase-1-Partner für Objektzugang, freie Termine und Materialfreigaben getrennt von direkten Eigentümer-/Objektprofilen.
- QA-Screenshots: `tmp/qa/admin-owners-agencies-v2/01-owners-workboard.png`, `tmp/qa/admin-owners-agencies-v2/02-owner-drawer.png`, `tmp/qa/admin-owners-agencies-v2/03-agencies-workboard.png`, `tmp/qa/admin-owners-agencies-v2/04-agency-drawer.png`.
- Admin Gesamt-Workflow geprüft: Gastanfragen werden über Status weiterhin zu Kunden/Buchungen; Partneranfragen brauchten eine echte Übergabe in die Fachbereiche.
- Lead-Drawer erweitert: Eigentümeranfragen haben nun `Objektprofil öffnen / anlegen`, Erlebnisanbieteranfragen haben `Anbieterprofil öffnen / anlegen`.
- Die Übergabe legt bei Bedarf ein passendes Objekt- bzw. Anbieterprofil an, setzt neue Leads in Prüfung und öffnet direkt den richtigen Admin-Bereich. Bestehende Profile werden erkannt und geöffnet.
- QA-Screenshots: `tmp/qa/admin-workflow-v1/01-owner-lead-handoff-button.png`, `tmp/qa/admin-workflow-v1/02-owner-profile-created.png`, `tmp/qa/admin-workflow-v1/03-experience-lead-handoff-button.png`, `tmp/qa/admin-workflow-v1/04-experience-provider-created.png`.
- Admin Übersicht als tägliches Cockpit gestrafft: Der Einstieg priorisiert jetzt `Heute zuerst` statt mehrere parallele Aufgabenmodule zu zeigen.
- Oberste Kennzahlen fokussieren auf Tagesarbeit: `Heute fällig`, `Neue Anfragen`, `Buchungs-Ops`, `Partnerübergaben`.
- Die frühere doppelte Struktur aus Tages-Lanes und separater Arbeitsliste wurde entfernt. Die Arbeitsliste ist jetzt der primäre Einstieg, rechts bleiben kommende Auszeiten sichtbar.
- Neuer Bereich `Arbeitsbereiche` zeigt den Systemzustand kompakt für Anfragen, Buchungen, Support, Gästebereich, Auszeiten, Erlebnisse, Vor-Ort-Kuration und Kunden.
- Partnerübergaben fließen in die Prioritäten ein, damit Eigentümer- und Erlebnisanbieteranfragen nicht im allgemeinen Leadstrom hängen bleiben.
- QA-Screenshots: `tmp/qa/admin-overview-v2/01-overview-cockpit.png`, `tmp/qa/admin-overview-v2/02-overview-workareas.png`, `tmp/qa/admin-overview-v2/03-overview-workitem-drawer.png`.
- Admin Datenpflege-Check gestartet: Auszeiten, Objekte, Agenturen, Erlebnisanbieter und Vor-Ort-Kandidaten wurden auf Anlegen, Bearbeiten, Pausieren, Verknüpfen und Entfernen geprüft.
- Schutzlogik für Entfernen ergänzt: Auszeiten mit Anfragen/Buchungen, Objekte mit Auszeiten, Agenturen mit betreuten Objekten und Erlebnisanbieter mit verbundenen Erlebnisbausteinen werden nicht hart gelöscht.
- Für freie Test-/Dubletten-Datensätze gibt es nun Entfernen-Aktionen direkt im jeweiligen Drawer. Für operative Datensätze bleibt Pausieren/Nicht passend die sichere Standardbewegung.
- Vor-Ort-Kandidaten behalten zusätzlich `Nicht passend`, `Pausieren` und `Freigeben`; Entfernen ist für echte Fehl- oder Testdatensätze verfügbar.
- QA-Screenshots: `tmp/qa/admin-data-care-v1/01-package-delete-control.png`, `tmp/qa/admin-data-care-v1/02-owner-delete-control.png`, `tmp/qa/admin-data-care-v1/03-provider-delete-control.png`, `tmp/qa/admin-data-care-v1/04-local-delete-control.png`, `tmp/qa/admin-data-care-v1/05-agency-delete-control.png`.
