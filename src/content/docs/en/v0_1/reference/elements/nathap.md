---
title: <nathap>
description: Names the หน้าทับ rhythmic cycle in force
---

The `<nathap>` element names the หน้าทับ the music is set against.

หน้าทับ is the drum cycle a piece is played over, carried by instruments such as ตะโพน, กลองแขก, and โทน-รำมะนา. It fixes the length of the cycle and the pattern of strokes inside it, and a musician who is told the หน้าทับ knows how the piece is held together before reading a note of it.

## Parent

[`<direction>`](/en/v0_1/reference/elements/direction/)

## Attributes

| Attribute | Required | Type   | Description                          |
| --------- | -------- | ------ | ------------------------------------ |
| `value`   | Yes      | string | The name of the cycle. See below.    |

## Values

`value` is a free-form string. The cycles below are the ones worth spelling consistently, but the list is a starting point rather than a closed set, and a score may name any cycle it is played to.

| Value | Notes |
| ----- | ----- |
| `ปรบไก่` | One of the two principal ปี่พาทย์ cycles |
| `สองไม้` | The other, shorter and more even |
| `ลาว` | หน้าทับ สำเนียงลาว |
| `เขมร` | หน้าทับ สำเนียงเขมร |
| `มอญ` | หน้าทับ สำเนียงมอญ |

An enumeration is not fixed in v0.1 because the repertoire of cycles is larger than any list that could be settled now, and a closed set would reject valid scores. Writing an unrecognized value is legal; a validator warns rather than rejects, so that a typo in a known name still surfaces.

## Example

```xml
<direction>
  <nathap value="ปรบไก่" />
  <chan value="1" />
  <bpm>60</bpm>
</direction>
```

## What it does

Nothing, in v0.1. `<nathap>` records which cycle the piece is set against and carries it to whatever reads the file. There is no structured representation of the cycle itself, so the strokes are not derivable from this element and a player cannot sound them from it.

Where a percussion part is actually written out, it is written out: an ordinary [`<part type="unpitched">`](/en/v0_1/reference/elements/part/#part-types) with `sound` codes, the same as any other instrument. `<nathap>` names what that part is playing; it does not generate it. What a playback engine chooses to do with the name is its own business.

Like [`<chan>`](/en/v0_1/reference/elements/chan/), it is metadata for files, editors, and players rather than something the page shows. A score that prints `หน้าทับปรบไก่` above the grid does so because the arranger wrote it into an [`<annotation>`](/en/v0_1/reference/elements/annotation/).

## Conformance

- `value` is required and may be any non-empty string.
- Validators should warn on a `value` outside the recommended list above, and must not reject it.
- At most one `<nathap>` per [`<direction>`](/en/v0_1/reference/elements/direction/).

## Rendering

หน้าทับ is not printed. See [The title band](/en/v0_1/reference/rendering/#the-title-band).
