import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ศูนย์ช่วยเหลือน้ำท่วม จังหวัดฉะเชิงเทรา',
  description: 'ระบบรายงานและติดตามสถานการณ์น้ำท่วม',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  )
}
