---
title: <instrument-name>
description: "Names an instrument, in English or Thai. On one row of a stacked instrument it names the hand too, as in ฆ้องวงใหญ่ มือขวา."
---

The `<instrument-name>` element gives the name of an instrument.

## Parent

[`<part>`](/en/reference/elements/part/)

## Content

Text. Use the English name or the Thai name.

On one row of a [stacked instrument](/en/reference/elements/part/#stacked-instruments) this also says which row it is, since `row` records only a position. `ฆ้องวงใหญ่ มือขวา` names the instrument and the hand together.

## Example

```xml
<instrument-name>Ranat Ek</instrument-name>
```

```xml
<instrument-name>ฉิ่ง</instrument-name>
```

## Rendering

Whether the name prints depends on the ensemble. See [Instrument names](/en/reference/rendering/#instrument-names). Where this name does not fit - the ensemble label column has only the page margin to work with - a [`<instrument-short-name>`](/en/reference/elements/instrument-short-name/) takes its place there.
