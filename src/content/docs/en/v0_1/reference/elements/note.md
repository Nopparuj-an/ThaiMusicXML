---
title: <note>
description: A musical note
---

The `<note>` element represents a musical note.

## Parent

[`<measure>`](/en/v0_1/reference/elements/measure/)

## Attributes

| Attribute | Required                                      | Type    | Description                                                                             |
| --------- | ---------------------------------------------- | ------- | ----------------------------------------------------------------------------------------- |
| `pitch`   | If the part's `type` is `"pitched"` (default) | pitch   | The note name. See [Pitch format](#pitch-format) below.                                   |
| `sound`   | If the part's `type` is `"unpitched"`         | string  | An instrument-specific sound code. See [Unpitched Notation](#unpitched-notation) below.    |
| `octave`  | No                                             | integer | The octave number. Only applies to `pitch`. Default is 0.                                 |

`pitch` and `sound` are mutually exclusive: a note uses one or the other depending on the [`type`](/en/v0_1/reference/elements/part/) of its containing `<part>`.

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

## Pitch Format

The `pitch` attribute uses Thai scale names.

### Base Notes

| Number | Thai | Romanized |
| ------ | ---- | --------- |
| 1      | ด    | D         |
| 2      | ร    | R         |
| 3      | ม    | M         |
| 4      | ฟ    | F         |
| 5      | ซ    | S         |
| 6      | ล    | L         |
| 7      | ท    | T         |

### Thai Octave Modifiers

| Modifier | Thai Name | Effect           | Example                  |
| -------- | --------- | ---------------- | ------------------------ |
| ํ        | Nikhahit  | Raise one octave | `ดํ` = ด up one octave   |
| ฺ        | Pinthu    | Lower one octave | `ทฺ` = ท down one octave |

### Unpitched Notation

For percussion or other non-pitched instruments, `<part type="unpitched">` notes use `sound` instead of `pitch`. `sound` is a free-form, instrument-specific code; its meaning should be documented with an `<annotation target="instrument">`.

```xml
<annotation target="instrument">0 = ฉิ่ง / 1 = ฉับ</annotation>
<measure number="1">
  <rest/><note sound="0"/><rest/><note sound="1"/>
</measure>
```
