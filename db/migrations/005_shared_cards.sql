create extension if not exists "pgcrypto";

create table if not exists public.shared_cards (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  child_id uuid,
  med_id uuid,
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_by uuid references auth.users(id)
);

create index if not exists shared_cards_token_idx on public.shared_cards (token);
create index if not exists shared_cards_expires_at_idx on public.shared_cards (expires_at);

alter table public.shared_cards enable row level security;

create policy "public_read_non_expired_shared_cards"
  on public.shared_cards
  for select
  using (expires_at > now());

create policy "insert_shared_cards_authenticated"
  on public.shared_cards
  for insert
  with check (auth.role() = 'authenticated' and created_by = auth.uid());
