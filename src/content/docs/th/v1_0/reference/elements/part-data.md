---
title: <part-data>
description: บรรจุข้อมูลดนตรีสำหรับเครื่องดนตรีเดียว
---

องค์ประกอบ `<part-data>` บรรจุข้อมูลดนตรีสำหรับเครื่องดนตรีเดียว

`<part>` ใน `<ensemble>` ประกาศว่าเครื่องดนตรีมีอยู่ ส่วน `<part-data>` คือที่ซึ่งโน้ตของเครื่องดนตรีนั้นอยู่จริง

## องค์ประกอบแม่

[`<thai-score>`](/th/v1_0/reference/elements/thai-score/)

## แอตทริบิวต์

| แอตทริบิวต์ | จำเป็น | ประเภท | คำอธิบาย |
|-----------|----------|------|-------------|
| `part` | ใช่ | IDREF | อ้าง `<part id="...">` ใน `<ensemble>` |

## ลูก

องค์ประกอบ [`<section-ref>`](/th/v1_0/reference/elements/section-ref/) หนึ่งหรือมากกว่า

## ตัวอย่าง

```xml
<part-data part="P1">
  <section-ref section="s1">
    <line number="1">
      <measure number="1"><note pitch="ด"/><note pitch="ร"/></measure>
    </line>
  </section-ref>
</part-data>
```

## การสอดคล้องมาตรฐาน

- `<part>` ทุกตัวใน `<ensemble>` ต้องมี `<part-data>` หนึ่งตัวอ้างถึง พาร์ตที่ไม่มี `<part-data>` ตรงกันหรือมีมากกว่าหนึ่งไม่ถูกต้อง
- `<part-data>` ต้องไม่อ้าง `<section>` เดิมซ้ำ
- `<part-data>` ปรากฏลำดับใดก็ได้ การจับคู่พาร์ตกับข้อมูลผ่าน `part` ไม่ใช่ตำแหน่งเอกสาร
- `<part-data>` ไม่จำเป็นต้องอ้างทุกท่อน ละ `<section-ref>` สำหรับท่อนที่เครื่องดนตรีไม่เล่น
