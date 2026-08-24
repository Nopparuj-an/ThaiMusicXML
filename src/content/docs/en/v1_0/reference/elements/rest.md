---
title: <rest>
description: A beat with no new attack
---

The `<rest>` element occupies one beat on which the instrument plays nothing new.

Thai instruments have no notated sustain. A `<rest>` means only that no note is struck, plucked, or bowed on that beat. Whatever the instrument was already sounding carries on according to its own physical decay: a ฆ้อง keeps ringing, a ระนาด damps quickly. The notation does not distinguish the two, and neither does this element.

## Parent

[`<measure>`](/en/v1_0/reference/elements/measure/) or [`<group>`](/en/v1_0/reference/elements/group/)

A `<measure>` in a [lyric part](/en/v1_0/reference/elements/part/#part-types) takes `<rest>` too, where it means no new syllable begins. The vowel already being sung carries on, which is เอื้อน, and it is the same reading as above: no new attack, not silence. See [`<syllable>`](/en/v1_0/reference/elements/syllable/#เอื้อน-and-gaps).

## Attributes

| Attribute | Required | Type | Description |
|-----------|----------|------|-------------|
| `id` | No | token | Optional identifier, unique among all `<rest>` elements in the document. Exists for a [foreign-namespace extension](/en/v1_0/reference/elements/thai-score/#extensions) to reference; ThaiMusicXML itself does not use it. |

## Example

```xml
<rest/>
```

## Conformance

- `id`, when present, must be unique among all `<rest>` elements in the document.

## Notes

- Self-closing element, with an optional `id`.
- Each `<rest/>` occupies one beat, the same as a `<note>` in the same position. Inside a [`<group>`](/en/v1_0/reference/elements/group/) it takes an equal share of the group's single beat.
- A rest prints as a hyphen, though some notation styles leave it blank in a part that is not carrying the melody. See [Inside a measure](/en/v1_0/reference/rendering/#inside-a-measure).
