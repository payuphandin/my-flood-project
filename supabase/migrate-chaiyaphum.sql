-- ย้ายข้อมูลตัวอย่างเดิมจากฉะเชิงเทราไปเป็นข้อมูลตัวอย่างในชัยภูมิ
-- รายงานที่ผู้ใช้สร้างเองและมีพิกัดชัยภูมิจะไม่ถูกแก้ไข

update public.water_reports
set lat = 15.81047,
    lng = 102.028812,
    location_name = 'ตัวเมืองชัยภูมิ - จุดตัวอย่าง 1',
    note = 'ข้อมูลตัวอย่างสำหรับทดสอบระบบ'
where lat = 13.6904 and lng = 101.0779;

update public.water_reports
set lat = 15.81400,
    lng = 102.03500,
    location_name = 'พื้นที่ชัยภูมิ - จุดตัวอย่าง 2',
    note = 'ข้อมูลตัวอย่างสำหรับทดสอบระบบ'
where lat = 13.6768 and lng = 101.0712;

update public.water_reports
set lat = 15.80500,
    lng = 102.02300,
    location_name = 'พื้นที่ชัยภูมิ - จุดตัวอย่าง 3',
    note = 'ข้อมูลตัวอย่างสำหรับทดสอบระบบ'
where lat = 13.7052 and lng = 101.0875;
