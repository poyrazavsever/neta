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
create policy "Users can view their own client activities" on public.client_activities for select using (auth.uid() = user_id);
create policy "Users can insert their own client activities" on public.client_activities for insert with check (auth.uid() = user_id);
create policy "Users can update their own client activities" on public.client_activities for update using (auth.uid() = user_id);
create policy "Users can delete their own client activities" on public.client_activities for delete using (auth.uid() = user_id);
