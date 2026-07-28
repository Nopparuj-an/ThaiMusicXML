---
title: <measure>
description: A single measure (ห้อง) containing notes and rests
---

The `<measure>` element contains the notes and rests in a single measure (ห้อง).

## Parent

[`<line>`](/en/v0_1/reference/elements/line/)

## Attributes

| Attribute | Required | Type | Description |
|-----------|----------|------|-------------|
| `number` | Yes | integer | 1-based measure number within the containing `<line>`. |

## Children

A sequence of [`<note>`](/en/v0_1/reference/elements/note/), [`<rest>`](/en/v0_1/reference/elements/rest/), and [`<group>`](/en/v0_1/reference/elements/group/) elements, optionally interspersed with [`<bow>`](/en/v0_1/reference/elements/bow/) and [`<parenthesis>`](/en/v0_1/reference/elements/parenthesis/) markers.

## Beats

A measure is divided into beats. Each `<note>`, `<rest>`, and `<group>` occupies exactly one beat. A [`<group>`](/en/v0_1/reference/elements/group/) splits its single beat among its own children instead of adding beats to the measure, so a measure's beat count is the number of its `<note>`, `<rest>`, and `<group>` children.

`<bow>` and `<parenthesis>` are zero-duration markers. They occupy no beat and do not affect the count.

How many beats a measure has depends on the piece. Four is the common pattern.

Every part plays the same measure over the same span of time, so corresponding measures must agree on beat count across parts. What each part does within those beats is free: one instrument may play four notes where another plays a note, two rests, and a `<group>` of three.

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
- Corresponding measures across all parts referencing the same section must have the same beat count. See [`<section-ref>`](/en/v0_1/reference/elements/section-ref/#conformance).
