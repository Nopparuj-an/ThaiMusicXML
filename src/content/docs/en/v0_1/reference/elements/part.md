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
| `id`      | Yes      | ID     | Unique identifier. Matched by `<part-data id="...">`.                                    |
| `type`    | No       | string | `"pitched"` or `"unpitched"`. Determines whether notes in this part use `pitch` or `sound`. Default: `"pitched"`. |

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

- `type` is a property of the instrument itself, not of any particular performance data. It is declared once here rather than repeated in `<part-data>`.
- See [`<note>`](/en/v0_1/reference/elements/note/) for how `type` determines which attribute a note uses.
- Every `<part>` must have exactly one matching [`<part-data>`](/en/v0_1/reference/elements/part-data/#conformance).
