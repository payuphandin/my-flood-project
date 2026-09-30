-- เพิ่มระบบแจ้งรายงานน้ำผิดแบบ idempotent
-- ใช้กรณีฐานข้อมูลเดิมยังไม่มีตาราง water_flags

create table if not exists public.water_flags (
  id uuid primary key default gen_random_uuid(),
  water_report_id uuid not null references public.water_reports(id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now()
);

create index if not exists water_flags_report_idx
  on public.water_flags(water_report_id);

alter table public.water_flags enable row level security;

drop policy if exists "public can flag reports" on public.water_flags;
create policy "public can flag reports"
on public.water_flags for insert
to anon, authenticated
with check (true);

-- เหตุผลของการแจ้งข้อมูลผิดจะแสดงผ่าน /api/water ซึ่งอ่านด้วย server-side secret key
-- จึงไม่จำเป็นต้องเปิด SELECT ให้ผู้ใช้โดยตรง
