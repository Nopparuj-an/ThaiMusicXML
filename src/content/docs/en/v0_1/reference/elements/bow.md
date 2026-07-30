---
title: <bow>
description: Marks a span of notes played with one continuous bow stroke
---

The `<bow>` element marks a span of sibling [`<note>`](/en/v0_1/reference/elements/note/) elements played with one continuous bow stroke on a stringed instrument, without changing direction across the span.

## Parent

[`<measure>`](/en/v0_1/reference/elements/measure/) or [`<group>`](/en/v0_1/reference/elements/group/)

## Attributes

| Attribute | Required | Type | Description |
| --------- | -------- | ---- | ----------- |
| `type` | Yes | `"start"` \| `"stop"` | Whether this marker opens or closes a span. |
| `direction` | If `type="start"` | `"in"` \| `"out"` | Bow direction for this span. Only valid, and required, on `type="start"`. |

## Semantics

A `<bow type="start"/>` and the next `<bow type="stop"/>` the part reaches bracket a span. Every `<note>` between them is played in one continuous bow stroke.

Matching is by document order within a resolved pass. A marker in one measure can be closed by one in a later measure or line, so a span may cross `<measure>`, `<group>`, and `<line>` boundaries. It may not cross a section boundary.

In a section that plays once, and in any section without [`<ending>`](/en/v0_1/reference/elements/ending/) elements, that is plain document order. Where an ending substitutes a line, resolve the pass first and match within the lines that pass actually plays. See [Spans across an overridden line](/en/v0_1/reference/elements/ending/#spans-across-an-overridden-line).

A [`<line-repeat>`](/en/v0_1/reference/elements/line-repeat/) does not enter into it. The lines are read once, in the order they are written, however many times playback runs through them. A span may open inside a repeated range and close after it, and a range that repeats does not re-open a span that closed within it.

A span that crosses a `<line>` boundary is still one span. The renderer splits the curve in two and marks the cut, which changes nothing about the data. See [Bow spans across a line break](/en/v0_1/reference/rendering/#bow-spans-across-a-line-break).

## Example

```xml
<!-- Continuous within one line, spanning a measure boundary -->
<line number="2">
  <measure number="1">
    <bow type="start" direction="in"/>
    <note pitch="ด"/>
    <note pitch="ร"/>
  </measure>
  <measure number="2">
    <note pitch="ม"/>
    <bow type="stop"/>
    <note pitch="ซ"/>
  </measure>
</line>
```

```xml
<!-- Broken across a line break: renders as two arcs -->
<line number="3">
  <measure number="1">
    <note pitch="ล"/>
    <bow type="start" direction="out"/>
    <note pitch="ซ"/>
  </measure>
</line>
<line number="4">
  <measure number="1">
    <note pitch="ม"/>
    <bow type="stop"/>
    <note pitch="ร"/>
  </measure>
</line>
```

## Conformance

- On every resolved pass of a section, a `type="start"` must be closed by a matching `type="stop"` before another `type="start"` appears. Bow spans cannot nest or overlap.
- On every resolved pass, each `type="start"` must have a matching `type="stop"` within the same `<section-ref>`. A span left open at the end of a pass is invalid, even if another pass closes it.
- `direction` is required on `type="start"` and must not appear on `type="stop"`.
- Bow spans cannot cross `<section>` boundaries.
- Bow spans are independent per part. Marking a span in one part's notes has no effect on any other part.

## Notes

- This element describes a bowing technique. It is unrelated to the tie of Western notation, which joins two notes of the same pitch into one sounding note.
