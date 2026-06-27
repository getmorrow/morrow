# Morrow Guest App

Geschuetzte App-Welt fuer `Deine Auszeit`.

Status: Next-Migration gestartet.

- Zugriff ueber Buchungs-ID plus persoenlichen Access-Code.
- Buchung und Auszeit werden ueber `get_guest_stay()` geladen.
- Start, Auszeit, Buchung, Vor Ort, Hilfe und Feedback sind als erste
  mobil-first App-Shell vorhanden.
- Supportnachrichten werden in `support_messages` gespeichert; sichtbare
  Antworten aus Admin laufen ueber `get_guest_support_events()` zurueck in
  den Hilfe-Verlauf.
- Feedback wird in `guest_feedback` gespeichert.
- Admin bleibt Quelle der Wahrheit; diese App zeigt nur Gaeste-Ausschnitte.
- Lokaler Sichttest: `/deine-auszeit/dev-active?code=MORROWDEV`
  funktioniert nur ausserhalb von Production.
- Supabase-Testdatensatz: `npm run supabase:seed-active-guest-test`
  benoetigt `SUPABASE_SERVICE_ROLE_KEY` und erzeugt
  `/deine-auszeit/11111111-1111-4111-8111-111111111111?code=MORROW1`.
- Wiederholbarer Supabase-/Browser-Check:
  `npm run supabase:verify-guest` prueft `get_guest_stay()` und
  `get_guest_support_events()` mit anon key. Mit `GUEST_VERIFY_SEED=1` wird
  der Testdatensatz vorher erneuert; mit `GUEST_VERIFY_SUPPORT_REPLY=1` wird
  zusaetzlich ein temporaerer Supportfall samt Morrow-Antwort geprueft; mit
  `GUEST_BASE_URL=https://<guest-app-domain>` wird die App im Browser
  gerendert und ein Screenshot unter `tmp/qa/guest-stay/` erzeugt.

Naechste Ausbaustufen:

- echte Gezeitenquelle anbinden
- Statusabhaengige Startseite weiter verfeinern
- Support-Chat Richtung Realtime/WhatsApp-Templates vertiefen
- abgeschlossene Aufenthalte mit Wiederbuchungslogik staerker ausbauen
