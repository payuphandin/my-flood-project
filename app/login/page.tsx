import Link from 'next/link'
import { ArrowLeft, Waves } from 'lucide-react'
import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  return <main className="min-h-screen bg-[#f3f7fb] px-4 py-12"><div className="mx-auto max-w-md"><Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-600"><ArrowLeft size={18} />กลับหน้าหลัก</Link><div className="mb-5 flex items-center gap-3"><div className="rounded-2xl bg-[#0b2d48] p-3 text-white"><Waves /></div><h1 className="text-2xl font-bold">เจ้าหน้าที่เข้าสู่ระบบ</h1></div><LoginForm /></div></main>
}
