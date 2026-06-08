# Database Query Order

This file is the canonical order of SQL files for database setup and migration.

| Order | SQL file | Documentation | Status |
| --- | --- | --- | --- |
| 0001 | `supabase/schema.sql` | `docs/database/0001-initial-schema.md` | Baseline registered |
| 0002 | `supabase/migrations/0002_add_freelancer_os_core_tables.sql` | `docs/database/0002-freelancer-os-core-tables.md` | Pending execution |
| 0003 | `supabase/migrations/0003_add_project_planning_assets.sql` | `docs/database/0003-project-planning-assets.md` | Pending execution |
| 0009 | `supabase/migrations/0009_lock_registration_after_first_admin.sql` | `docs/database/0009-lock-registration-after-first-admin.md` | Pending execution |
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
