import Link from 'next/link'
import { ArrowLeft, Clock3, Waves } from 'lucide-react'
import type { WaterReport } from '@/types/database'
import { getSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function UpdatesPage() {
  const supabase = getSupabaseClient()
  const { data } = await supabase.from('water_reports').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(50)
  const reports = (data ?? []) as WaterReport[]
  return <main className="min-h-screen"><header className="bg-[#0b2d48] px-5 py-5 text-white"><div className="mx-auto flex max-w-3xl items-center gap-3"><Link href="/" className="rounded-xl p-2 hover:bg-white/10"><ArrowLeft /></Link><Clock3 /><h1 className="text-xl font-bold">อัปเดตระดับน้ำล่าสุด</h1></div></header><div className="mx-auto max-w-3xl space-y-3 px-4 py-6">{reports.length === 0 ? <div className="rounded-2xl bg-white p-8 text-center text-slate-500">ยังไม่มีรายงาน</div> : reports.map((r) => <article key={r.id} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex gap-3"><div className="rounded-xl bg-blue-50 p-3 text-blue-700"><Waves /></div><div className="flex-1"><div className="flex justify-between gap-3"><h2 className="font-bold">{r.location_name || 'ไม่ระบุสถานที่'}</h2><time className="text-xs text-slate-400">{new Date(r.created_at).toLocaleString('th-TH')}</time></div><p className="mt-1 text-sm text-slate-600">ระดับน้ำ {depth(r.depth_level)} · {trend(r.trend)} · รถ {r.passable ? 'ผ่านได้' : 'ผ่านไม่ได้'}</p>{r.note && <p className="mt-2 text-sm">{r.note}</p>}</div></div></article>)}</div></main>
}
function depth(v: WaterReport['depth_level']) { return ({ normal: 'ปกติ', ankle: 'ตาตุ่ม', knee: 'เข่า', waist: 'เอว', chest: 'อกขึ้นไป', unknown: 'ไม่ระบุ' })[v] }
function trend(v: WaterReport['trend']) { return ({ rising: 'น้ำเพิ่มขึ้น', stable: 'น้ำคงที่', falling: 'น้ำลดลง' })[v] }
