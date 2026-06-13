# Supabase Directory

This directory stores SQL files for the project's Supabase/PostgreSQL database.

## Current Baseline

- `schema.sql` is the first registered database SQL file.
- Its documentation is in `docs/database/0001-initial-schema.md`.
- Its order is tracked in `docs/database/query-order.md`.
- Execution history is tracked in `docs/database/query-log.md`.

## Future Changes

Future schema changes should be added under:

```text
supabase/migrations/
```

Optional local/demo data should be added under:

```text
supabase/seeds/
```

Do not overwrite already executed SQL without also creating a new ordered migration and documenting why.

## Current Ordered SQL

1. `schema.sql`
2. `migrations/0002_add_freelancer_os_core_tables.sql`
3. `migrations/0003_add_project_planning_assets.sql`
4. `migrations/0004_add_business_os_tables.sql`
5. `migrations/0005_add_advanced_crm_tables.sql`
6. `migrations/0006_add_pgvector_and_embeddings.sql`
7. `migrations/0007_add_client_portal_tables.sql`
8. `migrations/0008_add_project_progress_and_quota.sql`
9. `migrations/0009_lock_registration_after_first_admin.sql`
10. Optional local/demo data: `seeds/0001_demo_freelancer_os_data.sql`

## Apply Migrations

From the repository root:

```bash
DATABASE_URL='postgresql://postgres:password@host:5432/postgres' bash ./scripts/apply-migrations.sh
```

The script applies all required schema files in canonical order. It requires either local `psql` or Docker. If `psql` is not installed, it runs `psql` through the `postgres:16-alpine` Docker image.
