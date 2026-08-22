---
title: ∙ ตัวอย่าง
description: ตัวอย่างสำหรับ ThaiMusicXML
---

โน้ตเต็มที่แสดงแนวคิด ThaiMusicXML ในบริบทจริง

## [แขกบรเทศ](/th/v1_0/reference/examples/khaek-borathes/)

เพลงสองเครื่องดนตรี (ระนาดเอก, ฆ้องวงใหญ่) ครอบคลุม:

- [`<header>`](/th/v1_0/reference/elements/header/) ที่มี `<title>`
- [`<direction>`](/th/v1_0/reference/elements/direction/) ที่ตั้ง [`<chan>`](/th/v1_0/reference/elements/chan/) และ [`<bpm>`](/th/v1_0/reference/elements/bpm/)
- [`<repeat>`](/th/v1_0/reference/elements/repeat/) ที่ครอบ [`<section>`](/th/v1_0/reference/elements/section/) เพื่อเล่นสองครั้ง
- [`<ensemble>`](/th/v1_0/reference/elements/ensemble/), [`<part>`](/th/v1_0/reference/elements/part/), และ [`<part-data>`](/th/v1_0/reference/elements/part-data/) สำหรับเครื่องดนตรีหลายตัวที่ใช้ท่อนเดียวกัน
- แอตทริบิวต์ `stack` และ `row` ของ `<part>` ที่เชื่อมฆ้องวงใหญ่ R และ L เป็นสองแถวของเครื่องดนตรีเดียว
- เนื้อหา [`<section-ref>`](/th/v1_0/reference/elements/section-ref/) หลายบรรทัดที่ซิงค์ข้ามพาร์ต
- ระดับเสียง [`<note>`](/th/v1_0/reference/elements/note/) ที่ใช้ตัวปรับ octaves ของไทย (นิคหิตและพินทุ)
- [`<rest>`](/th/v1_0/reference/elements/rest/)
- [`<group>`](/th/v1_0/reference/elements/group/) ที่แบ่งจังหวะเป็นสามส่วน พร้อมช่วง [`<link>`](/th/v1_0/reference/elements/link/) ที่เชื่อมการรัวกับโน้ตของอีกแถว

## [สาธุการ](/th/v1_0/reference/examples/sathukan/)

โน้ตฆ้องวงใหญ่สองแถวของเพลงหน้าพาทย์ สาธุการ ครอบคลุม:

- [`<section>`](/th/v1_0/reference/elements/section/) สี่ส่วนที่แบ่งตรงจุดแยกทางที่ต้นฉบับกำกับไว้ด้วยสัญญาณสด แต่ละจุดถ่ายทอดมาเป็น [`<annotation>`](/th/v1_0/reference/elements/annotation/) แทนที่จะเข้ารหัสเป็นการเล่นซ้ำ
- แอตทริบิวต์ `stack` และ `row` ของ `<part>` ที่เชื่อมฆ้องวงใหญ่ R และ L เป็นสองแถวของเครื่องดนตรีเดียว
- โน้ตยาวที่เขียนโดยไม่มีตัวปรับ octave ของไทยเลยสักตัว
- [`<rest>`](/th/v1_0/reference/elements/rest/) โดยไม่มี [`<direction>`](/th/v1_0/reference/elements/direction/) เลย

## [ชื่นชุมนุม - กลุ่มดนตรี](/th/v1_0/reference/examples/chuen-chumnum/)

โน้ตเครื่องดนตรีเดียว (ซออู้) ที่รวมเพลงสองชั้นสั้นสองเพลงไว้ในไฟล์เดียว ครอบคลุม:

- [`<direction>`](/th/v1_0/reference/elements/direction/) ที่ตั้งเฉพาะ [`<chan>`](/th/v1_0/reference/elements/chan/) โดยไม่มี [`<bpm>`](/th/v1_0/reference/elements/bpm/)
- สองเพลงในไฟล์เดียวเป็น [`<section>`](/th/v1_0/reference/elements/section/) สองส่วน โดย `name` ของแต่ละส่วนใช้ภายในไฟล์เท่านั้น ส่วนหัวข้อที่พิมพ์บนโน้ตมาจาก [`<annotation>`](/th/v1_0/reference/elements/annotation/) แบบกึ่งกลางใน `<structure>` แทน
- [`<br>`](/th/v1_0/reference/elements/br/) เว้นที่ว่างก่อนหัวข้อแต่ละอัน
- ระดับเสียง [`<note>`](/th/v1_0/reference/elements/note/) ที่ใช้ตัวปรับ octave เฉพาะนิคหิต ไม่มีพินทุ
- ช่วง [`<bow>`](/th/v1_0/reference/elements/bow/) ที่กำกับการสีต่อเนื่องหนึ่งจังหวะคันชัก รวมถึงช่วงที่มีโน้ตเดียวและช่วงที่ข้ามเส้นห้อง

## [โหมโรงจอมสุรางค์](/th/v1_0/reference/examples/chomsurang/)

โน้ตทำนองเดียวสำหรับเพลงโหมโรง โหมโรงจอมสุรางค์ ครอบคลุม:

- [`<repeat times="2">`](/th/v1_0/reference/elements/repeat/) ที่ครอบ section พร้อม [`<ending pass="2">`](/th/v1_0/reference/elements/ending/) แทนที่เฉพาะบรรทัดสุดท้าย
- ช่วง [`<parenthesis>`](/th/v1_0/reference/elements/parenthesis/) แบบ `dim="true"` กำกับช่วงที่คร่อมด้วยวงเล็บในต้นฉบับให้เป็นคิว ไม่ใช่ตัวที่เล่นจริง
- [`<group>`](/th/v1_0/reference/elements/group/) ที่แบ่งจังหวะเป็นสองส่วนในห้องหนึ่ง และแบ่งเป็นสามส่วนในอีกห้องหนึ่ง
- [`<instrument-name>`](/th/v1_0/reference/elements/instrument-name/) ที่เว้นว่างไว้ สำหรับแนวที่ต้นฉบับไม่ได้ระบุเครื่องดนตรี
