---
title: <ending>
description: A per-instrument variation played on specific repeat passes
---

The `<ending>` element replaces specific `<line>` elements on specific passes of a repeated section, so a part can play something different on a given pass without restructuring its `<section-ref>`.

## Parent

[`<section-ref>`](/en/v0_1/reference/elements/section-ref/)

## Attributes

| Attribute | Required | Type   | Description                                                                         |
| --------- | -------- | ------ | ------------------------------------------------------------------------------------ |
| `pass`    | Yes      | string | Comma-separated 1-based pass numbers this ending applies to, e.g. `"2"` or `"2,4"`. |

## Children

In order:

1. [`<annotation>`](/en/v0_1/reference/elements/annotation/) - zero or more, describing the variation
2. [`<line>`](/en/v0_1/reference/elements/line/) - one or more

## Semantics

Each `<line number="N">` inside an `<ending>` replaces line `N` for the passes listed in `pass`. A line with that number must already exist directly in the `<section-ref>`. An ending substitutes lines and nothing else: it cannot add a line or remove one, so the section keeps the same shape on every pass.

On a pass not covered by any `<ending>`, the part plays its regular `<line>` elements unchanged. A `<section-ref>` with no `<ending>` elements plays identically on every pass.

### Pass numbers

`pass` counts absolute passes of the section, straight through from its first play to its last, regardless of which layer of [`<repeat>`](/en/v0_1/reference/elements/repeat/) produced each one. A section nested in two `times="2"` repeats has a total pass count of 4, so `pass="4"` names its last play and `pass="2,4"` puts a different variation at two points across the four.

### Spans across an overridden line

[`<bow>`](/en/v0_1/reference/elements/bow/) and [`<parenthesis>`](/en/v0_1/reference/elements/parenthesis/) markers pair up by playback order, not by their position in the file. An `<ending>` sits after all the regular lines in the document but replaces one of them during playback, so the two orders come apart wherever a span reaches into a line an ending overrides.

Resolve the pass first, then match. Take the lines the part actually plays on that pass, regular lines with the ending's substitutions in place, and pair each `start` with the next `stop` in that sequence. Each pass is matched on its own.

A span reaching into an overridden line therefore needs its `stop` in both versions of the line: once in the regular line for the passes that play it, and once in the ending's line for the passes that play that instead.

```xml
<section-ref section="s1">
  <line number="1">
    <measure number="1">
      <bow type="start" direction="out"/>
      <note pitch="ซ"/><note pitch="ล"/><note pitch="ดํ"/><note pitch="ล"/>
    </measure>
  </line>
  <line number="2">
    <measure number="1">
      <note pitch="ซ"/><note pitch="ม"/>
      <bow type="stop"/>
      <note pitch="ร"/><note pitch="ด"/>
    </measure>
  </line>

  <ending pass="2">
    <line number="2">
      <measure number="1">
        <note pitch="ซ"/>
        <bow type="stop"/>
        <note pitch="ม"/><note pitch="ร"/><note pitch="ด"/>
      </measure>
    </line>
  </ending>
</section-ref>
```

The bow opens in line 1 on both passes. Pass 1 closes it on the second note of line 2, pass 2 closes it one note earlier. Neither pass sees more than one `stop`, because neither pass plays both versions of line 2.

Leaving the `stop` out of the ending's line is an error, not a shorthand: that pass would end with the span still open.

## Conformance

- `<ending>` is only valid inside a `<section-ref>` whose section has a total pass count greater than `1`. See [`<repeat>`](/en/v0_1/reference/elements/repeat/#total-pass-count).
- Every value in `pass` must be an integer from `1` to the section's total pass count.
- Each `<line number="N">` in an `<ending>` must match the `number` of a line already present in the enclosing `<section-ref>`.
- An `<ending>` line must have the same number of `<measure>` elements as the line it replaces, and corresponding measures must have the same beat count. This preserves the [cross-part synchronization rule](/en/v0_1/reference/elements/section-ref/#conformance): on any given pass, once every part's endings are resolved, all parts referencing the section still agree on line count, measure count, and beat count. Only the notes inside a measure may vary.
- Two `<ending>` elements in the same `<section-ref>` must not cover the same line number for the same pass.

## Example

```xml
<part-data part="P1">
  <section-ref section="s1">
    <line number="1"><!-- ... --></line>
    <line number="2"><!-- ... --></line>
    <line number="3"><!-- ... --></line>

    <ending pass="2">
      <annotation>แทนที่บรรทัดสุดท้ายในเที่ยวที่ 2 (Replace last line on pass 2)</annotation>
      <line number="3"><!-- variation, same measure count as line 3 above --></line>
    </ending>
  </section-ref>
</part-data>

<part-data part="P2">
  <!-- No <ending>: this part plays the same three lines on every pass. -->
  <section-ref section="s1">
    <line number="1"><!-- ... --></line>
    <line number="2"><!-- ... --></line>
    <line number="3"><!-- ... --></line>
  </section-ref>
</part-data>
```
