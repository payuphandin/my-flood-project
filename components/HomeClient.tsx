'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Bell, Camera, CheckCircle2, ChevronRight, Crosshair, History, Map, Navigation, Phone, Waves, X } from 'lucide-react'
import type { WaterReport } from '@/types/database'

const FLOOD_CHECK_RADIUS_KM = 5

export default function HomeClient() {
  const [reports, setReports] = useState<WaterReport[]>([])
  const [location, setLocation] = useState<string>('ยังไม่ได้ตรวจตำแหน่ง')
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [checkResult, setCheckResult] = useState<{
    lat: number
    lng: number
    nearby: Array<WaterReport & { distanceKm: number }>
  } | null>(null)

  useEffect(() => {
    fetch('/api/water')
      .then((r) => r.json())
      .then((json) => setReports(json.data ?? []))
      .catch(() => undefined)
  }, [])

  const activeFloodReports = useMemo(
    () => reports.filter((report) => report.is_active && report.depth_level !== 'normal'),
    [reports],
  )

  const locate = () => {
    if (!navigator.geolocation) {
      setLocation('อุปกรณ์ไม่รองรับ GPS')
      return
    }

    setLoadingLocation(true)
    setCheckResult(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        const nearby = activeFloodReports
          .map((report) => ({ ...report, distanceKm: distanceKm(lat, lng, report.lat, report.lng) }))
          .filter((report) => report.distanceKm <= FLOOD_CHECK_RADIUS_KM)
          .sort((a, b) => a.distanceKm - b.distanceKm)

        setLocation(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
        setCheckResult({ lat, lng, nearby })
        setLoadingLocation(false)
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? 'กรุณาอนุญาตการเข้าถึงตำแหน่ง เพื่อใช้ฟังก์ชันตรวจน้ำท่วมใกล้ฉัน'
            : error.code === error.TIMEOUT
              ? 'หมดเวลาในการอ่านตำแหน่ง กรุณาลองใหม่อีกครั้ง'
              : 'ไม่สามารถอ่านตำแหน่งได้ กรุณาลองใหม่อีกครั้ง'
        setLocation(message)
        setLoadingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    )
  }

  return <main className="min-h-screen">
    <header className="bg-[#0b2d48] px-5 py-7 text-white"><div className="mx-auto max-w-4xl"><div className="flex items-center gap-3"><div className="rounded-2xl bg-white/10 p-3"><Waves size={30} /></div><div><h1 className="text-2xl font-bold">ศูนย์ช่วยเหลือน้ำท่วม</h1><p className="text-blue-100">จังหวัดชัยภูมิ</p></div></div></div></header>
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-5">
      <section className="rounded-3xl bg-[#1264b3] p-6 text-white shadow-soft"><div className="flex items-center gap-4"><div className="rounded-2xl bg-white/15 p-3"><Waves size={34} /></div><div><h2 className="text-2xl font-bold">รายงานระดับน้ำ</h2><p className="text-blue-100">บอกว่าน้ำสูงแค่ไหนตรงที่คุณอยู่ ใช้เวลาไม่ถึงนาที</p></div></div><Link href="/report" className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 font-bold text-[#1264b3]">เริ่มรายงานน้ำ</Link></section>

      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 font-bold"><Bell size={21} className="text-blue-700" />น้ำท่วมใกล้บ้านฉันไหม?</div>
        <div className="grid gap-2 sm:grid-cols-2">
          <button onClick={locate} disabled={loadingLocation} className="flex items-center justify-center gap-2 rounded-xl bg-[#1264b3] px-4 py-3 font-bold text-white disabled:cursor-wait disabled:opacity-70">
            <Crosshair size={20} />{loadingLocation ? 'กำลังตรวจตำแหน่ง...' : 'ตรวจน้ำท่วมใกล้ฉัน'}
          </button>
          <Link href="/map" className="flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-bold"><Navigation size={20} />ดูบนแผนที่</Link>
        </div>
        <p className="mt-2 text-sm text-slate-500">{location}</p>
        <p className="mt-1 text-xs text-slate-400">ตรวจจากรายงานน้ำที่ใช้งานอยู่ภายในรัศมี {FLOOD_CHECK_RADIUS_KM} กม.</p>
      </section>

      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between"><div><h3 className="font-bold">สถานการณ์จากรายงานในระบบ</h3><p className="text-xs text-slate-500">ข้อมูลปัจจุบันจากรายงานที่ยังใช้งานอยู่</p></div><Link href="/updates" className="text-sm font-bold text-blue-700">ดูทั้งหมด</Link></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="รายงานทั้งหมด" value={reports.length} />
          <Stat label="จุดมีน้ำ" value={activeFloodReports.length} danger={activeFloodReports.length > 0} />
          <Stat label="รถผ่านไม่ได้" value={activeFloodReports.filter((r) => r.passable === false).length} danger />
          <Stat label="น้ำกำลังเพิ่ม" value={activeFloodReports.filter((r) => r.trend === 'rising').length} danger={activeFloodReports.some((r) => r.trend === 'rising')} />
        </div>
      </section>

      <nav className="overflow-hidden rounded-2xl border bg-white shadow-sm"><NavItem href="/map" icon={<Map />} title="แผนที่ระดับน้ำ" text={`${reports.length} รายงานล่าสุด ระดับน้ำ และจุด CCTV`} /><NavItem href="/updates" icon={<History />} title="อัปเดตระดับน้ำล่าสุด" text="ดูรายงานอะไร ที่ไหน เรียงจากล่าสุด" /><NavItem href="/cctv" icon={<Camera />} title="กล้อง CCTV ชัยภูมิ" text="ภาพและจุดกล้องที่เปิดให้บริการ" /></nav>
      <section className="rounded-2xl border bg-white shadow-sm"><h3 className="border-b px-5 py-4 font-bold">เบอร์ฉุกเฉิน</h3><div className="flex items-center justify-between px-5 py-4"><span className="flex items-center gap-3"><Phone className="text-red-600" />หน่วยกู้ภัยฉุกเฉิน</span><a className="font-bold text-red-600" href="tel:191">191</a></div></section>
    </div>

    {checkResult && <FloodCheckModal result={checkResult} onClose={() => setCheckResult(null)} />}
  </main>
}

function FloodCheckModal({ result, onClose }: { result: { lat: number; lng: number; nearby: Array<WaterReport & { distanceKm: number }> }; onClose: () => void }) {
  const found = result.nearby.length > 0
  const nearest = result.nearby[0]

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-3 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="flood-check-title">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className={`px-5 py-5 text-white ${found ? 'bg-red-600' : 'bg-emerald-600'}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {found ? <AlertTriangle size={34} /> : <CheckCircle2 size={34} />}
              <div>
                <h2 id="flood-check-title" className="text-xl font-bold">{found ? 'พบรายงานน้ำท่วมใกล้คุณ' : 'ยังไม่พบรายงานน้ำท่วมใกล้คุณ'}</h2>
                <p className="mt-1 text-sm text-white/90">{found ? `พบ ${result.nearby.length} จุด ภายในรัศมี ${FLOOD_CHECK_RADIUS_KM} กม.` : `ตรวจสอบจากรายงานที่ใช้งานอยู่ภายใน ${FLOOD_CHECK_RADIUS_KM} กม.`}</p>
              </div>
            </div>
            <button onClick={onClose} aria-label="ปิด" className="rounded-full p-2 hover:bg-white/15"><X size={22} /></button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5">
          {found ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                <p className="font-bold text-red-800">⚠️ ควรตรวจสอบพื้นที่ก่อนเดินทาง</p>
                <p className="mt-1 text-sm text-red-700">จุดที่ใกล้ที่สุดอยู่ห่างจากตำแหน่งของคุณประมาณ {formatDistance(nearest.distanceKm)}</p>
              </div>

              {result.nearby.map((report) => (
                <div key={report.id} className="rounded-2xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{report.location_name || 'จุดรายงานน้ำ'}</p>
                      <p className="mt-1 text-sm text-slate-500">ห่างจากคุณ {formatDistance(report.distanceKm)}</p>
                    </div>
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">{depthLabel(report.depth_level)}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-xl bg-slate-50 p-3"><span className="text-slate-500">ความลึก</span><strong className="mt-1 block">{report.depth_cm != null ? `${report.depth_cm} ซม.` : depthLabel(report.depth_level)}</strong></div>
                    <div className="rounded-xl bg-slate-50 p-3"><span className="text-slate-500">รถผ่าน</span><strong className="mt-1 block">{report.passable === false ? 'ไม่ได้' : report.passable === true ? 'ได้' : 'ไม่ทราบ'}</strong></div>
                  </div>
                  {report.note && <p className="mt-3 text-sm text-slate-600">{report.note}</p>}
                </div>
              ))}

              <Link href="/map" onClick={onClose} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1264b3] px-4 py-3 font-bold text-white">ดูจุดน้ำท่วมบนแผนที่ <Map size={18} /></Link>
            </div>
          ) : (
            <div className="py-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 size={36} /></div>
              <h3 className="mt-4 text-lg font-bold text-slate-800">ยังไม่พบรายงานน้ำท่วมในบริเวณใกล้เคียง</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">ผลนี้อ้างอิงจากรายงานที่มีอยู่ในระบบ ณ เวลาที่ตรวจ ไม่ได้หมายความว่าไม่มีน้ำท่วมในพื้นที่จริง</p>
              <Link href="/map" onClick={onClose} className="mt-5 inline-flex items-center gap-2 rounded-xl border px-5 py-3 font-bold">เปิดแผนที่ <Map size={18} /></Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const earthRadiusKm = 6371
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRadians(value: number) {
  return value * Math.PI / 180
}

function formatDistance(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} เมตร`
  return `${km.toFixed(1)} กม.`
}

function depthLabel(level: WaterReport['depth_level']) {
  const labels: Record<WaterReport['depth_level'], string> = {
    normal: 'ปกติ', ankle: 'ระดับตาตุ่ม', knee: 'ระดับเข่า', waist: 'ระดับเอว', chest: 'ระดับอกขึ้นไป', unknown: 'ไม่ทราบระดับ',
  }
  return labels[level]
}

function Stat({ label, value, danger = false }: { label: string; value: number; danger?: boolean }) { return <div className={`rounded-xl p-3 ${danger && value > 0 ? 'bg-red-50' : 'bg-slate-50'}`}><span className="text-xs text-slate-500">{label}</span><strong className={`mt-1 block text-xl ${danger && value > 0 ? 'text-red-700' : 'text-slate-800'}`}>{value}</strong></div> }

function NavItem({ href, icon, title, text }: { href: string; icon: React.ReactNode; title: string; text: string }) { return <Link href={href} className="flex items-center gap-4 border-b p-4 last:border-b-0 hover:bg-slate-50"><span className="rounded-xl bg-blue-50 p-3 text-blue-700">{icon}</span><span className="flex-1"><strong className="block">{title}</strong><small className="text-slate-500">{text}</small></span><ChevronRight className="text-slate-400" /></Link> }
