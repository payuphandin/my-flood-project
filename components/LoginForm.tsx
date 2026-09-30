'use client'

import { useState } from 'react'
import { LogIn } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMessage('')
    try {
      const { error } = await getSupabaseClient().auth.signInWithPassword({ email, password })
      if (error) throw error
      setMessage('เข้าสู่ระบบสำเร็จ')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'เข้าสู่ระบบไม่สำเร็จ') } finally { setBusy(false) }
  }
  return <form onSubmit={submit} className="space-y-4 rounded-3xl bg-white p-6 shadow-soft"><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="อีเมล" className="w-full rounded-xl border px-4 py-3" /><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="รหัสผ่าน" className="w-full rounded-xl border px-4 py-3" /><button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1264b3] px-4 py-3 font-bold text-white"><LogIn size={18} />เข้าสู่ระบบ</button>{message && <p className="text-sm text-slate-600">{message}</p>}</form>
}
