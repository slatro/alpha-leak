create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  address text not null unique,
  wallet_name text,
  display_name text not null default 'Operator',
  avatar text not null default 'signal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  item_id text not null,
  created_at timestamptz not null default now(),
  unique(user_id, item_id)
);

create table if not exists auth_challenges (
  id uuid primary key default gen_random_uuid(),
  address text not null unique,
  nonce text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_watchlist_user_id on watchlist(user_id);
create index if not exists idx_auth_challenges_address on auth_challenges(address);
