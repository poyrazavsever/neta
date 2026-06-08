# 0009 - Lock Registration After First Admin

SQL file:

`supabase/migrations/0009_lock_registration_after_first_admin.sql`

## Purpose

Adds the first-time setup guard for self-hosted installations.

The `/register` page is only available while the system has no profile record. After the first account creates a profile, public registration is closed.

## Changes

- Adds `public.is_first_admin_setup_available()`.
- Grants the function to `anon` and `authenticated` roles so the app can check setup state safely without bypassing RLS manually.
- Replaces `public.handle_new_user()` so direct public Supabase Auth signup attempts are also rejected after the first profile exists.
- Allows service-role/admin-created users when `raw_app_meta_data.internal_created` is `true`, so future invite/client-portal flows can still create accounts intentionally.

## Behavior

1. Fresh install has no `public.profiles` rows.
2. `/register` stays open.
3. The first signup creates an auth user and the trigger creates the first profile.
4. The setup function starts returning `false`.
5. `/register` redirects to `/login`.
6. Further public signup attempts fail at the database trigger level.
7. Admin-created internal users can still be allowed by service-role flows that set `app_metadata.internal_created = true`.

## Notes

- This is intended for the MVP single-admin self-host model.
- If multi-user, client portal accounts, invites, or team members are re-enabled later, keep them behind service-role/admin-created flows instead of public signup.
- Do not add this SQL file to `query-log.md` until it has actually been run in the target Supabase environment.
