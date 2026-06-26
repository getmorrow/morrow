# Morrow Owner App

Geschuetzte Eigentuemer-App fuer Objekttransparenz, freie Zeitraeume,
Buchungen, Vermarktung, Operationshinweise und spaetere Abrechnung.

Status: MVP-Light gestartet.

- Login per Supabase Auth.
- Zugriff nur fuer freigeschaltete `owner_profiles`.
- Objekte werden ueber `owner_property_access` begrenzt.
- Dashboard liest `get_owner_dashboard()`.
- Eigentümer können strukturierte Rückfragen zu Objekt, Buchung oder
  Abrechnung senden; diese landen als `support_messages` im Admin.
- Admin bleibt Quelle der Wahrheit.

Naechste Ausbaustufen:

- echte Monatsabrechnung und Dokumente
- Operationsstatus/Reinigung/Maengel
- Eigentuemer-Kommunikation mit Historie und Vorlagen
- Freigaben fuer Eigenbelegung und Verfuegbarkeiten
