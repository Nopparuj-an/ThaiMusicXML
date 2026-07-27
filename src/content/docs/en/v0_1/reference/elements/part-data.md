---
title: <part-data>
description: Contains the music data for a single instrument
---

The `<part-data>` element contains the music data for a single instrument.

## Parent

[`<thai-score>`](/en/v0_1/reference/elements/thai-score/)

## Attributes

| Attribute | Required | Type | Description |
|-----------|----------|------|-------------|
| `id` | Yes | IDREF | References a `<part id="...">` in `<ensemble>`. |

## Children

One or more [`<section-ref>`](/en/v0_1/reference/elements/section-ref/) elements.

## Example

```xml
<part-data id="P1">
  <section-ref id="s1">
    <line number="1">
      <measure number="1"><note pitch="ด"/><note pitch="ร"/></measure>
    </line>
  </section-ref>
</part-data>
```
