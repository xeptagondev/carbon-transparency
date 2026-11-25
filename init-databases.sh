#!/bin/bash
set -euo pipefail

: "${DB_NAME:=carbondev}"
: "${DB_EVENTS_NAME:=${DB_NAME}Events}"

escape_sql_ident() {
  printf '%s' "$1" | sed 's/"/""/g'
}

main_db="$(escape_sql_ident "$DB_NAME")"
events_db="$(escape_sql_ident "$DB_EVENTS_NAME")"

template="/docker-entrypoint-initdb.d/init.sql.template"
if [[ ! -f "$template" ]]; then
  echo "init-databases.sh: missing template at $template" >&2
  exit 1
fi

sed \
  -e "s|\${DB_NAME}|${main_db}|g" \
  -e "s|\${DB_EVENTS_NAME}|${events_db}|g" \
  "$template" |
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres