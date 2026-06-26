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

Naechste Ausbaustufen:

- interaktive Karte mit Cluster-/Drawer-Logik aus dem Prototyp migrieren
- Wetter, Gezeiten und Veranstaltungen in eigene Gastmodule ueberfuehren
- Statusabhaengige Startseite weiter verfeinern
- Support-Chat und Problem-Tickets vertiefen
- abgeschlossene Aufenthalte mit Wiederbuchungslogik staerker ausbauen
