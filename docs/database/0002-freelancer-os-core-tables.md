# 0002 Freelancer OS Core Tables

SQL file: `supabase/migrations/0002_add_freelancer_os_core_tables.sql`

## Purpose

Adds the database model required for the Freelancer OS MVP.

This migration keeps the existing baseline from `supabase/schema.sql` and extends it instead of replacing it. The existing `tasks` table is reused and enriched with freelancer-specific fields.

## What It Creates

- `clients`
- `projects`
- `calendar_events`
- `finance_transactions`
- `daily_logs`
- `app_settings`
- `set_updated_at()` trigger function
- updated-at triggers for the new tables
- indexes for common dashboard/report queries
- RLS policies for every new table

## What It Changes

The existing `tasks` table gets these additional columns:

- `client_id`
- `project_id`
- `priority`
- `due_at`
- `estimated_minutes`
- `actual_minutes`

This lets a task belong to a client and/or project while preserving the earlier journal/task prototype schema.

## MVP Coverage

This migration supports:

- client management
- client projects
- side projects
- task planning
- calendar planning
- income and expense tracking
- daily mood/energy logging
- app and AI provider settings

## RLS Model

Every new table has `user_id`.

Policies follow the same pattern:

- users can select their own rows
- users can insert rows only for themselves
- users can update their own rows
- users can delete their own rows

## Notes

`app_settings.api_key` exists for compatibility with the current prototype flow. For production-grade use, provider credentials should be encrypted or moved to a safer secret-management strategy.

`daily_logs` is the new MVP-oriented replacement for the earlier `journals` concept. The old `journals` table remains available until the UI migration is complete.

## Execution

Run this after `supabase/schema.sql`.

Do not add this file to `query-log.md` until it has actually been executed against a database.

