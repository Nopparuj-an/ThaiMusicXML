---
title: <group>
description: Subdivides a single beat into two or more equal parts
---

The `<group>` element subdivides a single beat into two or more equal parts, for measures that pack more notes into a beat than usual.

## Parent

[`<measure>`](/en/v0_1/reference/elements/measure/)

## Attributes

| Attribute | Required | Type    | Description                                                                                          |
| --------- | -------- | ------- | ----------------------------------------------------------------------------------------------------- |
| `link`    | No       | boolean | Draws a curve marking the group as one gesture, reaching the instrument's other rows where it has any. See [Conformance](#conformance) below. |

## Children

A sequence of two or more [`<note>`](/en/v0_1/reference/elements/note/) and [`<rest>`](/en/v0_1/reference/elements/rest/) elements, in any order, optionally interspersed with [`<bow>`](/en/v0_1/reference/elements/bow/) and [`<parenthesis>`](/en/v0_1/reference/elements/parenthesis/) markers.

## Semantics

A `<group>` occupies exactly one beat, the same span of time as a single `<note>` or `<rest>` at the same position in the `<measure>`. That beat is divided evenly among the group's `<note>` and `<rest>` children: two children each get half a beat, three each get a third, and so on.

### Where the children fall

A beat arrives on its last slot, so a group's final child lands on the beat and the earlier ones space evenly backwards from it.

This is where Thai subdivision parts company with Western subdivision, and it is worth being exact about. Take `ด ร ม ซ` against `ด (ร ม) ซ ล`. The ม of the group falls on the second beat, together with the ร of the plain version, and the ร of the group sounds between the first and second beats. A Western reading of the same figure would put ร on the beat and let ม follow it.

Marking each note that lands on a beat `X` and each note between beats `O`:

```
| -  -  - (ม ร ด) |    →    | -  -  - (O O X) |
| -  ร  -  ม      |    →    | -  X  -  X      |
| (ด ร) ม (ซ ล ท) (ดํ รํ) |    →    | (O X) X (O O X) (O X) |
```

A plain `<note>` is always `X`: it is the beat. Only a group produces `O`, and only on its non-final children.

### Why a group cannot leave its measure

A beat owns the span of time *ending* at its arrival rather than starting from it. Writing `d` for the duration of one slot, beat `n` of a measure arrives at `n·d` from the measure's leading edge, and a group of `k` children in beat `n` sounds at `n·d − (k−1)d/k` through `n·d`.

Its earliest child therefore falls `(k−1)/k` of a beat early, and since `(k−1)/k` is always less than `1`, that position always stays inside beat `n`'s own span. A group can never reach into the beat before it, and never across a `<measure>` or `<line>` boundary. Nothing enforces this; the arithmetic does not allow it.

See [Beats anchor to the right](/en/v0_1/reference/rendering/#beats-anchor-to-the-right) for how this places the symbols on the page, and [`<bpm>`](/en/v0_1/reference/elements/bpm/#walking-the-slots) for playback.

`<bow>` and `<parenthesis>` markers may appear inside a `<group>` alongside its notes and rests. They have zero duration and do not count toward the division. A group with two `<note>` children and a `<bow>` marker still splits its beat in half rather than in three. Spans opened or closed by these markers may cross a `<group>`'s boundary freely, the same way they already cross `<measure>` and `<line>` boundaries.

`link` marks the group as one connected gesture and asks for a curve saying so. It is a rendering hint with no effect on playback or timing, since the group's subdivision already describes the rhythm on its own.

Where the curve goes depends on the instrument. On one notated across several rows (see [`<part>`](/en/v0_1/reference/elements/part/)'s `stack` attribute), it runs to what the other rows play on the same beat, marking the rows as belonging to one gesture. On a single-row instrument there is no other row to reach and the curve sits over the group's own notes instead.

That second case is what makes the attribute useful on the solo scores most Thai music is written as. A group is otherwise shown only by its notes sitting closer together, and in a crowded measure that spacing has little room to work in. `link` is how an arranger says a particular group needs to be unmistakable.

On the two-row instrument the connector was designed for there is one other row and one curve. On a stack of three it reaches every other row, which is as far as a boolean can go. A group that needs to reach one specific row and not another cannot say so in v0.1.

## Example

```xml
<!-- Beat 2 split into two eighth notes -->
<measure number="1">
  <note pitch="ด"/>
  <group>
    <note pitch="ร"/>
    <note pitch="ม"/>
  </group>
  <note pitch="ซ"/>
  <note pitch="ล"/>
</measure>
```

```xml
<!-- A beat divided into three -->
<group>
  <note pitch="ด"/>
  <note pitch="ร"/>
  <note pitch="ม"/>
</group>
```

## Conformance

- A `<group>` must contain at least two `<note>` or `<rest>` children.
- A `<group>` must not contain a nested `<group>`. Subdivisions in ThaiMusicXML v0.1 go one level deep.
- `<bow>` and `<parenthesis>` markers inside a `<group>` do not count toward the equal division of its beat.
- `link` is valid on any `<group>`. Where the containing `<part>` has no `stack`, the curve marks the group's own notes rather than reaching another row.
- Where the `<part>` does have a `stack`, at least one other row in it must be a notated part, meaning `type="pitched"` or `type="unpitched"`. A [lyric part](/en/v0_1/reference/elements/part/#part-types) may carry `stack`, but a lyric measure holds words rather than beats, so there is no position for the connector to reach. A `link` whose stack contains no other notated row is invalid.
- Across rows, `link` describes a connection, so declare it on one side only. Marking the group in the upper row is the convention; there is no need to mark the beat it reaches as well.
- `link` points at whatever the stack's other rows play at this group's position. Because all parts agree on beat count within a measure (see [`<section-ref>`](/en/v0_1/reference/elements/section-ref/#conformance)), that position is always well-defined. Another row may hold a plain `<note>`, a `<rest>`, or a `<group>` of its own there.

## Rendering

A group occupies one beat of time but is given more than one beat's width on the page, so that beats stay aligned across parts. See [Inside a measure](/en/v0_1/reference/rendering/#inside-a-measure).
