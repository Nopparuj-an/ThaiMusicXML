---
title: <structure>
description: Defines the score layout with sections, directions, and annotations
---

The `<structure>` element defines the score layout: which sections are played, in what order, how often, and with what directions along the way.

## Parent

[`<thai-score>`](/en/v1_0/reference/elements/thai-score/)

## Children

A sequence of:

- [`<annotation>`](/en/v1_0/reference/elements/annotation/)
- [`<br>`](/en/v1_0/reference/elements/br/)
- [`<direction>`](/en/v1_0/reference/elements/direction/)
- [`<section>`](/en/v1_0/reference/elements/section/)
- [`<repeat>`](/en/v1_0/reference/elements/repeat/)

These can appear in any order and be repeated.

## Section order

A score's section order is the order in which `<section>` elements appear, counting only `<section>` elements and walking depth first into any [`<repeat>`](/en/v1_0/reference/elements/repeat/) wrappers. Interleaved `<annotation>`, `<br>`, and `<direction>` elements do not affect it. No attribute carries the order, so reordering the `<section>` elements in the document reorders the score.

## Directions

A [`<direction>`](/en/v1_0/reference/elements/direction/) takes effect where it appears and stays in effect until another `<direction>` changes the same setting. Processors read `<structure>` from top to bottom, and directions apply to every part.

A direction inside a `<repeat>` is re-read on each pass, so it applies again on every repetition.

## Annotations and breaks

An [`<annotation>`](/en/v1_0/reference/elements/annotation/) or [`<br>`](/en/v1_0/reference/elements/br/) inside a `<repeat>` is printed once, where it sits in the document, and is not repeated per pass.

The two behave differently from `<direction>` because they are different kinds of thing. A direction governs how the music sounds, so it has to apply again every time the music comes round. An annotation is page furniture, and the page is printed once and read straight down however many times the score is played through.

## Example

```xml
<structure>
  <annotation>Example Comments</annotation>
  <direction>
    <nathap value="ปรบไก่" />
    <chan value="1" />
    <bpm>65</bpm>
  </direction>
  <annotation>บรรทัดที่ 1 มี 7 ห้อง</annotation>
  <repeat times="2">
    <section id="s1" name="ท่อน 1" />
  </repeat>
  <annotation>End of section 1 message</annotation>
</structure>
```
