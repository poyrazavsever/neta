# Database Query Order

This file is the canonical order of SQL files for database setup and migration.

| Order | SQL file | Documentation | Status |
| --- | --- | --- | --- |
| 0001 | `supabase/schema.sql` | `docs/database/0001-initial-schema.md` | Baseline registered |

## How To Add The Next Query

1. Create a new SQL file under `supabase/migrations/`.
2. Use the next order number.
3. Add a documentation file under `docs/database/`.
4. Register both files in this table.
5. After running the SQL, add an entry to `query-log.md`.

