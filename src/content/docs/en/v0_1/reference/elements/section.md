---
title: <section>
description: A named section of the score
---

The `<section>` element defines a named section of the score.

## Parent

[`<structure>`](/en/v0_1/reference/elements/structure/)

## Attributes

| Attribute | Required | Type    | Description                                                |
| --------- | -------- | ------- | ---------------------------------------------------------- |
| `id`      | Yes      | ID      | Unique identifier. Referenced by `<section-ref id="...">`. |
| `name`    | No       | string  | Human-readable label (e.g. `"ท่อน 1"`).                    |

## Children

Zero or more [`<repeat>`](/en/v0_1/reference/elements/repeat/), declaring how many times the whole section, or a range of its lines, is played. A section with no `<repeat>` children plays once, with no line-range repeats.

## Example

```xml
<section id="s1" name="ท่อน 1">
  <repeat times="2"/>
</section>
```

## Notes

- Referenced by [`<section-ref>`](/en/v0_1/reference/elements/section-ref/) in part data.
- A section's order in the score is its position among the other `<section>` elements in `<structure>`, there is no separate ordering attribute. See [`<structure>`](/en/v0_1/reference/elements/structure/#section-order).
- When the whole-section `<repeat>` has `times` greater than `1`, a part can vary specific passes with [`<ending>`](/en/v0_1/reference/elements/ending/).
