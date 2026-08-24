---
title: <chan>
description: Sets the ชั้น (chan) rhythmic layer level
---

The `<chan>` element sets the ชั้น (chan) rhythmic layer level.

ชั้น (chan) is the Thai rhythmic layer system that determines the rhythmic density of a performance.

## Parent

[`<direction>`](/en/v1_0/reference/elements/direction/)

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

## What it does

Nothing that a processor computes from, in v1.0. `<chan>` records the level and carries it to whatever reads the file.

It changes no timing: [`<bpm>`](/en/v1_0/reference/elements/bpm/) fixes the measure rate, the bpm beat is half a measure whatever the ชั้น, and so the notes keep their rate through a change of level. What moves is the ฉิ่ง, and the ฉิ่ง is written out by the arranger as an ordinary unpitched part rather than generated from this element. A player that ignored `<chan>` entirely would sound the score correctly.

So it is metadata: for an editor to show, for a library to index on, for a playback engine to use however it sees fit. What it is not is an instruction the format asks anyone to act on.

## Notes

- ชั้น does not set the tempo. At a fixed [`<bpm>`](/en/v1_0/reference/elements/bpm/) the notes keep their rate through a change of ชั้น; what changes is how many measures the melody is spread over, and so how often the ฉิ่ง falls.
- [`<nathap>`](/en/v1_0/reference/elements/nathap/) sits beside it in `<direction>` and is metadata on the same terms.

## Conformance

- `value` must be one of the five values listed above, matched exactly as written. Validators must reject any other value, `0.50` and `.5` among them.
