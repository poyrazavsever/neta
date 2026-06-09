# Seed 0001 Demo Freelancer OS Data

SQL file: `supabase/seeds/0001_demo_freelancer_os_data.sql`

## Purpose

Adds demo data for local development and dashboard testing after the Freelancer OS core tables are created.

## What It Inserts

- demo clients
- demo projects and one side project
- demo tasks
- demo calendar events
- demo finance transactions
- demo daily mood/energy logs
- demo `app_settings`

## Required Manual Step

Before running the file, replace this placeholder with a real `auth.users.id`:

```sql
'00000000-0000-0000-0000-000000000000'::uuid
```

Use a user id from your Supabase Auth users table.

## Environment

This seed is intended for local and demo environments only.

Do not run it on production data.

## Execution

Run after:

1. `supabase/schema.sql`
2. `supabase/migrations/0002_add_freelancer_os_core_tables.sql`

After running it, add an entry to `docs/database/query-log.md`.

