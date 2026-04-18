FROM postgres:17-alpine

COPY 01-init.sql /docker-entrypoint-initdb.d/
COPY 02-metabase-roles.sh /docker-entrypoint-initdb.d/
