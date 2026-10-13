---
title: <direction>
description: "Carries performance directions for the score: the หน้าทับ cycle, the ชั้น layer, and the tempo in beats per minute."
---

The `<direction>` element contains performance directions for the score.

## Parents

- [`<structure>`](/en/reference/elements/structure/)
- [`<repeat>`](/en/reference/elements/repeat/)

## Children

- [`<nathap>`](/en/reference/elements/nathap/) - หน้าทับ (rhythmic cycle)
- [`<chan>`](/en/reference/elements/chan/) - ชั้น (rhythmic layer)
- [`<bpm>`](/en/reference/elements/bpm/) - tempo

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
