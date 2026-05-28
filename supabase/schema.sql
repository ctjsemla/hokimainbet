-- Run in Supabase SQL Editor (Settings → API for URL + anon key)

-- Oyun skorları
create table game_scores (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  username text not null,
  game text not null check (game in ('crash', 'dice', 'mines', 'plinko', 'wheel', 'keno')),
  score numeric not null default 0,
  multiplier numeric not null default 1,
  bet_amount numeric not null default 0,
  played_at timestamp with time zone default now()
);

-- Email bülten listesi
create table email_subscribers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  email text unique not null,
  subscribed_at timestamp with time zone default now()
);

-- Kullanıcı profilleri
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  demo_balance numeric default 1000,
  created_at timestamp with time zone default now()
);

-- RLS aktif et
alter table game_scores enable row level security;
alter table email_subscribers enable row level security;
alter table profiles enable row level security;

-- RLS policies
create policy "Users can insert own scores"
  on game_scores for insert
  with check (auth.uid() = user_id);

create policy "Scores visible to all"
  on game_scores for select
  using (true);

create policy "Users manage own profile"
  on profiles for all
  using (auth.uid() = id);

create policy "Users manage own subscription"
  on email_subscribers for all
  using (auth.uid() = user_id);

-- Kayıt olunca otomatik profil oluştur (1000 demo koin)
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Affiliate click tracking
create table affiliate_clicks (
  id uuid default gen_random_uuid() primary key,
  clicked_at timestamp with time zone default now(),
  bonus_type text not null,
  locale text not null,
  user_id uuid references auth.users(id) on delete set null
);

alter table affiliate_clicks enable row level security;

create policy "Anyone can insert affiliate clicks"
  on affiliate_clicks for insert
  with check (true);

-- Realtime for live leaderboard (run once; skip if already added)
-- alter publication supabase_realtime add table game_scores;
