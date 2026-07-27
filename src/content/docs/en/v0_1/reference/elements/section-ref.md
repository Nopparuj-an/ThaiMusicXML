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

In order:

- [`<annotation>`](/en/v0_1/reference/elements/annotation/) - optional, can appear before lines
- [`<line>`](/en/v0_1/reference/elements/line/) - one or more
- [`<ending>`](/en/v0_1/reference/elements/ending/) - optional, zero or more, per-pass variations for a repeated section

## Numbering

Each `<section-ref>` has its own line-numbering scope. Line numbers start at `1` in every section reference. Measure numbers also restart at `1` for every line.

The section's order among the `<section>` elements in `<structure>` does not affect line or measure numbering. Repeating a section does not change these numbers.

## Conformance

All `<part-data>` elements whose `<section-ref>` reference the same `<section>` must have the same number of `<line>` elements, and corresponding lines (matched by `number`) must have the same number of `<measure>` elements. This keeps a given measure number aligned to the same span of time across every part. Validators must reject documents that violate this rule.

The number of `<note>`/`<rest>` children within a corresponding measure is not required to match across parts, a measure's duration is shared, but each instrument may subdivide it differently.

If the section repeats, this rule applies per resolved pass: resolve every part's [`<ending>`](/en/v0_1/reference/elements/ending/) overrides first, then compare line and measure counts across parts.

## Example

```xml
<section-ref id="s1">
  <annotation target="instrument">0 = ฉิ่ง / 1 = ฉับ</annotation>
  <line number="1">
    <measure number="1"><rest/><note sound="0"/><rest/><note sound="1"/></measure>
  </line>
</section-ref>
```
