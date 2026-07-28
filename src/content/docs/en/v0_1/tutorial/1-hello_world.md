---
title: Hello World
description: Your first ThaiMusicXML file
---

This example shows a simple score for one instrument: a Ranat Ek (ระนาดเอก) playing the first line of a song.

## Example XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="https://thaimusicxml.anan.ovh/ns/0.1" version="0.1">
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
  <part-data part="P1">
    <section-ref section="s1">
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
<thai-score xmlns="https://thaimusicxml.anan.ovh/ns/0.1" version="0.1">
```

The `<thai-score>` element is the root of a ThaiMusicXML document. The `xmlns` attribute declares the ThaiMusicXML namespace, which is how tools tell these elements apart from any other XML vocabulary, and `version` identifies which ThaiMusicXML version the file follows.

```xml
<header>
  <title>Lao Duang Duen</title>
</header>
```

The `<header>` element contains score metadata. It must include a `<title>`, which is the title of a Thai song in this example. It can also carry a `<composer>` and a `<tuning>`.

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
<part-data part="P1">
  <section-ref section="s1">
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

The `<part-data>` element holds the music for a part. Its `part` attribute names a part in `<ensemble>`. Inside it, `<section-ref>` links to a section in `<structure>`. The music is organized into `<line>` elements, each containing `<measure>` elements with a `number` attribute.

Notes use Thai scale names in the `pitch` attribute. Each degree has three interchangeable single-character spellings, so `pitch="1"`, `pitch="D"`, and `pitch="ด"` all name the same note:

| Number | Thai | Romanized | Solfège |
| ------ | ---- | --------- | ------- |
| 1      | ด    | D         | Do      |
| 2      | ร    | R         | Re      |
| 3      | ม    | M         | Mi      |
| 4      | ฟ    | F         | Fa      |
| 5      | ซ    | S         | Sol     |
| 6      | ล    | L         | La      |
| 7      | ท    | T         | Ti      |

The solfège column is only for reading the table aloud. The three columns on the left are the valid `pitch` values.

Adding ํ (Nikhahit) after a note name raises it by an octave. Adding ฺ (Pinthu) lowers it by an octave. For example, `ดํ` is ด one octave higher, and `ทฺ` is ท one octave lower. The modifiers work with any of the three spellings.

```xml
<rest/>
```

A rest is a self-closing element with no attributes. It takes one beat, the same as a note, and means the instrument strikes nothing new on that beat. Thai notation has no sustain marking, so a note left ringing under a following rest is simply how the instrument behaves.

This is a complete ThaiMusicXML file. Next, see [File Structure](/en/v0_1/tutorial/2-file_structure/) to learn how to add multiple instruments, sections, and performance directions.
