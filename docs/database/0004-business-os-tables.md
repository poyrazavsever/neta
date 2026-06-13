# 0004 - Business OS Tables

SQL file: `supabase/migrations/0004_add_business_os_tables.sql`

## Purpose

Adds business document and recurring cost tables used by the freelancer business layer.

## What It Creates

- `proposals`
- `contracts`
- `invoices`
- `subscriptions`

## RLS

Every table has `user_id` and row level security policies that allow users to select, insert, update, and delete only their own rows.

## Execution

Run after `0003_add_project_planning_assets.sql`.
