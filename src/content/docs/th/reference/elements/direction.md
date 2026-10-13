---
title: <direction>
description: บรรข้อมูลเกี่ยวกับจังหวะ ได้แก่ หน้าทับ ระดับชั้น และจังหวะเป็นจังหวะต่อนาที
---

องค์ประกอบ `<direction>` บรรข้อมูลเกี่ยวกับจังหวะสำหรับโน้ต

## องค์ประกอบแม่

- [`<structure>`](/th/reference/elements/structure/)
- [`<repeat>`](/th/reference/elements/repeat/)

## ลูก

- [`<nathap>`](/th/reference/elements/nathap/) - หน้าทับ (รอบจังหวะกลอง)
- [`<chan>`](/th/reference/elements/chan/) - ชั้น (ระดับชั้นจังหวะ)
- [`<bpm>`](/th/reference/elements/bpm/) - จังหวะ

## ตัวอย่าง

```xml
<direction>
  <nathap value="ปรบไก่" />
  <chan value="1" />
  <bpm>65</bpm>
</direction>
```

## การสอดคล้องมาตรฐาน

- `<nathap>`, `<chan>`, และ `<bpm>` เป็นทางเลือกแต่ละตัว ปรากฏได้ไม่เกินหนึ่ง ลำดับใดก็ได้ `<direction>` อาจตั้งค่าใดก็ได้ ทั้งหมด หรือไม่มี
