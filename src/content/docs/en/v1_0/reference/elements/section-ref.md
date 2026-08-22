---
title: <section-ref>
description: References a section and contains its music data
---

The `<section-ref>` element references a section and contains its music data.

`<section>` in `<structure>` declares that the section exists. `<section-ref>` is where one part's notes for that section actually live.

## Parent

[`<part-data>`](/en/v1_0/reference/elements/part-data/)

## Attributes

| Attribute | Required | Type  | Description                                         |
| --------- | -------- | ----- | --------------------------------------------------- |
| `section` | Yes      | IDREF | References a `<section id="...">` in `<structure>`. |

## Children

In order:

- [`<annotation>`](/en/v1_0/reference/elements/annotation/) - zero or more, before the lines
- [`<line>`](/en/v1_0/reference/elements/line/) - one or more
- [`<ending>`](/en/v1_0/reference/elements/ending/) - zero or more, per-pass variations for a repeated section

## Numbering

Each `<section-ref>` has its own line-numbering scope. Line numbers start at `1` in every section reference. Measure numbers also restart at `1` for every line.

The section's order among the `<section>` elements in `<structure>` does not affect line or measure numbering. Repeating a section does not change these numbers.

## Conformance

All `<section-ref>` elements referencing the same `<section>` must agree on three counts: the number of `<line>` elements, the number of `<measure>` elements in each corresponding line (matched by `number`), and the number of beats in each corresponding measure. This keeps a given measure and beat aligned to the same span of time across every part. Validators must reject documents that violate this rule.

A [lyric part](/en/v1_0/reference/elements/part/#part-types) is bound by the first two counts and exempt from the third. It shares the line and measure grid like everything else, but its measures hold as many items as the words need rather than one per beat, so there is no beat count to compare. A lyric part also takes no part in the comparison for other parts: a four-beat measure stays a four-beat measure whatever the lyric row above it contains.

Within a measure, how a part fills its beats is its own business. A measure's beat count is the number of its `<note>`, `<rest>`, and `<group>` children, so one part may play four notes where another plays a note, two rests, and a `<group>` of three. All four still add up to four beats. See [`<measure>`](/en/v1_0/reference/elements/measure/#beats).

If the section repeats, the rule applies per resolved pass. Resolve every part's [`<ending>`](/en/v1_0/reference/elements/ending/) overrides first, then compare counts across parts.

A part may leave out a section entirely. If an instrument is silent for the whole of ท่อน 2, its `<part-data>` simply has no `<section-ref>` for that section, and the rule above applies only to the parts that do reference it.

A `<part-data>` must not contain two `<section-ref>` elements referencing the same `<section>`.

## Example

```xml
<section-ref section="s1">
  <annotation>0 = ฉิ่ง / 1 = ฉับ</annotation>
  <line number="1">
    <measure number="1"><rest/><note sound="0"/><rest/><note sound="1"/></measure>
  </line>
</section-ref>
```
