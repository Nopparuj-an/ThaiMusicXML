---
title: Hello World
description: Your first ThaiMusicXML file
---

Welcome to ThaiMusicXML. Let's look at a simple score for one instrument. A Ranat Ek (ระนาดเอก) playing first line of a song:

## Example XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<thai-score version="0.1">
  <header>
    <title>Lao Duang Duen</title>
  </header>
  <structure>
    <section id="s1" number="1" name="ท่อน 1" />
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

Let's look at each element in turn.

```xml
<?xml version="1.0" encoding="UTF-8"?>
```

This is the XML declaration required of all XML documents. We have specified that the characters are written in the Unicode encoding UTF-8.

```xml
<thai-score version="0.1">
```

This is the root element of a ThaiMusicXML document. The `version` attribute indicates which version of ThaiMusicXML is being used.

```xml
<header>
  <title>Lao Duang Duen</title>
</header>
```

The `<header>` element contains metadata about the score. At minimum, you need a `<title>`. Here we use the title of a well-known Thai song.

```xml
<structure>
  <section id="s1" number="1" name="ท่อน 1" />
</structure>
```

The `<structure>` element defines the layout of the score. Each `<section>` has an `id` that is referenced later in `<section-ref>` to attach music data. The `number` attribute gives the section order, and `name` is a human-readable label.

```xml
<ensemble>
  <part id="P1">
    <instrument-name>Ranat Ek</instrument-name>
  </part>
</ensemble>
```

The `<ensemble>` element lists all instruments. Each `<part>` has a unique `id` and an `<instrument-name>`. Here we have one Ranat Ek (ระนาดเอก, a Thai xylophone).

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

The `<part-data>` element holds the actual music for a part. The `id` matches a part in `<ensemble>`. Inside, `<section-ref>` links to a section defined in `<structure>`. The music is organized into `<line>` elements (visual lines on the page), each containing `<measure>` elements. Each measure has a `number` attribute.

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

A rest is a self-closing element — it takes no attributes. Its duration is implied by context (one beat in this score).

That's it. A complete ThaiMusicXML file. Next, we'll look at [File Structure](/en/v0_1/tutorial/2-file_structure/) to see how to add multiple instruments, sections, and performance directions.
