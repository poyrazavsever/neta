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
