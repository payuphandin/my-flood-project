# Flood Help Center — Chaiyaphum

ระบบต้นแบบศูนย์ช่วยเหลือน้ำท่วมสำหรับจังหวัดชัยภูมิ สร้างตาม stack ที่วิเคราะห์จากเว็บตัวอย่าง และใช้ Supabase เป็น database/backend service

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Lucide React
- Leaflet + React Leaflet
- Next.js API Routes
- Supabase PostgreSQL
- Supabase Storage
- Supabase Auth
- Vercel-ready

## Run

```bash
npm install
copy .env.example .env.local
npm run dev
```

จากนั้นเปิด `http://localhost:3000`

## ตั้งค่า Supabase

1. สร้างโปรเจกต์ Supabase
2. ใส่ค่าใน `.env.local`
3. เปิด SQL Editor แล้วรัน `supabase/schema.sql`
4. รัน `supabase/seed.sql` หากต้องการข้อมูลตัวอย่าง
5. หากใช้ Login ให้สร้าง user ใน Supabase Authentication

## Routes

- `/` หน้าหลัก
- `/report` รายงานระดับน้ำ
- `/map` แผนที่ระดับน้ำ
- `/updates` รายงานล่าสุด
- `/cctv` กล้อง CCTV ชัยภูมิ
- `/login` Login เจ้าหน้าที่

API:

- `GET/POST /api/water`
- `POST /api/water/status`
- `POST /api/water/flag`
- `POST /api/water-photo`
- `GET /api/cctv`

> หมายเหตุ: ระบบนี้เป็น implementation ใหม่ที่อิงจากฟีเจอร์และโครงสร้างที่ตรวจจากเว็บตัวอย่าง ไม่ใช่ source code ของเว็บตัวอย่าง
