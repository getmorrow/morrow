# Morrow Owner App

Geschuetzte Eigentuemer-App fuer Objekttransparenz, freie Zeitraeume,
Buchungen, Vermarktung, Operationshinweise und spaetere Abrechnung.

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
- Admin bleibt Quelle der Wahrheit.

Naechste Ausbaustufen:

- echte Monatsabrechnung auf Basis normalisierter Abrechnungsdatensaetze
- Operationsstatus/Reinigung/Maengel
- Eigentuemer-Kommunikation mit Historie und Vorlagen
- Freigaben fuer Eigenbelegung und Verfuegbarkeiten spaeter mit echter
  Statushistorie und Kalenderwirkung verbinden
