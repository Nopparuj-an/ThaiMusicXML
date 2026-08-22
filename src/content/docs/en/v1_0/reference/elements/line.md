---
title: <line>
description: A musical line (phrase) within a section
---

The `<line>` element contains a musical line or phrase within a section.

## Parent

[`<section-ref>`](/en/v1_0/reference/elements/section-ref/)

## Attributes

| Attribute | Required | Type | Description |
|-----------|----------|------|-------------|
| `number` | Yes | integer | 1-based line number within the containing `<section-ref>`. |

## Children

One to eight [`<measure>`](/en/v1_0/reference/elements/measure/) elements. Eight is a hard limit. Many lines have fewer, depending on the song.

## Numbering

Line numbers are local to the containing `<section-ref>`. They start at `1` for each section reference and increase by one for each line.

## Conformance

- A `<line>` must contain between one and eight `<measure>` elements. Validators must reject a line with nine or more.
- `number` must match the line's position in its `<section-ref>`, counting from `1`. Lines must appear in ascending order.

## Rendering

Measure cells are a fixed width across the whole score, so a line with fewer than eight measures renders left-aligned and stops short rather than stretching to fill the row. See [The measure grid](/en/v1_0/reference/rendering/#the-measure-grid).

## Example

```xml
<line number="1">
  <measure number="1"><note pitch="ด"/><note pitch="ร"/><note pitch="ม"/><note pitch="ร"/></measure>
  <measure number="2"><note pitch="ซ"/><note pitch="ม"/><note pitch="ร"/><note pitch="ด"/></measure>
</line>
```
