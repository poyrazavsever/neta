# 0006 - pgvector And Embeddings

SQL file: `supabase/migrations/0006_add_pgvector_and_embeddings.sql`

## Purpose

Adds vector storage for future retrieval augmented generation features.

## What It Creates

- `vector` extension
- `document_embeddings`
- `match_documents()`

## RLS

Embeddings are scoped by `user_id`; users can manage only their own embedding rows.

## Notes

The migration expects the target Postgres/Supabase environment to support the `vector` extension.

## Execution

Run after `0005_add_advanced_crm_tables.sql`.
