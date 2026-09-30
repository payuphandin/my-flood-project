'use client'

import { ChangeEvent, FormEvent, useState } from 'react'
import type { WaterReport, WaterUpdateType } from '@/types/database'

const types: { value: WaterUpdateType; label: string }[] = [
  { value: 'obstacle', label: '🌳 ต้นไม้/สิ่งกีดขวาง' },
  { value: 'blocked', label: '🚗 รถผ่านไม่ได้' },
  { value: 'rising', label: '💧 น้ำเพิ่มขึ้น' },
  { value: 'falling', label: '📉 น้ำลดลง' },
  { value: 'road_damage', label: '🚧 ถนนเสียหาย' },
  { value: 'power_issue', label: '⚡ ปัญหาไฟฟ้า' },
  { value: 'affected_area', label: '🏠 พื้นที่ได้รับผลกระทบ' },
  { value: 'photo', label: '📷 รูปเพิ่มเติม' },
  { value: 'other', label: '📝 อื่น ๆ' },
]

interface Props {
  report: WaterReport
  onSaved: () => void
  onCancel: () => void
}

export default function WaterUpdateForm({ report, onSaved, onCancel }: Props) {
  const [type, setType] = useState<WaterUpdateType>('other')
  const [note, setNote] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null
    if (!selected) return
    if (!selected.type.startsWith('image/')) return setError('กรุณาเลือกไฟล์รูปภาพเท่านั้น')
    if (selected.size > 5 * 1024 * 1024) return setError('รูปภาพต้องมีขนาดไม่เกิน 5 MB')
    setError('')
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (note.trim().length < 3) return setError('กรุณาระบุรายละเอียดอย่างน้อย 3 ตัวอักษร')
    setSaving(true)
    setError('')

    try {
      let photoUrl: string | null = null

      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        const upload = await fetch('/api/water-photo', { method: 'POST', body: formData })
        const uploadJson = await upload.json()
        if (!upload.ok) throw new Error(uploadJson.error || 'อัปโหลดรูปไม่สำเร็จ')
        photoUrl = uploadJson.url ?? uploadJson.data?.url ?? null
        if (!photoUrl) throw new Error('ไม่พบ URL ของรูปที่อัปโหลด')
      }

      const response = await fetch('/api/water/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ water_report_id: report.id, type, note: note.trim(), photo_url: photoUrl }),
      })
      const json = await response.json()
      if (!response.ok) throw new Error(json.error || 'บันทึกข้อมูลไม่สำเร็จ')

      setNote('')
      setFile(null)
      setPreview(null)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900">เพิ่มข้อมูลสถานการณ์</h3>
          <p className="text-xs text-slate-500">อัปเดตข้อมูลเพิ่มเติมของจุดนี้</p>
        </div>
        <button type="button" onClick={onCancel} className="text-sm text-slate-500">ปิด</button>
      </div>

      <select value={type} onChange={(e) => setType(e.target.value as WaterUpdateType)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
        {types.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>

      <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} rows={4} placeholder="เช่น มีต้นไม้ล้มขวางถนน รถไม่สามารถผ่านได้" className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" />

      <label className="block cursor-pointer rounded-xl border-2 border-dashed border-slate-300 p-4 text-center hover:border-blue-400">
        <input type="file" accept="image/*" onChange={chooseFile} className="hidden" />
        <div className="text-sm font-semibold text-slate-700">📷 เลือกรูปภาพเพิ่มเติม</div>
        <div className="mt-1 text-xs text-slate-500">รองรับรูปภาพ ขนาดไม่เกิน 5 MB</div>
      </label>

      {preview && (
        <div className="relative overflow-hidden rounded-xl border border-slate-200">
          <img src={preview} alt="ตัวอย่างรูปภาพ" className="max-h-48 w-full object-cover" />
          <button type="button" onClick={() => { setFile(null); setPreview(null) }} className="absolute right-2 top-2 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">ลบรูป</button>
        </div>
      )}

      {error && <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <button disabled={saving} className="w-full rounded-xl bg-[#1264b3] px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
        {saving ? 'กำลังบันทึก...' : 'บันทึกการอัปเดต'}
      </button>
    </form>
  )
}
