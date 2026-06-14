-- 0001: Initial Cognis baseline schema
-- This file is intentionally idempotent enough to be retried after a failed SQL Editor run.

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. Create journals table
create table if not exists public.journals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  mood text not null,
  energy smallint not null,
  content text not null,
  ai_tags text[] default array[]::text[],
  ai_sentiment_score numeric,
  ai_summary text,
  ai_reflection text,
  analysis_status text default 'pending'::text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create tasks table
create table if not exists public.tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  status text default 'todo'::text,
  ai_generated boolean default false,
  source_journal_id uuid references public.journals(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create chat_sessions table
create table if not exists public.chat_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create chat_messages table
create table if not exists public.chat_messages (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.chat_sessions(id) on delete cascade not null,
  role text not null,
  content text not null,
  context_journal_ids uuid[] default array[]::uuid[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  first_name text,
  last_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security)
alter table public.journals enable row level security;
alter table public.tasks enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.profiles enable row level security;

-- Journals policies
drop policy if exists "Users can view their own journals." on public.journals;
create policy "Users can view their own journals." on public.journals
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own journals." on public.journals;
create policy "Users can insert their own journals." on public.journals
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own journals." on public.journals;
create policy "Users can update their own journals." on public.journals
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own journals." on public.journals;
create policy "Users can delete their own journals." on public.journals
  for delete using (auth.uid() = user_id);

-- Tasks policies
drop policy if exists "Users can view their own tasks." on public.tasks;
create policy "Users can view their own tasks." on public.tasks
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own tasks." on public.tasks;
create policy "Users can insert their own tasks." on public.tasks
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own tasks." on public.tasks;
create policy "Users can update their own tasks." on public.tasks
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own tasks." on public.tasks;
create policy "Users can delete their own tasks." on public.tasks
  for delete using (auth.uid() = user_id);

-- Chat sessions policies
drop policy if exists "Users can view their own chat sessions." on public.chat_sessions;
create policy "Users can view their own chat sessions." on public.chat_sessions
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own chat sessions." on public.chat_sessions;
create policy "Users can insert their own chat sessions." on public.chat_sessions
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own chat sessions." on public.chat_sessions;
create policy "Users can update their own chat sessions." on public.chat_sessions
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own chat sessions." on public.chat_sessions;
create policy "Users can delete their own chat sessions." on public.chat_sessions
  for delete using (auth.uid() = user_id);

-- Chat messages policies
drop policy if exists "Users can view their own chat messages." on public.chat_messages;
create policy "Users can view their own chat messages." on public.chat_messages
  for select using (
    exists (
      select 1 from public.chat_sessions
      where chat_sessions.id = chat_messages.session_id
        and chat_sessions.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert their own chat messages." on public.chat_messages;
create policy "Users can insert their own chat messages." on public.chat_messages
  for insert with check (
    exists (
      select 1 from public.chat_sessions
      where chat_sessions.id = session_id
        and chat_sessions.user_id = auth.uid()
    )
  );

drop policy if exists "Users can update their own chat messages." on public.chat_messages;
create policy "Users can update their own chat messages." on public.chat_messages
  for update using (
    exists (
      select 1 from public.chat_sessions
      where chat_sessions.id = session_id
        and chat_sessions.user_id = auth.uid()
    )
  );

drop policy if exists "Users can delete their own chat messages." on public.chat_messages;
create policy "Users can delete their own chat messages." on public.chat_messages
  for delete using (
    exists (
      select 1 from public.chat_sessions
      where chat_sessions.id = session_id
        and chat_sessions.user_id = auth.uid()
    )
  );

-- Profiles policies
drop policy if exists "Users can view their own profile." on public.profiles;
create policy "Users can view their own profile." on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can insert their own profile." on public.profiles;
create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Users can update their own profile." on public.profiles;
create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id);

-- First admin setup guard for self-hosted installations
create or replace function public.is_first_admin_setup_available()
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.profiles
    limit 1
  );
$$;

revoke all on function public.is_first_admin_setup_available() from public;
grant execute on function public.is_first_admin_setup_available() to anon;
grant execute on function public.is_first_admin_setup_available() to authenticated;

create schema if not exists neta_internal;

create table if not exists neta_internal.internal_auth_creations (
  id uuid default uuid_generate_v4() primary key,
  email text not null,
  reason text default 'internal'::text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone default (timezone('utc'::text, now()) + interval '2 minutes') not null
);

create index if not exists internal_auth_creations_email_idx
  on neta_internal.internal_auth_creations (lower(email));

revoke all on schema neta_internal from public;
revoke all on all tables in schema neta_internal from public;

create or replace function public.request_internal_auth_creation(
  target_email text,
  target_reason text default 'internal'
)
returns void
language plpgsql
security definer
set search_path = public, neta_internal
as $$
begin
  if coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role' then
    raise exception 'Only service role can request internal auth creation.';
  end if;

  if target_email is null or btrim(target_email) = '' then
    raise exception 'target_email is required.';
  end if;

  delete from neta_internal.internal_auth_creations
  where expires_at <= timezone('utc'::text, now())
    or lower(email) = lower(btrim(target_email));

  insert into neta_internal.internal_auth_creations (email, reason)
  values (btrim(target_email), coalesce(nullif(btrim(target_reason), ''), 'internal'));
end;
$$;

revoke all on function public.request_internal_auth_creation(text, text) from public;
grant execute on function public.request_internal_auth_creation(text, text) to service_role;

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, neta_internal
as $$
declare
  allowed_internal_creation boolean := false;
begin
  delete from neta_internal.internal_auth_creations
  where lower(email) = lower(new.email)
    and expires_at > timezone('utc'::text, now())
  returning true into allowed_internal_creation;

  allowed_internal_creation := coalesce(allowed_internal_creation, false);

  if exists (select 1 from public.profiles limit 1)
    and coalesce(new.raw_app_meta_data->>'internal_created', 'false') <> 'true'
    and not allowed_internal_creation then
    raise exception 'Registration is closed. The first admin account already exists.';
  end if;

  insert into public.profiles (id, first_name, last_name, avatar_url)
  values (new.id, '', '', '')
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Trigger to automatically create profile on signup
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Setup storage bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Avatar images are publicly accessible." on storage.objects;
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload an avatar." on storage.objects;
create policy "Users can upload an avatar."
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can update their own avatar." on storage.objects;
create policy "Users can update their own avatar."
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can delete their own avatar." on storage.objects;
create policy "Users can delete their own avatar."
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
