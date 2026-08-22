---
title: <structure>
description: กำหนดโครงสร้างโน้ตด้วยท่อน ทิศทาง และหมายเหตุประกอบ
---

องค์ประกอบ `<structure>` กำหนดโครงสร้างโน้ต: ท่อนใดเล่น ลำดับใด บ่อยแค่ไหน และมีทิศทางใดระหว่างทาง

## องค์ประกอบแม่

[`<thai-score>`](/th/v1_0/reference/elements/thai-score/)

## ลูก

ลำดับของ:

- [`<annotation>`](/th/v1_0/reference/elements/annotation/)
- [`<br>`](/th/v1_0/reference/elements/br/)
- [`<direction>`](/th/v1_0/reference/elements/direction/)
- [`<section>`](/th/v1_0/reference/elements/section/)
- [`<repeat>`](/th/v1_0/reference/elements/repeat/)

ปรากฏลำดับใดก็ได้และซ้ำได้

## ลำดับท่อน

ลำดับท่อนของโน้ตคือลำดับที่องค์ประกอบ `<section>` ปรากฏ นับเฉพาะ `<section>` และเดินแบบ depth first เข้าตัวครอบ [`<repeat>`](/th/v1_0/reference/elements/repeat/) องค์ประกอบ `<annotation>`, `<br>`, และ `<direction>` ที่แทรกไม่กระทบ ไม่มีแอตทริบิวต์ระบุลำดับ การจัดลำดับองค์ประกอบ `<section>` ใหม่ในเอกสารจึงจัดลำดับโน้ตใหม่

## ทิศทาง

[`<direction>`](/th/v1_0/reference/elements/direction/) มีผล ณ จุดที่ปรากฏและคงอยู่จน `<direction>` อื่นเปลี่ยนการตั้งค่าเดียวกัน ตัวประมวลผลอ่าน `<structure>` จากบนลงล่าง ทิศทางใช้กับทุกพาร์ต

ทิศทางภายใน `<repeat>` อ่านใหม่ในทุกรอบ จึงใช้ซ้ำในทุกครั้งที่เล่น

## หมายเหตุประกอบและตัดบรรทัด

`<annotation>` หรือ `<br>` ภายใน `<repeat>` พิมพ์ครั้งเดียว ณ ตำแหน่งในเอกสาร ไม่ซ้ำตามรอบ

ทั้งสองทำงานต่างจาก `<direction>` เพราะเป็นคนละสิ่ง ทิศทางกำกับเสียงดนตรี จึงต้องใช้ทุกครั้งที่ดนตรีวนกลับ หมายเหตุประกอบเป็นเฟอร์นิเจอร์หน้า หน้าพิมพ์ครั้งเดียวและอ่านตรงลงไม่ว่าจะเล่นกี่รอบ

## ตัวอย่าง

```xml
<structure>
  <annotation>Example Comments</annotation>
  <direction>
    <nathap value="ปรบไก่" />
    <chan value="1" />
    <bpm>65</bpm>
  </direction>
  <annotation>บรรทัดที่ 1 มี 7 ห้อง</annotation>
  <repeat times="2">
    <section id="s1" name="ท่อน 1" />
  </repeat>
  <annotation>End of section 1 message</annotation>
</structure>
```
