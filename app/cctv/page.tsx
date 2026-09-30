import Link from 'next/link'
import { ArrowLeft, Camera } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase'
import type { CctvCamera } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function CctvPage() {
  const supabase = getSupabaseClient()
  const { data } = await supabase.from('cctv_cameras').select('*').eq('is_active', true).order('name')
  const cameras = (data ?? []) as CctvCamera[]
  return <main className="min-h-screen"><header className="bg-[#0b2d48] px-5 py-5 text-white"><div className="mx-auto flex max-w-4xl items-center gap-3"><Link href="/" className="rounded-xl p-2 hover:bg-white/10"><ArrowLeft /></Link><Camera /><h1 className="text-xl font-bold">กล้อง CCTV ชัยภูมิ</h1></div></header><div className="mx-auto grid max-w-4xl gap-4 px-4 py-6 sm:grid-cols-2">{cameras.map((camera) => <article key={camera.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm"><div className="flex aspect-video items-center justify-center bg-slate-100 text-slate-400">{camera.snapshot_url ? <img src={camera.snapshot_url} alt={camera.name} className="h-full w-full object-cover" /> : <Camera size={48} />}</div><div className="p-4"><h2 className="font-bold">{camera.name}</h2><p className="text-sm text-slate-500">{camera.location_name}</p>{camera.stream_url && <a href={camera.stream_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-bold text-blue-700">เปิดภาพกล้อง</a>}</div></article>)}</div></main>
}
