---
title: <chan>
description: Sets the ชั้น (chan) rhythmic layer level
---

The `<chan>` element sets the ชั้น (chan) rhythmic layer level.

ชั้น (chan) is the Thai rhythmic layer system that determines the rhythmic density of a performance.

## Parent

[`<direction>`](/en/v0_1/reference/elements/direction/)

## Attributes

| Attribute | Required | Type   | Description     |
| --------- | -------- | ------ | --------------- |
| `value`   | Yes      | number | The ชั้น level. |

## Values

| Value | Name      |
| ----- | --------- |
| `0.5` | ครึ่งชั้น |
| `1`   | ชั้นเดียว |
| `2`   | สองชั้น   |
| `3`   | สามชั้น   |
| `4`   | สี่ชั้น   |

## Example

```xml
<chan value="1" />
```

## Conformance

- `value` must be one of the five values listed above. Validators must reject any other value.
