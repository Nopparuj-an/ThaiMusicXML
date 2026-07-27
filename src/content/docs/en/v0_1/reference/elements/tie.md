---
title: <tie>
description: Marks a span of notes played with one continuous bow stroke
---

The `<tie>` element marks a span of sibling [`<note>`](/en/v0_1/reference/elements/note/) elements played with one continuous bow stroke on a stringed instrument, without changing direction across the span.

## Parent

[`<measure>`](/en/v0_1/reference/elements/measure/)

## Attributes

| Attribute | Required | Type | Description |
| --------- | -------- | ---- | ----------- |
| `type` | Yes | `"start"` \| `"stop"` | Whether this marker opens or closes a span. |
| `direction` | If `type="start"` | `"in"` \| `"out"` | Bow direction for this span. Only valid, and required, on `type="start"`. |

## Semantics

A `<tie type="start"/>` and the next `<tie type="stop"/>` that follows it in document order bracket a span: every `<note>` between them is played in one continuous bow stroke. The span can cross `<measure>` and `<line>` boundaries, a `<tie>` marker in one measure can be closed by one in a later measure or line, since matching is purely by document order, not by any reference or ID. Tie spans cannot cross section boundaries.

Both directions render above the notes: `in` as a curve with both tips pointing down, `out` as a curve with both tips pointing up.

When a tie span crosses a `<line>` boundary, the renderer draws it as two separate arcs: one running from the start marker to the end of its line, and another from the start of the next line to the stop marker. At the cut, the tip that would otherwise point up or down instead renders parallel to the horizon, signaling that the tie continues rather than ends there. The tip at the span's true start and true stop still points in the direction given by `direction`. The underlying span itself is unaffected; the split and the horizontal cut tip are purely rendering consequences of the line break.

## Example

```xml
<!-- Continuous within one line, spanning a measure boundary -->
<line number="2">
  <measure number="1">
    <tie type="start" direction="in"/>
    <note pitch="ด"/>
    <note pitch="ร"/>
  </measure>
  <measure number="2">
    <note pitch="ม"/>
    <tie type="stop"/>
    <note pitch="ซ"/>
  </measure>
</line>
```

```xml
<!-- Broken across a line break: renders as two arcs -->
<line number="3">
  <measure number="1">
    <note pitch="ล"/>
    <tie type="start" direction="out"/>
    <note pitch="ซ"/>
  </measure>
</line>
<line number="4">
  <measure number="1">
    <note pitch="ม"/>
    <tie type="stop"/>
    <note pitch="ร"/>
  </measure>
</line>
```

## Conformance

- Within a part, a `type="start"` must be closed by a matching `type="stop"` before another `type="start"` appears. Tie spans cannot nest or overlap.
- `direction` is required on `type="start"` and must not appear on `type="stop"`.
- Tie spans cannot cross `<section>` boundaries.
- Tie spans are independent per part; marking a span in one part's notes has no effect on any other part.
