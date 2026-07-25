---
title: Hello World
description: Understand ThaiMusicXML
---

```xml
<?xml version="1.0" encoding="UTF-8"?>
<thai-score version="0.4">
  <header>
    <title>Example Song</title>
    <composer>Example Composer</composer>
    <structure>
      <annotation>Example Comments</annotation>
      <direction>
        <chan value="1" />
        <bpm>65</bpm>
      </direction>
      <annotation>บรรทัดที่ 1 มี 7 ห้อง</annotation>
      <section id="s1" number="1" name="ท่อน 1" repeat="2" />
      <annotation>End of section 1 message</annotation>
    </structure>
  </header>
  <ensemble>
    <part id="P1">
      <instrument-name>Ranat Ek</instrument-name>
    </part>
    <part id="P2">
      <instrument-name>Ching</instrument-name>
    </part>
  </ensemble>
  <part-data id="P1">
    <section-ref id="s1">
      <line number="1">
        <measure number="1"><note pitch="ด"/><note pitch="ร"/><note pitch="ม"/><note pitch="ร"/></measure>
        <measure number="2"><note pitch="ซ"/><note pitch="ม"/><note pitch="ร"/><note pitch="ด"/></measure>
        <measure number="3"><note pitch="ทฺ"/><note pitch="ด"/><note pitch="ร"/><note pitch="ลฺ"/></measure>
        <measure number="4"><note pitch="ทฺ"/><note pitch="ด"/><note pitch="ร"/><note pitch="ด"/></measure>
        <measure number="5"><note pitch="ร"/><note pitch="ม"/><note pitch="ฟ"/><note pitch="ซ"/></measure>
        <measure number="6"><note pitch="ล"/><note pitch="ซ"/><note pitch="ฟ"/><note pitch="ม"/></measure>
        <measure number="7"><note pitch="ร"/><note pitch="ม"/><note pitch="ฟ"/><note pitch="ซ"/></measure>
      </line>
    </section-ref>
  </part-data>
  <part-data id="P2">
    <section-ref id="s1">
      <annotation target="instrument">0 = ฉิ่ง / 1 = ฉับ</annotation>
      <line number="1">
        <measure number="1"><rest/><note pitch="0"/><rest/><note pitch="1"/></measure>
        <measure number="2"><rest/><note pitch="0"/><rest/><note pitch="1"/></measure>
        <measure number="3"><rest/><note pitch="0"/><rest/><note pitch="1"/></measure>
        <measure number="4"><rest/><note pitch="0"/><rest/><note pitch="1"/></measure>
        <measure number="5"><rest/><note pitch="0"/><rest/><note pitch="1"/></measure>
        <measure number="6"><rest/><note pitch="0"/><rest/><note pitch="1"/></measure>
        <measure number="7"><rest/><note pitch="0"/><rest/><note pitch="1"/></measure>
      </line>
    </section-ref>
  </part-data>
</thai-score>
```
