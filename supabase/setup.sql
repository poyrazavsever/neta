-- Neta one-shot Supabase setup SQL
-- Run this once in a fresh Supabase project after Auth and Storage schemas are available.
-- This file is generated from supabase/schema.sql and supabase/migrations/0002..0012.
-- Demo seed data is intentionally not included.


-- -----------------------------------------------------------------------------
-- Source: supabase/schema.sql
-- -----------------------------------------------------------------------------

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

create or replace function public.neta_current_jwt_role()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role', ''),
    nullif(current_setting('request.jwt.claim.role', true), ''),
    ''
  );
$$;

revoke all on function public.neta_current_jwt_role() from public;
grant execute on function public.neta_current_jwt_role() to anon;
grant execute on function public.neta_current_jwt_role() to authenticated;
grant execute on function public.neta_current_jwt_role() to service_role;

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
  if public.neta_current_jwt_role() <> 'service_role' then
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
  using (
    bucket_id = 'avatars'
    or public.neta_current_jwt_role() = 'service_role'
  );

drop policy if exists "Users can upload an avatar." on storage.objects;
create policy "Users can upload an avatar."
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (
      public.neta_current_jwt_role() = 'service_role'
      or auth.uid()::text = (storage.foldername(name))[1]
    )
  );

drop policy if exists "Users can update their own avatar." on storage.objects;
create policy "Users can update their own avatar."
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (
      public.neta_current_jwt_role() = 'service_role'
      or auth.uid()::text = (storage.foldername(name))[1]
    )
  );

drop policy if exists "Users can delete their own avatar." on storage.objects;
create policy "Users can delete their own avatar."
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (
      public.neta_current_jwt_role() = 'service_role'
      or auth.uid()::text = (storage.foldername(name))[1]
    )
  );

-- -----------------------------------------------------------------------------
-- Source: supabase/migrations/0002_add_freelancer_os_core_tables.sql
-- -----------------------------------------------------------------------------

-- 0002: Add Freelancer OS core tables
-- Run after: supabase/schema.sql

create extension if not exists "uuid-ossp";

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create table if not exists public.clients (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  company_name text,
  email text,
  phone text,
  website text,
  status text default 'active'::text not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  name text not null,
  type text default 'client_project'::text not null,
  description text,
  status text default 'planning'::text not null,
  start_date date,
  due_date date,
  budget_amount numeric(12, 2),
  currency text default 'USD'::text not null,
  progress integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.calendar_events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  title text not null,
  description text,
  type text default 'focus'::text not null,
  starts_at timestamp with time zone not null,
  ends_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.finance_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  type text not null,
  amount numeric(12, 2) not null,
  currency text default 'USD'::text not null,
  transaction_date date default current_date not null,
  category text,
  payment_status text default 'planned'::text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.daily_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  log_date date default current_date not null,
  mood_score smallint not null,
  energy_score smallint not null,
  work_satisfaction_score smallint,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, log_date)
);

