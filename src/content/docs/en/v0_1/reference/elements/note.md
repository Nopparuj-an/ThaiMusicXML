---
title: <note>
description: A musical note
---

The `<note>` element represents a musical note.

## Parent

[`<measure>`](/en/v0_1/reference/elements/measure/) or [`<group>`](/en/v0_1/reference/elements/group/)

## Attributes

| Attribute | Required                                      | Type    | Description                                                                             |
| --------- | ---------------------------------------------- | ------- | ----------------------------------------------------------------------------------------- |
| `pitch`   | If the part's `type` is `"pitched"` (default) | pitch   | The note name. See [Pitch format](#pitch-format) below.                                   |
| `sound`   | If the part's `type` is `"unpitched"`         | string  | An instrument-specific sound code. See [Unpitched Notation](#unpitched-notation) below.    |
| `octave`  | No                                             | integer | The octave number, any integer. Only applies to `pitch`. Default is 0. Ignored when `pitch` carries a Thai octave modifier, see [Conformance](#conformance) below.  |

`pitch` and `sound` are mutually exclusive: a note uses one or the other depending on the [`type`](/en/v0_1/reference/elements/part/#part-types) of its containing `<part>`. A `type="lyric"` part has no `<note>` elements at all, using [`<syllable>`](/en/v0_1/reference/elements/syllable/) instead.

## Example

```xml
<!-- Lower Do -->
<note pitch="1" octave="-1"/>
<note pitch="D" octave="-1"/>
<note pitch="ดฺ"/>

<!-- Middle Do -->
<note pitch="1" octave="0"/>
<note pitch="D" octave="0"/>
<note pitch="ด"/>

<!-- Higher Do -->
<note pitch="1" octave="1"/>
<note pitch="D" octave="1"/>
<note pitch="ดํ"/>
```

## Pitch format

A `pitch` value is one base-note character, optionally followed by one Thai octave modifier.

### Base notes

Each degree of the scale has three interchangeable single-character spellings. `pitch="1"`, `pitch="D"`, and `pitch="ด"` name the same note.

| Number | Thai | Code point | Romanized |
| ------ | ---- | ---------- | --------- |
| 1      | ด    | U+0E14     | D         |
| 2      | ร    | U+0E23     | R         |
| 3      | ม    | U+0E21     | M         |
| 4      | ฟ    | U+0E1F     | F         |
| 5      | ซ    | U+0E0B     | S         |
| 6      | ล    | U+0E25     | L         |
| 7      | ท    | U+0E17     | T         |

A document may use any of the three, but a generator should pick one spelling and keep to it throughout a file. The choice is not merely cosmetic: the spelling a file is written in is the spelling a renderer displays, so a file that mixes them prints mixed. See [Rendering](#rendering) below.

A romanized base note may be written in either case. `pitch="d"` and `pitch="D"` are the same note, and case carries no meaning, so a renderer displays whichever case it prefers rather than the one the file happens to use. Uppercase is the default.

### Thai octave modifiers

| Modifier | Thai name | Code point | Effect           | Example                  |
| -------- | --------- | ---------- | ---------------- | ------------------------ |
| ํ        | Nikhahit  | U+0E4D     | Raise one octave | `ดํ` = ด up one octave   |
| ฺ        | Pinthu    | U+0E3A     | Lower one octave | `ทฺ` = ท down one octave |

The modifiers attach to any of the three spellings, so `1ํ`, `Dํ`, and `ดํ` are all valid and all mean the same note.

The code points are given because both modifiers are combining characters. In a rendered table they sit on top of whatever precedes them and cannot be told apart by eye from any of several lookalikes, and they cannot be copied reliably out of a web page. Match on the numbers.

Unicode normalization is not a concern here. Thai has no canonical compositions, so `ดํ` is the two code points U+0E14 U+0E4D under NFC, under NFD, and as written. A processor does not need a normalization pass before matching a `pitch` value, and adding one changes nothing.

## Unpitched notation

For percussion and other non-pitched instruments, `<part type="unpitched">` notes carry `sound` in place of `pitch`. `sound` is a free-form, instrument-specific code. Document what its values mean with an `<annotation>` inside the part's `<section-ref>`.

```xml
<section-ref section="s1">
  <annotation>0 = ฉิ่ง / 1 = ฉับ</annotation>
  <line number="1">
    <measure number="1">
      <rest/><note sound="0"/><rest/><note sound="1"/>
    </measure>
  </line>
</section-ref>
```

## Rendering

A note displays in the spelling the file is written in, and an unpitched note's `sound` displays verbatim. See [Inside a measure](/en/v0_1/reference/rendering/#inside-a-measure) and [Octaves beyond the Thai spellings](/en/v0_1/reference/rendering/#octaves-beyond-the-thai-spellings).

## Conformance

- `pitch` must be one of the seven base-note characters in any of the three spellings, optionally followed by one Thai octave modifier. Validators must reject any other value.
- A romanized base note may be written in upper or lower case. Both are valid and mean the same note.
- When `pitch` carries a Thai octave modifier (nikhahit `ํ` or pinthu `ฺ`), that modifier determines the octave. An `octave` attribute on the same `<note>` is ignored.
- Validators should warn rather than reject when `octave` appears alongside a Thai octave modifier. The combination is redundant, not contradictory.
- When `pitch` has no Thai octave modifier (numeric, romanized, or unmodified Thai), `octave` applies as normal, defaulting to `0` when absent.
- `octave` is not limited to `-1`, `0`, or `1`. Values outside that range have no distinct Thai-script spelling, since there is only one nikhahit and one pinthu. The `octave` value stays authoritative for playback whatever a renderer chooses to display. See [Octaves beyond the Thai spellings](/en/v0_1/reference/rendering/#octaves-beyond-the-thai-spellings).
- `octave` may appear on a `<note>` that uses `sound`. It has no effect there: `sound` codes are instrument-specific and not organized into octaves. Validators should warn, since the attribute is being discarded.
