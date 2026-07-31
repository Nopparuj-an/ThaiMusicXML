---
title: <part-data>
description: Contains the music data for a single instrument
---

The `<part-data>` element contains the music data for a single instrument.

`<part>` in `<ensemble>` declares that the instrument exists. `<part-data>` is where its notes actually live.

## Parent

[`<thai-score>`](/en/v0_1/reference/elements/thai-score/)

## Attributes

| Attribute | Required | Type | Description |
|-----------|----------|------|-------------|
| `part` | Yes | IDREF | References a `<part id="...">` in `<ensemble>`. |

## Children

One or more [`<section-ref>`](/en/v0_1/reference/elements/section-ref/) elements.

## Example

```xml
<part-data part="P1">
  <section-ref section="s1">
    <line number="1">
      <measure number="1"><note pitch="ด"/><note pitch="ร"/></measure>
    </line>
  </section-ref>
</part-data>
```

## Conformance

- Every `<part>` in `<ensemble>` must have exactly one `<part-data>` referencing it. A part with no matching `<part-data>`, or more than one, is invalid.
- A `<part-data>` must not reference the same `<section>` twice.
- `<part-data>` elements may appear in any order. Matching a part to its data goes through `part`, not through document position.
- A `<part-data>` need not reference every section. Leave out the `<section-ref>` for a section its instrument does not play.