create table if not exists public.app_settings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  timezone text default 'UTC'::text not null,
  currency text default 'USD'::text not null,
  ai_provider text default 'ollama'::text not null,
  ai_model text,
  api_key text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.tasks
  add column if not exists client_id uuid references public.clients(id) on delete set null,
  add column if not exists project_id uuid references public.projects(id) on delete set null,
  add column if not exists priority text default 'medium'::text not null,
  add column if not exists due_at timestamp with time zone,
  add column if not exists estimated_minutes integer,
  add column if not exists actual_minutes integer;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'clients_status_check') then
    alter table public.clients
      add constraint clients_status_check
      check (status in ('active', 'paused', 'archived'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'projects_type_check') then
    alter table public.projects
      add constraint projects_type_check
      check (type in ('client_project', 'side_project'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'projects_status_check') then
    alter table public.projects
      add constraint projects_status_check
      check (status in ('planning', 'active', 'paused', 'completed', 'cancelled'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'projects_progress_check') then
    alter table public.projects
      add constraint projects_progress_check
      check (progress >= 0 and progress <= 100);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'tasks_priority_check') then
    alter table public.tasks
      add constraint tasks_priority_check
      check (priority in ('low', 'medium', 'high', 'urgent'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'calendar_events_type_check') then
    alter table public.calendar_events
      add constraint calendar_events_type_check
      check (type in ('meeting', 'focus', 'deadline', 'personal', 'finance'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'calendar_events_time_check') then
    alter table public.calendar_events
      add constraint calendar_events_time_check
      check (ends_at is null or ends_at >= starts_at);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'finance_transactions_type_check') then
    alter table public.finance_transactions
      add constraint finance_transactions_type_check
      check (type in ('income', 'expense'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'finance_transactions_amount_check') then
    alter table public.finance_transactions
      add constraint finance_transactions_amount_check
      check (amount >= 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'finance_transactions_payment_status_check') then
    alter table public.finance_transactions
      add constraint finance_transactions_payment_status_check
      check (payment_status in ('planned', 'pending', 'paid', 'cancelled'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'daily_logs_mood_score_check') then
    alter table public.daily_logs
      add constraint daily_logs_mood_score_check
      check (mood_score between 1 and 5);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'daily_logs_energy_score_check') then
    alter table public.daily_logs
      add constraint daily_logs_energy_score_check
      check (energy_score between 1 and 5);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'daily_logs_work_satisfaction_score_check') then
    alter table public.daily_logs
      add constraint daily_logs_work_satisfaction_score_check
      check (work_satisfaction_score is null or work_satisfaction_score between 1 and 5);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'app_settings_ai_provider_check') then
    alter table public.app_settings
      add constraint app_settings_ai_provider_check
      check (ai_provider in ('ollama', 'openai', 'gemini', 'groq'));
  end if;
end $$;

create index if not exists clients_user_id_idx on public.clients(user_id);
create index if not exists clients_status_idx on public.clients(status);

create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists projects_client_id_idx on public.projects(client_id);
create index if not exists projects_status_idx on public.projects(status);
create index if not exists projects_due_date_idx on public.projects(due_date);

create index if not exists tasks_client_id_idx on public.tasks(client_id);
create index if not exists tasks_project_id_idx on public.tasks(project_id);
create index if not exists tasks_due_at_idx on public.tasks(due_at);
create index if not exists tasks_priority_idx on public.tasks(priority);

create index if not exists calendar_events_user_id_idx on public.calendar_events(user_id);
create index if not exists calendar_events_starts_at_idx on public.calendar_events(starts_at);
create index if not exists calendar_events_project_id_idx on public.calendar_events(project_id);
create index if not exists calendar_events_task_id_idx on public.calendar_events(task_id);

create index if not exists finance_transactions_user_id_idx on public.finance_transactions(user_id);
create index if not exists finance_transactions_client_id_idx on public.finance_transactions(client_id);
create index if not exists finance_transactions_project_id_idx on public.finance_transactions(project_id);
create index if not exists finance_transactions_transaction_date_idx on public.finance_transactions(transaction_date);
create index if not exists finance_transactions_payment_status_idx on public.finance_transactions(payment_status);

create index if not exists daily_logs_user_id_idx on public.daily_logs(user_id);
create index if not exists daily_logs_log_date_idx on public.daily_logs(log_date);

alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.calendar_events enable row level security;
alter table public.finance_transactions enable row level security;
alter table public.daily_logs enable row level security;
alter table public.app_settings enable row level security;

drop policy if exists "Users can view their own clients." on public.clients;
create policy "Users can view their own clients." on public.clients
  for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own clients." on public.clients;
create policy "Users can insert their own clients." on public.clients
  for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own clients." on public.clients;
create policy "Users can update their own clients." on public.clients
  for update using (auth.uid() = user_id);
drop policy if exists "Users can delete their own clients." on public.clients;
create policy "Users can delete their own clients." on public.clients
  for delete using (auth.uid() = user_id);

drop policy if exists "Users can view their own projects." on public.projects;
create policy "Users can view their own projects." on public.projects
  for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own projects." on public.projects;
create policy "Users can insert their own projects." on public.projects
  for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own projects." on public.projects;
create policy "Users can update their own projects." on public.projects
  for update using (auth.uid() = user_id);
drop policy if exists "Users can delete their own projects." on public.projects;
create policy "Users can delete their own projects." on public.projects
  for delete using (auth.uid() = user_id);

drop policy if exists "Users can view their own calendar events." on public.calendar_events;
create policy "Users can view their own calendar events." on public.calendar_events
  for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own calendar events." on public.calendar_events;
create policy "Users can insert their own calendar events." on public.calendar_events
  for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own calendar events." on public.calendar_events;
create policy "Users can update their own calendar events." on public.calendar_events
  for update using (auth.uid() = user_id);
drop policy if exists "Users can delete their own calendar events." on public.calendar_events;
create policy "Users can delete their own calendar events." on public.calendar_events
  for delete using (auth.uid() = user_id);

drop policy if exists "Users can view their own finance transactions." on public.finance_transactions;
create policy "Users can view their own finance transactions." on public.finance_transactions
  for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own finance transactions." on public.finance_transactions;
create policy "Users can insert their own finance transactions." on public.finance_transactions
  for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own finance transactions." on public.finance_transactions;
create policy "Users can update their own finance transactions." on public.finance_transactions
  for update using (auth.uid() = user_id);
drop policy if exists "Users can delete their own finance transactions." on public.finance_transactions;
create policy "Users can delete their own finance transactions." on public.finance_transactions
  for delete using (auth.uid() = user_id);

drop policy if exists "Users can view their own daily logs." on public.daily_logs;
create policy "Users can view their own daily logs." on public.daily_logs
  for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own daily logs." on public.daily_logs;
create policy "Users can insert their own daily logs." on public.daily_logs
  for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own daily logs." on public.daily_logs;
create policy "Users can update their own daily logs." on public.daily_logs
  for update using (auth.uid() = user_id);
drop policy if exists "Users can delete their own daily logs." on public.daily_logs;
create policy "Users can delete their own daily logs." on public.daily_logs
  for delete using (auth.uid() = user_id);

drop policy if exists "Users can view their own app settings." on public.app_settings;
create policy "Users can view their own app settings." on public.app_settings
  for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own app settings." on public.app_settings;
create policy "Users can insert their own app settings." on public.app_settings
  for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own app settings." on public.app_settings;
create policy "Users can update their own app settings." on public.app_settings
  for update using (auth.uid() = user_id);
drop policy if exists "Users can delete their own app settings." on public.app_settings;
create policy "Users can delete their own app settings." on public.app_settings
  for delete using (auth.uid() = user_id);

drop trigger if exists set_clients_updated_at on public.clients;
create trigger set_clients_updated_at
  before update on public.clients
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
  before update on public.projects
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_calendar_events_updated_at on public.calendar_events;
create trigger set_calendar_events_updated_at
  before update on public.calendar_events
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_finance_transactions_updated_at on public.finance_transactions;
create trigger set_finance_transactions_updated_at
  before update on public.finance_transactions
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_daily_logs_updated_at on public.daily_logs;
create trigger set_daily_logs_updated_at
  before update on public.daily_logs
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_app_settings_updated_at on public.app_settings;
create trigger set_app_settings_updated_at
  before update on public.app_settings
  for each row execute procedure public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Source: supabase/migrations/0003_add_project_planning_assets.sql
-- -----------------------------------------------------------------------------

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
    and (
      public.neta_current_jwt_role() = 'service_role'
      or auth.uid()::text = (storage.foldername(name))[1]
    )
  );

drop policy if exists "Users can upload their own project assets." on storage.objects;
create policy "Users can upload their own project assets." on storage.objects
  for insert with check (
    bucket_id = 'project-assets'
    and (
      public.neta_current_jwt_role() = 'service_role'
      or auth.uid()::text = (storage.foldername(name))[1]
    )
  );

drop policy if exists "Users can update their own project assets." on storage.objects;
create policy "Users can update their own project assets." on storage.objects
  for update using (
    bucket_id = 'project-assets'
    and (
      public.neta_current_jwt_role() = 'service_role'
      or auth.uid()::text = (storage.foldername(name))[1]
    )
  );

drop policy if exists "Users can delete their own project assets." on storage.objects;
create policy "Users can delete their own project assets." on storage.objects
  for delete using (
    bucket_id = 'project-assets'
    and (
      public.neta_current_jwt_role() = 'service_role'
      or auth.uid()::text = (storage.foldername(name))[1]
    )
  );

-- -----------------------------------------------------------------------------
-- Source: supabase/migrations/0004_add_business_os_tables.sql
-- -----------------------------------------------------------------------------

-- 0004: Faz 6 - Freelancer Business OS Tables

-- 1. Proposals
create table if not exists public.proposals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  description text,
  amount numeric(12,2) not null default 0,
  currency text default 'TRY'::text,
  status text default 'draft'::text check (status in ('draft', 'sent', 'accepted', 'rejected')),
  valid_until timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Contracts
create table if not exists public.contracts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  proposal_id uuid references public.proposals(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  title text not null,
  content text,
  status text default 'draft'::text check (status in ('draft', 'active', 'completed', 'cancelled')),
  signed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Invoices
create table if not exists public.invoices (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  invoice_number text not null,
  amount numeric(12,2) not null default 0,
  tax_rate numeric(5,2) default 0, -- percentage
  currency text default 'TRY'::text,
  status text default 'draft'::text check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  issue_date timestamp with time zone default timezone('utc'::text, now()),
  due_date timestamp with time zone,
  paid_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Subscriptions
create table if not exists public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  amount numeric(12,2) not null default 0,
  currency text default 'TRY'::text,
  billing_cycle text default 'monthly'::text check (billing_cycle in ('monthly', 'yearly', 'weekly')),
  next_billing_date timestamp with time zone,
  status text default 'active'::text check (status in ('active', 'cancelled')),
  category text, -- e.g., 'software', 'hosting', 'marketing'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.proposals enable row level security;
alter table public.contracts enable row level security;
alter table public.invoices enable row level security;
alter table public.subscriptions enable row level security;

-- Proposals RLS
drop policy if exists "Users can view their own proposals" on public.proposals;
create policy "Users can view their own proposals" on public.proposals for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own proposals" on public.proposals;
create policy "Users can insert their own proposals" on public.proposals for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own proposals" on public.proposals;
create policy "Users can update their own proposals" on public.proposals for update using (auth.uid() = user_id);
drop policy if exists "Users can delete their own proposals" on public.proposals;
create policy "Users can delete their own proposals" on public.proposals for delete using (auth.uid() = user_id);

-- Contracts RLS
drop policy if exists "Users can view their own contracts" on public.contracts;
create policy "Users can view their own contracts" on public.contracts for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own contracts" on public.contracts;
create policy "Users can insert their own contracts" on public.contracts for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own contracts" on public.contracts;
create policy "Users can update their own contracts" on public.contracts for update using (auth.uid() = user_id);
drop policy if exists "Users can delete their own contracts" on public.contracts;
create policy "Users can delete their own contracts" on public.contracts for delete using (auth.uid() = user_id);

-- Invoices RLS
drop policy if exists "Users can view their own invoices" on public.invoices;
create policy "Users can view their own invoices" on public.invoices for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own invoices" on public.invoices;
create policy "Users can insert their own invoices" on public.invoices for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own invoices" on public.invoices;
create policy "Users can update their own invoices" on public.invoices for update using (auth.uid() = user_id);
drop policy if exists "Users can delete their own invoices" on public.invoices;
create policy "Users can delete their own invoices" on public.invoices for delete using (auth.uid() = user_id);

-- Subscriptions RLS
drop policy if exists "Users can view their own subscriptions" on public.subscriptions;
create policy "Users can view their own subscriptions" on public.subscriptions for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own subscriptions" on public.subscriptions;
create policy "Users can insert their own subscriptions" on public.subscriptions for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own subscriptions" on public.subscriptions;
create policy "Users can update their own subscriptions" on public.subscriptions for update using (auth.uid() = user_id);
drop policy if exists "Users can delete their own subscriptions" on public.subscriptions;
create policy "Users can delete their own subscriptions" on public.subscriptions for delete using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- Source: supabase/migrations/0005_add_advanced_crm_tables.sql
-- -----------------------------------------------------------------------------

-- 0005: Faz 7 - Advanced CRM Tables

-- 1. Alter clients table to add CRM specific columns
alter table public.clients
add column if not exists pipeline_stage text default 'lead'::text check (pipeline_stage in ('lead', 'contacted', 'proposal_sent', 'won', 'lost')),
add column if not exists next_follow_up_date timestamp with time zone,
add column if not exists last_contact_date timestamp with time zone,
add column if not exists client_value_score numeric(5,2) default 0;

-- 2. Create client_activities table
create table if not exists public.client_activities (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  type text not null check (type in ('note', 'call', 'meeting', 'email')),
  title text not null,
  content text,
  activity_date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.client_activities enable row level security;

-- Client Activities RLS
drop policy if exists "Users can view their own client activities" on public.client_activities;
create policy "Users can view their own client activities" on public.client_activities for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own client activities" on public.client_activities;
create policy "Users can insert their own client activities" on public.client_activities for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own client activities" on public.client_activities;
create policy "Users can update their own client activities" on public.client_activities for update using (auth.uid() = user_id);
drop policy if exists "Users can delete their own client activities" on public.client_activities;
create policy "Users can delete their own client activities" on public.client_activities for delete using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- Source: supabase/migrations/0006_add_pgvector_and_embeddings.sql
-- -----------------------------------------------------------------------------

-- 0006: Faz 8 - pgvector & RAG Embeddings

-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store document embeddings for RAG
create table if not exists public.document_embeddings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  metadata jsonb, -- e.g. { "source_type": "note", "source_id": "123" }
  embedding vector(1536), -- 1536 works for OpenAI text-embedding-3-small and text-embedding-ada-002
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.document_embeddings enable row level security;

drop policy if exists "Users can view their own embeddings" on public.document_embeddings;
create policy "Users can view their own embeddings" on public.document_embeddings for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own embeddings" on public.document_embeddings;
create policy "Users can insert their own embeddings" on public.document_embeddings for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own embeddings" on public.document_embeddings;
create policy "Users can update their own embeddings" on public.document_embeddings for update using (auth.uid() = user_id);
drop policy if exists "Users can delete their own embeddings" on public.document_embeddings;
create policy "Users can delete their own embeddings" on public.document_embeddings for delete using (auth.uid() = user_id);

-- Create a function to similarity search for embeddings
create or replace function match_documents (
  query_embedding vector(1536),
  match_count int default null,
  filter_user_id uuid default null
) returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query
  select
    document_embeddings.id,
    document_embeddings.content,
    document_embeddings.metadata,
    1 - (document_embeddings.embedding <=> query_embedding) as similarity
  from document_embeddings
  where document_embeddings.user_id = filter_user_id
  order by document_embeddings.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- -----------------------------------------------------------------------------
-- Source: supabase/migrations/0007_add_client_portal_tables.sql
-- -----------------------------------------------------------------------------

-- 0007: Add Client Portal Tables and Roles
-- Run after: 0006_add_pgvector_and_embeddings.sql

-- 1. Update Profiles with Role
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'freelancer'::text CHECK (role IN ('freelancer', 'client'));

-- 2. Update Clients to link to Client Auth ID
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS client_auth_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Update Tasks to add Client Visibility
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS is_public_to_client boolean DEFAULT false;

-- 4. Create Project Revisions table
CREATE TABLE IF NOT EXISTS public.project_revisions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  requested_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to set updated_at
DROP TRIGGER IF EXISTS set_project_revisions_updated_at ON public.project_revisions;
CREATE TRIGGER set_project_revisions_updated_at
BEFORE UPDATE ON public.project_revisions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 5. Enable RLS
ALTER TABLE public.project_revisions ENABLE ROW LEVEL SECURITY;

-- 6. Add RLS Policies for Client Access

-- PROFILES
-- Clients can read their own profile
DROP POLICY IF EXISTS "Clients can view own profile" ON public.profiles;
CREATE POLICY "Clients can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- CLIENTS
-- Clients can read their own client record
DROP POLICY IF EXISTS "Clients can view own client record" ON public.clients;
CREATE POLICY "Clients can view own client record"
ON public.clients FOR SELECT
USING (client_auth_id = auth.uid());

-- PROJECTS
-- Clients can view projects where client_id matches their client record
DROP POLICY IF EXISTS "Clients can view own projects" ON public.projects;
CREATE POLICY "Clients can view own projects"
ON public.projects FOR SELECT
USING (
  client_id IN (
    SELECT id FROM public.clients WHERE client_auth_id = auth.uid()
  )
);

-- TASKS
-- Clients can view tasks linked to their projects IF is_public_to_client is true
DROP POLICY IF EXISTS "Clients can view public tasks of their projects" ON public.tasks;
CREATE POLICY "Clients can view public tasks of their projects"
ON public.tasks FOR SELECT
USING (
  is_public_to_client = true 
  AND project_id IN (
    SELECT id FROM public.projects WHERE client_id IN (
      SELECT id FROM public.clients WHERE client_auth_id = auth.uid()
    )
  )
);

-- PROJECT PLANNING SECTIONS (Milestones, Roadmap, etc.)
-- Clients can view planning sections of their projects
DROP POLICY IF EXISTS "Clients can view planning sections of their projects" ON public.project_planning_sections;
CREATE POLICY "Clients can view planning sections of their projects"
ON public.project_planning_sections FOR SELECT
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE client_id IN (
      SELECT id FROM public.clients WHERE client_auth_id = auth.uid()
    )
  )
);

-- PROJECT REVISIONS
-- Freelancers can manage all revisions for their projects
DROP POLICY IF EXISTS "Freelancers can manage revisions" ON public.project_revisions;
CREATE POLICY "Freelancers can manage revisions"
ON public.project_revisions FOR ALL
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);

-- Clients can insert revisions for their projects
DROP POLICY IF EXISTS "Clients can insert revisions" ON public.project_revisions;
CREATE POLICY "Clients can insert revisions"
ON public.project_revisions FOR INSERT
WITH CHECK (
  client_id IN (
    SELECT id FROM public.clients WHERE client_auth_id = auth.uid()
  )
  AND requested_by = auth.uid()
);

-- Clients can view their own revisions
DROP POLICY IF EXISTS "Clients can view own revisions" ON public.project_revisions;
CREATE POLICY "Clients can view own revisions"
ON public.project_revisions FOR SELECT
USING (
  client_id IN (
    SELECT id FROM public.clients WHERE client_auth_id = auth.uid()
  )
);

-- -----------------------------------------------------------------------------
-- Source: supabase/migrations/0008_add_project_progress_and_quota.sql
-- -----------------------------------------------------------------------------

-- 0008: Add Project Progress Type and Revision Quota

-- Add columns to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS progress_type text DEFAULT 'manual'::text CHECK (progress_type IN ('manual', 'auto')),
ADD COLUMN IF NOT EXISTS revision_quota integer DEFAULT 0;

-- Function to update project progress automatically if progress_type is 'auto'
CREATE OR REPLACE FUNCTION public.update_project_progress_on_task_change()
RETURNS TRIGGER AS $$
DECLARE
  v_project_id uuid;
  v_progress_type text;
  v_total_tasks integer;
  v_done_tasks integer;
  v_new_progress integer;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_project_id := OLD.project_id;
  ELSE
    v_project_id := NEW.project_id;
  END IF;

  IF v_project_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT progress_type INTO v_progress_type FROM public.projects WHERE id = v_project_id;

  IF v_progress_type = 'auto' THEN
    SELECT count(*) INTO v_total_tasks FROM public.tasks WHERE project_id = v_project_id;
    SELECT count(*) INTO v_done_tasks FROM public.tasks WHERE project_id = v_project_id AND status = 'done';

    IF v_total_tasks > 0 THEN
      v_new_progress := round((v_done_tasks::numeric / v_total_tasks::numeric) * 100);
    ELSE
      v_new_progress := 0;
    END IF;

    UPDATE public.projects SET progress = v_new_progress WHERE id = v_project_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to recalculate progress when tasks are modified
DROP TRIGGER IF EXISTS trigger_update_project_progress ON public.tasks;
CREATE TRIGGER trigger_update_project_progress
AFTER INSERT OR UPDATE OF status OR DELETE
ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_project_progress_on_task_change();

-- Trigger to recalculate progress when a project's progress_type is changed to 'auto'
CREATE OR REPLACE FUNCTION public.update_project_progress_on_type_change()
RETURNS TRIGGER AS $$
DECLARE
  v_total_tasks integer;
  v_done_tasks integer;
  v_new_progress integer;
BEGIN
  IF NEW.progress_type = 'auto' AND (OLD.progress_type IS DISTINCT FROM NEW.progress_type) THEN
    SELECT count(*) INTO v_total_tasks FROM public.tasks WHERE project_id = NEW.id;
    SELECT count(*) INTO v_done_tasks FROM public.tasks WHERE project_id = NEW.id AND status = 'done';

    IF v_total_tasks > 0 THEN
      v_new_progress := round((v_done_tasks::numeric / v_total_tasks::numeric) * 100);
    ELSE
      v_new_progress := 0;
    END IF;
    
    NEW.progress := v_new_progress;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_project_progress_type ON public.projects;
CREATE TRIGGER trigger_update_project_progress_type
BEFORE UPDATE OF progress_type
ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_project_progress_on_type_change();

-- -----------------------------------------------------------------------------
-- Source: supabase/migrations/0009_lock_registration_after_first_admin.sql
-- -----------------------------------------------------------------------------

-- 0009: Lock public registration after the first self-host admin account
-- Run after: supabase/migrations/0008_add_project_progress_and_quota.sql

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

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.profiles limit 1)
    and coalesce(new.raw_app_meta_data->>'internal_created', 'false') <> 'true' then
    raise exception 'Registration is closed. The first admin account already exists.';
  end if;

  insert into public.profiles (id, first_name, last_name, avatar_url)
  values (new.id, '', '', '')
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

