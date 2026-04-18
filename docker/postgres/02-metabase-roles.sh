#!/bin/sh
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  do \$\$
  begin
    if not exists (select from pg_roles where rolname = 'metabase_app') then
      create role metabase_app login password '${METABASE_APP_PASSWORD:-metabase_app}';
    end if;
    if not exists (select from pg_roles where rolname = 'metabase_reader') then
      create role metabase_reader login password '${METABASE_READER_PASSWORD:-metabase_reader}';
    end if;
  end
  \$\$;

  create schema if not exists metabase authorization metabase_app;

  grant connect on database "$POSTGRES_DB" to metabase_reader;
  grant usage on schema public to metabase_reader;
  grant select on all tables in schema public to metabase_reader;
  alter default privileges in schema public grant select on tables to metabase_reader;
EOSQL
