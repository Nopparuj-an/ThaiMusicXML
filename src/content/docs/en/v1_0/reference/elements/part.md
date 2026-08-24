---
title: <part>
description: Defines a single instrument in the ensemble
---

The `<part>` element defines a single instrument in the ensemble.

`<part>` declares that an instrument exists and describes its type, name, and whether it stacks with another row. It holds no notes.

## Parent

[`<ensemble>`](/en/v1_0/reference/elements/ensemble/)

## Attributes

| Attribute | Required | Type   | Description                                                                             |
| --------- | -------- | ------ | ---------------------------------------------------------------------------------------- |
| `id`      | Yes      | ID     | Unique identifier. Referenced by `<part-data part="...">`.                               |
| `type`    | No       | string | `"pitched"`, `"unpitched"`, or `"lyric"`. Determines what this part's measures hold. Default: `"pitched"`. |
| `stack`   | No       | string | Joins this part to the other rows of the same instrument. Parts sharing a `stack` value read as one instrument. Omit for single-row instruments and for lyric parts. See [Conformance](#conformance) below. |
| `row`     | If `stack` is present | integer | This part's position within the stack, counting from `1` at the top. See [Conformance](#conformance) below. |

## Children

- [`<instrument-name>`](/en/v1_0/reference/elements/instrument-name/) - required
- [`<instrument-short-name>`](/en/v1_0/reference/elements/instrument-short-name/) - optional

## Example

```xml
<part id="P1">
  <instrument-name>Ranat Ek</instrument-name>
</part>
```

```xml
<part id="P2" type="unpitched">
  <instrument-name>Ching</instrument-name>
</part>
```

```xml
<part id="P3" stack="khong" row="1">
  <instrument-name>ฆ้องวงใหญ่ มือขวา</instrument-name>
</part>
<part id="P4" stack="khong" row="2">
  <instrument-name>ฆ้องวงใหญ่ มือซ้าย</instrument-name>
</part>
```

```xml
<part id="P5" type="lyric">
  <instrument-name>เนื้อร้อง</instrument-name>
</part>
```

## Part types

`type` says what a part's measures hold, and each value takes a different element:

| `type` | Measures hold | Notes carry |
| --- | --- | --- |
| `pitched` | [`<note>`](/en/v1_0/reference/elements/note/), [`<rest>`](/en/v1_0/reference/elements/rest/), [`<group>`](/en/v1_0/reference/elements/group/) | `pitch` |
| `unpitched` | the same | `sound` |
| `lyric` | [`<syllable>`](/en/v1_0/reference/elements/syllable/), `<rest>` | n/a |

A lyric part is an ordinary single-row part. It takes its own row in the grid, it sits wherever it is listed in [`<ensemble>`](/en/v1_0/reference/elements/ensemble/), and where that is depends on how the score is laid out rather than on any rule here: above the instruments, below them, or between two of them. Its `<instrument-name>` is conventionally `เนื้อร้อง` or `ร้อง`, and like every other part name it labels the row for an editor rather than printing.

One thing does set it apart. Every other part agrees with the rest of the score on beat count within a measure, and a lyric part does not have to. A vocal line often does not divide the way the melody does, so a lyric measure holds whatever the words need and the item count decides whether the syllables align to beats or sit centered in the cell. See [`<syllable>`](/en/v1_0/reference/elements/syllable/#counting).

Nothing automatically joins a lyric part to the music it belongs with. Placement is the mechanism: if the words go under ระนาดเอก, list them under ระนาดเอก. A lyric part takes no `stack`: a stack is one instrument's own rows, and words are not a region of an instrument, so the words sit beside a stack rather than inside it.

## Stacked instruments

Some instruments need more than one row of notation per line. A two-handed instrument is the familiar case, with one row per hand, but rows do not have to be hands: an instrument may be notated as a row per group of strings, or per region of the instrument. Give every such part the same `stack` value and number them with `row`.

The value of `stack` is an arbitrary token. It is not printed and never reaches the page, so pick whatever reads clearly in the file.

What each row actually is goes in that part's [`<instrument-name>`](/en/v1_0/reference/elements/instrument-name/), which is the only place it can go, since `row` records a position and nothing more. On a two-handed instrument the right hand conventionally takes the top row, but that is a convention rather than a rule, and a file that does not say `มือขวา` somewhere has not recorded which hand is which.

Three rows is the most seen in practice. Nothing caps it.

## Notes

- `type` describes the part, not any particular performance. It is declared once here and never repeated in `<part-data>`. A lyric part is the one value that is not an instrument at all, which is a stretch of the word `<ensemble>` worth knowing about: reusing `<part>` is what gives a lyric line the whole line and measure grid for free.
- See [`<note>`](/en/v1_0/reference/elements/note/) for how `type` determines which attribute a note uses.
- `stack` describes the instrument too. See [`<ensemble>`](/en/v1_0/reference/elements/ensemble/#rendering) for how it affects rendering, and [`<link>`](/en/v1_0/reference/elements/link/) for the cross-row curve it enables.
- A stack's parts sit together in `<ensemble>`, in row order. Their `<part-data>` is unaffected and still references each part on its own by `id`.

## Conformance

- Every `<part>` must have exactly one matching [`<part-data>`](/en/v1_0/reference/elements/part-data/#conformance).
- `type` must be `"pitched"`, `"unpitched"`, or `"lyric"`. Validators must reject any other value.
- A `type="lyric"` part's measures must hold only [`<syllable>`](/en/v1_0/reference/elements/syllable/#conformance) and `<rest>` children, and are exempt from the beat-count agreement in [`<section-ref>`](/en/v1_0/reference/elements/section-ref/#conformance).
- `stack` and `row` must appear together: a `<part>` with `stack` must also have `row`, and a `<part>` with `row` must also have `stack`.
- A `stack` value must be shared by at least two `<part>` elements. One part alone is a single-row instrument and carries neither attribute.
- A `type="lyric"` part must not carry `stack` or `row`. Every row of a stack is a notated part.
- The `row` values within one stack must run from `1` upward with no gaps and no repeats.
- A stack's `<part>` elements must be adjacent in [`<ensemble>`](/en/v1_0/reference/elements/ensemble/), in ascending `row` order. `row` must match position the way `number` does on [`<line>`](/en/v1_0/reference/elements/line/) and [`<measure>`](/en/v1_0/reference/elements/measure/).
