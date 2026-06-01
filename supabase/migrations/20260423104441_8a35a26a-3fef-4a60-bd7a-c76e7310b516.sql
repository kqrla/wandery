
create table public.locations (
  id bigint generated always as identity primary key,
  name text not null,
  city text not null,
  lat double precision not null,
  lng double precision not null,
  type text not null,
  capabilities jsonb not null default '[]'::jsonb,
  membership_info text default '',
  source_url text default '',
  description text default '',
  created_at timestamptz not null default now()
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  location_name text not null,
  suggested_change text not null,
  source_url text,
  notes text,
  city text,
  address text,
  status text not null default 'pending',
  submitter_email text
);

alter table public.locations enable row level security;
alter table public.submissions enable row level security;

create policy "public read locations" on public.locations for select using (true);
create policy "public insert submissions" on public.submissions for insert with check (true);
create policy "public read submissions" on public.submissions for select using (true);
create policy "public update submissions" on public.submissions for update using (true);

create index locations_city_idx on public.locations (city);
create index submissions_status_idx on public.submissions (status);
