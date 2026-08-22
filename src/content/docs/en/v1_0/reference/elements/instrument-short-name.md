---
title: <instrument-short-name>
description: A shortened form of the instrument name, for tight spaces
---

The `<instrument-short-name>` element gives a shortened form of [`<instrument-name>`](/en/v1_0/reference/elements/instrument-name/), for use wherever the full name does not fit.

## Parent

[`<part>`](/en/v1_0/reference/elements/part/)

## Content

Text. Optional: a part with no `<instrument-short-name>` is identified by its full [`<instrument-name>`](/en/v1_0/reference/elements/instrument-name/) wherever a short name would otherwise be used.

## Example

```xml
<part id="P2" stack="khong" row="1">
  <instrument-name>ฆ้องวงใหญ่ มือขวา</instrument-name>
  <instrument-short-name>ฆ้องวงใหญ่ R</instrument-short-name>
</part>
```

## Rendering

Used in place of `<instrument-name>` in the ensemble label column, which has only the page margin to work with. See [Instrument names](/en/v1_0/reference/rendering/#instrument-names).