notify pgrst, 'reload schema';

-- -----------------------------------------------------------------------------
-- Source: supabase/migrations/0010_allow_internal_auth_user_creation.sql
-- -----------------------------------------------------------------------------

-- 0010: Allow trusted server-side internal Auth user creation
-- Run after: supabase/migrations/0009_lock_registration_after_first_admin.sql

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

create or replace function public.neta_current_jwt_role()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role', ''),
    nullif(current_setting('request.jwt.claim.role', true), ''),
    ''
  );
$$;

revoke all on function public.neta_current_jwt_role() from public;
grant execute on function public.neta_current_jwt_role() to anon;
grant execute on function public.neta_current_jwt_role() to authenticated;
grant execute on function public.neta_current_jwt_role() to service_role;

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
  if public.neta_current_jwt_role() <> 'service_role' then
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

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

notify pgrst, 'reload schema';

-- -----------------------------------------------------------------------------
-- Source: supabase/migrations/0011_fix_service_role_claims_and_storage_policies.sql
-- -----------------------------------------------------------------------------

-- 0011: Fix service-role JWT claim handling and storage policies
-- Run after: supabase/migrations/0010_allow_internal_auth_user_creation.sql

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

create or replace function public.neta_current_jwt_role()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role', ''),
    nullif(current_setting('request.jwt.claim.role', true), ''),
    ''
  );
