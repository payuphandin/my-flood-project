import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('water_reports')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) throw error
    return NextResponse.json({ data })
  } catch (error) {
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
