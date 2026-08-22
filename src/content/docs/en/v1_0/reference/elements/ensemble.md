---
title: <ensemble>
description: Lists the instruments in the score
---

The `<ensemble>` element lists the instruments in the score.

## Parent

[`<thai-score>`](/en/v1_0/reference/elements/thai-score/)

## Children

One or more [`<part>`](/en/v1_0/reference/elements/part/) elements. Parts render in the order they appear here, and the parts of one [stacked instrument](/en/v1_0/reference/elements/part/#stacked-instruments) sit together in row order.

## Example

```xml
<ensemble>
  <part id="P1">
    <instrument-name>Ranat Ek</instrument-name>
  </part>
  <part id="P2">
    <instrument-name>Ching</instrument-name>
  </part>
</ensemble>
```

## Rendering

A full score stacks one row per part, and how much space separates those rows depends on whether the ensemble contains instruments notated on more than one row. See [Score layout](/en/v1_0/reference/rendering/#score-layout) in the rendering reference.
