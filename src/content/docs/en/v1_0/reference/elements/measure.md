---
title: <measure>
description: A single measure (ห้อง) containing notes and rests
---

The `<measure>` element contains the notes and rests in a single measure (ห้อง).

## Parent

[`<line>`](/en/v1_0/reference/elements/line/)

## Attributes

| Attribute | Required | Type | Description |
|-----------|----------|------|-------------|
| `number` | Yes | integer | 1-based measure number within the containing `<line>`. |
| `id` | No | token | Optional identifier, unique among all `<measure>` elements in the document. Exists for a [foreign-namespace extension](/en/v1_0/reference/elements/thai-score/#extensions) to reference; ThaiMusicXML itself does not use it. |

## Children

In a pitched or unpitched part, a sequence of [`<note>`](/en/v1_0/reference/elements/note/), [`<rest>`](/en/v1_0/reference/elements/rest/), and [`<group>`](/en/v1_0/reference/elements/group/) elements, optionally interspersed with [`<bow>`](/en/v1_0/reference/elements/bow/) and [`<parenthesis>`](/en/v1_0/reference/elements/parenthesis/) markers.

In a lyric part, a sequence of [`<syllable>`](/en/v1_0/reference/elements/syllable/) and `<rest>` elements, and nothing else. See [`<part>`](/en/v1_0/reference/elements/part/#part-types).

## Beats

A measure is divided into beats. Each `<note>`, `<rest>`, and `<group>` occupies exactly one beat. A [`<group>`](/en/v1_0/reference/elements/group/) splits its single beat among its own children instead of adding beats to the measure, so a measure's beat count is the number of its `<note>`, `<rest>`, and `<group>` children.

`<bow>` and `<parenthesis>` are zero-duration markers. They occupy no beat and do not affect the count.

How many beats a measure has depends on the piece. Four is the common pattern.

A beat arrives on its last slot, so a measure is read as travelling toward its final note rather than starting from its first, and that final note lands on the measure's closing boundary. This governs where a [`<group>`](/en/v1_0/reference/elements/group/#where-the-children-fall)'s children fall and where every symbol sits in the cell.

Every part plays the same measure over the same span of time, so corresponding measures must agree on beat count across parts. What each part does within those beats is free: one instrument may play four notes where another plays a note, two rests, and a `<group>` of three.

A lyric part is outside this. Its measures hold as many items as the words need, so they have no beat count to agree on, and the item count is instead what decides how the syllables sit in the cell. See [`<syllable>`](/en/v1_0/reference/elements/syllable/#counting).

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
- Corresponding measures across all parts referencing the same section must have the same beat count. Lyric parts are excluded from this. See [`<section-ref>`](/en/v1_0/reference/elements/section-ref/#conformance).
- A measure's children must match its part's `type`: `<note>`, `<rest>`, and `<group>` in a pitched or unpitched part, `<syllable>` and `<rest>` in a lyric part.
- A measure in a pitched or unpitched part must hold at least one `<note>`, `<rest>`, or `<group>`. An empty one would be a measure of no beats, and the agreement above would force every other part's corresponding measure to no beats with it. A lyric measure may be empty, meaning nothing is sung there.
- `id`, when present, must be unique among all `<measure>` elements in the document.
