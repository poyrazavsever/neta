# 0008 - Project Progress And Quota

SQL file: `supabase/migrations/0008_add_project_progress_and_quota.sql`

## Purpose

Adds project progress mode and revision quota support.

## What It Changes

The `projects` table receives:

- `progress_type`
- `revision_quota`

## What It Creates

- `update_project_progress_on_task_change()`
- `trigger_update_project_progress`
- `update_project_progress_on_type_change()`
- `trigger_update_project_progress_type`

## Notes

Automatic progress mode calculates progress from tasks with status `done`.

## Execution

Run after `0007_add_client_portal_tables.sql`.
