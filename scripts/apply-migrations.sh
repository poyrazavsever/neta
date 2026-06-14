#!/usr/bin/env sh

set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
PSQL_IMAGE="${NETA_PSQL_IMAGE:-postgres:16-alpine}"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required." >&2
  echo "Example:" >&2
  echo "  DATABASE_URL='postgresql://postgres:password@host:5432/postgres' sh ./scripts/apply-migrations.sh" >&2
  exit 1
fi

run_sql() {
  sql="$1"

  if command -v psql >/dev/null 2>&1; then
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -Atc "$sql"
  elif command -v docker >/dev/null 2>&1; then
    docker run --rm -i "$PSQL_IMAGE" \
      psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -Atc "$sql"
  else
    echo "Neither psql nor docker is available to run migrations." >&2
    exit 1
  fi
}

query_scalar() {
  run_sql "$1" | tail -n 1 | tr -d '[:space:]'
}

ensure_migration_table() {
  run_sql "
    create schema if not exists neta_internal;
    create table if not exists neta_internal.schema_migrations (
      version text primary key,
      file_path text not null,
      applied_at timestamp with time zone default timezone('utc'::text, now()) not null
    );
    revoke all on schema neta_internal from public;
    revoke all on all tables in schema neta_internal from public;
  " >/dev/null
}

is_migration_recorded() {
  migration_id="$1"
  result="$(query_scalar "select case when exists (select 1 from neta_internal.schema_migrations where version = '$migration_id') then 'yes' else 'no' end;")"
  [ "$result" = "yes" ]
}

record_migration() {
  migration_id="$1"
  file_path="$2"

  run_sql "
    insert into neta_internal.schema_migrations (version, file_path)
    values ('$migration_id', '$file_path')
    on conflict (version) do update set
      file_path = excluded.file_path,
      applied_at = timezone('utc'::text, now());
  " >/dev/null
}

existing_objects_cover_migration() {
  migration_id="$1"

  case "$migration_id" in
    0001_schema)
      query_scalar "select case when to_regclass('public.profiles') is not null and to_regclass('public.tasks') is not null then 'yes' else 'no' end;"
      ;;
    0002_freelancer_os_core)
      query_scalar "select case when to_regclass('public.clients') is not null and to_regclass('public.projects') is not null and to_regclass('public.calendar_events') is not null and to_regclass('public.finance_transactions') is not null and to_regclass('public.daily_logs') is not null and exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'tasks' and column_name = 'priority') then 'yes' else 'no' end;"
      ;;
    0003_project_planning_assets)
      query_scalar "select case when to_regclass('public.project_planning_sections') is not null and exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'projects' and column_name = 'cover_image_path') then 'yes' else 'no' end;"
      ;;
    0004_business_os_tables)
      query_scalar "select case when to_regclass('public.proposals') is not null and to_regclass('public.contracts') is not null and to_regclass('public.invoices') is not null and to_regclass('public.subscriptions') is not null then 'yes' else 'no' end;"
      ;;
    0005_advanced_crm)
      query_scalar "select case when to_regclass('public.client_activities') is not null and exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'clients' and column_name = 'pipeline_stage') then 'yes' else 'no' end;"
      ;;
    0006_pgvector_embeddings)
      query_scalar "select case when to_regclass('public.document_embeddings') is not null and exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'match_documents') then 'yes' else 'no' end;"
      ;;
    0007_client_portal)
      query_scalar "select case when to_regclass('public.project_revisions') is not null and exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'role') and exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'clients' and column_name = 'client_auth_id') then 'yes' else 'no' end;"
      ;;
    0008_project_progress_quota)
      query_scalar "select case when exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'projects' and column_name = 'progress_type') and exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'update_project_progress_on_task_change') then 'yes' else 'no' end;"
      ;;
    0009_first_admin_registration_lock)
      echo "no"
      ;;
    0010_internal_auth_creation)
      echo "no"
      ;;
    *)
      echo "no"
      ;;
  esac
}

run_sql_file() {
  file_path="$1"
  absolute_path="$ROOT_DIR/$file_path"

  if [ ! -f "$absolute_path" ]; then
    echo "Missing SQL file: $file_path" >&2
    exit 1
  fi

  echo "Applying $file_path"

  if command -v psql >/dev/null 2>&1; then
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$absolute_path"
  elif command -v docker >/dev/null 2>&1; then
    docker run --rm -i "$PSQL_IMAGE" \
      psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f - < "$absolute_path"
  else
    echo "Neither psql nor docker is available to run migrations." >&2
    exit 1
  fi
}

run_migration() {
  migration_id="$1"
  file_path="$2"

  if is_migration_recorded "$migration_id"; then
    echo "Skipping $file_path; migration $migration_id is already recorded."
    return
  fi

  if [ "$(existing_objects_cover_migration "$migration_id")" = "yes" ]; then
    echo "Detected existing database objects for $migration_id; recording without replay."
    record_migration "$migration_id" "$file_path"
    return
  fi

  run_sql_file "$file_path"
  record_migration "$migration_id" "$file_path"
}

reload_postgrest_schema_cache() {
  echo "Reloading PostgREST schema cache."
  run_sql "notify pgrst, 'reload schema';" >/dev/null
  sleep "${NETA_POSTGREST_RELOAD_WAIT_SECONDS:-2}"
}

ensure_migration_table

while IFS='|' read -r migration_id sql_file; do
  [ -n "$migration_id" ] || continue
  run_migration "$migration_id" "$sql_file"
done <<'SQL_FILES'
0001_schema|supabase/schema.sql
0002_freelancer_os_core|supabase/migrations/0002_add_freelancer_os_core_tables.sql
0003_project_planning_assets|supabase/migrations/0003_add_project_planning_assets.sql
0004_business_os_tables|supabase/migrations/0004_add_business_os_tables.sql
0005_advanced_crm|supabase/migrations/0005_add_advanced_crm_tables.sql
0006_pgvector_embeddings|supabase/migrations/0006_add_pgvector_and_embeddings.sql
0007_client_portal|supabase/migrations/0007_add_client_portal_tables.sql
0008_project_progress_quota|supabase/migrations/0008_add_project_progress_and_quota.sql
0009_first_admin_registration_lock|supabase/migrations/0009_lock_registration_after_first_admin.sql
0010_internal_auth_creation|supabase/migrations/0010_allow_internal_auth_user_creation.sql
SQL_FILES

reload_postgrest_schema_cache

echo "All Neta migrations were applied."
