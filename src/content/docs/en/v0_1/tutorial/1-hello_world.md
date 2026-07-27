---
title: Hello World
description: Your first ThaiMusicXML file
---

This example shows a simple score for one instrument: a Ranat Ek (ระนาดเอก) playing the first line of a song.

## Example XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<thai-score version="0.1">
  <header>
    <title>Lao Duang Duen</title>
  </header>
  <structure>
    <section id="s1" name="ท่อน 1" />
  </structure>
  <ensemble>
    <part id="P1">
      <instrument-name>Ranat Ek</instrument-name>
    </part>
  </ensemble>
  <part-data id="P1">
    <section-ref id="s1">
      <line number="1">
        <measure number="1">
          <rest/><rest/><rest/><rest/>
        </measure>
        <measure number="2">
          <rest/><rest/><rest/><rest/>
        </measure>
        <measure number="3">
          <rest/><note pitch="ด"/><note pitch="ร"/><note pitch="ม"/>
        </measure>
        <measure number="4">
          <rest/><note pitch="ซ"/><rest/><note pitch="ดํ"/>
        </measure>
        <measure number="5">
          <rest/><rest/><rest/><note pitch="รํ"/>
        </measure>
        <measure number="6">
          <note pitch="ดํ"/><note pitch="ดํ"/><note pitch="ดํ"/><note pitch="ดํ"/>
        </measure>
        <measure number="7">
          <note pitch="ซ"/><note pitch="ล"/><note pitch="ดํ"/><note pitch="ล"/>
        </measure>
        <measure number="8">
          <note pitch="ซ"/><note pitch="ม"/><rest/><note pitch="ซ"/>
        </measure>
      </line>
    </section-ref>
  </part-data>
</thai-score>
```

## Explanations

The following sections explain each element.

```xml
<?xml version="1.0" encoding="UTF-8"?>
```

This XML declaration identifies the document as XML and specifies UTF-8 encoding.

```xml
<thai-score version="0.1">
```

The `<thai-score>` element is the root of a ThaiMusicXML document. Its `version` attribute identifies the ThaiMusicXML version.

```xml
<header>
  <title>Lao Duang Duen</title>
</header>
```

The `<header>` element contains score metadata. It must include a `<title>`, which is the title of a Thai song in this example.

```xml
<structure>
  <section id="s1" name="ท่อน 1" />
</structure>
```

The `<structure>` element defines the score layout. Each `<section>` has an `id` that `<section-ref>` uses later to attach music data, and an optional `name` label for readers. A section's order in the score is its position among the `<section>` elements in `<structure>`.

```xml
<ensemble>
  <part id="P1">
    <instrument-name>Ranat Ek</instrument-name>
  </part>
</ensemble>
```

The `<ensemble>` element lists the instruments. Each `<part>` has a unique `id` and an `<instrument-name>`. This example has one Ranat Ek (ระนาดเอก, a Thai xylophone).

```xml
<part-data id="P1">
  <section-ref id="s1">
    <line number="1">
      <measure number="1">
        <rest/><rest/><rest/><rest/>
      </measure>
      <measure number="2">
        <rest/><rest/><rest/><rest/>
      </measure>
      <measure number="3">
        <rest/><note pitch="ด"/><note pitch="ร"/><note pitch="ม"/>
      </measure>
      ...
    </line>
  </section-ref>
</part-data>
```

The `<part-data>` element holds the music for a part. Its `id` matches a part in `<ensemble>`. Inside it, `<section-ref>` links to a section in `<structure>`. The music is organized into `<line>` elements, each containing `<measure>` elements with a `number` attribute.

Notes use Thai scale names in the `pitch` attribute:

| Number | Thai | Romanized | Sound (C Major) |
| ------ | ---- | --------- | --------------- |
| 1      | ด    | Do        | C               |
| 2      | ร    | Re        | D               |
| 3      | ม    | Mi        | E               |
| 4      | ฟ    | Fa        | F               |
| 5      | ซ    | Sol       | G               |
| 6      | ล    | La        | A               |
| 7      | ท    | Ti        | B               |

Adding ํ (Nikhahit) after a note name raises it by an octave. Adding ฺ (Pinthu) lowers it by an octave. For example, `ดํ` is ด one octave higher, and `ทฺ` is ท one octave lower.

```xml
<rest/>
```

A rest is a self-closing element with no attributes. Its duration comes from the context, one beat in this score.

This is a complete ThaiMusicXML file. Next, see [File Structure](/en/v0_1/tutorial/2-file_structure/) to learn how to add multiple instruments, sections, and performance directions.
