# 0001 Initial Schema

SQL file: `supabase/schema.sql`

## Purpose

This is the first registered database query file for the project. It represents the schema that existed before the Freelancer OS MVP planning work started.

## What It Creates

- `journals`
- `tasks`
- `chat_sessions`
- `chat_messages`
- `profiles`
- Row Level Security policies for the tables above
- `handle_new_user()` trigger function for profile creation
- `on_auth_user_created` trigger
- `avatars` storage bucket and related storage policies

## Current Product Fit

This schema supports the earlier MindSpace/Cognis prototype:

- mood/energy journals
- basic tasks
- chat history
- user profile storage
- avatar uploads

It does not yet fully match the Freelancer OS MVP model.

## Known Gaps For MVP

The Freelancer OS MVP still needs new schema additions for:

- `clients`
- `projects`
- `calendar_events`
- `finance_transactions`
- `daily_logs`
- `app_settings`

The existing `journals` table can either be migrated into `daily_logs` or kept as a legacy table until the UI is moved to the new model.

## Execution Notes

This file should be treated as the first baseline. If it has already been run in a Supabase project, do not rerun it blindly because some `create table` and `create policy` statements are not idempotent.

Future changes should be added as ordered migration files rather than editing this baseline after execution.

