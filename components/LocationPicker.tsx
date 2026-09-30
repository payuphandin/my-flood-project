'use client'

import { useEffect, useRef } from 'react'
import { LocateFixed, MapPin } from 'lucide-react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

type Props = {
  value: { lat: number; lng: number } | null
  onChange: (coords: { lat: number; lng: number }) => void
  onClose: () => void
}

function MapController({ position, onChange }: { position: { lat: number; lng: number }; onChange: Props['onChange'] }) {
  const map = useMap()
  const dragging = useRef(false)

  useEffect(() => {
    map.on('movestart', () => { dragging.current = true })
    map.on('moveend', () => {
      dragging.current = false
      const center = map.getCenter()
      onChange({ lat: center.lat, lng: center.lng })
    })
    return () => {
      map.off('movestart')
      map.off('moveend')
    }
  }, [map, onChange])

  useEffect(() => {
    if (!dragging.current) map.setView([position.lat, position.lng])
  }, [map, position.lat, position.lng])

  return null
}

export default function LocationPicker({ value, onChange, onClose }: Props) {
  const initial = value ?? { lat: 15.81047, lng: 102.028812 }
  const mapCenter = value ?? initial

  const locateMe = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (p) => onChange({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => undefined,
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-100">
      <div className="absolute left-0 right-0 top-0 z-[1001] flex items-center gap-3 bg-white/95 px-4 py-4 shadow backdrop-blur">
        <MapPin className="text-blue-700" />
        <div className="min-w-0 flex-1">
          <p className="font-bold">เลือกตำแหน่งรายงาน</p>
          <p className="truncate text-xs text-slate-500">เลื่อนแผนที่ให้หมุดอยู่ตรงจุดที่ต้องการ</p>
        </div>
        <button type="button" onClick={locateMe} aria-label="ไปตำแหน่งปัจจุบัน" className="rounded-xl border p-3 text-blue-700 shadow-sm hover:bg-blue-50">
          <LocateFixed size={21} />
        </button>
      </div>

      <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={15} scrollWheelZoom className="h-full w-full">
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapController position={mapCenter} onChange={onChange} />
      </MapContainer>

      <div className="pointer-events-none absolute left-0 right-0 top-1/2 z-[1001] -translate-y-1/2 text-center">
        <div className="relative mx-auto h-14 w-12 -translate-y-7 drop-shadow-[0_4px_5px_rgba(0,0,0,0.35)]">
          <MapPin
            className="absolute inset-0 text-red-600"
            size={48}
            strokeWidth={2.4}
            fill="currentColor"
          />
          <span className="absolute left-1/2 top-[9px] h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white bg-red-200 shadow-inner" />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-[1001] bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.12)]">
        <p className="mb-3 text-center text-sm text-slate-500">
          {mapCenter.lat.toFixed(5)}, {mapCenter.lng.toFixed(5)}
        </p>
        <button type="button" onClick={onClose} className="w-full rounded-xl bg-[#1264b3] px-4 py-3 font-bold text-white">
          ยืนยันตำแหน่งนี้
        </button>
      </div>
    </div>
  )
}
