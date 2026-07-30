---
title: <syllable>
description: One syllable of a lyric line
---

The `<syllable>` element holds one syllable of เนื้อร้อง.

## Parent

[`<measure>`](/en/v0_1/reference/elements/measure/), in a part whose [`type`](/en/v0_1/reference/elements/part/) is `"lyric"`.

## Content

Text, written the way it should be read. A syllable is the unit because Thai is sung a syllable at a time, but nothing stops a short whole word from filling one, and the element does not check what it holds.

## Example

```xml
<!-- Four items in a four-beat measure: each one sits under its beat -->
<measure number="4">
  <rest/>
  <rest/>
  <syllable>ละ</syllable>
  <syllable>หนอ</syllable>
</measure>
```

```xml
<!-- Three items in a four-beat measure: the run is centered in the cell -->
<measure number="7">
  <rest/>
  <syllable>ดวง</syllable>
  <rest/>
  <syllable>เดือน</syllable>
</measure>
```

## Counting

A lyric measure holds as many or as few items as the words need, and the count is what decides whether they align to beats. Match the measure's beat count and each item takes a beat; write any other number and the run is placed in the cell without reference to the beats.

Both are ordinary ways to write a lyric line. A vocal line frequently does not divide the way the melody underneath it does, and three syllables written across a four-beat measure say the words belong to that measure without claiming which beat each one lands on. See [Lyric rows](/en/v0_1/reference/rendering/#lyric-rows).

This is why a lyric part is the one part exempt from agreeing on beat count. It still shares the line and measure grid with every other part. See [`<section-ref>`](/en/v0_1/reference/elements/section-ref/#conformance).

## เอื้อน and gaps

A [`<rest>`](/en/v0_1/reference/elements/rest/) in a lyric measure means no new syllable begins on that beat. Whatever vowel is already being sung carries on, which is เอื้อน, and it is the same reading a rest has in an instrumental part: no new attack, not silence.

Rests count as items. A measure of three syllables and one rest has four items and aligns; drop the rest and the same three syllables center instead. A measure with no children at all is a measure where nothing is sung.

ThaiMusicXML v0.1 has no dedicated marker for เอื้อน beyond this. The rests say where it falls and how long it runs, and an arranger who wants it named on the page writes an [`<annotation>`](/en/v0_1/reference/elements/annotation/).

## Conformance

- `<syllable>` is valid only inside a `<measure>` in a part whose `type` is `"lyric"`.
- A lyric part's measures must contain only `<syllable>` and `<rest>` children. `<note>`, `<group>`, `<bow>`, and `<parenthesis>` are not valid there.
- A lyric measure's item count is unconstrained. It may equal the beat count of the corresponding measures in other parts, exceed it, fall short of it, or be zero.
- A lyric part must still agree with every other part on line count and on the number of measures in each line.

## Rendering

Items align to beats when their count matches the beat count, and are centered in the cell when it does not. See [Lyric rows](/en/v0_1/reference/rendering/#lyric-rows).
