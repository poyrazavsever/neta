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

notify pgrst, 'reload schema';
