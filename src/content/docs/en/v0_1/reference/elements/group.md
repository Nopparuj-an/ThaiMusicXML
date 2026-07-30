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
| `link`    | No       | boolean | Draws a visual connector from this group to the corresponding beat in the instrument's other rows. See [Conformance](#conformance) below. |

## Children

A sequence of two or more [`<note>`](/en/v0_1/reference/elements/note/) and [`<rest>`](/en/v0_1/reference/elements/rest/) elements, in any order, optionally interspersed with [`<bow>`](/en/v0_1/reference/elements/bow/) and [`<parenthesis>`](/en/v0_1/reference/elements/parenthesis/) markers.

## Semantics

A `<group>` occupies exactly one beat, the same duration as a single `<note>` or `<rest>` at the same position in the `<measure>`. That one beat is divided evenly among the group's `<note>` and `<rest>` children: two children each get half a beat, three children each get a third, and so on.

`<bow>` and `<parenthesis>` markers may appear inside a `<group>` alongside its notes and rests. They have zero duration and do not count toward the division. A group with two `<note>` children and a `<bow>` marker still splits its beat in half rather than in three. Spans opened or closed by these markers may cross a `<group>`'s boundary freely, the same way they already cross `<measure>` and `<line>` boundaries.

`link` is for instruments notated on more than one row (see [`<part>`](/en/v0_1/reference/elements/part/)'s `stack` attribute). It marks this group's rapid subdivision as connected to what the instrument's other rows play on the same beat, and the renderer draws a curve between them. `link` is a rendering hint with no effect on playback or timing, since the group's subdivision already describes the rhythm on its own.

On the two-row instrument this was designed for there is one other row and one connector. On a stack of three the connector reaches every other row, which is as far as a boolean can go. A group that needs to reach one specific row and not another cannot say so in v0.1.

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
- `link` is only valid on a `<group>` whose containing `<part>` has a `stack` attribute. A `<group>` in a single-row instrument's part has no other row to link to.
- `link` describes a connection between rows, so declare it on one side only. Marking the group in the upper row is the convention; there is no need to mark the beat it reaches as well.
- `link` points at whatever the stack's other rows play at this group's position. Because all parts agree on beat count within a measure (see [`<section-ref>`](/en/v0_1/reference/elements/section-ref/#conformance)), that position is always well-defined. Another row may hold a plain `<note>`, a `<rest>`, or a `<group>` of its own there.

## Rendering

A group occupies one beat of time but is given more than one beat's width on the page, so that beats stay aligned across parts. See [Inside a measure](/en/v0_1/reference/rendering/#inside-a-measure).
