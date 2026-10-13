---
title: <measure>
description: "A single measure (ห้อง) holding one part's notes and rests, or its words or chord symbols. Every notated part agrees on how many beats a given measure has."
---

The `<measure>` element contains the notes and rests in a single measure (ห้อง).

## Parent

[`<line>`](/en/reference/elements/line/)

## Attributes

| Attribute | Required | Type | Description |
|-----------|----------|------|-------------|
| `number` | Yes | integer | 1-based measure number within the containing `<line>`. |
| `id` | No | token | Optional identifier, unique among all `<measure>` elements in the document. Exists for a [foreign-namespace extension](/en/reference/elements/thai-score/#extensions) to reference; ThaiMusicXML itself does not use it. |

## Children

In a pitched or unpitched part, a sequence of [`<note>`](/en/reference/elements/note/), [`<rest>`](/en/reference/elements/rest/), and [`<group>`](/en/reference/elements/group/) elements, optionally interspersed with [`<bow>`](/en/reference/elements/bow/), [`<parenthesis>`](/en/reference/elements/parenthesis/), and [`<link>`](/en/reference/elements/link/) markers.

In a lyric part, a sequence of [`<syllable>`](/en/reference/elements/syllable/) and `<rest>` elements, and nothing else. In a chord part, a sequence of [`<chord>`](/en/reference/elements/chord/) and `<rest>` elements. See [`<part>`](/en/reference/elements/part/#part-types).

## Beats

A measure is divided into beats. Each `<note>`, `<rest>`, and `<group>` occupies exactly one beat. A [`<group>`](/en/reference/elements/group/) splits its single beat among its own children instead of adding beats to the measure, so a measure's beat count is the number of its `<note>`, `<rest>`, and `<group>` children.

`<bow>`, `<parenthesis>`, and `<link>` are zero-duration markers. They occupy no beat and do not affect the count.

How many beats a measure has depends on the piece. Four is the common pattern.

The measure itself is the unit of time. A measure lasts as long as any other measure in the score, and its beats divide that span among themselves, so a measure of five beats is not longer than one of four - it is the same span cut finer. See [`<bpm>`](/en/reference/elements/bpm/#the-unit-being-counted).

A beat arrives on its last slot, so a measure is read as travelling toward its final note rather than starting from its first, and that final note lands on the measure's closing boundary. This governs where a [`<group>`](/en/reference/elements/group/#where-the-children-fall)'s children fall and where every symbol sits in the cell.

Every part plays the same measure over the same span of time, so corresponding measures must agree on beat count across parts. What each part does within those beats is free: one instrument may play four notes where another plays a note, two rests, and a `<group>` of three.

The two text parts are outside this. A lyric measure holds as many items as the words need, so it has no beat count to agree on, and the item count is instead what decides how the syllables sit in the cell. A chord measure holds one item per beat it claims, flushed against the end of the measure, so its count is capped by the beat count but never sets it. See [`<syllable>`](/en/reference/elements/syllable/#counting) and [`<chord>`](/en/reference/elements/chord/#counting).

## Numbering

Measure numbers are local to the containing `<line>`. They start at `1` for each line and increase by one for each measure.

## Example

```xml
<measure number="1">
  <note pitch="ด"/><note pitch="ร"/><note pitch="ม"/><note pitch="ร"/>
</measure>
```

## Conformance

- `number` must match the measure's position in its `<line>`, counting from `1`. Measures must appear in ascending order.
- Corresponding measures across all parts referencing the same section must have the same beat count. Lyric and chord parts are excluded from this. See [`<section-ref>`](/en/reference/elements/section-ref/#conformance).
- A measure's children must match its part's `type`: `<note>`, `<rest>`, and `<group>` in a pitched or unpitched part, `<syllable>` and `<rest>` in a lyric part, `<chord>` and `<rest>` in a chord part.
- A chord measure must not hold more items than the measure has beats.
- A measure in a pitched or unpitched part must hold at least one `<note>`, `<rest>`, or `<group>`. An empty one would be a measure of no beats, and the agreement above would force every other part's corresponding measure to no beats with it. A lyric measure may be empty, meaning nothing is sung there, and a chord measure may be empty, meaning the chord already sounding carries on.
- `id`, when present, must be unique among all `<measure>` elements in the document.
