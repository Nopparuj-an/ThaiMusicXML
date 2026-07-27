---
title: <repeat>
description: How many times a section, or a range of its lines, is played
---

The `<repeat>` element declares how many times a section, or a consecutive range of its lines, is played.

## Parent

[`<section>`](/en/v0_1/reference/elements/section/)

## Attributes

| Attribute | Required          | Type    | Description                                                                                          |
| --------- | ----------------- | ------- | ---------------------------------------------------------------------------------------------------- |
| `times`   | No                | integer | How many times this scope is played. Default: `1`.                                                   |
| `first`   | Only with `last`  | integer | 1-based first line number this repeat covers. Omit together with `last` to repeat the whole section. |
| `last`    | Only with `first` | integer | 1-based last line number this repeat covers, inclusive.                                              |

## Semantics

A `<repeat>` with no `first`/`last` covers the whole section: the entire `<section-ref>` content, across every part, plays `times` times before the score continues to the next section. This is the direct replacement for the section's own repeat count.

A `<repeat first="X" last="Y">` covers only lines `X` through `Y` (inclusive): each time playback reaches line `X`, lines `X`-`Y` play through `times` times before continuing past line `Y`. `first` and `last` can be equal to repeat a single line.

A line-range repeat is independent of, and nests inside, any whole-section repeat: it re-triggers in full on every pass of the whole section, not just the first.

A `<section>` can have multiple `<repeat>` children, for example one whole-section repeat plus one or more line-range repeats, or several disjoint line-range repeats.

## Example

```xml
<section id="s1" name="ท่อน 1">
  <repeat times="2"/>
  <repeat first="2" last="3" times="2"/>
</section>
```

This plays the whole section twice; within each of those two passes, lines 2-3 additionally play twice before continuing to line 4.

## Conformance

- At most one `<repeat>` without `first`/`last` may appear per `<section>`.
- `first` and `last` must both be present or both absent on a given `<repeat>`; when present, `first` must be less than or equal to `last`.
- Ranges from different `<repeat>` elements that both specify `first`/`last` must be properly nested or disjoint, never partially overlapping.
- `last` must not exceed the number of `<line>` elements in any `<section-ref>` referencing this section.
- [`<ending>`](/en/v0_1/reference/elements/ending/)'s `pass` values refer to passes of the whole-section `<repeat>` (the one without `first`/`last`), not to passes of a nested line-range repeat.
