#!/bin/sh
set -e

: "${METABASE_APP_PASSWORD:?METABASE_APP_PASSWORD must be set}"
: "${METABASE_READER_PASSWORD:?METABASE_READER_PASSWORD must be set}"

psql -v ON_ERROR_STOP=1 \
  -v app_password="$METABASE_APP_PASSWORD" \
  -v reader_password="$METABASE_READER_PASSWORD" \
  --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-'EOSQL'
  SELECT format('CREATE ROLE metabase_app LOGIN PASSWORD %L', :'app_password')
  WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'metabase_app')
  \gexec

  SELECT format('CREATE ROLE metabase_reader LOGIN PASSWORD %L', :'reader_password')
  WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'metabase_reader')
  \gexec

  CREATE SCHEMA IF NOT EXISTS metabase AUTHORIZATION metabase_app;
  ALTER ROLE metabase_app SET search_path = metabase;

  GRANT CONNECT ON DATABASE :"DBNAME" TO metabase_reader;
  GRANT USAGE ON SCHEMA public TO metabase_reader;
  GRANT SELECT ON ALL TABLES IN SCHEMA public TO metabase_reader;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO metabase_reader;
EOSQL
