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
| `id` | No | token | Optional identifier, unique among all `<line>` elements in the document. Exists for a [foreign-namespace extension](/en/v1_0/reference/elements/thai-score/#extensions) to reference; ThaiMusicXML itself does not use it. |

## Children

In order:

- [`<annotation>`](/en/v1_0/reference/elements/annotation/) - zero or more, before the measures
- [`<measure>`](/en/v1_0/reference/elements/measure/) - one to eight

Eight measures is a hard limit. Many lines have fewer, depending on the song.

An annotation here belongs to this line of this part, which is what separates it from one on the [`<section-ref>`](/en/v1_0/reference/elements/section-ref/) around it. A section-ref annotation says something about the whole section - what an instrument's `sound` codes mean, say - and prints once above it. A line annotation says something about this line, `กรอ` over the passage it applies to, and prints above that line wherever it falls.

## Numbering

Line numbers are local to the containing `<section-ref>`. They start at `1` for each section reference and increase by one for each line.

## Conformance

- A `<line>` must contain between one and eight `<measure>` elements. Validators must reject a line with nine or more.
- Any `<annotation>` children come before the measures, not between them.
- `number` must match the line's position in its `<section-ref>`, counting from `1`. Lines must appear in ascending order.
- `id`, when present, must be unique among all `<line>` elements in the document.

## Rendering

Measure cells are a fixed width across the whole score, so a line with fewer than eight measures renders left-aligned and stops short rather than stretching to fill the row. See [The measure grid](/en/v1_0/reference/rendering/#the-measure-grid).

## Example

```xml
<line number="1">
  <measure number="1"><note pitch="ด"/><note pitch="ร"/><note pitch="ม"/><note pitch="ร"/></measure>
  <measure number="2"><note pitch="ซ"/><note pitch="ม"/><note pitch="ร"/><note pitch="ด"/></measure>
</line>
```

```xml
<!-- With a note to the player, printed above this line only -->
<line number="2">
  <annotation>กรอ</annotation>
  <measure number="1"><note pitch="ล"/><note pitch="ซ"/><note pitch="ม"/><note pitch="ร"/></measure>
</line>
```
