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

create policy "Users can view their own embeddings" on public.document_embeddings for select using (auth.uid() = user_id);
create policy "Users can insert their own embeddings" on public.document_embeddings for insert with check (auth.uid() = user_id);
create policy "Users can update their own embeddings" on public.document_embeddings for update using (auth.uid() = user_id);
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
