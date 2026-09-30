import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const reportId = url.searchParams.get('report_id')
    const page = Math.max(1, Number(url.searchParams.get('page') || '1'))
    const pageSize = Math.min(20, Math.max(1, Number(url.searchParams.get('page_size') || '20')))

    if (!reportId) {
      return NextResponse.json({ error: 'กรุณาระบุ report_id' }, { status: 400 })
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    const supabase = getSupabaseAdmin()

    const { data, error, count } = await supabase
      .from('water_flags')
      .select('id, water_report_id, reason, created_at', { count: 'exact' })
      .eq('water_report_id', reportId)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    const total = count ?? 0
    return NextResponse.json({
      data: data ?? [],
      pagination: {
        page,
        page_size: pageSize,
        total,
        total_pages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('GET /api/water/flags failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'โหลดรายละเอียดไม่สำเร็จ' },
      { status: 500 },
    )
  }
}
