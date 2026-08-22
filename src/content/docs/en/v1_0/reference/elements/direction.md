---
title: <direction>
description: Performance directions for the score
---

The `<direction>` element contains performance directions for the score.

## Parents

- [`<structure>`](/en/v1_0/reference/elements/structure/)
- [`<repeat>`](/en/v1_0/reference/elements/repeat/)

## Children

- [`<nathap>`](/en/v1_0/reference/elements/nathap/) - หน้าทับ (rhythmic cycle)
- [`<chan>`](/en/v1_0/reference/elements/chan/) - ชั้น (rhythmic layer)
- [`<bpm>`](/en/v1_0/reference/elements/bpm/) - tempo

## Example

```xml
<direction>
  <nathap value="ปรบไก่" />
  <chan value="1" />
  <bpm>65</bpm>
</direction>
```

## Conformance

- `<nathap>`, `<chan>`, and `<bpm>` are each optional and may appear at most once, in any order. A `<direction>` can set any of them, all of them, or none.
