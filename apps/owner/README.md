# Morrow Owner App

Geschuetzte Eigentuemer-App fuer Objekttransparenz, freie Zeitraeume,
Buchungen, Vermarktung, Operationshinweise und spaetere Abrechnung.

Status: MVP-Light gestartet.

- Login per Supabase Auth.
- Zugriff nur fuer freigeschaltete `owner_profiles`.
- Objekte werden ueber `owner_property_access` begrenzt.
- Dashboard liest `get_owner_dashboard()`.
- Admin bleibt Quelle der Wahrheit.

Naechste Ausbaustufen:

- echte Monatsabrechnung und Dokumente
- Operationsstatus/Reinigung/Maengel
- Eigentuemer-Kommunikation
- Freigaben fuer Eigenbelegung und Verfuegbarkeiten
