---
title: <group>
description: Subdivides a single beat into two or more equal parts
---

The `<group>` element subdivides a single beat into two or more equal parts, for measures that pack more notes into a beat than usual.

## Parent

[`<measure>`](/en/v0_1/reference/elements/measure/)

## Attributes

None.

## Children

A sequence of two or more [`<note>`](/en/v0_1/reference/elements/note/) and [`<rest>`](/en/v0_1/reference/elements/rest/) elements, in any order, optionally interspersed with [`<bow>`](/en/v0_1/reference/elements/bow/), [`<parenthesis>`](/en/v0_1/reference/elements/parenthesis/), and [`<link>`](/en/v0_1/reference/elements/link/) markers.

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

`<bow>`, `<parenthesis>`, and `<link>` markers may appear inside a `<group>` alongside its notes and rests. They have zero duration and do not count toward the division. A group with two `<note>` children and a `<bow>` marker still splits its beat in half rather than in three. Spans opened or closed by these markers may cross a `<group>`'s boundary freely, the same way they already cross `<measure>` and `<line>` boundaries.

A group says how a beat divides, and nothing more. To mark a run of notes as one connected gesture, and get a curve saying so, write a [`<link>`](/en/v0_1/reference/elements/link/) span around it. Because a group is exactly one beat and a gesture often is not, that mark is a marker pair rather than anything a group could carry itself.

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
- `<bow>`, `<parenthesis>`, and `<link>` markers inside a `<group>` do not count toward the equal division of its beat.

## Rendering

A group occupies one beat of time but is given more than one beat's width on the page, so that beats stay aligned across parts. See [Inside a measure](/en/v0_1/reference/rendering/#inside-a-measure).
