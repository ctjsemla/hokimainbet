create table if not exists public.coin_daily_streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  next_day integer not null default 1 check (next_day >= 1 and next_day <= 9),
  last_claimed_at timestamptz,
  total_claims integer not null default 0
);

alter table public.coin_daily_streaks enable row level security;

create policy "Users can read own daily streak"
  on public.coin_daily_streaks for select
  using (auth.uid() = user_id);

create policy "Users can insert own daily streak"
  on public.coin_daily_streaks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own daily streak"
  on public.coin_daily_streaks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
