---
title: <parenthesis>
description: Marks a note/rest span as cued rather than played
---

The `<parenthesis>` element marks a span of sibling [`<note>`](/en/v0_1/reference/elements/note/) and [`<rest>`](/en/v0_1/reference/elements/rest/) elements as cued, not played: the part waits for another instrument in a leader/follower relationship to carry that passage.

## Parent

[`<measure>`](/en/v0_1/reference/elements/measure/)

## Attributes

| Attribute | Required | Type                  | Description                                                                                                    |
| --------- | -------- | --------------------- | -------------------------------------------------------------------------------------------------------------- |
| `type`    | Yes      | `"start"` \| `"stop"` | Whether this marker opens or closes a span.                                                                    |
| `dim`     | No       | boolean               | Overrides the renderer's default for showing this span in a less distinct color. Only valid on `type="start"`. |
| `mute`    | No       | boolean               | Overrides the renderer's default for muting this span during playback. Only valid on `type="start"`.           |

## Semantics

A `<parenthesis type="start"/>` and the next `<parenthesis type="stop"/>` that follows it in document order bracket a span: every `<note>` and `<rest>` between them belongs to the cued passage. The span can cross `<measure>` and `<line>` boundaries, a `<parenthesis>` marker in one measure can be closed by one in a later measure or line, since matching is purely by document order, not by any reference or ID. Parenthesis markers cannot cross section boundaries.

Whether a span renders in a less distinct color and/or is muted during playback is, by default, left to the renderer or player's own settings, the markup only identifies the span. `dim` and `mute` optionally override that default for one specific span. Because they describe the span as a whole, they only appear on the `start` marker; the `stop` marker does not repeat them.

## Example

```xml
<measure number="3">
  <parenthesis type="start"/>
  <note pitch="ซ"/>
  <note pitch="ม"/>
  <parenthesis type="stop"/>
  <note pitch="ซ"/>
  <note pitch="ม"/>
</measure>
```

```xml
<!-- Span crossing a measure boundary -->
<line number="2">
  <measure number="1">
    <parenthesis type="start" dim="false"/>
    <note pitch="ด"/>
    <note pitch="ร"/>
    <note pitch="ม"/>
    <note pitch="ซ"/>
  </measure>
  <measure number="2">
    <note pitch="ล"/>
    <note pitch="ซ"/>
    <note pitch="ม"/>
    <note pitch="ร"/>
    <parenthesis type="stop"/>
  </measure>
</line>
```

## Conformance

- Within a part, a `type="start"` must be closed by a matching `type="stop"` before another `type="start"` appears. Parenthesis spans cannot nest or overlap.
- `dim` and `mute` are only valid on a `type="start"` marker.
- Parenthesis spans are independent per part; marking a span in one part's notes has no effect on any other part.
