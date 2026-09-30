-- เพิ่มระบบอัปเดตสถานการณ์ในจุดน้ำท่วมเดิม
create table if not exists public.water_updates (
  id uuid primary key default gen_random_uuid(),
  water_report_id uuid not null references public.water_reports(id) on delete cascade,
  type text not null check (type in ('obstacle','blocked','rising','falling','road_damage','power_issue','affected_area','photo','other')),
  note text not null,
  photo_url text,
  created_at timestamptz not null default now()
);

create index if not exists water_updates_report_created_idx
  on public.water_updates(water_report_id, created_at desc);

alter table public.water_updates enable row level security;

drop policy if exists "public can read water updates" on public.water_updates;
create policy "public can read water updates"
on public.water_updates for select
using (true);

drop policy if exists "public can submit water updates" on public.water_updates;
create policy "public can submit water updates"
on public.water_updates for insert
to anon, authenticated
with check (true);
