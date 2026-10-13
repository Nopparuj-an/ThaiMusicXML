---
title: <instrument-short-name>
description: ชื่อย่อของชื่อเครื่องดนตรี สำหรับที่ที่ชื่อเต็มไม่พอดี เป็นทางเลือก พาร์ตที่ไม่มีชื่อย่อจะใช้ชื่อเต็มแทน
---

องค์ประกอบ `<instrument-short-name>` ให้ชื่อย่อของ [`<instrument-name>`](/th/reference/elements/instrument-name/) สำหรับกรณีที่ชื่อเต็มไม่พอดี

## องค์ประกอบแม่

[`<part>`](/th/reference/elements/part/)

## เนื้อหา

ข้อความ เป็นทางเลือก: พาร์ตที่ไม่มี `<instrument-short-name>` จะถูกเรียกด้วยชื่อเต็มจาก [`<instrument-name>`](/th/reference/elements/instrument-name/) แทน ในทุกที่ที่ปกติจะใช้ชื่อย่อ

## ตัวอย่าง

```xml
<part id="P2" stack="khong" row="1">
  <instrument-name>ฆ้องวงใหญ่ มือขวา</instrument-name>
  <instrument-short-name>ฆ้องวงใหญ่ R</instrument-short-name>
</part>
```

## การแสดงผล

ใช้แทน `<instrument-name>` ในคอลัมน์ป้ายชื่อวง ซึ่งมีพื้นที่ให้ใช้เพียงขอบหน้าเท่านั้น ดู [ชื่อเครื่องดนตรี](/th/reference/rendering/#ชื่อเครื่องดนตรี)
