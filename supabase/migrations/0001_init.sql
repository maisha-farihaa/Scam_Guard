-- Scam Shield database schema
-- Run this in the Supabase SQL editor, or via `supabase db push`

-- checks: history of messages/links each user has scanned
create table if not exists public.checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  input_text text not null,
  risk_level text not null check (risk_level in ('red', 'yellow', 'green')),
  risk_score int not null,
  reasons jsonb not null default '[]',
  checked_at timestamptz not null default now()
);

alter table public.checks enable row level security;

create policy "Users can view their own checks"
  on public.checks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own checks"
  on public.checks for insert
  with check (auth.uid() = user_id);

-- reports: community-submitted scam messages
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  message_text text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_at timestamptz not null default now()
);

alter table public.reports enable row level security;

create policy "Users can view their own reports"
  on public.reports for select
  using (auth.uid() = user_id);

create policy "Users can submit reports"
  on public.reports for insert
  with check (auth.uid() = user_id);

create index if not exists checks_user_id_idx on public.checks(user_id);
create index if not exists reports_user_id_idx on public.reports(user_id);
