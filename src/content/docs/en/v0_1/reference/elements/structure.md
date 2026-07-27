---
title: <structure>
description: Defines the score layout with sections, directions, and annotations
---

The `<structure>` element defines the score layout with sections, directions, and annotations.

## Parent

[`<thai-score>`](/en/v0_1/reference/elements/thai-score/)

## Children

A sequence of:

- [`<annotation>`](/en/v0_1/reference/elements/annotation/)
- [`<br>`](/en/v0_1/reference/elements/br/)
- [`<direction>`](/en/v0_1/reference/elements/direction/)
- [`<section>`](/en/v0_1/reference/elements/section/)

These can appear in any order and be repeated.

## Section Order

A score's section order is the order in which `<section>` elements appear in `<structure>`, counting only `<section>` elements (interleaved `<annotation>`, `<br>`, and `<direction>` elements don't affect it). There is no separate attribute for section order — reordering the `<section>` elements in the document changes the score's order.

## Example

```xml
<structure>
  <annotation>Example Comments</annotation>
  <direction>
    <chan value="1" />
    <bpm>65</bpm>
  </direction>
  <annotation>บรรทัดที่ 1 มี 7 ห้อง</annotation>
  <section id="s1" name="ท่อน 1" repeat="2" />
  <annotation>End of section 1 message</annotation>
</structure>
```
