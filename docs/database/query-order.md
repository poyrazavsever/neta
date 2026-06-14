# Database Query Order

This file is the canonical order of SQL files for database setup and migration.

| Order | SQL file | Documentation | Status |
| --- | --- | --- | --- |
| 0001 | `supabase/schema.sql` | `docs/database/0001-initial-schema.md` | Baseline registered |
| 0002 | `supabase/migrations/0002_add_freelancer_os_core_tables.sql` | `docs/database/0002-freelancer-os-core-tables.md` | Pending execution |
| 0003 | `supabase/migrations/0003_add_project_planning_assets.sql` | `docs/database/0003-project-planning-assets.md` | Pending execution |
| 0004 | `supabase/migrations/0004_add_business_os_tables.sql` | `docs/database/0004-business-os-tables.md` | Pending execution |
| 0005 | `supabase/migrations/0005_add_advanced_crm_tables.sql` | `docs/database/0005-advanced-crm-tables.md` | Pending execution |
| 0006 | `supabase/migrations/0006_add_pgvector_and_embeddings.sql` | `docs/database/0006-pgvector-and-embeddings.md` | Pending execution |
| 0007 | `supabase/migrations/0007_add_client_portal_tables.sql` | `docs/database/0007-client-portal-tables.md` | Pending execution |
| 0008 | `supabase/migrations/0008_add_project_progress_and_quota.sql` | `docs/database/0008-project-progress-and-quota.md` | Pending execution |
| 0009 | `supabase/migrations/0009_lock_registration_after_first_admin.sql` | `docs/database/0009-lock-registration-after-first-admin.md` | Pending execution |
| 0010 | `supabase/migrations/0010_allow_internal_auth_user_creation.sql` | `docs/database/0010-internal-auth-user-creation.md` | Pending execution |
| 0011 | `supabase/migrations/0011_fix_service_role_claims_and_storage_policies.sql` | `docs/database/0011-service-role-claims-and-storage-policies.md` | Pending execution |
| seed-0001 | `supabase/seeds/0001_demo_freelancer_os_data.sql` | `docs/database/seed-0001-demo-freelancer-os-data.md` | Optional demo seed, pending execution |

## How To Add The Next Query

1. Create a new SQL file under `supabase/migrations/`.
2. Use the next order number.
3. Add a documentation file under `docs/database/`.
4. Register both files in this table.
5. After running the SQL, add an entry to `query-log.md`.

## Seed Files

Seed files are optional and should live under `supabase/seeds/`.

They must also be documented and registered in this file, but they should only be run in local/demo environments unless explicitly approved.

## Applying The Ordered SQL

Use the migration helper from the repository root:

```bash
DATABASE_URL='postgresql://postgres:password@host:5432/postgres' sh ./scripts/apply-migrations.sh
```

The helper applies missing queries from `0001` through `0011` in the order listed above and records completed migrations in `neta_internal.schema_migrations`. It uses local `psql` when available, otherwise it runs `psql` through Docker. After migrations, it sends `NOTIFY pgrst, 'reload schema'` so PostgREST can see new RPC functions without a manual restart.
