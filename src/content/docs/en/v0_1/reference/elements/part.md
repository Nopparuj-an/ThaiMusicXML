---
title: <part>
description: Defines a single instrument in the ensemble
---

The `<part>` element defines a single instrument in the ensemble.

## Parent

[`<ensemble>`](/en/v0_1/reference/elements/ensemble/)

## Attributes

| Attribute | Required | Type | Description                                           |
| --------- | -------- | ---- | ----------------------------------------------------- |
| `id`      | Yes      | ID   | Unique identifier. Matched by `<part-data id="...">`. |

## Children

- [`<instrument-name>`](/en/v0_1/reference/elements/instrument-name/) - required

## Example

```xml
<part id="P1">
  <instrument-name>Ranat Ek</instrument-name>
</part>
```
