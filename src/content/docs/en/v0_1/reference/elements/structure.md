---
title: <structure>
description: Defines the score layout with sections, directions, and annotations
---

The `<structure>` element defines the score layout with sections, directions, and annotations.

## Parent

[`<header>`](/en/v0_1/reference/elements/header/)

## Children

A sequence of:

- [`<annotation>`](/en/v0_1/reference/elements/annotation/)
- [`<direction>`](/en/v0_1/reference/elements/direction/)
- [`<section>`](/en/v0_1/reference/elements/section/)

These can appear in any order and be repeated.

## Example

```xml
<structure>
  <annotation>Example Comments</annotation>
  <direction>
    <chan value="1" />
    <bpm>65</bpm>
  </direction>
  <annotation>บรรทัดที่ 1 มี 7 ห้อง</annotation>
  <section id="s1" number="1" name="ท่อน 1" repeat="2" />
  <annotation>End of section 1 message</annotation>
</structure>
```
