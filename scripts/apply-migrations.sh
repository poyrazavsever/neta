#!/usr/bin/env sh

set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required." >&2
  echo "Example:" >&2
  echo "  DATABASE_URL='postgresql://postgres:password@host:5432/postgres' sh ./scripts/apply-migrations.sh" >&2
  exit 1
fi

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
    docker run --rm -i postgres:16-alpine \
      psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f - < "$absolute_path"
  else
    echo "Neither psql nor docker is available to run migrations." >&2
    exit 1
  fi
}

while IFS= read -r sql_file; do
  [ -n "$sql_file" ] || continue
  run_sql_file "$sql_file"
done <<'SQL_FILES'
supabase/schema.sql
supabase/migrations/0002_add_freelancer_os_core_tables.sql
supabase/migrations/0003_add_project_planning_assets.sql
supabase/migrations/0004_add_business_os_tables.sql
supabase/migrations/0005_add_advanced_crm_tables.sql
supabase/migrations/0006_add_pgvector_and_embeddings.sql
supabase/migrations/0007_add_client_portal_tables.sql
supabase/migrations/0008_add_project_progress_and_quota.sql
supabase/migrations/0009_lock_registration_after_first_admin.sql
SQL_FILES

echo "All Neta migrations were applied."
