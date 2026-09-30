import Link from 'next/link'
import { ArrowLeft, Waves } from 'lucide-react'
import ReportForm from '@/components/ReportForm'

export default function ReportPage() {
  return <main className="min-h-screen"><header className="bg-[#0b2d48] px-5 py-5 text-white"><div className="mx-auto flex max-w-2xl items-center gap-3"><Link href="/" className="rounded-xl p-2 hover:bg-white/10"><ArrowLeft /></Link><Waves /><h1 className="text-xl font-bold">รายงานระดับน้ำ</h1></div></header><div className="mx-auto max-w-2xl px-4 py-6"><ReportForm /></div></main>
}
