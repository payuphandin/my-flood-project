create extension if not exists pgcrypto;

create table if not exists public.water_reports (
  id uuid primary key default gen_random_uuid(),
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  location_name text,
  depth_level text not null check (depth_level in ('normal','ankle','knee','waist','chest','unknown')),
  depth_cm integer check (depth_cm is null or depth_cm >= 0),
  trend text not null default 'stable' check (trend in ('rising','stable','falling')),
  passable boolean,
  note text,
  photo_url text,
  is_active boolean not null default true,
  confirm_count integer not null default 0 check (confirm_count >= 0),
  false_report_count integer not null default 0 check (false_report_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.water_flags (
  id uuid primary key default gen_random_uuid(),
  water_report_id uuid not null references public.water_reports(id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.water_status_updates (
  id uuid primary key default gen_random_uuid(),
  water_report_id uuid not null references public.water_reports(id) on delete cascade,
  status text not null check (status in ('confirmed','falling','resolved','false_report')),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.water_updates (
  id uuid primary key default gen_random_uuid(),
  water_report_id uuid not null references public.water_reports(id) on delete cascade,
  type text not null check (type in ('obstacle','blocked','rising','falling','road_damage','power_issue','affected_area','photo','other')),
  note text not null,
  photo_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.cctv_cameras (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location_name text not null,
  stream_url text,
  snapshot_url text,
  latitude double precision,
  longitude double precision,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists water_reports_created_at_idx on public.water_reports(created_at desc);
create index if not exists water_reports_active_idx on public.water_reports(is_active);
create index if not exists water_flags_report_idx on public.water_flags(water_report_id);
create index if not exists water_updates_report_created_idx on public.water_updates(water_report_id, created_at desc);

alter table public.water_reports enable row level security;
alter table public.water_flags enable row level security;
alter table public.water_status_updates enable row level security;
alter table public.water_updates enable row level security;
alter table public.cctv_cameras enable row level security;

create policy "public can read active water reports"
on public.water_reports for select
using (is_active = true);

create policy "public can submit water reports"
on public.water_reports for insert
to anon, authenticated
with check (true);

create policy "public can flag reports"
on public.water_flags for insert
to anon, authenticated
with check (true);

create policy "public can read active cctv"
on public.cctv_cameras for select
using (is_active = true);

create policy "public can read status updates"
on public.water_status_updates for select
using (true);

create policy "public can read water updates"
on public.water_updates for select
using (true);

create policy "public can submit water updates"
on public.water_updates for insert
to anon, authenticated
with check (true);

insert into public.cctv_cameras (name, location_name, snapshot_url)
select 'ตัวอย่างกล้อง 01', 'ตัวเมืองชัยภูมิ', null
where not exists (select 1 from public.cctv_cameras);

insert into storage.buckets (id, name, public)
values ('water-photos', 'water-photos', true)
on conflict (id) do nothing;

create policy "public can upload water photos"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'water-photos');

create policy "public can view water photos"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'water-photos');
