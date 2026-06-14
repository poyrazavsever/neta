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
