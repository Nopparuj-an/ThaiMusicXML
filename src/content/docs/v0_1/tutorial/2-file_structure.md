---
title: File Structure
description: How ThaiMusicXML files are organized
---

Building on the [Hello World](/v0_1/tutorial/1-hello_world/) example, let's look at what a full ThaiMusicXML file adds: multiple instruments, structure annotations, performance directions, and section repeats.

## Example XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<thai-score version="0.1">
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

## Header

The `<header>` can include a `<composer>` alongside `<title>`:

```xml
<header>
  <title>Example Song</title>
  <composer>Example Composer</composer>
</header>
```

## Structure

The `<structure>` element mixes several types of children to describe the score layout:

```xml
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
```

- **`<annotation>`** — Free-form comments that can appear anywhere. They are ignored by playback. The `target` attribute (optional) specifies what the annotation refers to.
- **`<direction>`** — Performance directions. Here we set the ชั้น (`<chan>`) and tempo (`<bpm>`). ชั้น (chan) is the Thai rhythmic layer system — `value="1"` means ชั้นเดียว.
- **`<section>`** — Defines a named section. The `repeat` attribute indicates how many times the section is played.

## Multiple Instruments

The `<ensemble>` can list multiple parts:

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

Each instrument gets its own `<part-data>` element with a matching `id`. In this example, P1 is a Ranat Ek (ระนาดเอก, a Thai xylophone) and P2 is a Ching (ฉิ่ง, small cymbals).

## Part Data

Each `<part-data>` links to a section via `<section-ref>`. The Ching part includes an instrument-specific annotation explaining its notation:

```xml
<part-data id="P2">
  <section-ref id="s1">
    <annotation target="instrument">0 = ฉิ่ง / 1 = ฉับ</annotation>
    <line number="1">
      <measure number="1"><rest/><note pitch="0"/><rest/><note pitch="1"/></measure>
      ...
    </line>
  </section-ref>
</part-data>
```

The `target="instrument"` attribute tells us this comment applies specifically to the instrument. It documents the Ching notation convention: `0` means ฉิ่ง (open) and `1` means ฉับ (closed).
