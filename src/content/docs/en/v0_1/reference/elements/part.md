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
| `stack`   | No       | string | Joins this part to the other rows of the same instrument. Parts sharing a `stack` value read as one instrument. Omit for single-row instruments. See [Conformance](#conformance) below. |
| `row`     | If `stack` is present | integer | This part's position within the stack, counting from `1` at the top. See [Conformance](#conformance) below. |

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

```xml
<part id="P3" stack="khong" row="1">
  <instrument-name>ฆ้องวงใหญ่ มือขวา</instrument-name>
</part>
<part id="P4" stack="khong" row="2">
  <instrument-name>ฆ้องวงใหญ่ มือซ้าย</instrument-name>
</part>
```

## Stacked instruments

Some instruments need more than one row of notation per line. A two-handed instrument is the familiar case, with one row per hand, but rows do not have to be hands: an instrument may be notated as a row per group of strings, or per region of the instrument. Give every such part the same `stack` value and number them with `row`.

The value of `stack` is an arbitrary token. It is not printed and never reaches the page, so pick whatever reads clearly in the file.

What each row actually is goes in that part's [`<instrument-name>`](/en/v0_1/reference/elements/instrument-name/), which is the only place it can go, since `row` records a position and nothing more. On a two-handed instrument the right hand conventionally takes the top row, but that is a convention rather than a rule, and a file that does not say `มือขวา` somewhere has not recorded which hand is which.

Three rows is the most seen in practice. Nothing caps it.

## Notes

- `type` describes the instrument, not any particular performance. It is declared once here and never repeated in `<part-data>`.
- See [`<note>`](/en/v0_1/reference/elements/note/) for how `type` determines which attribute a note uses.
- `stack` describes the instrument too. See [`<ensemble>`](/en/v0_1/reference/elements/ensemble/#rendering) for how it affects rendering, and [`<group>`](/en/v0_1/reference/elements/group/) for the `link` attribute it enables.
- A stack's parts sit together in `<ensemble>`, in row order. Their `<part-data>` is unaffected and still references each part on its own by `id`.

## Conformance

- Every `<part>` must have exactly one matching [`<part-data>`](/en/v0_1/reference/elements/part-data/#conformance).
- `stack` and `row` must appear together: a `<part>` with `stack` must also have `row`, and a `<part>` with `row` must also have `stack`.
- A `stack` value must be shared by at least two `<part>` elements. One part alone is a single-row instrument and carries neither attribute.
- The `row` values within one stack must run from `1` upward with no gaps and no repeats.
- A stack's `<part>` elements must be adjacent in [`<ensemble>`](/en/v0_1/reference/elements/ensemble/), in ascending `row` order. `row` must match position the way `number` does on [`<line>`](/en/v0_1/reference/elements/line/) and [`<measure>`](/en/v0_1/reference/elements/measure/).
