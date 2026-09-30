create table if not exists public.sos_requests (
  id uuid primary key default gen_random_uuid(),
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  detail text,
  status text not null default 'pending' check (status in ('pending','accepted','resolved','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sos_requests_created_at_idx on public.sos_requests(created_at desc);
create index if not exists sos_requests_status_idx on public.sos_requests(status);

alter table public.sos_requests enable row level security;

create policy "public can submit sos requests"
on public.sos_requests for insert
to anon, authenticated
with check (true);

create policy "public can read own-compatible sos requests"
on public.sos_requests for select
to anon, authenticated
using (true);
