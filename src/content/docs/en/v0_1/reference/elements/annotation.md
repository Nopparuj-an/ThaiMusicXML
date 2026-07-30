---
title: <annotation>
description: A free-form comment ignored during playback
---

The `<annotation>` element contains a free-form comment that is ignored during playback. It holds either one text value or up to three aligned text values on the same line.

Its scope comes from where it sits. An annotation in `<structure>` applies to the score as a whole; one inside a `<section-ref>` or an `<ending>` applies to that part alone, which is how instrument-specific notation conventions are documented.

## Parents

- [`<structure>`](/en/v0_1/reference/elements/structure/)
- [`<repeat>`](/en/v0_1/reference/elements/repeat/)
- [`<section-ref>`](/en/v0_1/reference/elements/section-ref/)
- [`<ending>`](/en/v0_1/reference/elements/ending/)

## Content

Either plain text or one [`<text>`](/en/v0_1/reference/elements/text/) child per alignment. The `<text>` children are optional, but each alignment can appear at most once.

| Child | Required | Description |
| ----- | -------- | ----------- |
| `<text align="left">` | No | Text aligned to the left edge. |
| `<text align="center">` | No | Text aligned to the center. |
| `<text align="right">` | No | Text aligned to the right edge. |

The `align` attribute accepts `left`, `center`, or `right`. The renderer treats these children as three separate positions on one line rather than as adjacent inline text.

Plain text is shorthand for a left-aligned text child.

Where an element has `<text>` children, they carry the whole content and any text sitting beside them is ignored. This is what lets an `<annotation>` be indented across several lines without the surrounding whitespace being read as content. Text that is not merely whitespace is still discarded, so a validator warns.

## Example

```xml
<annotation>บรรทัดที่ 1 มี 7 ห้อง</annotation>
```

```xml
<annotation>
  <text align="left">ท่อน 1</text>
  <text align="center">Lao Duang Duen</text>
  <text align="right">หน้า 1</text>
</annotation>
```

```xml
<annotation>
  <text align="center">Centered annotation</text>
</annotation>
```

```xml
<!-- Inside a <section-ref>: documents one instrument's notation -->
<annotation>0 = ฉิ่ง / 1 = ฉับ</annotation>
```

## Conformance

- At most one `<text>` child per `align` value.
- Where an `<annotation>` has `<text>` children, they are its content and any sibling text is ignored. Validators should warn when the ignored text is not merely whitespace.

## Rendering

An annotation renders where its position puts it: in the title band, between two section blocks, or above one part's first row. See [Annotations](/en/v0_1/reference/rendering/#annotations).
