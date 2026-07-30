---
title: <tuning>
description: The pitch reference the score is written against
---

The `<tuning>` element states what absolute pitch the scale degrees in this score stand for.

A `pitch` value names a degree of the Thai scale, not a frequency. ด is the first degree wherever the ensemble happens to be tuned. Without a `<tuning>`, a document says what to play relative to the ensemble but not at what pitch, which is enough to print a score and not enough to sound one.

## Parent

[`<header>`](/en/v0_1/reference/elements/header/)

## Attributes

| Attribute   | Required | Type   | Description                              |
| ----------- | -------- | ------ | ---------------------------------------- |
| `reference` | Yes      | string | The tuning ด is written against. See below. |

## Values

`reference` is a free-form string. The values below are the ones worth spelling consistently, but the list is a starting point rather than a closed set.

| Value | Description |
| ----- | ----------- |
| `pi-phat-mai-khaeng` | ปี่พาทย์ไม้แข็ง at the กรมศิลปากร reference pitch |
| `khrueang-sai` | เครื่องสาย and มโหรี at the กรมศิลปากร reference pitch |
| `c-major` | ด sounds as C, the usual choice for teaching material and for scores shared with Western instruments |
| `bb-major` | ด sounds as B♭, the closest common Western fit for Thai string ensembles |

Tuning practice is wider than four values, and pinning the set now would reject scores that are perfectly well described by a name this list has not reached yet. A validator therefore accepts any string and warns on one it does not recognize, which still catches `c-majro` without turning an unusual tuning into an invalid document. [`<nathap>`](/en/v0_1/reference/elements/nathap/) is open for the same reason; [`<chan>`](/en/v0_1/reference/elements/chan/) is not, because its five levels are the whole set.

## Example

```xml
<header>
  <title>แขกบรเทศ ชั้นเดียว</title>
  <tuning reference="khrueang-sai" />
</header>
```

## Notes

- Thai tuning divides the octave into seven near-equal steps, so no Western key matches it exactly. The `c-major` and `bb-major` values name the closest practical mapping, not an identity.
- `<tuning>` is optional. A score meant only for reading, or one whose tuning is not known, can leave it out.

## Conformance

- `reference` is required and may be any non-empty string.
- Validators should warn on a `reference` outside the recommended list above, and must not reject it.
- At most one `<tuning>` per [`<header>`](/en/v0_1/reference/elements/header/).

## Rendering

Tuning is not conventionally printed on a Thai score. See [The title band](/en/v0_1/reference/rendering/#the-title-band).
