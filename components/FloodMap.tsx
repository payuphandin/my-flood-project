'use client'

import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { CctvCamera, WaterReport } from '@/types/database'

const cctvIcon = L.divIcon({ className: '', html: '<div style="width:34px;height:34px;border-radius:50%;background:#0b2d48;color:#fff;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 2px 8px #0005;font-size:16px">📹</div>', iconSize: [34, 34], iconAnchor: [17, 17] })

export default function FloodMap() {
  const [reports, setReports] = useState<WaterReport[]>([])
  const [cameras, setCameras] = useState<CctvCamera[]>([])
  const [confirming, setConfirming] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({})

  useEffect(() => {
    Promise.all([
      fetch('/api/water').then((r) => r.json()),
      fetch('/api/cctv').then((r) => r.json()),
    ]).then(([water, cctv]) => {
      setReports(water.data ?? [])
      setCameras(cctv.data ?? [])
    }).catch(() => undefined)
  }, [])

  const activeReports = useMemo(() => reports.filter((r) => r.is_active), [reports])

  async function confirmReport(id: string) {
    if (confirmed[id]) return
    setConfirming(id)
    try {
      const response = await fetch('/api/water/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ water_report_id: id }) })
      if (!response.ok) throw new Error()
      const json = await response.json()
      setReports((current) => current.map((r) => r.id === id ? { ...r, confirm_count: json.data.confirm_count } : r))
      setConfirmed((current) => ({ ...current, [id]: true }))
    } catch {
      window.alert('ยืนยันรายงานไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setConfirming(null)
    }
  }

  async function flagReport(id: string) {
    const reason = window.prompt('เหตุผลที่คิดว่ารายงานนี้ไม่ถูกต้อง')?.trim()
    if (!reason) return
    if (reason.length < 3) {
      window.alert('กรุณาระบุเหตุผลอย่างน้อย 3 ตัวอักษร')
      return
    }

    try {
      const response = await fetch('/api/water/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ water_report_id: id, reason }),
      })
      const json = await response.json()
      if (!response.ok) throw new Error(json.error || 'ส่งข้อมูลไม่สำเร็จ')

      setReports((current) => current.map((report) => {
        if (report.id !== id) return report
        return {
          ...report,
          false_report_count: json.data?.false_report_count ?? report.false_report_count + 1,
          flags: [json.data, ...(report.flags ?? [])],
        }
      }))
      window.alert('แจ้งข้อมูลผิดแล้ว เหตุผลจะแสดงให้ผู้ใช้คนอื่นเห็นที่จุดนี้')
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่')
    }
  }

  return <MapContainer center={[15.81047, 102.028812]} zoom={12} scrollWheelZoom className="h-full w-full">
    <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    {activeReports.map((r) => <Marker key={r.id} position={[r.lat, r.lng]} icon={waterIcon(r.depth_level)}><Popup>
      <div className="min-w-[220px]">
        <strong>{r.location_name || 'จุดรายงานน้ำ'}</strong>
        <div className="mt-1 text-sm">ระดับ: {label(r.depth_level)}</div>
        <div className="text-sm">แนวโน้ม: {trend(r.trend)}</div>
        <div className="text-sm">รถผ่าน: {r.passable === null ? 'ไม่ระบุ' : r.passable ? 'ได้' : 'ไม่ได้'}</div>
        {r.depth_cm != null && <div className="text-sm">ความลึก: {r.depth_cm} ซม.</div>}
        {r.note && <p className="mt-1 text-sm">{r.note}</p>}
        {r.flags && r.flags.length > 0 && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
            <div className="flex items-center justify-between gap-2">
              <strong className="text-sm text-red-800">⚠️ มีการแจ้งข้อมูลผิด {r.flags.length} ครั้ง</strong>
              <span className="text-xs text-red-600">ตรวจสอบเหตุผลด้านล่าง</span>
            </div>
            <div className="mt-2 space-y-2">
              {r.flags.map((flag) => (
                <div key={flag.id} className="rounded-lg bg-white/80 p-2 text-sm text-red-900">
                  <p>{flag.reason}</p>
                  <time className="mt-1 block text-[11px] text-red-500">แจ้งเมื่อ {formatDate(flag.created_at)}</time>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mt-3 flex gap-2">
          <button disabled={confirming === r.id || confirmed[r.id]} onClick={() => confirmReport(r.id)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-60">{confirmed[r.id] ? '✓ ยืนยันแล้ว' : `ยืนยันว่าพบ (${r.confirm_count})`}</button>
          <button onClick={() => flagReport(r.id)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600">แจ้งข้อมูลผิด</button>
        </div>
      </div>
    </Popup></Marker>)}
    {cameras.filter((c) => c.latitude != null && c.longitude != null).map((camera) => <Marker key={`cctv-${camera.id}`} position={[camera.latitude!, camera.longitude!]} icon={cctvIcon}><Popup><strong>{camera.name}</strong><p className="mt-1 text-sm">{camera.location_name}</p>{camera.snapshot_url && <img src={camera.snapshot_url} alt={camera.name} className="mt-2 w-full rounded-lg" />}{camera.stream_url && <a href={camera.stream_url} target="_blank" rel="noreferrer" className="mt-2 inline-block font-bold text-blue-700">เปิดกล้อง</a>}</Popup></Marker>)}
  </MapContainer>
}

function waterIcon(level: WaterReport['depth_level']) {
  const color = ({ normal: '#16a34a', ankle: '#eab308', knee: '#f97316', waist: '#ef4444', chest: '#991b1b', unknown: '#64748b' })[level]
  return L.divIcon({ className: '', html: `<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:3px solid #fff;box-shadow:0 2px 7px #0005"><span style="display:block;transform:rotate(45deg);color:#fff;text-align:center;line-height:24px;font-size:14px">💧</span></div>`, iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -28] })
}

function label(v: WaterReport['depth_level']) { return ({ normal: 'ปกติ', ankle: 'ตาตุ่ม', knee: 'เข่า', waist: 'เอว', chest: 'อกขึ้นไป', unknown: 'ไม่ระบุ' })[v] }
function trend(v: WaterReport['trend']) { return ({ rising: 'เพิ่มขึ้น', stable: 'คงที่', falling: 'ลดลง' })[v] }
function formatDate(value: string) { return new Date(value).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) }
