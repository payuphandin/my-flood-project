import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('cctv_cameras')
      .select('*')
      .eq('is_active', true)
      .order('name')
    if (error) throw error
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'โหลดกล้องไม่สำเร็จ' }, { status: 500 })
  }
}
