import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

const allowedTypes = new Set(['obstacle', 'blocked', 'rising', 'falling', 'road_damage', 'power_issue', 'affected_area', 'photo', 'other'])

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('report_id')
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const pageSize = Math.min(20, Math.max(1, Number(searchParams.get('page_size') || 10)))
    if (!reportId) return NextResponse.json({ error: 'ต้องระบุ report_id' }, { status: 400 })

    const supabase = getSupabaseAdmin()
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    const { data, error, count } = await supabase
      .from('water_updates')
      .select('id, water_report_id, type, note, photo_url, created_at', { count: 'exact' })
      .eq('water_report_id', reportId)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error
    return NextResponse.json({
      data: data ?? [],
      pagination: { page, page_size: pageSize, total: count ?? 0, total_pages: Math.max(1, Math.ceil((count ?? 0) / pageSize)) },
    })
  } catch (error) {
    console.error('GET /api/water/updates failed:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'โหลดข้อมูลอัปเดตไม่สำเร็จ' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const reportId = String(body.water_report_id || '')
    const type = String(body.type || '')
    const note = String(body.note || '').trim()
    const photoUrl = body.photo_url ? String(body.photo_url) : null

    if (!reportId) return NextResponse.json({ error: 'ต้องระบุ water_report_id' }, { status: 400 })
    if (!allowedTypes.has(type)) return NextResponse.json({ error: 'ประเภทข้อมูลอัปเดตไม่ถูกต้อง' }, { status: 400 })
    if (note.length < 3 || note.length > 1000) return NextResponse.json({ error: 'รายละเอียดต้องมี 3-1000 ตัวอักษร' }, { status: 400 })

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('water_updates')
      .insert({ water_report_id: reportId, type, note, photo_url: photoUrl })
      .select('id, water_report_id, type, note, photo_url, created_at')
      .single()

    if (error) throw error
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('POST /api/water/updates failed:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'บันทึกข้อมูลอัปเดตไม่สำเร็จ' }, { status: 500 })
  }
}
