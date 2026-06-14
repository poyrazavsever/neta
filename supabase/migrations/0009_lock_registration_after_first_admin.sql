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
