---
title: <ensemble>
description: Lists the instruments in the score
---

The `<ensemble>` element lists the instruments in the score.

## Parent

[`<thai-score>`](/en/v0_1/reference/elements/thai-score/)

## Children

One or more [`<part>`](/en/v0_1/reference/elements/part/) elements.

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

A full score stacks one row per part, and how much space separates those rows depends on whether the ensemble contains two-handed instruments. See [Score layout](/en/v0_1/reference/rendering/#score-layout) in the rendering reference.
