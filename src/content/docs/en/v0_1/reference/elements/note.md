---
title: <note>
description: A musical note
---

The `<note>` element represents a musical note.

## Parent

[`<measure>`](/en/v0_1/reference/elements/measure/)

## Attributes

| Attribute | Required | Type    | Description                                             |
| --------- | -------- | ------- | ------------------------------------------------------- |
| `pitch`   | Yes      | pitch   | The note name. See [Pitch format](#pitch-format) below. |
| `octave`  | No       | integer | The octave number. Default is 0.                        |

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

### Instrument-Specific Notation

For percussion or non-pitched instruments, the `pitch` attribute can use numeric values. The meaning depends on the instrument and should be documented with an `<annotation target="instrument">`.

```xml
<annotation target="instrument">0 = ฉิ่ง / 1 = ฉับ</annotation>
<measure number="1">
  <rest/><note pitch="0"/><rest/><note pitch="1"/>
</measure>
```
