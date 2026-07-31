---
title: <ensemble>
description: แสดงรายการเครื่องดนตรีในโน้ต
---

องค์ประกอบ `<ensemble>` แสดงรายการเครื่องดนตรีในโน้ต

## องค์ประกอบแม่

[`<thai-score>`](/th/v0_1/reference/elements/thai-score/)

## ลูก

องค์ประกอบ [`<part>`](/th/v0_1/reference/elements/part/) หนึ่งหรือมากกว่า พาร์ตแสดงผลตามลำดับที่ปรากฏ พาร์ตของ [เครื่องดนตรีที่ซ้อนแถว](/th/v0_1/reference/elements/part/#เครื่องดนตรีที่ซ้อนแถว) อยู่ด้วยกันตามลำดับแถว

## ตัวอย่าง

```xml
<ensemble>
  <part id="P1">
    <instrument-name>Ranat Ek</instrument-name>
  </part>
  <part id="P2">
    <instrument-name>Ching</instrument-name>
  </part>
</ensemble>
```

## การแสดงผล

โน้ตเต็มซ้อนแถวละพาร์ต พื้นที่ระหว่างแถวขึ้นอยู่กับว่าวงมีเครื่องดนตรีที่บันทึกโน้ตไว้มากกว่าหนึ่งแถวหรือไม่ ดู [การจัดวางโน้ต](/th/v0_1/reference/rendering/#การจัดวางโน้ต) ในหน้าอ้างอิงการแสดงผล
