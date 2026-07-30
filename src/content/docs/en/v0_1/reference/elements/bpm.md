---
title: <bpm>
description: Sets the tempo in beats per minute
---

The `<bpm>` element sets the tempo in beats per minute.

## Parent

[`<direction>`](/en/v0_1/reference/elements/direction/)

## The unit being counted

One bpm beat is **two** measure beats, meaning two consecutive `<note>`, `<rest>`, or `<group>` slots as defined under [`<measure>`](/en/v0_1/reference/elements/measure/#beats). At `<bpm>90</bpm>` the score plays 180 note slots a minute.

The factor of two is there because a note slot is a subdivision, not the pulse. Tapping along with every slot of a four-slot measure gives twice the number a musician would call the tempo, the same way counting eighth notes gives twice a Western tempo marking. Counting in pairs puts ThaiMusicXML tempo on the scale people actually name.

## Walking the slots

A slot lasts `30 / bpm` seconds, since one bpm beat covers two of them. At `<bpm>90</bpm>` that is a third of a second.

Attacks fall a uniform slot apart unless a [`<group>`](/en/v0_1/reference/elements/group/) intervenes, so a player walks the slots at that interval and subdivides each group backwards inside its own slot. Beat `n` of a measure arrives `n` slots from the measure's leading edge, which puts the measure's last note on its closing boundary. See [Where the children fall](/en/v0_1/reference/elements/group/#where-the-children-fall).

One consequence of arrivals falling at the end of their slots: a piece's first note sounds one slot after nominal zero rather than at it. Nothing in a ThaiMusicXML file sits on an absolute timeline, so the offset costs nothing and a player may simply start at the first note. It matters only when synchronizing against an external clock, where the leading edge of the first measure is the reference and the first note is one slot later.

## Relationship to ชั้น

Tempo and [`<chan>`](/en/v0_1/reference/elements/chan/) are independent. Changing ชั้น at a fixed `<bpm>` does not speed the music up or slow it down.

The bpm beat is fixed at two note slots whatever the ชั้น, so the notes keep their rate through the change. What moves is the ฉิ่ง. Going from ชั้นเดียว to สองชั้น stretches the melody over twice as many note slots, and the ฉิ่ง cycle stretches with it, so the strokes arrive half as often. The song plays at the same speed with a sparser cycle underneath it.

## Content

Integer.

## Example

```xml
<bpm>90</bpm>
```

Ninety pulses a minute, so 180 note slots a minute: at four slots to the measure, forty-five measures a minute.

## Conformance

- Content must be a positive integer.

## Rendering

Tempo is not conventionally printed on a Thai score. The value is carried for players and editors to read. See [The title band](/en/v0_1/reference/rendering/#the-title-band).
