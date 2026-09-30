import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { water_report_id, reason } = await request.json()
    const cleanReason = typeof reason === 'string' ? reason.trim() : ''
    if (!water_report_id || !cleanReason) return NextResponse.json({ error: 'ข้อมูลไม่ครบ' }, { status: 400 })
    if (cleanReason.length < 3) return NextResponse.json({ error: 'กรุณาระบุเหตุผลอย่างน้อย 3 ตัวอักษร' }, { status: 400 })
    if (cleanReason.length > 500) return NextResponse.json({ error: 'เหตุผลยาวเกินไป (สูงสุด 500 ตัวอักษร)' }, { status: 400 })

    const supabase = getSupabaseAdmin()

    const { data: report, error: reportError } = await supabase
      .from('water_reports')
      .select('id, false_report_count')
      .eq('id', water_report_id)
      .single()

    if (reportError) throw reportError
    if (!report) return NextResponse.json({ error: 'ไม่พบรายงานน้ำท่วมนี้' }, { status: 404 })

    const { data, error } = await supabase
      .from('water_flags')
      .insert({ water_report_id, reason: cleanReason })
      .select()
      .single()

    if (error) throw error

    const { error: updateError } = await supabase
      .from('water_reports')
      .update({
        false_report_count: (report.false_report_count ?? 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', water_report_id)

    if (updateError) throw updateError

    return NextResponse.json({
      data: {
        ...data,
        false_report_count: (report.false_report_count ?? 0) + 1,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/water/flag failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'แจ้งรายงานไม่สำเร็จ' },
      { status: 500 },
    )
  }
}
