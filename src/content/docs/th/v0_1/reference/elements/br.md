---
title: <br>
description: ตัดบรรทัด
---

องค์ประกอบ `<br>` ระบุการตัดบรรทัด

## องค์ประกอบแม่

- [`<structure>`](/th/v0_1/reference/elements/structure/)
- [`<repeat>`](/th/v0_1/reference/elements/repeat/)

## ตัวอย่าง

```xml
<structure>
  <annotation>Line 1</annotation>
  <br/>
  <annotation>Line 2</annotation>
</structure>
```

## หมายเหตุ

- องค์ประกอบปิดตัวเองไม่มีแอตทริบิวต์
- `<br>` เพิ่มช่องว่างแนวตั้ง ณ จุดที่ปรากฏ ดันสิ่งที่ตามมาให้ลงไปต่ำกว่าเดิมในหน้า เหมือนบรรทัดว่างในเอกสารข้อความทั่วไป หาก `<br>` วางติดกันหลายตัวจะซ้อนกัน ดู [หมายเหตุประกอบ](/th/v0_1/reference/rendering/#หมายเหตุประกอบ)
