'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'

const FloodMap = dynamic(() => import('@/components/FloodMap'), { ssr: false })

export default function MapPage() {
  return <main className="h-screen"><header className="absolute left-0 right-0 top-0 z-10 mx-auto flex max-w-4xl items-center gap-3 p-4"><Link href="/" className="rounded-xl bg-white p-3 shadow"><ArrowLeft /></Link><div className="rounded-xl bg-white px-4 py-2 font-bold shadow">แผนที่ระดับน้ำ</div><Link href="/report" className="ml-auto flex items-center gap-2 rounded-xl bg-[#1264b3] px-4 py-3 font-bold text-white shadow"><Plus size={18} />รายงานน้ำ</Link></header><div className="h-full"><FloodMap /></div></main>
}
