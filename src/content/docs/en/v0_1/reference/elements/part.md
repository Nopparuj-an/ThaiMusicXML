---
title: <part>
description: Defines a single instrument in the ensemble
---

The `<part>` element defines a single instrument in the ensemble.

## Parent

[`<ensemble>`](/en/v0_1/reference/elements/ensemble/)

## Attributes

| Attribute | Required | Type   | Description                                                                             |
| --------- | -------- | ------ | ---------------------------------------------------------------------------------------- |
| `id`      | Yes      | ID     | Unique identifier. Referenced by `<part-data part="...">`.                               |
| `type`    | No       | string | `"pitched"` or `"unpitched"`. Determines whether notes in this part use `pitch` or `sound`. Default: `"pitched"`. |
| `hand`    | No       | string | `"right"` or `"left"`. Marks this part as one hand of a two-handed instrument. Omit for single-line instruments. See [Conformance](#conformance) below. |
| `pair`    | If `hand` is present | IDREF  | References the `id` of this instrument's other hand. See [Conformance](#conformance) below. |

## Children

- [`<instrument-name>`](/en/v0_1/reference/elements/instrument-name/) - required

## Example

```xml
<part id="P1">
  <instrument-name>Ranat Ek</instrument-name>
</part>
```

```xml
<part id="P2" type="unpitched">
  <instrument-name>Ching</instrument-name>
</part>
```

## Notes

- `type` describes the instrument, not any particular performance. It is declared once here and never repeated in `<part-data>`.
- See [`<note>`](/en/v0_1/reference/elements/note/) for how `type` determines which attribute a note uses.
- `hand` describes the instrument too. See [`<ensemble>`](/en/v0_1/reference/elements/ensemble/#rendering) for how it affects rendering, and [`<group>`](/en/v0_1/reference/elements/group/) for the `link` attribute it enables.
- Listing a hand pair adjacently in `<ensemble>` reads better, but nothing depends on it. `pair` states the relationship explicitly wherever the two parts appear.

## Conformance

- Every `<part>` must have exactly one matching [`<part-data>`](/en/v0_1/reference/elements/part-data/#conformance).
- `hand` and `pair` must appear together: a `<part>` with `hand` must also have `pair`, and a `<part>` with `pair` must also have `hand`.
- `pair` must reference a `<part>` with the opposite `hand` value.
- The reference must be mutual: if `<part id="A">` has `pair="B"`, then `<part id="B">` must have `pair="A"`.
