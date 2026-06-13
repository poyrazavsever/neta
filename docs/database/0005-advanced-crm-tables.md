# 0005 - Advanced CRM Tables

SQL file: `supabase/migrations/0005_add_advanced_crm_tables.sql`

## Purpose

Extends client management with pipeline and activity tracking fields.

## What It Changes

The `clients` table receives:

- `pipeline_stage`
- `next_follow_up_date`
- `last_contact_date`
- `client_value_score`

## What It Creates

- `client_activities`

## RLS

`client_activities` is user-scoped through `user_id` and has select, insert, update, and delete policies for the owning user.

## Execution

Run after `0004_add_business_os_tables.sql`.
