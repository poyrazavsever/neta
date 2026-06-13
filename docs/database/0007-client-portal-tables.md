# 0007 - Client Portal Tables

SQL file: `supabase/migrations/0007_add_client_portal_tables.sql`

## Purpose

Adds client portal access and revision request support.

## What It Changes

- Adds `profiles.role`
- Adds `clients.client_auth_id`
- Adds `tasks.is_public_to_client`

## What It Creates

- `project_revisions`

## RLS

Freelancers manage revisions for their own projects. Clients can view their linked client record, related projects, public project tasks, project planning sections, and their own revision requests.

## Execution

Run after `0006_add_pgvector_and_embeddings.sql`.
