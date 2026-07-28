---
title: <section>
description: A named section of the score
---

The `<section>` element defines a named section of the score.

## Parents

- [`<structure>`](/en/v0_1/reference/elements/structure/)
- [`<repeat>`](/en/v0_1/reference/elements/repeat/)

## Attributes

| Attribute | Required | Type    | Description                                                     |
| --------- | -------- | ------- | --------------------------------------------------------------- |
| `id`      | Yes      | ID      | Unique identifier. Referenced by `<section-ref section="...">`. |
| `name`    | No       | string  | Human-readable label (e.g. `"ท่อน 1"`).                         |

## Children

Zero or more [`<line-repeat>`](/en/v0_1/reference/elements/line-repeat/) elements, each repeating a range of lines inside the section. A section with no `<line-repeat>` children plays its lines straight through.

## Example

```xml
<section id="s1" name="ท่อน 1" />
```

```xml
<section id="s1" name="ท่อน 1">
  <line-repeat first="2" last="3" times="2"/>
</section>
```

## Notes

- Referenced by [`<section-ref>`](/en/v0_1/reference/elements/section-ref/) in part data, which holds the actual notes.
- A section's order in the score is its position among the other `<section>` elements in `<structure>`. There is no separate ordering attribute. See [`<structure>`](/en/v0_1/reference/elements/structure/#section-order).
- To play a section more than once, wrap it in a [`<repeat>`](/en/v0_1/reference/elements/repeat/) in `<structure>`. Repetition is a property of where the section sits in the score, not of the section itself, which is why it is not an attribute here.
- When a section's total pass count is greater than `1`, a part can vary individual passes with [`<ending>`](/en/v0_1/reference/elements/ending/).
