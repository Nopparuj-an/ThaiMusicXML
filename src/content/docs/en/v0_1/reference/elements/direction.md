---
title: <direction>
description: Performance directions for the score
---

The `<direction>` element contains performance directions for the score.

## Parents

- [`<structure>`](/en/v0_1/reference/elements/structure/)
- [`<repeat>`](/en/v0_1/reference/elements/repeat/)

## Children

- [`<chan>`](/en/v0_1/reference/elements/chan/) - ชั้น (rhythmic layer)
- [`<bpm>`](/en/v0_1/reference/elements/bpm/) - tempo

## Example

```xml
<direction>
  <chan value="1" />
  <bpm>65</bpm>
</direction>
```

## Conformance

- `<chan>` and `<bpm>` are each optional and may appear at most once, in any order. A `<direction>` can set either, both, or neither.
