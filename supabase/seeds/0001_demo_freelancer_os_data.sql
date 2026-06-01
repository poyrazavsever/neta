-- Seed 0001: Demo Freelancer OS data
-- Run after: supabase/migrations/0002_add_freelancer_os_core_tables.sql
--
-- Before running, replace the UUID below with an existing auth.users.id.
-- This file is for local/demo environments. Do not run it on production data.

with seed_user as (
  select '00000000-0000-0000-0000-000000000000'::uuid as user_id
),
demo_clients as (
  insert into public.clients (user_id, name, company_name, email, status, notes)
  select user_id, 'Acme Studio', 'Acme Studio LLC', 'hello@acme.example', 'active', 'Primary design and web retainer client.'
  from seed_user
  union all
  select user_id, 'Northwind Labs', 'Northwind Labs', 'ops@northwind.example', 'active', 'Product strategy project with monthly milestones.'
  from seed_user
  returning id, user_id, name
),
demo_projects as (
  insert into public.projects (user_id, client_id, name, type, description, status, start_date, due_date, budget_amount, currency, progress)
  select
    c.user_id,
    c.id,
    'Acme Website Refresh',
    'client_project',
    'Marketing website refresh and conversion improvements.',
    'active',
    current_date - 14,
    current_date + 21,
    4200,
    'USD',
    45
  from demo_clients c
  where c.name = 'Acme Studio'
  union all
  select
    c.user_id,
    c.id,
    'Northwind Product Audit',
    'client_project',
    'Audit onboarding, analytics, and project roadmap.',
    'active',
    current_date - 7,
    current_date + 14,
    2800,
    'USD',
    30
  from demo_clients c
  where c.name = 'Northwind Labs'
  union all
  select
    user_id,
    null,
    'Cognis Open Source Launch',
    'side_project',
    'Prepare the self-hosted Freelancer OS MVP for public release.',
    'planning',
    current_date,
    current_date + 45,
    null,
    'USD',
    10
  from seed_user
  returning id, user_id, client_id, name
),
demo_tasks as (
  insert into public.tasks (user_id, client_id, project_id, title, description, status, priority, due_at, estimated_minutes, actual_minutes)
  select
    p.user_id,
    p.client_id,
    p.id,
    'Prepare homepage wireframe',
    'Create first-pass homepage structure for client review.',
    'todo',
    'high',
    timezone('utc'::text, now()) + interval '2 days',
    180,
    null
  from demo_projects p
  where p.name = 'Acme Website Refresh'
  union all
  select
    p.user_id,
    p.client_id,
    p.id,
    'Review onboarding analytics',
    'Summarize funnel drop-off points and quick wins.',
    'in_progress',
    'urgent',
    timezone('utc'::text, now()) + interval '1 day',
    120,
    45
  from demo_projects p
  where p.name = 'Northwind Product Audit'
  union all
  select
    p.user_id,
    p.client_id,
    p.id,
    'Write MVP installation notes',
    'Document self-host setup, env vars, and migration order.',
    'todo',
    'medium',
    timezone('utc'::text, now()) + interval '5 days',
    90,
    null
  from demo_projects p
  where p.name = 'Cognis Open Source Launch'
  returning id, user_id, client_id, project_id, title
),
demo_events as (
  insert into public.calendar_events (user_id, client_id, project_id, task_id, title, description, type, starts_at, ends_at)
  select
    t.user_id,
    t.client_id,
    t.project_id,
    t.id,
    'Client review: homepage wireframe',
    'Review initial direction with Acme.',
    'meeting',
    timezone('utc'::text, now()) + interval '3 days',
    timezone('utc'::text, now()) + interval '3 days 1 hour'
  from demo_tasks t
  where t.title = 'Prepare homepage wireframe'
  union all
  select
    t.user_id,
    t.client_id,
    t.project_id,
    t.id,
    'Deep work: analytics audit',
    'Focus block for Northwind analysis.',
    'focus',
    timezone('utc'::text, now()) + interval '1 day',
    timezone('utc'::text, now()) + interval '1 day 2 hours'
  from demo_tasks t
  where t.title = 'Review onboarding analytics'
  returning id
),
demo_finance as (
  insert into public.finance_transactions (user_id, client_id, project_id, type, amount, currency, transaction_date, category, payment_status, description)
  select
    p.user_id,
    p.client_id,
    p.id,
    'income',
    2100,
    'USD',
    current_date - 3,
    'Project deposit',
    'paid',
    'Acme Website Refresh initial payment.'
  from demo_projects p
  where p.name = 'Acme Website Refresh'
  union all
  select
    p.user_id,
    p.client_id,
    p.id,
    'income',
    2800,
    'USD',
    current_date + 10,
    'Project payment',
    'pending',
    'Northwind audit payment due.'
  from demo_projects p
  where p.name = 'Northwind Product Audit'
  union all
  select
    user_id,
    null,
    null,
    'expense',
    49,
    'USD',
    current_date,
    'Software',
    'paid',
    'Monthly tool subscription.'
  from seed_user
  returning id
),
demo_daily_logs as (
  insert into public.daily_logs (user_id, log_date, mood_score, energy_score, work_satisfaction_score, note)
  select user_id, current_date - 2, 3, 3, 3, 'Mixed admin day with some client context switching.'
  from seed_user
  union all
  select user_id, current_date - 1, 4, 5, 4, 'Strong focus block and clear project progress.'
  from seed_user
  union all
  select user_id, current_date, 4, 4, 4, 'Good planning momentum for the week.'
  from seed_user
  on conflict (user_id, log_date) do update set
    mood_score = excluded.mood_score,
    energy_score = excluded.energy_score,
    work_satisfaction_score = excluded.work_satisfaction_score,
    note = excluded.note,
    updated_at = timezone('utc'::text, now())
  returning id
)
insert into public.app_settings (user_id, timezone, currency, ai_provider, ai_model)
select user_id, 'UTC', 'USD', 'ollama', 'llama3'
from seed_user
on conflict (user_id) do update set
  timezone = excluded.timezone,
  currency = excluded.currency,
  ai_provider = excluded.ai_provider,
  ai_model = excluded.ai_model,
  updated_at = timezone('utc'::text, now());
