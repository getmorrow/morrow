# Morrow Guest App

Geschuetzte App-Welt fuer `Deine Auszeit`.

Status: Next-Migration gestartet.

- Zugriff ueber Buchungs-ID plus persoenlichen Access-Code.
- Buchung und Auszeit werden ueber `get_guest_stay()` geladen.
- Start, Auszeit, Buchung, Vor Ort, Hilfe und Feedback sind als erste
  mobil-first App-Shell vorhanden.
- Supportnachrichten werden in `support_messages` gespeichert.
- Feedback wird in `guest_feedback` gespeichert.
- Admin bleibt Quelle der Wahrheit; diese App zeigt nur Gaeste-Ausschnitte.
- Lokaler Sichttest: `/deine-auszeit/dev-active?code=MORROWDEV`
  funktioniert nur ausserhalb von Production.
- Supabase-Testdatensatz: `npm run supabase:seed-active-guest-test`
  benoetigt `SUPABASE_SERVICE_ROLE_KEY` und erzeugt
  `/deine-auszeit/11111111-1111-4111-8111-111111111111?code=MORROW1`.

Naechste Ausbaustufen:

- interaktive Karte mit Cluster-/Drawer-Logik aus dem Prototyp migrieren
- Wetter, Gezeiten und Veranstaltungen in eigene Gastmodule ueberfuehren
- Statusabhaengige Startseite weiter verfeinern
- Support-Chat und Problem-Tickets vertiefen
- abgeschlossene Aufenthalte mit Wiederbuchungslogik staerker ausbauen