$$;

revoke all on function public.neta_current_jwt_role() from public;
grant execute on function public.neta_current_jwt_role() to anon;
grant execute on function public.neta_current_jwt_role() to authenticated;
grant execute on function public.neta_current_jwt_role() to service_role;

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
  if public.neta_current_jwt_role() <> 'service_role' then
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

drop policy if exists "Avatar images are publicly accessible." on storage.objects;
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using (
    bucket_id = 'avatars'
    or public.neta_current_jwt_role() = 'service_role'
  );

drop policy if exists "Users can upload an avatar." on storage.objects;
create policy "Users can upload an avatar."
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (
      public.neta_current_jwt_role() = 'service_role'
      or auth.uid()::text = (storage.foldername(name))[1]
    )
  );

drop policy if exists "Users can update their own avatar." on storage.objects;
create policy "Users can update their own avatar."
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (
      public.neta_current_jwt_role() = 'service_role'
      or auth.uid()::text = (storage.foldername(name))[1]
    )
  );

drop policy if exists "Users can delete their own avatar." on storage.objects;
create policy "Users can delete their own avatar."
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (
      public.neta_current_jwt_role() = 'service_role'
      or auth.uid()::text = (storage.foldername(name))[1]
    )
  );

drop policy if exists "Users can view their own project assets." on storage.objects;
create policy "Users can view their own project assets." on storage.objects
  for select using (
    bucket_id = 'project-assets'
    and (
      public.neta_current_jwt_role() = 'service_role'
      or auth.uid()::text = (storage.foldername(name))[1]
    )
  );

