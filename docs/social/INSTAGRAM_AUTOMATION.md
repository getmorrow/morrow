# Instagram Automation

Diese Automatisierung ist fuer den organischen Morrow Instagram-Contentplan gebaut.

## Was automatisiert wird

- Naechsten oder faelligen Beitrag aus `data/social/instagram-first-3-months-2026.json` lesen
- Creatives aus dem lokalen Projektordner nehmen
- Optional in einen separaten Supabase Storage Bucket laden und temporaere signierte URLs fuer Meta erzeugen
- Caption aus dem Plan verwenden
- Ueber die Instagram Platform veroeffentlichen
- Gepostete Media-IDs in `data/social/instagram-post-log.json` speichern
- Spaeter Insights fuer bereits gepostete Beitraege abrufen

## Wichtig zu Meta MCP

Der neue Meta MCP-Endpunkt unter `https://mcp.facebook.com/ads` ist fuer Meta Ads und Business-Operationen gedacht. Er ist sinnvoll fuer bezahlte Kampagnen, Ads-Analyse und spaeteres Boosting.

Organische Instagram-Feedposts laufen weiterhin ueber die Instagram Platform Content Publishing API. Dafuer braucht Morrow einen professionellen Instagram-Account, einen gueltigen Access Token, die Instagram Professional Account ID und Bild-URLs, die Meta beim Posting abrufen kann.

Die Creatives muessen nicht auf der Morrow Website veroeffentlicht werden. Der bevorzugte Weg ist `supabase-storage`: Das Skript nimmt die PNGs aus Codex/dem Projektordner, laedt sie in einen separaten Storage Bucket und erzeugt nur fuer den Posting-Vorgang signierte URLs.

## Env

In `.env.local` muessen gesetzt sein:

```bash
INSTAGRAM_API_HOST=graph.instagram.com
INSTAGRAM_API_VERSION=
INSTAGRAM_ACCESS_TOKEN=
INSTAGRAM_PROFESSIONAL_ACCOUNT_ID=
INSTAGRAM_ASSET_PROVIDER=supabase-storage
INSTAGRAM_ASSET_BASE_URL=
INSTAGRAM_STORAGE_BUCKET=instagram-creatives
INSTAGRAM_SIGNED_URL_SECONDS=86400
INSTAGRAM_LAUNCH_DATE=2026-06-04
INSTAGRAM_INSIGHT_METRICS=reach,likes,comments,saved,shares,total_interactions
INSTAGRAM_PUBLISH_LOG=data/social/instagram-post-log.json
```

Zusaetzlich braucht der Storage-Upload die Supabase Serverwerte:

```bash
VITE_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

`INSTAGRAM_ASSET_BASE_URL` wird nur gebraucht, wenn `INSTAGRAM_ASSET_PROVIDER=static-url` genutzt wird.

## Befehle

```bash
npm run instagram:dry-run
npm run instagram:assets
npm run instagram:post
npm run instagram:insights
node scripts/instagram-publisher.mjs status
node scripts/instagram-publisher.mjs dry-run 02
node scripts/instagram-publisher.mjs assets 02
```

`npm run instagram:post` nutzt `post due` und veroeffentlicht pro Lauf maximal einen faelligen, noch nicht geposteten Beitrag.

`npm run instagram:assets` bereitet die Assets fuer den naechsten Beitrag vor und zeigt die Storage-/URL-Zuordnung. Bei `supabase-storage` werden dabei signierte URLs erzeugt.

## Launch-Offset

Der Contentplan wurde urspruenglich ab dem 22. Mai 2026 aufgebaut. Wenn `INSTAGRAM_LAUNCH_DATE` gesetzt ist, verschiebt das Skript alle Plantermine relativ auf dieses neue Startdatum. So bleibt der Rhythmus erhalten, auch wenn der echte Start spaeter liegt.
