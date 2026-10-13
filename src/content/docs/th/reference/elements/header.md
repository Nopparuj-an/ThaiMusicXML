---
title: <header>
description: ข้อมูลอื่น ๆ ของโน้ต ได้แก่ ชื่อเพลง ผู้อยู่เบื้องหลัง การปรับเสียงที่ใช้เขียน และเงื่อนไขการเผยแพร่
---

องค์ประกอบ `<header>` บรรจุข้อมูลอื่น ๆ ของโน้ต: ชื่อเพลง ผู้อยู่เบื้องหลัง การปรับเสียง และเงื่อนไขการเผยแพร่

## องค์ประกอบแม่

[`<thai-score>`](/th/reference/elements/thai-score/)

## ลูก

ตามลำดับ:

1. [`<title>`](/th/reference/elements/title/) - หนึ่งเดียว
2. [`<composer>`](/th/reference/elements/composer/) - ศูนย์หรือมากกว่า หนึ่งต่อผู้ประพันธ์
3. [`<lyricist>`](/th/reference/elements/lyricist/) - ศูนย์หรือมากกว่า หนึ่งต่อผู้แต่งคำร้อง
4. [`<arranger>`](/th/reference/elements/arranger/) - ศูนย์หรือมากกว่า หนึ่งต่อผู้เรียบเรียง
5. [`<tuning>`](/th/reference/elements/tuning/) - ศูนย์หรือหนึ่ง
6. [`<license>`](/th/reference/elements/license/) - ศูนย์หรือหนึ่ง

เฉพาะ `<title>` ที่จำเป็น เพลงไทยเดิมส่วนใหญ่เป็นเพลงโบราณ โน้ตที่ไม่มีใครให้เครดิตจึงถือเป็นเรื่องปกติ ไม่ใช่ว่าโน้ตนั้นไม่สมบูรณ์

## ตัวอย่าง

```xml
<header>
  <title>Lao Duang Duen</title>
  <composer>Traditional</composer>
  <tuning reference="c-major" />
</header>
```

```xml
<header>
  <title>Example Song</title>
  <composer>Example Composer</composer>
  <lyricist>Example Lyricist</lyricist>
  <arranger>Example Arranger</arranger>
  <tuning reference="khrueang-sai" />
  <license>CC BY-SA 4.0</license>
</header>
```
