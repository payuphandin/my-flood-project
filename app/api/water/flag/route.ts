import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { water_report_id, reason } = await request.json()
    if (!water_report_id || !reason) return NextResponse.json({ error: 'ข้อมูลไม่ครบ' }, { status: 400 })

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('water_flags')
      .insert({ water_report_id, reason })
      .select()
      .single()

    if (error) throw error

    const { data: report } = await supabase
      .from('water_reports')
      .select('false_report_count')
      .eq('id', water_report_id)
      .single()

    if (report) {
      await supabase
        .from('water_reports')
        .update({ false_report_count: (report.false_report_count ?? 0) + 1, updated_at: new Date().toISOString() })
        .eq('id', water_report_id)
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'แจ้งรายงานไม่สำเร็จ' }, { status: 500 })
  }
}
