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

Do not overwrite already executed SQL without also creating a new ordered migration and documenting why.

