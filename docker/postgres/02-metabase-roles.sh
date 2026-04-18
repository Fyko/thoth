#!/bin/sh
set -e

: "${METABASE_APP_PASSWORD:?METABASE_APP_PASSWORD must be set}"
: "${METABASE_READER_PASSWORD:?METABASE_READER_PASSWORD must be set}"

psql -v ON_ERROR_STOP=1 \
  -v app_password="$METABASE_APP_PASSWORD" \
  -v reader_password="$METABASE_READER_PASSWORD" \
  --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-'EOSQL'
  do $$
  begin
    if not exists (select from pg_roles where rolname = 'metabase_app') then
      execute format('create role metabase_app login password %L', :'app_password');
    end if;
    if not exists (select from pg_roles where rolname = 'metabase_reader') then
      execute format('create role metabase_reader login password %L', :'reader_password');
    end if;
  end
  $$;

  create schema if not exists metabase authorization metabase_app;

  grant connect on database :"DBNAME" to metabase_reader;
  grant usage on schema public to metabase_reader;
  grant select on all tables in schema public to metabase_reader;
  alter default privileges in schema public grant select on tables to metabase_reader;
EOSQL
