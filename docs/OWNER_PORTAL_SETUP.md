# Morrow Owner Portal Setup

Stand: 2026-06-27

Dieses Dokument beschreibt, wie der geschuetzte Eigentuemerbereich mit Supabase verbunden wird.

## Ziel

Ein Eigentuemer soll sich nur einloggen koennen, wenn:

- ein Supabase Auth User existiert
- ein aktives `owner_profiles` Profil existiert
- dieses Profil ueber `owner_property_access` mit mindestens einem Objekt verbunden ist

Die Eigentuemer-App liest danach nur:

- eigene Objekte
- damit verbundene Auszeiten
- damit verbundene Termine
- damit verbundene Buchungen
- freigegebene Eigentümerdokumente wie Vereinbarungen, Abrechnungen, Belege, Reports und Übergaben
- strukturierte Rückfragen, die der Eigentümer an Morrow sendet, werden als `support_messages` gespeichert

Admin bleibt die Quelle der Wahrheit.

## Rückkanal an Morrow

Eigentümer können im Dashboard Rückfragen zu Objekt, Buchung, Eigenbelegung/Verfügbarkeit oder Abrechnung senden.

Bei Eigenbelegung/Verfügbarkeit werden zusätzlich Von-/Bis-Daten abgefragt und im Payload der `support_messages` gespeichert. Das ist im MVP bewusst noch kein vollautomatischer Kalenderblocker: Der Fall landet zuerst im Admin, damit Morrow den Zeitraum prüft und danach sauber im operativen System bestätigt.

## Migration anwenden

Die relevante Migration liegt hier:

```text
supabase/migrations/202606250001_owner_portal_access.sql
supabase/migrations/202606270001_owner_documents.sql
```

Sie legt an:

- `owner_profiles`
- `owner_property_access`
- `owner_documents`
- `is_morrow_owner_for_property(property_id)`
- `get_owner_dashboard()`
- RLS Policies fuer Eigentuemerzugriff

Remote-Anwendung per Supabase CLI:

```bash
export SUPABASE_ACCESS_TOKEN="<supabase-access-token>"
npx supabase migration list --linked
npx supabase db push --linked
```

Falls die CLI ein Datenbankpasswort verlangt, das Supabase-Datenbankpasswort sicher als Umgebung setzen oder im Prompt eingeben. Keine Secrets im Repo speichern.

## Ersten Eigentuemer verknuepfen

Voraussetzung:

- Der Eigentuemer ist in Supabase Auth angelegt.
- Die gewuenschten Objekte existieren in `properties`.

Danach:

```bash
export SUPABASE_URL="https://haifftleyussrokyafqq.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
export OWNER_EMAIL="eigentuemer@example.com"
export OWNER_NAME="Name des Eigentuemers"
export OWNER_AUTH_USER_ID="<auth.users.id>"
export OWNER_PROPERTY_IDS="nordlicht-lodge,duenenruhe-suite"
npm run supabase:seed-owner-access
```

`OWNER_AUTH_USER_ID` ist empfohlen. Wenn sie fehlt, wird die Verknuepfung ueber die E-Mail aus dem Auth-JWT geprueft.

## Vercel Variablen

Fuer `apps/owner` muessen in Vercel gesetzt sein:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Die alten `VITE_...` Variablen bleiben nur fuer den Prototyp und einige lokale Seed-Skripte relevant.

## Pruefung

1. Ohne Login `/dashboard` oeffnen.
   Erwartung: Rueckleitung zum Login.
2. Mit freigeschaltetem Owner einloggen.
   Erwartung: Dashboard zeigt eigene Objekte, Auszeiten, Termine und Buchungen.
3. Mit einem nicht freigeschalteten Auth User einloggen.
   Erwartung: Hinweis, dass noch kein Objekt freigeschaltet ist.
4. In Supabase pruefen:
   - `owner_profiles.status = active`
   - `owner_property_access.property_id` verweist auf bestehende `properties.id`
   - `packages.property_id` verweist auf dieselbe Immobilie
   - `package_dates.package_id` und `bookings.package_id` sind gesetzt
   - sichtbare Dokumente liegen in `owner_documents.status = visible`

## Automatischer Verifikationstest

Der Owner-Zugang kann strukturell und optional mit einem echten Owner-Login geprueft werden:

```bash
export SUPABASE_URL="https://haifftleyussrokyafqq.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
npm run supabase:verify-owner
```

Dieser Test prueft:

- `owner_profiles`
- `owner_property_access`
- `properties`
- `packages`
- `package_dates`
- `bookings`
- `owner_documents`
- `get_owner_dashboard()`

Mit echtem Owner-Login:

```bash
export SUPABASE_URL="https://haifftleyussrokyafqq.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
export SUPABASE_ANON_KEY="<anon-key>"
export OWNER_EMAIL="eigentuemer@example.com"
export OWNER_PASSWORD="<owner-password>"
npm run supabase:verify-owner
```

Dann prueft der Test zusaetzlich, ob sich der Eigentuemer anmelden kann und ob `get_owner_dashboard()` fuer diesen Zugang eigene Objekte, Auszeiten, Termine, Buchungen und Dokumente liefert.

Ohne echten Owner-Login kann der Test einen temporaeren Eigentuemer mit Objektzugriff erzeugen, den Zugang pruefen und am Ende wieder aufraeumen:

```bash
export SUPABASE_URL="https://haifftleyussrokyafqq.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
export SUPABASE_ANON_KEY="<anon-key>"
export OWNER_VERIFY_TEMP_OWNER=1
export OWNER_VERIFY_SUPPORT_INSERT=1
export OWNER_VERIFY_DOCUMENT_ACCESS=1
npm run supabase:verify-owner
```

Das ist der bevorzugte Smoke-Test, wenn kein echter Eigentuemer-Testzugang in `.env.local` gepflegt werden soll.

Mit Support-Rueckkanal:

```bash
export OWNER_VERIFY_SUPPORT_INSERT=1
npm run supabase:verify-owner
```

Dann sendet der Test als eingeloggter Eigentuemer eine strukturierte Supportnachricht und eine Verfügbarkeits-/Eigenbelegungsanfrage in `support_messages` und liest sie mit Service Role wieder aus. Das prueft den Weg von Eigentuemer-App zu Admin-Supportfluss inklusive RLS-Policy fuer `owner_availability`.

Für Verfügbarkeits- und Eigenbelegungsanfragen wird dieselbe Tabelle genutzt. Die App setzt dabei `category = owner_availability` und speichert `requestedStartsOn` sowie `requestedEndsOn` im Payload.

Mit Dokument-Zugriff:

```bash
export OWNER_VERIFY_DOCUMENT_ACCESS=1
npm run supabase:verify-owner
```

Dann legt der Test mit Service Role ein temporaeres sichtbares Dokument fuer das erste freigeschaltete Objekt an, liest es als eingeloggter Eigentuemer ueber `get_owner_dashboard()` und loescht es danach wieder. Das prueft den Weg von Admin-Dokument zu sichtbarem Owner-Dokument.
