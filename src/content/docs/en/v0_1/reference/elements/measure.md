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

A sequence of [`<note>`](/en/v0_1/reference/elements/note/), [`<rest>`](/en/v0_1/reference/elements/rest/), and [`<group>`](/en/v0_1/reference/elements/group/) elements.

## Numbering

Measure numbers are local to the containing `<line>`. They start at `1` for each line and increase by one for each measure.

## Example

```xml
<measure number="1">
  <note pitch="ด"/><note pitch="ร"/><note pitch="ม"/><note pitch="ร"/>
</measure>
```

## Notes

- The number of beats per measure depends on the piece. Common patterns use 4 beats per measure.
- Each `<note>`, `<rest>`, or `<group>` occupies one beat; a [`<group>`](/en/v0_1/reference/elements/group/) subdivides its one beat evenly among its own children rather than adding beats to the measure.
