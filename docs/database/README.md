# Database Change Process

This directory records every database change that should be run against Supabase/PostgreSQL.

The project currently starts with `supabase/schema.sql` as the first database query file. Future database changes must be added as separate SQL files and registered here before they are run.

## Rules

1. Every SQL change must have a stable order number.
2. Every SQL file must be listed in `query-order.md`.
3. Every executed query must be recorded in `query-log.md`.
4. Every meaningful schema addition must have a short documentation file under this directory.
5. Do not edit an already executed SQL file silently. Add a new ordered SQL file instead.

## Current Files

- `supabase/schema.sql`: Initial legacy schema. It creates the current auth/profile, journal, task, chat, and avatar storage structure.
- `docs/database/0001-initial-schema.md`: Explanation for the initial schema.
- `docs/database/query-order.md`: Canonical order of SQL files.
- `docs/database/query-log.md`: Manual execution log for SQL files that were run against an environment.

## Next Migration Naming

Use this pattern for future SQL files:

```text
supabase/migrations/0002_short_description.sql
```

Example:

```text
supabase/migrations/0002_add_freelancer_os_core_tables.sql
```

