---
title: <group>
description: Subdivides a single beat into two or more equal parts
---

The `<group>` element subdivides a single beat into two or more equal parts, for measures that pack more notes into a beat than usual.

## Parent

[`<measure>`](/en/v0_1/reference/elements/measure/)

## Children

A sequence of two or more [`<note>`](/en/v0_1/reference/elements/note/) and [`<rest>`](/en/v0_1/reference/elements/rest/) elements, in any order, optionally interspersed with [`<tie>`](/en/v0_1/reference/elements/tie/) and [`<parenthesis>`](/en/v0_1/reference/elements/parenthesis/) markers.

## Semantics

A `<group>` occupies exactly one beat, the same duration as a single `<note>` or `<rest>` at the same position in the `<measure>`. That one beat is divided evenly among the group's `<note>`/`<rest>` children: two children each get half a beat, three children each get a third, and so on.

`<tie>` and `<parenthesis>` markers may appear inside a `<group>` alongside its notes and rests. They are zero-duration markers and do not count toward the division, a group with two `<note>` children and a `<tie>` marker still splits its beat in half, not in three. Spans opened or closed by these markers may freely cross a `<group>`'s boundary, the same way they already cross `<measure>` and `<line>` boundaries.

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

- A `<group>` must contain at least two `<note>`/`<rest>` children.
- A `<group>` must not contain a nested `<group>`. Subdivisions in ThaiMusicXML v0.1 go one level deep.
- `<tie>` and `<parenthesis>` markers inside a `<group>` do not count toward the equal division of its beat.
