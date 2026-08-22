---
title: <instrument-name>
description: The name of an instrument
---

The `<instrument-name>` element gives the name of an instrument.

## Parent

[`<part>`](/en/v1_0/reference/elements/part/)

## Content

Text. Use the English name or the Thai name.

On one row of a [stacked instrument](/en/v1_0/reference/elements/part/#stacked-instruments) this also says which row it is, since `row` records only a position. `ฆ้องวงใหญ่ มือขวา` names the instrument and the hand together.

## Example

```xml
<instrument-name>Ranat Ek</instrument-name>
```

```xml
<instrument-name>ฉิ่ง</instrument-name>
```

## Rendering

Whether the name prints depends on the ensemble. See [Instrument names](/en/v1_0/reference/rendering/#instrument-names). Where this name does not fit — the ensemble label column has only the page margin to work with — a [`<instrument-short-name>`](/en/v1_0/reference/elements/instrument-short-name/) takes its place there.
