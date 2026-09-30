'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { CheckCircle2, ImagePlus, Loader2, MapPin, Send } from 'lucide-react'

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { ssr: false })

export default function ReportForm() {
  const [form, setForm] = useState({ depth_level: 'ankle', depth_cm: '', trend: 'stable', passable: 'yes', note: '', location_name: '' })
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [showLocationPicker, setShowLocationPicker] = useState(false)

  const openLocationPicker = () => {
    setError('')
    setShowLocationPicker(true)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError('')
    try {
      if (!coords) throw new Error('กรุณากดปักหมุดตำแหน่งก่อนส่งรายงาน')
      let photo_url: string | null = null
      if (file) {
        const fd = new FormData(); fd.append('file', file)
        const upload = await fetch('/api/water-photo', { method: 'POST', body: fd })
        const json = await upload.json(); if (!upload.ok) throw new Error(json.error)
        photo_url = json.url
      }
      const response = await fetch('/api/water', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lat: coords.lat, lng: coords.lng, passable: form.passable === 'yes', photo_url }),
      })
      const json = await response.json(); if (!response.ok) throw new Error(json.error)
      setDone(true)
    } catch (err) { setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด') } finally { setBusy(false) }
  }

  if (done) return <div className="rounded-3xl bg-white p-8 text-center shadow-soft"><CheckCircle2 className="mx-auto mb-3 text-emerald-600" size={52} /><h2 className="text-2xl font-bold">ส่งรายงานแล้ว</h2><p className="mt-2 text-slate-500">ขอบคุณที่ช่วยแจ้งสถานการณ์น้ำในจังหวัดชัยภูมิ</p></div>

  return <>
    <form onSubmit={submit} className="space-y-5 rounded-3xl bg-white p-5 shadow-soft">
    <button type="button" onClick={openLocationPicker} className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 font-bold text-blue-700 hover:bg-blue-100">
      <MapPin size={20} />
      {coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : 'ปักหมุดตำแหน่งบนแผนที่'}
    </button>
    <label className="block"><span className="mb-2 block font-bold">ตำแหน่ง/สถานที่</span><input value={form.location_name} onChange={(e) => setForm({ ...form, location_name: e.target.value })} className="w-full rounded-xl border px-4 py-3" placeholder="เช่น ในตัวเมืองชัยภูมิ" /></label>
    <div className="grid gap-4 sm:grid-cols-2">
      <label><span className="mb-2 block font-bold">ระดับน้ำ</span><select value={form.depth_level} onChange={(e) => setForm({ ...form, depth_level: e.target.value })} className="w-full rounded-xl border px-4 py-3"><option value="normal">ปกติ</option><option value="ankle">ตาตุ่ม</option><option value="knee">เข่า</option><option value="waist">เอว</option><option value="chest">อกขึ้นไป</option></select></label>
      <label><span className="mb-2 block font-bold">ความลึกโดยประมาณ (ซม.)</span><input type="number" min="0" value={form.depth_cm} onChange={(e) => setForm({ ...form, depth_cm: e.target.value })} className="w-full rounded-xl border px-4 py-3" placeholder="เช่น 40" /></label>
      <label><span className="mb-2 block font-bold">แนวโน้ม</span><select value={form.trend} onChange={(e) => setForm({ ...form, trend: e.target.value })} className="w-full rounded-xl border px-4 py-3"><option value="rising">น้ำเพิ่มขึ้น</option><option value="stable">คงที่</option><option value="falling">น้ำลดลง</option></select></label>
      <label><span className="mb-2 block font-bold">รถผ่านได้หรือไม่</span><select value={form.passable} onChange={(e) => setForm({ ...form, passable: e.target.value })} className="w-full rounded-xl border px-4 py-3"><option value="yes">ผ่านได้</option><option value="no">ผ่านไม่ได้</option></select></label>
    </div>
    <label className="block"><span className="mb-2 block font-bold">รายละเอียดเพิ่มเติม</span><textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="min-h-28 w-full rounded-xl border px-4 py-3" placeholder="อธิบายสภาพพื้นที่เพิ่มเติม" /></label>
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed p-4"><ImagePlus /><span className="flex-1">{file ? file.name : 'แนบรูปสถานการณ์น้ำ'}</span><input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></label>
    {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1264b3] px-4 py-3 font-bold text-white disabled:opacity-60">{busy ? <Loader2 className="animate-spin" /> : <Send />}ส่งรายงาน</button>
    </form>
    {showLocationPicker && <LocationPicker value={coords} onChange={setCoords} onClose={() => setShowLocationPicker(false)} />}
  </>
}
