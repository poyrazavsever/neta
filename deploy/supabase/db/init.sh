#!/usr/bin/env sh
set -eu

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<SQL
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create role authenticator noinherit login password '$POSTGRES_PASSWORD';
create role supabase_auth_admin noinherit login password '$POSTGRES_PASSWORD';
create role supabase_storage_admin noinherit login password '$POSTGRES_PASSWORD';

grant anon, authenticated, service_role to authenticator;
grant all privileges on database postgres to supabase_auth_admin;
grant all privileges on database postgres to supabase_storage_admin;

create schema if not exists auth authorization supabase_auth_admin;
create schema if not exists storage authorization supabase_storage_admin;

grant usage on schema public to anon, authenticated, service_role;
grant usage on schema auth to supabase_auth_admin;
grant usage on schema storage to anon, authenticated, service_role, supabase_storage_admin;

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;
create extension if not exists vector;

create or replace function auth.uid()
returns uuid
language sql
stable
as \$\$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
\$\$;

create or replace function auth.role()
returns text
language sql
stable
as \$\$
  select nullif(current_setting('request.jwt.claim.role', true), '')::text;
\$\$;

create or replace function auth.email()
returns text
language sql
stable
as \$\$
  select nullif(current_setting('request.jwt.claim.email', true), '')::text;
\$\$;

alter default privileges in schema public grant select, insert, update, delete on tables to anon, authenticated, service_role;
alter default privileges in schema public grant usage, select on sequences to anon, authenticated, service_role;
SQL
