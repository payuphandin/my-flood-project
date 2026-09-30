'use client'

import { useEffect, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { WaterReport } from '@/types/database'

const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
})

export default function FloodMap() {
  const [reports, setReports] = useState<WaterReport[]>([])
  useEffect(() => { fetch('/api/water').then((r) => r.json()).then((j) => setReports(j.data ?? [])).catch(() => undefined) }, [])
  return <MapContainer center={[15.81047, 102.028812]} zoom={12} scrollWheelZoom className="h-full w-full">
    <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    {reports.map((r) => <Marker key={r.id} position={[r.lat, r.lng]} icon={icon}><Popup><strong>{r.location_name || 'จุดรายงานน้ำ'}</strong><br />ระดับ: {label(r.depth_level)}<br />แนวโน้ม: {trend(r.trend)}<br />รถผ่าน: {r.passable === null ? 'ไม่ระบุ' : r.passable ? 'ได้' : 'ไม่ได้'}<br />{r.note}</Popup></Marker>)}
  </MapContainer>
}

function label(v: WaterReport['depth_level']) { return ({ normal: 'ปกติ', ankle: 'ตาตุ่ม', knee: 'เข่า', waist: 'เอว', chest: 'อกขึ้นไป', unknown: 'ไม่ระบุ' })[v] }
function trend(v: WaterReport['trend']) { return ({ rising: 'เพิ่มขึ้น', stable: 'คงที่', falling: 'ลดลง' })[v] }
