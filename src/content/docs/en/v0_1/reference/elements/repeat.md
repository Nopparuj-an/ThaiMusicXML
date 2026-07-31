---
title: <repeat>
description: Plays a run of sections more than once
---

The `<repeat>` element wraps a run of `<structure>` content and plays it more than once. Repeats nest, so a piece can be built from layers of them.

## Parents

- [`<structure>`](/en/v0_1/reference/elements/structure/)
- [`<repeat>`](/en/v0_1/reference/elements/repeat/) - a repeat may wrap another repeat

## Attributes

| Attribute | Required | Type    | Description                                        |
| --------- | -------- | ------- | -------------------------------------------------- |
| `times`   | No       | integer | How many times the wrapped content plays. Default: `1`. |

## Children

The same children `<structure>` takes, in any order and repeated freely:

- [`<annotation>`](/en/v0_1/reference/elements/annotation/)
- [`<br>`](/en/v0_1/reference/elements/br/)
- [`<direction>`](/en/v0_1/reference/elements/direction/)
- [`<section>`](/en/v0_1/reference/elements/section/)
- [`<repeat>`](/en/v0_1/reference/elements/repeat/)

## Semantics

Everything inside a `<repeat>` plays `times` times through before the score moves past it. Wrapping two sections repeats the pair together, so `A B A B`, which is different from repeating each section on its own.

Nested repeats multiply. A section wrapped in a `times="2"` inside another `times="2"` plays four times.

```xml
<structure>
  <repeat times="2">
    <repeat times="2">
      <section id="s1" name="ท่อน 1" />
    </repeat>
    <section id="s2" name="ท่อน 2" />
  </repeat>
</structure>
```

That plays ท่อน 1 twice, then ท่อน 2 once, then repeats the whole pair again: four bars of ท่อน 1 and two of ท่อน 2 in total, in the order 1 1 2 1 1 2.

### Total pass count

A section's total pass count is the product of the `times` values of every `<repeat>` enclosing it, or `1` if none do. In the example above ท่อน 1 has a total pass count of 4 and ท่อน 2 has 2.

Passes are counted absolutely, straight through from the first play to the last, ignoring which layer of repeat produced them. [`<ending>`](/en/v0_1/reference/elements/ending/)'s `pass` attribute uses these absolute numbers, so `pass="4"` on ท่อน 1 above names the last of its four plays, and `pass="2,4"` names two of them.

## Section order

`<repeat>` does not change how section order is read. The order is still the document order of the `<section>` elements, walked depth first through any `<repeat>` wrappers. See [`<structure>`](/en/v0_1/reference/elements/structure/#section-order).

## Conformance

- `times` must be an integer of `1` or greater.
- A `<repeat>` must contain at least one `<section>`, directly or inside a nested `<repeat>`. A repeat wrapping only annotations and directions has nothing to play.
- Repeats nest to any depth.
- To repeat a range of lines within one section rather than the section as a whole, use [`<line-repeat>`](/en/v0_1/reference/elements/line-repeat/).
