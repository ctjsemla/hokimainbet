create table if not exists public.coin_reward_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reward_window text not null check (reward_window in ('ten_min', 'hourly', 'daily', 'weekly')),
  period_key text not null,
  amount numeric not null default 0,
  claimed_at timestamptz not null default timezone('utc', now()),
  unique (user_id, reward_window, period_key)
);

create table if not exists public.coin_wheel_spins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prize_id text not null,
  prize_label text not null,
  prize_type text not null check (prize_type in ('coins', 'item')),
  coin_amount numeric not null default 0,
  spun_at timestamptz not null default timezone('utc', now())
);

create index if not exists coin_reward_claims_user_claimed_idx
  on public.coin_reward_claims(user_id, claimed_at desc);

create index if not exists coin_wheel_spins_user_spun_idx
  on public.coin_wheel_spins(user_id, spun_at desc);

alter table public.coin_reward_claims enable row level security;
alter table public.coin_wheel_spins enable row level security;

create policy "Users can read own coin reward claims"
  on public.coin_reward_claims for select
  using (auth.uid() = user_id);

create policy "Users can insert own coin reward claims"
  on public.coin_reward_claims for insert
  with check (auth.uid() = user_id);

create policy "Users can read own wheel spins"
  on public.coin_wheel_spins for select
  using (auth.uid() = user_id);

create policy "Users can insert own wheel spins"
  on public.coin_wheel_spins for insert
  with check (auth.uid() = user_id);