drop policy if exists "Users can upload their own project assets." on storage.objects;
create policy "Users can upload their own project assets." on storage.objects
  for insert with check (
    bucket_id = 'project-assets'
    and (
      public.neta_current_jwt_role() = 'service_role'
      or auth.uid()::text = (storage.foldername(name))[1]
    )
  );

drop policy if exists "Users can update their own project assets." on storage.objects;
create policy "Users can update their own project assets." on storage.objects
  for update using (
    bucket_id = 'project-assets'
    and (
      public.neta_current_jwt_role() = 'service_role'
      or auth.uid()::text = (storage.foldername(name))[1]
    )
  );

drop policy if exists "Users can delete their own project assets." on storage.objects;
create policy "Users can delete their own project assets." on storage.objects
  for delete using (
    bucket_id = 'project-assets'
    and (
      public.neta_current_jwt_role() = 'service_role'
      or auth.uid()::text = (storage.foldername(name))[1]
    )
  );

-- -----------------------------------------------------------------------------
-- Source: supabase/migrations/0012_add_analytics_rpcs.sql
-- -----------------------------------------------------------------------------

-- 0012: Dashboard & Analytics aggregate RPC functions
-- These functions run aggregation queries inside PostgreSQL so the frontend
-- receives pre-computed JSON instead of raw rows. This significantly reduces
-- network payload and eliminates client-side reduce/filter overhead.

