import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { water_report_id } = await request.json()
    if (!water_report_id) return NextResponse.json({ error: 'ไม่พบรหัสรายงาน' }, { status: 400 })

    const supabase = getSupabaseAdmin()
    const { data: report, error: readError } = await supabase
      .from('water_reports')
      .select('confirm_count')
      .eq('id', water_report_id)
      .single()

    if (readError) throw readError

    const { data, error } = await supabase
      .from('water_reports')
      .update({ confirm_count: (report.confirm_count ?? 0) + 1, updated_at: new Date().toISOString() })
      .eq('id', water_report_id)
      .select('id, confirm_count')
      .single()

    if (error) throw error
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'ยืนยันรายงานไม่สำเร็จ' }, { status: 500 })
  }
}
