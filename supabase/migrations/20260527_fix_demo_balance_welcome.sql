-- Welcome demo balance: default 1000 + new-user trigger
-- Run in Supabase SQL Editor if not applied via CLI.

alter table public.profiles
  alter column demo_balance set default 1000;

update public.profiles
set demo_balance = 1000
where demo_balance is null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, demo_balance)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'username',
      'user_' || substr(new.id::text, 1, 8)
    ),
    1000
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
