import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { id, status, note } = await request.json()
    if (!id || !status) return NextResponse.json({ error: 'ข้อมูลไม่ครบ' }, { status: 400 })

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('water_status_updates')
      .insert({ water_report_id: id, status, note: note || null })
      .select()
      .single()

    if (error) throw error

    if (status === 'resolved') {
      await supabase.from('water_reports').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', id)
    }

    if (status === 'falling') {
      await supabase.from('water_reports').update({ trend: 'falling', updated_at: new Date().toISOString() }).eq('id', id)
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'อัปเดตสถานะไม่สำเร็จ' }, { status: 500 })
  }
}
