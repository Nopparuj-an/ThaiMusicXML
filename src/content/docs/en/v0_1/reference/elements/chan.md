---
title: <chan>
description: Sets the ชั้น (chan) rhythmic layer level
---

The `<chan>` element sets the ชั้น (chan) rhythmic layer level.

ชั้น (chan) is the Thai rhythmic layer system that determines the rhythmic density of a performance.

## Parent

[`<direction>`](/en/v0_1/reference/elements/direction/)

## Attributes

| Attribute | Required | Type        | Description                                    |
| --------- | -------- | ----------- | ---------------------------------------------- |
| `value`   | Yes      | enumeration | The ชั้น level. One of the five values below. |

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

## Notes

- ชั้น does not set the tempo. At a fixed [`<bpm>`](/en/v0_1/reference/elements/bpm/) the notes keep their rate through a change of ชั้น; what changes is how many note slots the melody is spread over, and so how often the ฉิ่ง falls.

## Conformance

- `value` must be one of the five values listed above. Validators must reject any other value.
