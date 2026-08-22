---
title: <parenthesis>
description: Marks a note/rest span as cued rather than played
---

The `<parenthesis>` element marks a span of sibling [`<note>`](/en/v1_0/reference/elements/note/) and [`<rest>`](/en/v1_0/reference/elements/rest/) elements as cued, not played: the part waits for another instrument in a leader/follower relationship to carry that passage.

## Parent

[`<measure>`](/en/v1_0/reference/elements/measure/) or [`<group>`](/en/v1_0/reference/elements/group/)

## Attributes

| Attribute | Required | Type                  | Description                                                                                                    |
| --------- | -------- | --------------------- | -------------------------------------------------------------------------------------------------------------- |
| `type`    | Yes      | `"start"` \| `"stop"` | Whether this marker opens or closes a span.                                                                    |
| `dim`     | No       | boolean               | Overrides the renderer's default for showing this span in a less distinct color. Only valid on `type="start"`. |
| `mute`    | No       | boolean               | Overrides the renderer's default for muting this span during playback. Only valid on `type="start"`.           |

## Semantics

A `<parenthesis type="start"/>` and the next `<parenthesis type="stop"/>` the part reaches bracket a span. Every `<note>` and `<rest>` between them belongs to the cued passage.

Matching is by document order within a resolved pass. A marker in one measure can be closed by one in a later measure or line, so a span may cross `<measure>`, `<group>`, and `<line>` boundaries. It may not cross a section boundary.

In a section that plays once, and in any section without [`<ending>`](/en/v1_0/reference/elements/ending/) elements, that is plain document order. Where an ending substitutes a line, resolve the pass first and match within the lines that pass actually plays. See [Spans across an overridden line](/en/v1_0/reference/elements/ending/#spans-across-an-overridden-line).

A [`<line-repeat>`](/en/v1_0/reference/elements/line-repeat/) does not enter into it. The lines are read once, in the order they are written, however many times playback runs through them. A span may open inside a repeated range and close after it, and a range that repeats does not re-open a span that closed within it.

The markup only identifies the span. Whether it renders in a less distinct color, or is muted during playback, is left to the renderer or player's own settings by default. `dim` and `mute` override those settings for one specific span. They describe the span as a whole, so they appear on the `start` marker only and the `stop` marker does not repeat them. See [Cued passages](/en/v1_0/reference/rendering/#cued-passages).

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

- On every resolved pass of a section, a `type="start"` must be closed by a matching `type="stop"` before another `type="start"` appears. Parenthesis spans cannot nest or overlap.
- On every resolved pass, each `type="start"` must have a matching `type="stop"` within the same `<section-ref>`. A span left open at the end of a pass is invalid, even if another pass closes it.
- `dim` and `mute` are only valid on a `type="start"` marker.
- Parenthesis spans are independent per part. Marking a span in one part's notes has no effect on any other part.
