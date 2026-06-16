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
