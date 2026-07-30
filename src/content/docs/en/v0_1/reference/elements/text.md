---
title: <text>
description: One aligned run of text within an annotation or a credit
---

The `<text>` element holds one aligned run of text inside an [`<annotation>`](/en/v0_1/reference/elements/annotation/) or a credit.

Its parent renders as a single line carrying up to three positions, left, center, and right. Each `<text>` claims one of them. This is what puts the หน้าทับ name on the left of a score and the composer on the right of the same line, without either being written as padded plain text.

## Parents

- [`<annotation>`](/en/v0_1/reference/elements/annotation/)
- [`<composer>`](/en/v0_1/reference/elements/composer/)
- [`<lyricist>`](/en/v0_1/reference/elements/lyricist/)
- [`<arranger>`](/en/v0_1/reference/elements/arranger/)

## Attributes

| Attribute | Required | Type        | Description                                    |
| --------- | -------- | ----------- | ---------------------------------------------- |
| `align`   | Yes      | enumeration | `"left"`, `"center"`, or `"right"`.            |

`align` is required. A `<text>` exists to say where its text sits, and a parent that needs only one run in the default position writes plain text instead.

## Content

Text, and nothing else. `<text>` takes no child elements.

The text prints exactly as written. Nothing is prefixed, appended, or generated around it, which is why a credit reading `ผู้ประพันธ์ : พระประดิษฐไพเราะ` is one where the arranger typed the label as part of the string. See [The title band](/en/v0_1/reference/rendering/#the-title-band).

## Example

```xml
<annotation>
  <text align="left">ท่อน 1</text>
  <text align="center">Lao Duang Duen</text>
  <text align="right">หน้า 1</text>
</annotation>
```

```xml
<composer>
  <text align="right">ผู้ประพันธ์ : พระประดิษฐไพเราะ</text>
</composer>
```

## Three positions, not three columns

A parent's `<text>` children are three positions on one line rather than runs of text set next to each other. They are placed independently, so leaving out the center one does not move the other two, and the order they appear in the document does not affect where they land.

Long runs are the arranger's problem rather than the renderer's. Nothing reflows or truncates a `<text>` that collides with its neighbour.

## Reading it as metadata

A tool pulling a credit out of a file as a plain string concatenates the `<text>` children left to right, in `align` order rather than document order. `align="left"`, then `center`, then `right`.

## Conformance

- `align` is required, and must be `"left"`, `"center"`, or `"right"`. Validators must reject any other value.
- A parent may hold at most one `<text>` per `align` value.
- `<text>` must contain text only. Child elements are invalid.
- Where a parent has `<text>` children, they are its content and any text beside them is ignored. Validators should warn when the ignored text is not merely whitespace. See [`<annotation>`](/en/v0_1/reference/elements/annotation/#conformance).

## Rendering

The three positions render on one line, in the title band or between section blocks depending on where the parent sits. See [Annotations](/en/v0_1/reference/rendering/#annotations) and [The title band](/en/v0_1/reference/rendering/#the-title-band).
