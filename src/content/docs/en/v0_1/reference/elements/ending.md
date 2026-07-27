---
title: <ending>
description: A per-instrument variation played on specific repeat passes
---

The `<ending>` element overrides or extends specific `<line>` elements for one or more passes of a repeated `<section>`, so a part can play something different on a given pass without restructuring its `<section-ref>`.

## Parent

[`<section-ref>`](/en/v0_1/reference/elements/section-ref/)

## Attributes

| Attribute | Required | Type   | Description                                                                                |
| --------- | -------- | ------ | ------------------------------------------------------------------------------------------ |
| `pass`    | Yes      | string | Comma-separated 1-based repeat pass numbers this ending applies to, e.g. `"2"` or `"1,3"`. |

## Children

In order:

1. [`<annotation>`](/en/v0_1/reference/elements/annotation/) - optional, describes the variation
2. [`<line>`](/en/v0_1/reference/elements/line/) - one or more

## Semantics

Each `<line number="N">` inside an `<ending>` either:

- **overrides** line `N`, if a line with that number already exists directly in the `<section-ref>`, replacing it for the pass(es) listed, or
- **extends** the section, if `N` continues sequentially past the highest line number in the `<section-ref>` (e.g. a coda line added only on the final pass).

For a pass not covered by any `<ending>`, the part plays its regular `<line>` elements unchanged. A `<section-ref>` with no `<ending>` elements plays identically on every pass.

Two `<ending>` elements must not cover the same line number for the same pass. That is a conflict.

`<ending>` is only valid inside a `<section-ref>` whose referenced `<section>` has a whole-section [`<repeat>`](/en/v0_1/reference/elements/repeat/) (one without `first`/`last`) with `times` greater than `1`, and every value in `pass` must be within `1..times`.

## Conformance

An `<ending>` line that overrides an existing line number must have the same number of `<measure>` elements as the line it overrides. This preserves the [cross-part synchronization rule](/en/v0_1/reference/elements/section-ref/#conformance): for any given pass, once every part's `<ending>` overrides are resolved, all parts referencing the same section must still agree on line count and per-line measure count. Only the notes within a measure are free to vary.

## Example

```xml
<part-data id="P1">
  <section-ref id="s1">
    <line number="1"><!-- ... --></line>
    <line number="2"><!-- ... --></line>
    <line number="3"><!-- ... --></line>

    <ending pass="2">
      <annotation>แทนที่บรรทัดสุดท้ายในเที่ยวที่ 2 (Replace last line on pass 2)</annotation>
      <line number="3"><!-- variation, same measure count as line 3 above --></line>
    </ending>
  </section-ref>
</part-data>

<part-data id="P2">
  <!-- No <ending>: this part plays the same three lines on every pass. -->
  <section-ref id="s1">
    <line number="1"><!-- ... --></line>
    <line number="2"><!-- ... --></line>
    <line number="3"><!-- ... --></line>
  </section-ref>
</part-data>
```
