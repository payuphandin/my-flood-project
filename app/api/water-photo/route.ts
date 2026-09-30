import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof File)) return NextResponse.json({ error: 'ไม่พบไฟล์' }, { status: 400 })
    if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'รองรับเฉพาะไฟล์รูปภาพ' }, { status: 400 })
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'รูปต้องมีขนาดไม่เกิน 5MB' }, { status: 400 })

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `reports/${crypto.randomUUID()}.${ext}`
    const supabase = getSupabaseClient()
    const { error } = await supabase.storage.from('water-photos').upload(path, file, {
      contentType: file.type,
      upsert: false,
    })
    if (error) throw error

    const { data } = supabase.storage.from('water-photos').getPublicUrl(path)
    return NextResponse.json({ url: data.publicUrl, path }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'อัปโหลดรูปไม่สำเร็จ' }, { status: 500 })
  }
}
