import type { Metadata } from 'next'
import './globals.css'
import 'leaflet/dist/leaflet.css'

export const metadata: Metadata = {
  title: 'ศูนย์ช่วยเหลือน้ำท่วม จังหวัดชัยภูมิ',
  description: 'ระบบรายงานและติดตามสถานการณ์น้ำท่วม',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  )
}
