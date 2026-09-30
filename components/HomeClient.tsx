'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Bell, Camera, ChevronRight, Crosshair, History, Map, Navigation, Phone, Waves } from 'lucide-react'
import type { WaterReport } from '@/types/database'

export default function HomeClient() {
  const [reports, setReports] = useState<WaterReport[]>([])
  const [location, setLocation] = useState<string>('ยังไม่ได้ตรวจตำแหน่ง')
  const [loadingLocation, setLoadingLocation] = useState(false)

  useEffect(() => {
    fetch('/api/water').then((r) => r.json()).then((json) => setReports(json.data ?? [])).catch(() => undefined)
  }, [])

  const locate = () => {
    if (!navigator.geolocation) return setLocation('อุปกรณ์ไม่รองรับ GPS')
    setLoadingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLocation(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`); setLoadingLocation(false) },
      () => { setLocation('ไม่สามารถอ่านตำแหน่งได้'); setLoadingLocation(false) },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return <main className="min-h-screen">
    <header className="bg-[#0b2d48] px-5 py-7 text-white"><div className="mx-auto max-w-4xl"><div className="flex items-center gap-3"><div className="rounded-2xl bg-white/10 p-3"><Waves size={30} /></div><div><h1 className="text-2xl font-bold">ศูนย์ช่วยเหลือน้ำท่วม</h1><p className="text-blue-100">จังหวัดชัยภูมิ</p></div></div></div></header>
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-5">
      <section className="rounded-3xl bg-[#1264b3] p-6 text-white shadow-soft"><div className="flex items-center gap-4"><div className="rounded-2xl bg-white/15 p-3"><Waves size={34} /></div><div><h2 className="text-2xl font-bold">รายงานระดับน้ำ</h2><p className="text-blue-100">บอกว่าน้ำสูงแค่ไหนตรงที่คุณอยู่ ใช้เวลาไม่ถึงนาที</p></div></div><Link href="/report" className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 font-bold text-[#1264b3]">เริ่มรายงานน้ำ</Link></section>
      <section className="rounded-2xl border bg-white p-4 shadow-sm"><div className="mb-3 flex items-center gap-2 font-bold"><Bell size={21} className="text-blue-700" />น้ำท่วมใกล้บ้านฉันไหม?</div><div className="grid gap-2 sm:grid-cols-2"><button onClick={locate} className="flex items-center justify-center gap-2 rounded-xl bg-[#1264b3] px-4 py-3 font-bold text-white"><Crosshair size={20} />{loadingLocation ? 'กำลังตรวจ...' : 'ตรวจใกล้ฉัน'}</button><Link href="/map" className="flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-bold"><Navigation size={20} />ดูบนแผนที่</Link></div><p className="mt-2 text-sm text-slate-500">{location}</p></section>
      <nav className="overflow-hidden rounded-2xl border bg-white shadow-sm"><NavItem href="/map" icon={<Map />} title="แผนที่ระดับน้ำ" text={`${reports.length} รายงานล่าสุด ความสูงพื้นที่ และจุดเสี่ยง`} /><NavItem href="/updates" icon={<History />} title="อัปเดตระดับน้ำล่าสุด" text="ดูรายงานอะไร ที่ไหน เรียงจากล่าสุด" /><NavItem href="/cctv" icon={<Camera />} title="กล้อง CCTV ชัยภูมิ" text="ภาพสดและจุดกล้องที่เปิดให้บริการ" /></nav>
      <section className="rounded-2xl border bg-white shadow-sm"><h3 className="border-b px-5 py-4 font-bold">เบอร์ฉุกเฉิน</h3><div className="flex items-center justify-between px-5 py-4"><span className="flex items-center gap-3"><Phone className="text-red-600" />หน่วยกู้ภัยฉุกเฉิน</span><a className="font-bold text-red-600" href="tel:191">191</a></div></section>
    </div>
  </main>
}

function NavItem({ href, icon, title, text }: { href: string; icon: React.ReactNode; title: string; text: string }) { return <Link href={href} className="flex items-center gap-4 border-b p-4 last:border-b-0 hover:bg-slate-50"><span className="rounded-xl bg-blue-50 p-3 text-blue-700">{icon}</span><span className="flex-1"><strong className="block">{title}</strong><small className="text-slate-500">{text}</small></span><ChevronRight className="text-slate-400" /></Link> }
