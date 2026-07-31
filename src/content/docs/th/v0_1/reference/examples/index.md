---
title: ∙ ตัวอย่าง
description: ตัวอย่างสำหรับ ThaiMusicXML
---

โน้ตเต็มที่แสดงแนวคิด ThaiMusicXML ในบริบทจริง

## [แขกบรเทศ](/th/v0_1/reference/examples/khaek-borathes/)

เพลงสองเครื่องดนตรี (ระนาดเอก, ฆ้องวงใหญ่) ครอบคลุม:

- [`<header>`](/th/v0_1/reference/elements/header/) ที่มี `<title>`
- [`<direction>`](/th/v0_1/reference/elements/direction/) ที่ตั้ง [`<chan>`](/th/v0_1/reference/elements/chan/) และ [`<bpm>`](/th/v0_1/reference/elements/bpm/)
- [`<repeat>`](/th/v0_1/reference/elements/repeat/) ที่ครอบ [`<section>`](/th/v0_1/reference/elements/section/) เพื่อเล่นสองครั้ง
- [`<ensemble>`](/th/v0_1/reference/elements/ensemble/), [`<part>`](/th/v0_1/reference/elements/part/), และ [`<part-data>`](/th/v0_1/reference/elements/part-data/) สำหรับเครื่องดนตรีหลายตัวที่ใช้ท่อนเดียวกัน
- แอตทริบิวต์ `stack` และ `row` ของ `<part>` ที่เชื่อมฆ้องวงใหญ่ R และ L เป็นสองแถวของเครื่องดนตรีเดียว
- เนื้อหา [`<section-ref>`](/th/v0_1/reference/elements/section-ref/) หลายบรรทัดที่ซิงค์ข้ามพาร์ต
- ระดับเสียง [`<note>`](/th/v0_1/reference/elements/note/) ที่ใช้ตัวปรับ octaves ของไทย (นิคหิตและพินทุ)
- [`<rest>`](/th/v0_1/reference/elements/rest/)
- [`<group>`](/th/v0_1/reference/elements/group/) ที่แบ่งจังหวะเป็นสามส่วน พร้อม `link` ที่เชื่อมกลุ่มกับจังหวะของอีกแถว

## [สาธุการ](/th/v0_1/reference/examples/sathukan/)

โน้ตฆ้องวงใหญ่สองแถวของเพลงหน้าพาทย์ สาธุการ ครอบคลุม:

- [`<section>`](/th/v0_1/reference/elements/section/) สี่ส่วนที่แบ่งตรงจุดแยกทางที่ต้นฉบับกำกับไว้ด้วยสัญญาณสด แต่ละจุดถ่ายทอดมาเป็น [`<annotation>`](/th/v0_1/reference/elements/annotation/) แทนที่จะเข้ารหัสเป็นการเล่นซ้ำ
- แอตทริบิวต์ `stack` และ `row` ของ `<part>` ที่เชื่อมฆ้องวงใหญ่ R และ L เป็นสองแถวของเครื่องดนตรีเดียว
- โน้ตยาวที่เขียนโดยไม่มีตัวปรับ octave ของไทยเลยสักตัว
- [`<rest>`](/th/v0_1/reference/elements/rest/) โดยไม่มี [`<direction>`](/th/v0_1/reference/elements/direction/) เลย
