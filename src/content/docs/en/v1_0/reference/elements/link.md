---
title: <link>
description: Marks a span of notes as one connected gesture
---

The `<link>` element marks a span of notes as one connected gesture, and asks for a curve saying so.

## Parent

[`<measure>`](/en/v1_0/reference/elements/measure/) or [`<group>`](/en/v1_0/reference/elements/group/)

## Attributes

| Attribute | Required | Type                  | Description                                 |
| --------- | -------- | --------------------- | ------------------------------------------- |
| `type`    | Yes      | `"start"` \| `"stop"` | Whether this marker opens or closes a span. |

Nothing else. A [`<bow>`](/en/v1_0/reference/elements/bow/) carries a `direction` and a [`<parenthesis>`](/en/v1_0/reference/elements/parenthesis/) carries `dim` and `mute`, because those are choices the arranger makes. A link's curve is not chosen: it follows from where the notes it spans fell.

## Semantics

A `<link type="start"/>` and the next `<link type="stop"/>` the part reaches bracket a span. The notes between them belong to one gesture.

It is a rendering hint, with no effect on playback or timing. The notes already describe the rhythm; what the curve adds is certainty about how they group.

Matching is by document order within a resolved pass, the same as a `<bow>`. A marker in one measure can be closed by one in a later measure or line, so a span may cross `<measure>`, `<group>`, and `<line>` boundaries. It may not cross a section boundary. See [`<bow>`](/en/v1_0/reference/elements/bow/#semantics) for how [`<ending>`](/en/v1_0/reference/elements/ending/) and [`<line-repeat>`](/en/v1_0/reference/elements/line-repeat/) bear on that; the rules are the same element for element.

### Where the curve goes

On a single-row instrument the curve arcs over the span's own notes. A group is otherwise shown only by its notes sitting closer together, and in a crowded measure that spacing has little room to work in. A link span is how an arranger says a particular run needs to be unmistakable.

On an instrument notated across several rows (see [`<part>`](/en/v1_0/reference/elements/part/)'s `stack` attribute) the curve reaches the other rows too, marking them as belonging to one gesture. A stack is one physical instrument, so the gesture is whatever that instrument sounds, not whatever one of its hands does.

Which notes it reaches follows from that. In the row that wrote the span, it is the notes between the two markers. In the instrument's other notated rows, it is every note they play in the beats the span covers. The two rules differ because the rows only correspond so far: parts agree on beat count within a measure (see [`<section-ref>`](/en/v1_0/reference/elements/section-ref/#conformance)), but one row may divide a beat in two where another divides it in three, so a slot in one row names no position at all in the next. The beat is the finest unit they share.

Rests are skipped throughout, since [a rest is no attack](/en/v1_0/reference/elements/rest/) and there is nothing there for a gesture to reach.

Both markers always sit in the same part, the same as a `<bow>`. It is the curve's reach that crosses rows, not the span itself, and the reach is enough: a span written in the upper row and covering two beats already draws a curve that can begin on a note in the lowest row and end on one in the upper, because its ends are found by reading the whole stack over those beats. A `type="start"` in one row and a `type="stop"` in another are two dangling markers rather than a span, and neither draws anything.

## Example

```xml
<!-- One beat: the same mark a group would once have carried itself -->
<measure number="1">
  <note pitch="ด"/>
  <link type="start"/>
  <group>
    <note pitch="ร"/>
    <note pitch="ม"/>
  </group>
  <link type="stop"/>
  <note pitch="ซ"/>
</measure>
```

```xml
<!-- Two beats under one curve, which is what a marker pair buys -->
<measure number="2">
  <note pitch="ด"/>
  <link type="start"/>
  <group><note pitch="ร"/><note pitch="ม"/></group>
  <group><note pitch="ซ"/><note pitch="ล"/></group>
  <link type="stop"/>
  <note pitch="ท"/>
</measure>
```

```xml
<!-- Opening inside a group, since the markers go where the gesture starts -->
<measure number="3">
  <group>
    <note pitch="ดํ"/>
    <link type="start"/>
    <note pitch="ท"/>
  </group>
  <note pitch="ล"/>
  <link type="stop"/>
  <note pitch="ซ"/>
</measure>
```

## Conformance

- On every resolved pass of a section, a `type="start"` must be closed by a matching `type="stop"` before another `type="start"` appears. Link spans cannot nest or overlap.
- On every resolved pass, each `type="start"` must have a matching `type="stop"` within the same `<section-ref>`. A span left open at the end of a pass is invalid, even if another pass closes it.
- Link spans cannot cross `<section>` boundaries.
- A `<link>` marker inside a [`<group>`](/en/v1_0/reference/elements/group/) has zero duration and does not count toward the equal division of that group's beat.
- Where the containing `<part>` has a `stack`, at least one other row in that stack must be a notated part, meaning `type="pitched"` or `type="unpitched"`. A [lyric part](/en/v1_0/reference/elements/part/#part-types) may carry `stack`, but a lyric measure holds words rather than beats, so there is no position for the curve to reach. A link span whose stack contains no other notated row is invalid.
- Where the `<part>` has no `stack`, the curve marks the span's own notes and there is nothing further to satisfy.
- Both markers of a span must be in the same part. A `type="start"` in one row of a stack cannot be closed by a `type="stop"` in another; that leaves the first span open at the end of the pass and the second marker closing nothing, and both are already invalid under the rules above.
- Across rows a link describes a connection, so declare it on one side only. Marking the span in the upper row is the convention; there is no need to mark what it reaches as well.
- A span that sounds fewer than two notes has no run to mark and draws nothing. It is not an error.

## Notes

- A link and a [`<bow>`](/en/v1_0/reference/elements/bow/) are matched independently, so one may open inside the other. A gesture that is also bowed is an ordinary thing to write.
- On a stack of three rows the curve reaches all of them. A gesture that needs to reach one specific row and not another cannot say so in v1.0, and neither can one that covers different beats in different rows: the span has one extent, and every row is read over it.

## Rendering

See [Link spans](/en/v1_0/reference/rendering/#link-spans).
