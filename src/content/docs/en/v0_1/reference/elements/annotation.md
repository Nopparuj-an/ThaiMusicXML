---
title: <annotation>
description: A free-form comment ignored during playback
---

The `<annotation>` element contains a free-form comment that is ignored during playback. It can contain one text value or up to three aligned text values on the same line.

## Parents

- [`<structure>`](/en/v0_1/reference/elements/structure/)
- [`<section-ref>`](/en/v0_1/reference/elements/section-ref/)

## Attributes

| Attribute | Required | Type   | Description                                                               |
| --------- | -------- | ------ | ------------------------------------------------------------------------- |
| `target`  | No       | string | Scope of the annotation. `"instrument"` limits it to the containing part. |

## Content

Either plain text or one `<text>` child for each alignment. The `text` children are optional, but each alignment can appear at most once.

| Child | Required | Description |
| ----- | -------- | ----------- |
| `<text align="left">` | No | Text aligned to the left edge. |
| `<text align="center">` | No | Text aligned to the center. |
| `<text align="right">` | No | Text aligned to the right edge. |

The `align` attribute accepts `left`, `center`, or `right`. The renderer treats these children as separate positions on one line, not as adjacent inline text.

Plain text is shorthand for a left-aligned text child. Do not mix plain text with `<text>` children.

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
<annotation target="instrument">0 = ฉิ่ง / 1 = ฉับ</annotation>
```

## Notes

- When `target="instrument"` is used inside `<section-ref>`, the annotation documents notation conventions for that specific instrument.
