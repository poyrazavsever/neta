# 0011 - Service Role Claims And Storage Policies

SQL file:

`supabase/migrations/0011_fix_service_role_claims_and_storage_policies.sql`

## Purpose

Fixes service-role detection for self-hosted PostgREST deployments and allows trusted server-side storage operations to pass RLS.

PostgREST stores JWT claims in `request.jwt.claims` JSON when legacy GUCs are disabled. Earlier SQL only checked the legacy `request.jwt.claim.role` value, so service-role requests could be rejected.

## Changes

- Adds `public.neta_current_jwt_role()`.
- Updates `public.request_internal_auth_creation()` to read both modern and legacy JWT claim formats.
- Recreates avatar and project asset storage policies to allow service-role operations.
- Reloads the PostgREST schema cache.
