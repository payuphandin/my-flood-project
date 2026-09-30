'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import WaterUpdateForm from './WaterUpdateForm'
import type { CctvCamera, WaterReport, WaterUpdate } from '@/types/database'

const MapView = dynamic(() => import('./FloodMapView'), { ssr: false })

export default function FloodMap() {
  const [reports, setReports] = useState<WaterReport[]>([])
  const [cameras, setCameras] = useState<CctvCamera[]>([])
  const [selected, setSelected] = useState<WaterReport | null>(null)
  const [updates, setUpdates] = useState<WaterUpdate[]>([])
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [loadingUpdates, setLoadingUpdates] = useState(false)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({})

  useEffect(() => {
    Promise.all([
      fetch('/api/water', { cache: 'no-store' }).then((r) => r.json()),
      fetch('/api/cctv', { cache: 'no-store' }).then((r) => r.json()),
    ]).then(([water, cctv]) => {
      setReports(water.data ?? [])
      setCameras(cctv.data ?? [])
    }).catch(() => undefined)
  }, [])

  const activeReports = reports.filter((r) => r.is_active)

  async function selectReport(report: WaterReport) {
    setSelected(report)
    setShowUpdateForm(false)
    setUpdates(report.updates ?? [])
    setLoadingUpdates(true)
    try {
      const response = await fetch(`/api/water/updates?report_id=${encodeURIComponent(report.id)}&page=1&page_size=20`, { cache: 'no-store' })
      const json = await response.json()
      if (response.ok) setUpdates(json.data ?? [])
    } finally {
      setLoadingUpdates(false)
    }
  }

  async function refreshSelected(reportId: string) {
    const response = await fetch(`/api/water/updates?report_id=${encodeURIComponent(reportId)}&page=1&page_size=20`, { cache: 'no-store' })
    const json = await response.json()
    if (response.ok) setUpdates(json.data ?? [])
  }

  async function confirmReport(id: string) {
    if (confirmed[id]) return
    setConfirming(id)
    try {
      const response = await fetch('/api/water/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ water_report_id: id }) })
      if (!response.ok) throw new Error()
      const json = await response.json()
      setReports((current) => current.map((r) => r.id === id ? { ...r, confirm_count: json.data.confirm_count } : r))
      setConfirmed((current) => ({ ...current, [id]: true }))
      if (selected?.id === id) setSelected((current) => current ? { ...current, confirm_count: json.data.confirm_count } : current)
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

      setReports((current) => current.map((report) => report.id !== id ? report : {
        ...report,
        false_report_count: json.data?.false_report_count ?? report.false_report_count + 1,
        flags: [json.data, ...(report.flags ?? [])],
      }))
      setSelected((current) => current?.id !== id ? current : {
        ...current,
        false_report_count: json.data?.false_report_count ?? current.false_report_count + 1,
        flags: [json.data, ...(current.flags ?? [])],
      })
      window.alert('แจ้งข้อมูลผิดแล้ว เหตุผลจะแสดงให้ผู้ใช้คนอื่นเห็นที่จุดนี้')
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่')
    }
  }

  return <div className="relative h-full w-full">
    <MapView reports={activeReports} cameras={cameras} onSelect={selectReport} />

    {selected && (
      <div className="absolute bottom-4 left-1/2 z-[1000] w-[min(460px,calc(100%-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="max-h-[75vh] overflow-y-auto p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-900">{selected.location_name || 'จุดรายงานน้ำท่วม'}</h2>
              <p className="text-xs text-slate-500">{Number(selected.lat).toFixed(6)}, {Number(selected.lng).toFixed(6)}</p>
            </div>
            <button onClick={() => { setSelected(null); setShowUpdateForm(false) }} className="rounded-full bg-slate-100 px-3 py-1 text-sm">ปิด</button>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
            <div>ระดับ: <strong>{label(selected.depth_level)}</strong></div>
            <div>แนวโน้ม: {trend(selected.trend)}</div>
            <div>รถผ่าน: {selected.passable === null ? 'ไม่ระบุ' : selected.passable ? 'ได้' : 'ไม่ได้'}</div>
            {selected.depth_cm != null && <div>ความลึก: {selected.depth_cm} ซม.</div>}
            {selected.note && <p className="mt-1">{selected.note}</p>}
          </div>

          {selected.photo_url && <img src={selected.photo_url} alt="รูปประกอบรายงานน้ำท่วม" className="mt-3 max-h-48 w-full rounded-xl object-cover" />}

          {selected.flags && selected.flags.length > 0 && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <strong className="text-sm text-red-800">⚠️ มีการแจ้งข้อมูลผิด {selected.flags.length} ครั้ง</strong>
                <span className="text-xs text-red-600">เหตุผล</span>
              </div>
              <div className="mt-2 space-y-2">
                {selected.flags.map((flag) => <div key={flag.id} className="rounded-lg bg-white/80 p-2 text-sm text-red-900"><p>{flag.reason}</p><time className="mt-1 block text-[11px] text-red-500">แจ้งเมื่อ {formatDate(flag.created_at)}</time></div>)}
              </div>
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <button disabled={confirming === selected.id || confirmed[selected.id]} onClick={() => confirmReport(selected.id)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-60">{confirmed[selected.id] ? '✓ ยืนยันแล้ว' : `ยืนยันว่าพบ (${selected.confirm_count})`}</button>
            <button onClick={() => flagReport(selected.id)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600">แจ้งข้อมูลผิด</button>
          </div>

          <div className="mt-4 border-t border-slate-200 pt-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">อัปเดตสถานการณ์</h3>
              {!showUpdateForm && <button onClick={() => setShowUpdateForm(true)} className="rounded-lg bg-[#1264b3] px-3 py-2 text-xs font-bold text-white">＋ เพิ่มข้อมูล</button>}
            </div>

            {showUpdateForm && <WaterUpdateForm report={selected} onCancel={() => setShowUpdateForm(false)} onSaved={async () => { setShowUpdateForm(false); await refreshSelected(selected.id) }} />}

            {!showUpdateForm && (loadingUpdates ? <p className="text-sm text-slate-500">กำลังโหลดข้อมูลอัปเดต...</p> : updates.length === 0 ? <p className="text-sm text-slate-500">ยังไม่มีข้อมูลอัปเดตเพิ่มเติม</p> : <div className="space-y-3">
              {updates.map((update) => <div key={update.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-2"><strong className="text-sm text-slate-800">{updateLabel(update.type)}</strong><time className="text-[11px] text-slate-400">{formatDate(update.created_at)}</time></div>
                <p className="mt-1 text-sm text-slate-700">{update.note}</p>
                {update.photo_url && <img src={update.photo_url} alt="รูปประกอบการอัปเดต" className="mt-2 max-h-40 w-full rounded-lg object-cover" />}
              </div>)}
            </div>)}
          </div>
        </div>
      </div>
    )}
  </div>
}

function label(v: WaterReport['depth_level']) { return ({ normal: 'ปกติ', ankle: 'ตาตุ่ม', knee: 'เข่า', waist: 'เอว', chest: 'อกขึ้นไป', unknown: 'ไม่ระบุ' })[v] }
function trend(v: WaterReport['trend']) { return ({ rising: 'เพิ่มขึ้น', stable: 'คงที่', falling: 'ลดลง' })[v] }
function updateLabel(v: WaterUpdate['type']) { return ({ obstacle: '🌳 ต้นไม้/สิ่งกีดขวาง', blocked: '🚗 รถผ่านไม่ได้', rising: '💧 น้ำเพิ่มขึ้น', falling: '📉 น้ำลดลง', road_damage: '🚧 ถนนเสียหาย', power_issue: '⚡ ปัญหาไฟฟ้า', affected_area: '🏠 พื้นที่ได้รับผลกระทบ', photo: '📷 รูปเพิ่มเติม', other: '📝 อื่น ๆ' })[v] }
function formatDate(value: string) { return new Date(value).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) }
