---
title: <section>
description: A named section of the score
---

The `<section>` element defines a named section of the score.

`<section>` declares that a section exists and where it falls in the play order. It holds no notes.

## Parents

- [`<structure>`](/en/v1_0/reference/elements/structure/)
- [`<repeat>`](/en/v1_0/reference/elements/repeat/)

## Attributes

| Attribute | Required | Type    | Description                                                     |
| --------- | -------- | ------- | --------------------------------------------------------------- |
| `id`      | Yes      | ID      | Unique identifier. Referenced by `<section-ref section="...">`. |
| `name`    | No       | string  | Human-readable label (e.g. `"ท่อน 1"`). Not printed on the score, see [Rendering](#rendering) below. |

## Children

Zero or more [`<line-repeat>`](/en/v1_0/reference/elements/line-repeat/) elements, each repeating a range of lines inside the section. A section with no `<line-repeat>` children plays its lines straight through.

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

- Referenced by [`<section-ref>`](/en/v1_0/reference/elements/section-ref/) in part data, which holds the actual notes.
- A section's order in the score is its position among the other `<section>` elements in `<structure>`. There is no separate ordering attribute. See [`<structure>`](/en/v1_0/reference/elements/structure/#section-order).
- To play a section more than once, wrap it in a [`<repeat>`](/en/v1_0/reference/elements/repeat/) in `<structure>`. Repetition is a property of where the section sits in the score, not of the section itself, which is why it is not an attribute here.
- When a section's total pass count is greater than `1`, a part can vary individual passes with [`<ending>`](/en/v1_0/reference/elements/ending/).

## Rendering

`name` labels the section for the file and for an editor's interface. It is not printed above the grid. A printed heading such as `สามชั้น ท่อน ๑` comes from an [`<annotation>`](/en/v1_0/reference/elements/annotation/) the arranger placed in `<structure>` before the section, which leaves the wording to them. See [Section headings](/en/v1_0/reference/rendering/#section-headings).
