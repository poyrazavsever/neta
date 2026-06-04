# 0003 - Project Planning Assets

SQL file: `supabase/migrations/0003_add_project_planning_assets.sql`

## Purpose

This migration extends project management beyond task tracking.

It adds:

- Project cover image fields on `projects`
- A private Supabase Storage bucket for uploaded project images
- A structured `project_planning_sections` table for project planning categories

## Project Image Fields

The `projects` table receives:

- `cover_image_path`: path of the uploaded file in the `project-assets` bucket
- `cover_image_alt`: optional alt text for the cover image

Images are uploaded from the user's computer, not saved as external image links.

## Storage Bucket

Bucket:

- `project-assets`

Configuration:

- Private bucket
- Max file size: 5 MB
- Allowed MIME types:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `image/gif`

Storage object paths must start with the authenticated user id:

```txt
<user_id>/projects/<project_id>/<file_name>
```

This keeps Storage RLS simple and user-scoped.

## Planning Sections

Table:

- `project_planning_sections`

Core fields:

- `user_id`
- `project_id`
- `category`
- `title`
- `content`
- `metadata`
- `sort_order`

Allowed categories:

- `overview`
- `problem`
- `goal`
- `audience`
- `scope`
- `design_system`
- `color_palette`
- `typography`
- `assets`
- `notes`

## RLS

RLS is enabled for `project_planning_sections`.

Users can only select, insert, update, and delete their own planning sections.

Storage policies allow users to select, upload, update, and delete only files under their own user id folder inside `project-assets`.

## Execution

Run after:

1. `supabase/schema.sql`
2. `supabase/migrations/0002_add_freelancer_os_core_tables.sql`

After running this SQL in Supabase, add an execution record to `docs/database/query-log.md`.
