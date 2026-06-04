-- 0003: Add project planning sections and project visual storage
-- Run after: supabase/migrations/0002_add_freelancer_os_core_tables.sql

alter table public.projects
  add column if not exists cover_image_path text,
  add column if not exists cover_image_alt text;

create table if not exists public.project_planning_sections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  category text not null,
  title text not null,
  content text,
  metadata jsonb default '{}'::jsonb not null,
  sort_order integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'project_planning_sections_category_check') then
    alter table public.project_planning_sections
      add constraint project_planning_sections_category_check
      check (
        category in (
          'overview',
          'problem',
          'goal',
          'audience',
          'scope',
          'design_system',
          'color_palette',
          'typography',
          'assets',
          'notes'
        )
      );
  end if;
end $$;

create index if not exists project_planning_sections_user_id_idx
  on public.project_planning_sections(user_id);

create index if not exists project_planning_sections_project_id_idx
  on public.project_planning_sections(project_id);

create index if not exists project_planning_sections_category_idx
  on public.project_planning_sections(category);

alter table public.project_planning_sections enable row level security;

drop policy if exists "Users can view their own project planning sections." on public.project_planning_sections;
create policy "Users can view their own project planning sections." on public.project_planning_sections
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own project planning sections." on public.project_planning_sections;
create policy "Users can insert their own project planning sections." on public.project_planning_sections
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own project planning sections." on public.project_planning_sections;
create policy "Users can update their own project planning sections." on public.project_planning_sections
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own project planning sections." on public.project_planning_sections;
create policy "Users can delete their own project planning sections." on public.project_planning_sections
  for delete using (auth.uid() = user_id);

drop trigger if exists set_project_planning_sections_updated_at on public.project_planning_sections;
create trigger set_project_planning_sections_updated_at
  before update on public.project_planning_sections
  for each row execute procedure public.set_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-assets',
  'project-assets',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can view their own project assets." on storage.objects;
create policy "Users can view their own project assets." on storage.objects
  for select using (
    bucket_id = 'project-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can upload their own project assets." on storage.objects;
create policy "Users can upload their own project assets." on storage.objects
  for insert with check (
    bucket_id = 'project-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can update their own project assets." on storage.objects;
create policy "Users can update their own project assets." on storage.objects
  for update using (
    bucket_id = 'project-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can delete their own project assets." on storage.objects;
create policy "Users can delete their own project assets." on storage.objects
  for delete using (
    bucket_id = 'project-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