CREATE OR REPLACE FUNCTION public.get_dashboard_metrics(
  p_start_date TIMESTAMP WITH TIME ZONE,
  p_end_date TIMESTAMP WITH TIME ZONE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_income NUMERIC;
  v_expense NUMERIC;
  v_net_profit NUMERIC;
  v_active_projects INT;
  v_completed_tasks INT;
  v_avg_mood NUMERIC;
  v_finance_trend JSONB;
  v_mood_trend JSONB;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Net Profit
  SELECT COALESCE(SUM(amount), 0) INTO v_income
  FROM finance_transactions
  WHERE user_id = v_user_id AND type = 'income'
    AND transaction_date >= p_start_date::date AND transaction_date <= p_end_date::date;

  SELECT COALESCE(SUM(amount), 0) INTO v_expense
  FROM finance_transactions
  WHERE user_id = v_user_id AND type = 'expense'
    AND transaction_date >= p_start_date::date AND transaction_date <= p_end_date::date;

  v_net_profit := v_income - v_expense;

  -- 2. Active Projects
  SELECT COUNT(*) INTO v_active_projects
  FROM projects
  WHERE user_id = v_user_id AND status = 'active';

  -- 3. Completed Tasks
  SELECT COUNT(*) INTO v_completed_tasks
  FROM tasks
  WHERE user_id = v_user_id AND status = 'done'
    AND COALESCE(updated_at, created_at) >= p_start_date AND COALESCE(updated_at, created_at) <= p_end_date;

  -- 4. Average Mood
  SELECT COALESCE(ROUND(AVG(mood_score)::numeric, 1), 0) INTO v_avg_mood
  FROM daily_logs
  WHERE user_id = v_user_id
    AND log_date >= p_start_date::date AND log_date <= p_end_date::date;

  -- 5. Finance Trend (group by date)
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'date', t.t_date,
      'income', t.inc,
      'expense', t.exp
    )
  ), '[]'::jsonb) INTO v_finance_trend
  FROM (
    SELECT
      transaction_date AS t_date,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS inc,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS exp
    FROM finance_transactions
    WHERE user_id = v_user_id
      AND transaction_date >= p_start_date::date AND transaction_date <= p_end_date::date
    GROUP BY transaction_date
    ORDER BY transaction_date ASC
  ) t;

  -- 6. Mood Trend
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'date', log_date,
      'mood', mood_score,
      'energy', energy_score
    )
  ), '[]'::jsonb) INTO v_mood_trend
  FROM (
    SELECT log_date, mood_score, energy_score
    FROM daily_logs
    WHERE user_id = v_user_id
      AND log_date >= p_start_date::date AND log_date <= p_end_date::date
    ORDER BY log_date ASC
  ) m;

  RETURN jsonb_build_object(
    'netProfit', v_net_profit,
    'activeProjectsCount', v_active_projects,
    'completedTasksCount', v_completed_tasks,
    'avgMood', v_avg_mood::text,
    'financeTrend', v_finance_trend,
    'moodTrend', v_mood_trend
  );
