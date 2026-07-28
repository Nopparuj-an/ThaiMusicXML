---
title: <line-repeat>
description: Repeats a range of lines inside one section
---

The `<line-repeat>` element repeats a consecutive range of lines within a section, without repeating the section as a whole.

## Parent

[`<section>`](/en/v0_1/reference/elements/section/)

## Attributes

| Attribute | Required | Type    | Description                                              |
| --------- | -------- | ------- | -------------------------------------------------------- |
| `first`   | Yes      | integer | 1-based first line number this repeat covers.            |
| `last`    | Yes      | integer | 1-based last line number this repeat covers, inclusive.  |
| `times`   | No       | integer | How many times the range is played. Default: `1`.        |

## Semantics

Each time playback reaches line `first`, lines `first` through `last` play `times` times before continuing past `last`. Setting `first` and `last` to the same number repeats a single line.

A line repeat is independent of any [`<repeat>`](/en/v0_1/reference/elements/repeat/) enclosing the section, and nests inside it. It re-triggers in full on every pass of the section, including the second and later ones.

A section may carry several `<line-repeat>` children covering different ranges. When one range contains another, the inner range runs to completion each time the outer range reaches it.

## Example

```xml
<section id="s1" name="ท่อน 1">
  <line-repeat first="2" last="3" times="2"/>
</section>
```

Lines 2 and 3 play twice before the section continues to line 4. If a `<repeat>` in `<structure>` plays this section twice, that happens on both passes.

## Conformance

- `first` and `last` are both required, and `first` must be less than or equal to `last`.
- `times` must be an integer of `1` or greater.
- `last` must not exceed the number of `<line>` elements in the section's `<section-ref>` content.
- Two `<line-repeat>` ranges in the same `<section>` must be either properly nested or wholly disjoint. Partially overlapping ranges are invalid, and so are two elements covering the identical range: combine those into one element with a higher `times`.
- [`<ending>`](/en/v0_1/reference/elements/ending/)'s `pass` values count passes of the section, not passes of a line repeat. An ending that replaces a line inside a repeated range applies to every play of that range within the pass it names.
