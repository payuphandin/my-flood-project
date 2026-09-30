export type WaterLevel = 'normal' | 'ankle' | 'knee' | 'waist' | 'chest' | 'unknown'
export type WaterTrend = 'rising' | 'stable' | 'falling'

export interface WaterReport {
  id: string
  lat: number
  lng: number
  location_name: string | null
  depth_level: WaterLevel
  depth_cm: number | null
  trend: WaterTrend
  passable: boolean | null
  note: string | null
  photo_url: string | null
  created_at: string
  updated_at: string
  is_active: boolean
  confirm_count: number
  false_report_count: number
}

export interface CctvCamera {
  id: string
  name: string
  location_name: string
  stream_url: string | null
  snapshot_url: string | null
  latitude: number | null
  longitude: number | null
  is_active: boolean
}