END;
$$;


CREATE OR REPLACE FUNCTION public.get_analytics_metrics(
  p_start_date TIMESTAMP WITH TIME ZONE,
  p_end_date TIMESTAMP WITH TIME ZONE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_project_income JSONB;
  v_completed_tasks INT;
  v_active_tasks INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Project Income Data
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'name', t.p_name,
      'value', t.total_amount
    )
  ), '[]'::jsonb) INTO v_project_income
  FROM (
    SELECT
      COALESCE(p.name, 'Bilinmeyen') AS p_name,
      SUM(f.amount) AS total_amount
    FROM finance_transactions f
    LEFT JOIN projects p ON f.project_id = p.id
    WHERE f.user_id = v_user_id AND f.type = 'income'
      AND f.transaction_date >= p_start_date::date AND f.transaction_date <= p_end_date::date
    GROUP BY p.name
    ORDER BY total_amount DESC
  ) t;

  -- 2. Task completion stats
  SELECT COUNT(*) INTO v_completed_tasks
  FROM tasks
  WHERE user_id = v_user_id AND status = 'done'
    AND COALESCE(due_at, created_at) >= p_start_date AND COALESCE(due_at, created_at) <= p_end_date;

  SELECT COUNT(*) INTO v_active_tasks
  FROM tasks
  WHERE user_id = v_user_id AND status != 'done' AND status != 'cancelled'
    AND COALESCE(due_at, created_at) >= p_start_date AND COALESCE(due_at, created_at) <= p_end_date;

  RETURN jsonb_build_object(
    'projectIncomeData', v_project_income,
    'completedTasks', v_completed_tasks,
    'activeTasks', v_active_tasks
  );
END;
$$;

notify pgrst, 'reload schema';
