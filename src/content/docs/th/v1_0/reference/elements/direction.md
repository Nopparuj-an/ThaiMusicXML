---
title: <direction>
description: ทิศทางการแสดงสำหรับโน้ต
---

องค์ประกอบ `<direction>` บรรจุทิศทางการแสดงสำหรับโน้ต

## องค์ประกอบแม่

- [`<structure>`](/th/v1_0/reference/elements/structure/)
- [`<repeat>`](/th/v1_0/reference/elements/repeat/)

## ลูก

- [`<nathap>`](/th/v1_0/reference/elements/nathap/) - หน้าทับ (รอบจังหวะกลอง)
- [`<chan>`](/th/v1_0/reference/elements/chan/) - ชั้น (ระดับชั้นจังหวะ)
- [`<bpm>`](/th/v1_0/reference/elements/bpm/) - จังหวะ

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
