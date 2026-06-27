# Morrow Owner App

Geschuetzte Eigentuemer-App fuer Objekttransparenz, freie Zeitraeume,
Buchungen, Vermarktung, Operationshinweise und Abrechnung.

Status: MVP-Light gestartet.

- Login per Supabase Auth.
- Zugriff nur fuer freigeschaltete `owner_profiles`.
- Objekte werden ueber `owner_property_access` begrenzt.
- Dashboard liest `get_owner_dashboard()`.
- Freigegebene Eigentümerdokumente werden aus `owner_documents`
  gelesen und nur bei passendem Objektzugriff angezeigt.
- Eigentümer können strukturierte Rückfragen zu Objekt, Buchung,
  Eigenbelegung/Verfügbarkeit oder Abrechnung senden; diese landen als
  `support_messages` im Admin und enthalten bei Zeitraumfragen Von-/Bis-Daten.
- Gesendete Eigentümer-Rückfragen werden über `get_owner_dashboard().messages`
  wieder im Dashboard angezeigt, inklusive Status, Objektbezug und Zeitraum.
- Admin-Antworten zu diesen Rückfragen werden über `get_owner_communication_events()`
  als sichtbarer Verlauf unter dem jeweiligen Anliegen angezeigt.
- Statuswechsel zu Rückfragen werden über `get_owner_support_status_events()`
  als kleine Historie beim Anliegen sichtbar.
- Freigegebene Monatsabrechnungen werden aus `owner_statements` gelesen und
  nur bei Finanzfreigabe des Objektzugriffs angezeigt.
- Freigegebene Operationsmeldungen werden aus `owner_operations` gelesen und
  nur bei Operationsfreigabe des Objektzugriffs angezeigt.
- Admin bleibt Quelle der Wahrheit.

Naechste Ausbaustufen:

- Eigentuemer-Kommunikation mit Antworten und Vorlagen
- Freigaben fuer Eigenbelegung und Verfuegbarkeiten spaeter mit echter
  Statushistorie und Kalenderwirkung verbinden
