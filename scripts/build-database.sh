#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DB_PATH="$ROOT_DIR/data/morrow.sqlite"

rm -f "$DB_PATH"
sqlite3 "$DB_PATH" < "$ROOT_DIR/data/schema.sql"
sqlite3 "$DB_PATH" < "$ROOT_DIR/data/seed.sql"

sqlite3 "$DB_PATH" "SELECT segment, COUNT(*) AS leads FROM partner_leads GROUP BY segment;"
