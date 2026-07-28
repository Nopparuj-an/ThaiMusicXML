---
title: <tuning>
description: The pitch reference the score is written against
---

The `<tuning>` element states what absolute pitch the scale degrees in this score stand for.

A `pitch` value names a degree of the Thai scale, not a frequency. ด is the first degree wherever the ensemble happens to be tuned. Without a `<tuning>`, a document says what to play relative to the ensemble but not at what pitch, which is enough to print a score and not enough to sound one.

## Parent

[`<header>`](/en/v0_1/reference/elements/header/)

## Attributes

| Attribute   | Required | Type        | Description                              |
| ----------- | -------- | ----------- | ---------------------------------------- |
| `reference` | Yes      | enumeration | The tuning ด is written against. See below. |

## Values

| Value | Description |
| ----- | ----------- |
| `pi-phat-mai-khaeng` | ปี่พาทย์ไม้แข็ง at the กรมศิลปากร reference pitch |
| `khrueang-sai` | เครื่องสาย and มโหรี at the กรมศิลปากร reference pitch |
| `c-major` | ด sounds as C, the usual choice for teaching material and for scores shared with Western instruments |
| `bb-major` | ด sounds as B♭, the closest common Western fit for Thai string ensembles |

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
