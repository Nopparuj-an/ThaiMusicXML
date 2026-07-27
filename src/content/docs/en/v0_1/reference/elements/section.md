---
title: <section>
description: A named section of the score
---

The `<section>` element defines a named section of the score.

## Parent

[`<structure>`](/en/v0_1/reference/elements/structure/)

## Attributes

| Attribute | Required | Type | Description |
|-----------|----------|------|-------------|
| `id` | Yes | ID | Unique identifier. Referenced by `<section-ref id="...">`. |
| `name` | No | string | Human-readable label (e.g. `"ท่อน 1"`). |
| `repeat` | No | integer | How many times the section is played. Default: `1`. |

## Example

```xml
<section id="s1" name="ท่อน 1" repeat="2" />
```

## Notes

- Referenced by [`<section-ref>`](/en/v0_1/reference/elements/section-ref/) in part data.
- A section's order in the score is its position among the other `<section>` elements in `<structure>` — there is no separate ordering attribute. See [`<structure>`](/en/v0_1/reference/elements/structure/#section-order).
- When `repeat` is greater than `1`, a part can vary specific passes with [`<ending>`](/en/v0_1/reference/elements/ending/).
