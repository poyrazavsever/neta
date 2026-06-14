# 0010 - Internal Auth User Creation

SQL file:

`supabase/migrations/0010_allow_internal_auth_user_creation.sql`

## Purpose

Allows Neta's trusted server-side flows to create Auth users after public registration is locked.

This is required for client portal accounts. Public signup remains blocked after the first admin account, but the application can create internal users through the service role key.

## Changes

- Adds `neta_internal.internal_auth_creations`.
- Adds `public.request_internal_auth_creation(target_email, target_reason)`.
- Grants that RPC only to `service_role`.
- Updates `public.handle_new_user()` so it accepts a short-lived internal creation request.
- Reloads the PostgREST schema cache.

## Operational Notes

The application calls the RPC immediately before calling the Supabase Auth Admin API. The pending request expires after two minutes and is consumed by the Auth user trigger.
