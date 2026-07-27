---
title: <section-ref>
description: References a section and contains its music data
---

The `<section-ref>` element references a section and contains its music data.

## Parent

[`<part-data>`](/en/v0_1/reference/elements/part-data/)

## Attributes

| Attribute | Required | Type  | Description                                         |
| --------- | -------- | ----- | --------------------------------------------------- |
| `id`      | Yes      | IDREF | References a `<section id="...">` in `<structure>`. |

## Children

- [`<annotation>`](/en/v0_1/reference/elements/annotation/) - optional, can appear before lines
- [`<line>`](/en/v0_1/reference/elements/line/) - one or more

## Numbering

Each `<section-ref>` has its own line-numbering scope. Line numbers start at `1` in every section reference. Measure numbers also restart at `1` for every line.

The section's `number` attribute identifies its order in `<structure>` and does not affect line or measure numbering. Repeating a section does not change these numbers.

## Example

```xml
<section-ref id="s1">
  <annotation target="instrument">0 = ฉิ่ง / 1 = ฉับ</annotation>
  <line number="1">
    <measure number="1"><rest/><note pitch="0"/><rest/><note pitch="1"/></measure>
  </line>
</section-ref>
```
