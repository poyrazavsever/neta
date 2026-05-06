-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. Create journals table
create table public.journals (
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
create table public.tasks (
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
create table public.chat_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create chat_messages table
create table public.chat_messages (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.chat_sessions(id) on delete cascade not null,
  role text not null,
  content text not null,
  context_journal_ids uuid[] default array[]::uuid[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) Policies
alter table public.journals enable row level security;
alter table public.tasks enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

-- Journals Policies
create policy "Users can view their own journals." on public.journals
  for select using (auth.uid() = user_id);
create policy "Users can insert their own journals." on public.journals
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own journals." on public.journals
  for update using (auth.uid() = user_id);
create policy "Users can delete their own journals." on public.journals
  for delete using (auth.uid() = user_id);

-- Tasks Policies
create policy "Users can view their own tasks." on public.tasks
  for select using (auth.uid() = user_id);
create policy "Users can insert their own tasks." on public.tasks
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own tasks." on public.tasks
  for update using (auth.uid() = user_id);
create policy "Users can delete their own tasks." on public.tasks
  for delete using (auth.uid() = user_id);

-- Chat Sessions Policies
create policy "Users can view their own chat sessions." on public.chat_sessions
  for select using (auth.uid() = user_id);
create policy "Users can insert their own chat sessions." on public.chat_sessions
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own chat sessions." on public.chat_sessions
  for update using (auth.uid() = user_id);
create policy "Users can delete their own chat sessions." on public.chat_sessions
  for delete using (auth.uid() = user_id);

-- Chat Messages Policies
-- Assuming users can only access messages in their own sessions
create policy "Users can view their own chat messages." on public.chat_messages
  for select using (
    exists (
      select 1 from public.chat_sessions
      where chat_sessions.id = chat_messages.session_id
      and chat_sessions.user_id = auth.uid()
    )
  );
create policy "Users can insert their own chat messages." on public.chat_messages
  for insert with check (
    exists (
      select 1 from public.chat_sessions
      where chat_sessions.id = session_id
      and chat_sessions.user_id = auth.uid()
    )
  );
create policy "Users can update their own chat messages." on public.chat_messages
  for update using (
    exists (
      select 1 from public.chat_sessions
      where chat_sessions.id = session_id
      and chat_sessions.user_id = auth.uid()
    )
  );
create policy "Users can delete their own chat messages." on public.chat_messages
  for delete using (
    exists (
      select 1 from public.chat_sessions
      where chat_sessions.id = session_id
      and chat_sessions.user_id = auth.uid()
    )
  );
