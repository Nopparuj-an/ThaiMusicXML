---
title: <annotation>
description: A free-form comment ignored during playback
---

The `<annotation>` element contains a free-form comment that is ignored during playback.

## Parents

- [`<structure>`](/en/v0_1/reference/elements/structure/)
- [`<section-ref>`](/en/v0_1/reference/elements/section-ref/)

## Attributes

| Attribute | Required | Type   | Description                                                               |
| --------- | -------- | ------ | ------------------------------------------------------------------------- |
| `target`  | No       | string | Scope of the annotation. `"instrument"` limits it to the containing part. |

## Content

Text.

## Example

```xml
<annotation>บรรทัดที่ 1 มี 7 ห้อง</annotation>
```

```xml
<annotation target="instrument">0 = ฉิ่ง / 1 = ฉับ</annotation>
```

## Notes

- When `target="instrument"` is used inside `<section-ref>`, the annotation documents notation conventions for that specific instrument.
