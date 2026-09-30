import { NextResponse } from 'next/server'
import { getSupabaseAdmin, getSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { data: reports, error: reportError } = await supabase
      .from('water_reports')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(200)

    if (reportError) throw reportError

    const reportIds = (reports ?? []).map((report) => report.id)
    let flags: Array<{ id: string; water_report_id: string; reason: string; created_at: string }> = []

    if (reportIds.length > 0) {
      const { data: flagData, error: flagError } = await supabase
        .from('water_flags')
        .select('id, water_report_id, reason, created_at')
        .in('water_report_id', reportIds)
        .order('created_at', { ascending: false })

      if (flagError) throw flagError
      flags = flagData ?? []
    }

    const flagsByReport = new Map<string, typeof flags>()
    for (const flag of flags) {
      const current = flagsByReport.get(flag.water_report_id) ?? []
      current.push(flag)
      flagsByReport.set(flag.water_report_id, current)
    }

    const data = (reports ?? []).map((report) => ({
      ...report,
      flags: flagsByReport.get(report.id) ?? [],
    }))

    return NextResponse.json({ data })
  } catch (error) {
    console.error('GET /api/water failed:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'โหลดข้อมูลไม่สำเร็จ' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const required = ['lat', 'lng', 'depth_level', 'trend']
    for (const field of required) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json({ error: `กรุณาระบุ ${field}` }, { status: 400 })
      }
    }

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('water_reports')
      .insert({
        lat: Number(body.lat),
        lng: Number(body.lng),
        location_name: body.location_name || null,
        depth_level: body.depth_level,
        depth_cm: body.depth_cm ? Number(body.depth_cm) : null,
        trend: body.trend,
        passable: typeof body.passable === 'boolean' ? body.passable : null,
        note: body.note || null,
        photo_url: body.photo_url || null,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'บันทึกรายงานไม่สำเร็จ' }, { status: 500 })
  }
}
