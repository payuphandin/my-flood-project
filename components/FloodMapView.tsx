'use client'

import { useEffect, useMemo } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import type { CctvCamera, WaterReport } from '@/types/database'

interface Props {
  reports: WaterReport[]
  cameras: CctvCamera[]
  onSelect: (report: WaterReport) => void
}

function MapUpdater() {
  const map = useMap()

  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 100)
    return () => window.clearTimeout(timer)
  }, [map])

  return null
}

const cctvIcon = L.divIcon({
  className: '',
  html: '<div style="width:34px;height:34px;border-radius:50%;background:#0b2d48;color:#fff;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 2px 8px #0005;font-size:16px">📹</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
})

function waterIcon(level: WaterReport['depth_level']) {
  const color = ({
    normal: '#16a34a',
    ankle: '#eab308',
    knee: '#f97316',
    waist: '#ef4444',
    chest: '#991b1b',
    unknown: '#64748b',
  })[level]

  return L.divIcon({
    className: '',
    html: `<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:3px solid #fff;box-shadow:0 2px 7px #0005"><span style="display:block;transform:rotate(45deg);color:#fff;text-align:center;line-height:24px;font-size:14px">💧</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  })
}

export default function FloodMapView({ reports, cameras, onSelect }: Props) {
  const center: [number, number] = [
    Number(process.env.NEXT_PUBLIC_MAP_CENTER_LAT ?? 15.81047),
    Number(process.env.NEXT_PUBLIC_MAP_CENTER_LNG ?? 102.028812),
  ]
  const zoom = Number(process.env.NEXT_PUBLIC_MAP_ZOOM ?? 11)
  const icons = useMemo(
    () => new Map(reports.map((report) => [report.id, waterIcon(report.depth_level)])),
    [reports],
  )

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      className="flood-map"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater />

      {reports
        .filter(
          (r) =>
            Number.isFinite(Number(r.lat)) &&
            Number.isFinite(Number(r.lng)),
        )
        .map((r) => (
          <Marker
            key={r.id}
            position={[Number(r.lat), Number(r.lng)]}
            icon={icons.get(r.id)}
            eventHandlers={{ click: () => onSelect(r) }}
          >
            <Popup>
              <div className="min-w-[220px]">
                <strong>{r.location_name || 'จุดรายงานน้ำท่วม'}</strong>
                <div className="mt-1 text-sm">ระดับ: {label(r.depth_level)}</div>
                <div className="text-sm">แนวโน้ม: {trend(r.trend)}</div>
                <div className="text-sm">
                  รถผ่าน: {r.passable === null ? 'ไม่ระบุ' : r.passable ? 'ได้' : 'ไม่ได้'}
                </div>
                {r.depth_cm != null && (
                  <div className="text-sm">ความลึก: {r.depth_cm} ซม.</div>
                )}
                {r.note && <p className="mt-1 text-sm">{r.note}</p>}
                {r.photo_url && (
                  <img
                    src={r.photo_url}
                    alt="รูปประกอบรายงาน"
                    className="mt-2 max-h-32 w-full rounded-lg object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => onSelect(r)}
                  className="mt-2 rounded-lg bg-[#1264b3] px-3 py-2 text-xs font-bold text-white"
                >
                  ดูรายละเอียด / อัปเดต
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

      {cameras
        .filter((c) => c.latitude != null && c.longitude != null)
        .map((camera) => (
          <Marker
            key={`cctv-${camera.id}`}
            position={[camera.latitude!, camera.longitude!]}
            icon={cctvIcon}
          >
            <Popup>
              <strong>{camera.name}</strong>
              <p className="mt-1 text-sm">{camera.location_name}</p>
              {camera.snapshot_url && (
                <img
                  src={camera.snapshot_url}
                  alt={camera.name}
                  className="mt-2 w-full rounded-lg"
                />
              )}
              {camera.stream_url && (
                <a
                  href={camera.stream_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block font-bold text-blue-700"
                >
                  เปิดกล้อง
                </a>
              )}
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  )
}

function label(v: WaterReport['depth_level']) {
  return ({
    normal: 'ปกติ',
    ankle: 'ตาตุ่ม',
    knee: 'เข่า',
    waist: 'เอว',
    chest: 'อกขึ้นไป',
    unknown: 'ไม่ระบุ',
  })[v]
}

function trend(v: WaterReport['trend']) {
  return ({
    rising: 'เพิ่มขึ้น',
    stable: 'คงที่',
    falling: 'ลดลง',
  })[v]
}
